import { Logger } from '@nestjs/common';
import { setTimeout } from 'timers/promises';

import {
  getClientAndConfig,
  getClientAndConfigForCluster,
  InMemoryProviderConfig,
} from './providers';
import {
  Cluster,
  ClusterOptions,
  InMemoryProviderClient,
  InMemoryProviderEnum,
  Redis,
  RedisOptions,
  ScanStream,
} from './types';

const LOG_CONTEXT = 'InMemoryProviderService';

export class InMemoryProviderService {
  public inMemoryProviderClient: InMemoryProviderClient;
  public inMemoryProviderConfig: InMemoryProviderConfig;
  public provider: InMemoryProviderEnum;
  public inCluster: boolean;
  public hasAutoPipelining: boolean;

  public isProviderClientReady: (string) => boolean;

  constructor(
    private options: { logContext?: string; inCluster?: boolean } = {
      logContext: LOG_CONTEXT,
      inCluster:
        process.env.IS_IN_MEMORY_CLUSTER_MODE_ENABLED === 'true' ||
        process.env.IN_MEMORY_CLUSTER_MODE_ENABLED === 'true' ||
        false,
    },
  ) {
    /**
     * Rules for the provider selection:
     * - For our self hosted users we assume all of them have a single node Redis
     * instance.
     * - For Novu we will use Elasticache. We fallback to a Redis Cluster configuration
     * if Elasticache not configured properly. That's happening in the provider
     * mapping in the /in-memory-provider/providers/index.ts
     */
    this.provider = process.env.IS_SELF_HOSTED
      ? InMemoryProviderEnum.REDIS
      : InMemoryProviderEnum.ELASTICACHE;

    this.inCluster =
      process.env.IS_IN_MEMORY_CLUSTER_MODE_ENABLED === 'true' ||
      process.env.IN_MEMORY_CLUSTER_MODE_ENABLED === 'true' ||
      false;

    this.hasAutoPipelining =
      process.env.REDIS_CACHE_ENABLE_AUTOPIPELINING === 'true';

    Logger.log(
      `[${this.options.logContext}] Provider: ${this.provider}, Cluster: ${this.inCluster ? 'enabled' : 'disabled'}, Autopipelining: ${this.hasAutoPipelining ? 'enabled' : 'disabled'}`,
      this.options.logContext,
    );

    this.inMemoryProviderClient = this.buildClient(this.provider);
  }

  public get getProvider(): {
    selected: InMemoryProviderEnum;
    configured: InMemoryProviderEnum;
  } {
    const config = this.inCluster
      ? getClientAndConfigForCluster(this.provider)
      : getClientAndConfig();

    return {
      selected: this.provider,
      configured: config.provider,
    };
  }

  protected log(message) {
    return Logger.log(
      `[${this.options.logContext}] ${message}`,
      this.options.logContext,
    );
  }

  private buildClient(provider: InMemoryProviderEnum): InMemoryProviderClient {
    return this.inCluster
      ? this.inMemoryClusterProviderSetup(provider)
      : this.inMemoryProviderSetup();
  }

  public async delayUntilReadiness(): Promise<void> {
    let times = 0;
    const retries = process.env
      .IN_MEMORY_PROVIDER_SERVICE_READINESS_TIMEOUT_RETRIES
      ? Number(process.env.IN_MEMORY_PROVIDER_SERVICE_READINESS_TIMEOUT_RETRIES)
      : 10;
    const timeout = process.env.IN_MEMORY_PROVIDER_SERVICE_READINESS_TIMEOUT
      ? Number(process.env.IN_MEMORY_PROVIDER_SERVICE_READINESS_TIMEOUT)
      : 100;

    while (times <= retries && !this.isClientReady()) {
      times += 1;
      await setTimeout(timeout);
    }

    Logger.warn(
      this.log(`Is being delayed ${times} times up to a total of ${retries}.`),
      LOG_CONTEXT,
    );

    if (times === retries) {
      Logger.error(
        this.log('It reached the limit of retries waiting for readiness.'),
        LOG_CONTEXT,
      );
    }
  }

  public getStatus(): string | unknown {
    if (this.inMemoryProviderClient) {
      return this.inMemoryProviderClient.status;
    }
  }

  public isClientReady(): boolean {
    return this.isProviderClientReady(this.getStatus());
  }

  public getClusterOptions(): ClusterOptions | undefined {
    if (this.inMemoryProviderClient && this.inCluster) {
      return this.inMemoryProviderClient.options;
    }
  }

  public getOptions(): RedisOptions | undefined {
    if (this.inMemoryProviderClient) {
      if (!this.inCluster) {
        const { options } = this.inMemoryProviderClient;

        return options;
      } else {
        const clusterOptions: ClusterOptions =
          this.inMemoryProviderClient.options;

        return clusterOptions.redisOptions;
      }
    }
  }

  private inMemoryClusterProviderSetup(provider): Cluster | undefined {
    Logger.verbose(this.log(`In-memory cluster service set up`), LOG_CONTEXT);

    const { getConfig, getClient, isClientReady } =
      getClientAndConfigForCluster(provider);

    this.isProviderClientReady = isClientReady;
    this.inMemoryProviderConfig = getConfig();
    const { host } = getConfig();

    if (!host) {
      Logger.warn(
        this.log(`Missing host for in-memory cluster for`),
        LOG_CONTEXT,
      );
    }

    const inMemoryProviderClient = getClient(this.hasAutoPipelining);
    if (host && inMemoryProviderClient) {
      Logger.log(this.log(`Connecting to cluster at ${host}`), LOG_CONTEXT);

      inMemoryProviderClient.on('connect', () => {
        Logger.verbose(this.log(`In-memory cluster connected`), LOG_CONTEXT);
      });

      inMemoryProviderClient.on('connecting', () => {
        Logger.verbose(this.log(`In-memory cluster connecting`), LOG_CONTEXT);
      });

      inMemoryProviderClient.on('reconnecting', () => {
        Logger.verbose(this.log(`In-memory cluster reconnecting`), LOG_CONTEXT);
      });

      inMemoryProviderClient.on('close', () => {
        Logger.verbose(this.log(`In-memory cluster closing`), LOG_CONTEXT);
      });

      inMemoryProviderClient.on('end', () => {
        Logger.verbose(this.log(`In-memory cluster end`), LOG_CONTEXT);
      });

      inMemoryProviderClient.on('error', (error) => {
        Logger.error(
          error,
          this.log(
            `There has been an error in the In-memory Cluster provider client`,
          ),
          LOG_CONTEXT,
        );
      });

      inMemoryProviderClient.on('ready', () => {
        Logger.log(this.log(`In-memory cluster ready`), LOG_CONTEXT);
      });

      inMemoryProviderClient.on('wait', () => {
        Logger.verbose(this.log(`In-memory cluster waiting`), LOG_CONTEXT);
      });

      return inMemoryProviderClient;
    }
  }

  private inMemoryProviderSetup(): Redis | undefined {
    Logger.verbose(this.log('In-memory service set up'), LOG_CONTEXT);

    const { getClient, getConfig, isClientReady } = getClientAndConfig();

    this.isProviderClientReady = isClientReady;
    this.inMemoryProviderConfig = getConfig();
    const { host, port, ttl } = getConfig();

    if (!host) {
      Logger.warn(this.log('Missing host for in-memory provider'), LOG_CONTEXT);
    }

    const inMemoryProviderClient = getClient();
    if (host && inMemoryProviderClient) {
      Logger.log(this.log(`Connecting to ${host}:${port}`), LOG_CONTEXT);

      inMemoryProviderClient.on('connect', () => {
        Logger.verbose(this.log('REDIS CONNECTED'), LOG_CONTEXT);
      });

      inMemoryProviderClient.on('reconnecting', () => {
        Logger.verbose(this.log('Redis reconnecting'), LOG_CONTEXT);
      });

      inMemoryProviderClient.on('close', () => {
        Logger.verbose(this.log('Redis close'), LOG_CONTEXT);
      });

      inMemoryProviderClient.on('end', () => {
        Logger.verbose(this.log('Redis end'), LOG_CONTEXT);
      });

      inMemoryProviderClient.on('error', (error) => {
        Logger.error(
          error,
          this.log('There has been an error in the InMemory provider client'),
          LOG_CONTEXT,
        );
      });

      inMemoryProviderClient.on('ready', () => {
        Logger.log(this.log('Redis ready'), LOG_CONTEXT);
      });

      inMemoryProviderClient.on('wait', () => {
        Logger.verbose(this.log('Redis wait'), LOG_CONTEXT);
      });

      return inMemoryProviderClient;
    }
  }

  public inMemoryScan(pattern: string): ScanStream {
    if (this.inCluster) {
      const client = this.inMemoryProviderClient as Cluster;

      return client.sscanStream(pattern);
    }

    const client = this.inMemoryProviderClient as Redis;

    return client.scanStream({ match: pattern });
  }

  public async shutdown(): Promise<void> {
    if (this.inMemoryProviderClient) {
      try {
        await this.inMemoryProviderClient.quit();
        Logger.verbose(
          this.log(`In-memory provider service shutdown`),
          LOG_CONTEXT,
        );
      } catch (error) {
        Logger.warn(
          error,
          this.log(`In-memory provider service shutdown has failed`),
          LOG_CONTEXT,
        );
      }
    }
  }

  /**
   * This Nest.js hook allows us to execute logic on termination after signal.
   * https://docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown
   *
   * Enabled by:
   *   app.enableShutdownHooks();
   *
   * in /apps/api/src/bootstrap.ts
   */
  public async onApplicationShutdown(signal): Promise<void> {
    await this.shutdown();
  }
}

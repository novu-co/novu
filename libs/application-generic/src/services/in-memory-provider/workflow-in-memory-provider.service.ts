import { InMemoryProviderService } from './in-memory-provider.service';
import { InMemoryProviderClient, InMemoryProviderEnum } from './types';

const LOG_CONTEXT = 'WorkflowInMemoryProviderService';

// TODO: This is an unecessary wrapping class. Replace it with InMemoryProviderService across the codebase.
export class WorkflowInMemoryProviderService {
  public inMemoryProviderService: InMemoryProviderService;

  constructor() {
    this.inMemoryProviderService = new InMemoryProviderService({
      logContext: LOG_CONTEXT,
    });
  }

  public async initialize(): Promise<void> {
    await this.inMemoryProviderService.delayUntilReadiness();
  }

  public getClient(): InMemoryProviderClient {
    return this.inMemoryProviderService.inMemoryProviderClient;
  }

  public isReady(): boolean {
    return this.inMemoryProviderService.isClientReady();
  }

  public providerInUseIsInClusterMode(): boolean {
    const providerConfigured =
      this.inMemoryProviderService.getProvider.configured;

    return (
      this.inMemoryProviderService.inCluster ||
      providerConfigured !== InMemoryProviderEnum.REDIS
    );
  }

  public async shutdown(): Promise<void> {
    await this.inMemoryProviderService.shutdown();
  }
}

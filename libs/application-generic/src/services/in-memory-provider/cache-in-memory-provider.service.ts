import { InMemoryProviderService } from './in-memory-provider.service';
import { InMemoryProviderClient, ScanStream } from './types';

const LOG_CONTEXT = 'CacheInMemoryProviderService';

// TODO: This is an unecessary wrapping class. Replace it with InMemoryProviderService across the codebase.
export class CacheInMemoryProviderService {
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

  public getClientStatus(): string {
    return this.getClient().status;
  }

  public getTtl(): number {
    return this.inMemoryProviderService.inMemoryProviderConfig.ttl;
  }

  public inMemoryScan(pattern: string): ScanStream {
    return this.inMemoryProviderService.inMemoryScan(pattern);
  }

  public isReady(): boolean {
    return this.inMemoryProviderService.isClientReady();
  }

  public async shutdown(): Promise<void> {
    await this.inMemoryProviderService.shutdown();
  }
}

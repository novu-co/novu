import { Global, MiddlewareConsumer, Module, ModuleMetadata } from '@nestjs/common';
import { getCommunityAuthModuleConfig, configure as configureCommunity } from './community.auth.module.config';
import { getEEModuleConfig, configure as configureEE } from './ee.auth.module.config';

const isEnterprise = process.env.NOVU_ENTERPRISE === 'true' || process.env.CI_EE_TEST === 'true';

function getModuleConfig(): ModuleMetadata {
  if (isEnterprise) {
    return getEEModuleConfig();
  } else {
    return getCommunityAuthModuleConfig();
  }
}

@Global()
@Module(getModuleConfig())
export class AuthModule {
  public configure(consumer: MiddlewareConsumer) {
    if (isEnterprise) {
      configureEE(consumer);
    } else {
      configureCommunity(consumer);
    }
  }
}

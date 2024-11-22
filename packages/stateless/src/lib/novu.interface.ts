import { type ProviderStore } from './provider/provider.store';
import { type TemplateStore } from './template/template.store';
import { type ThemeStore } from './theme/theme.store';
import { type IContentEngine } from './content/content.engine';

export interface INovuConfig {
  channels?: {
    email?: {
      from?: { name: string; email: string };
    };
  };
  variableProtection?: boolean;
  templateStore?: TemplateStore;
  providerStore?: ProviderStore;
  themeStore?: ThemeStore;
  contentEngine?: IContentEngine;
}

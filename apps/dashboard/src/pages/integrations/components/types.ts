export interface IntegrationFormData {
  name: string;
  identifier: string;
  active: boolean;
  primary: boolean;
  credentials: Record<string, any>;
}

export type IntegrationStep = 'select' | 'configure';

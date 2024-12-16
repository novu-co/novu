import { toast } from 'sonner';
import { CheckIntegrationResponseEnum } from '@/api/integrations';

export function handleIntegrationError(error: any, operation: 'update' | 'create' | 'delete') {
  if (error?.message?.code === CheckIntegrationResponseEnum.INVALID_EMAIL) {
    toast.error('Invalid sender email', {
      description: error.message?.message,
    });
  } else if (error?.message?.code === CheckIntegrationResponseEnum.BAD_CREDENTIALS) {
    toast.error('Invalid credentials or credentials expired', {
      description: error.message?.message,
    });
  } else {
    toast.error(`Failed to ${operation} integration`, {
      description: error?.message?.message || error?.message || `There was an error ${operation}ing the integration.`,
    });
  }
}

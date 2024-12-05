import { Button } from '@/components/primitives/button';
import { ApiServiceLevelEnum } from '@novu/shared';
import { useMutation } from '@tanstack/react-query';
import { get, post } from '../../api/api.client';
import { toast } from 'sonner';
import { useSubscription } from './hooks/use-subscription';
import { cn } from '../../utils/ui';
import { useTelemetry } from '../../hooks/use-telemetry';
import { TelemetryEvent } from '../../utils/telemetry';

interface PlanActionButtonProps {
  selectedBillingInterval: 'month' | 'year';
  variant?: 'default' | 'outline';
  showIcon?: boolean;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

export function PlanActionButton({
  selectedBillingInterval,
  variant = 'default',
  className,
  size = 'default',
}: PlanActionButtonProps) {
  const { data, isLoading } = useSubscription();
  const track = useTelemetry();

  const isPaidSubscriptionActive = () => {
    return data?.isActive && !data?.trial?.isActive && data?.apiServiceLevel !== ApiServiceLevelEnum.FREE;
  };

  const { mutateAsync: checkout, isLoading: isCheckingOut } = useMutation(
    () =>
      post('/v1/billing/checkout-session', {
        billingInterval: selectedBillingInterval,
        apiServiceLevel: ApiServiceLevelEnum.BUSINESS,
      }),
    {
      onSuccess: (data) => {
        track(TelemetryEvent.BILLING_UPGRADE_INITIATED, {
          fromPlan: data?.apiServiceLevel,
          toPlan: ApiServiceLevelEnum.BUSINESS,
          billingInterval: selectedBillingInterval,
        });
        window.location.href = data.stripeCheckoutUrl;
      },
      onError: (error: Error) => {
        track(TelemetryEvent.BILLING_UPGRADE_ERROR, {
          error: error.message,
          billingInterval: selectedBillingInterval,
        });
        toast.error(error.message || 'Unexpected error');
      },
    }
  );

  const { mutateAsync: goToPortal, isLoading: isGoingToPortal } = useMutation(() => get('/v1/billing/portal'), {
    onSuccess: (url) => {
      track(TelemetryEvent.BILLING_PORTAL_ACCESSED, {
        currentPlan: data?.apiServiceLevel,
        billingInterval: selectedBillingInterval,
      });
      window.location.href = url;
    },
    onError: (error: Error) => {
      track(TelemetryEvent.BILLING_PORTAL_ERROR, {
        error: error.message,
        currentPlan: data?.apiServiceLevel,
      });
      toast.error(error.message || 'Unexpected error');
    },
  });

  const handleAction = () => {
    if (isPaidSubscriptionActive()) {
      goToPortal();
    } else {
      checkout();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn('gap-2', className)}
      onClick={handleAction}
      disabled={isGoingToPortal}
      isLoading={isCheckingOut || isLoading}
    >
      {isPaidSubscriptionActive() ? 'Manage Account' : 'Upgrade plan'}
    </Button>
  );
}

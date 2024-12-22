import { ApiServiceLevelEnum } from '@novu/shared';
import { cn } from '../../utils/ui';
import { useFetchSubscription } from '../../hooks/use-fetch-subscription';
import { useCheckoutSession } from '../../hooks/use-checkout-session';
import { useBillingPortal } from '../../hooks/use-billing-portal';
import { Button } from '../primitives/button';

interface PlanActionButtonProps {
  selectedBillingInterval: 'month' | 'year';
  variant?: 'default' | 'outline';
  showIcon?: boolean;
  className?: string;
  size?: 'sm';
}

export function PlanActionButton({
  selectedBillingInterval,
  variant = 'default',
  className,
  size = 'sm',
}: PlanActionButtonProps) {
  const { subscription: data, isLoading: isLoadingSubscription } = useFetchSubscription();
  const { navigateToCheckout, isLoading: isCheckingOut } = useCheckoutSession();
  const { navigateToPortal, isLoading: isLoadingPortal } = useBillingPortal(selectedBillingInterval);

  const isPaidSubscriptionActive = () => {
    return data?.isActive && !data?.trial?.isActive && data?.apiServiceLevel !== ApiServiceLevelEnum.FREE;
  };

  const handleAction = () => {
    if (isPaidSubscriptionActive()) {
      navigateToPortal();
    } else {
      navigateToCheckout(selectedBillingInterval);
    }
  };

  return (
    <Button
      mode={variant === 'outline' ? 'outline' : 'filled'}
      variant={variant === 'outline' ? 'secondary' : 'primary'}
      size={size}
      className={cn('gap-2', className)}
      onClick={handleAction}
      disabled={isLoadingPortal}
      isLoading={isCheckingOut || isLoadingSubscription}
    >
      {isPaidSubscriptionActive() ? 'Manage Account' : 'Upgrade plan'}
    </Button>
  );
}

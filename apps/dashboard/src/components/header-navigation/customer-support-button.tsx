import { useBootIntercom } from '@/hooks/use-boot-intercom';
import { RiCustomerService2Line } from 'react-icons/ri';
import { HeaderButton } from './header-button';

export const CustomerSupportButton = () => {
  useBootIntercom();

  return (
    <button id="intercom-launcher" tabIndex={-1} className="flex items-center justify-center">
      <HeaderButton label="Help">
        <RiCustomerService2Line className="text-foreground-600 size-4" />
      </HeaderButton>
    </button>
  );
};

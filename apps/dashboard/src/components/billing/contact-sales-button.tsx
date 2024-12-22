import { Button } from '@/components/primitives/button';
import { ApiServiceLevelEnum } from '@novu/shared';
import { useState } from 'react';
import { ContactSalesModal } from './contact-sales-modal';
import { useTelemetry } from '../../hooks/use-telemetry';
import { TelemetryEvent } from '../../utils/telemetry';

interface ContactSalesButtonProps {
  className?: string;
  variant?: 'default' | 'outline';
}

export function ContactSalesButton({ className, variant = 'outline' }: ContactSalesButtonProps) {
  const [isContactSalesModalOpen, setIsContactSalesModalOpen] = useState(false);
  const track = useTelemetry();

  const handleContactSales = () => {
    track(TelemetryEvent.BILLING_CONTACT_SALES_CLICKED, {
      intendedPlan: ApiServiceLevelEnum.ENTERPRISE,
      source: 'billing_page',
    });
    setIsContactSalesModalOpen(true);
  };

  const handleModalClose = () => {
    track(TelemetryEvent.BILLING_CONTACT_SALES_MODAL_CLOSED, {
      intendedPlan: ApiServiceLevelEnum.ENTERPRISE,
    });
    setIsContactSalesModalOpen(false);
  };

  return (
    <>
      <Button variant={variant} className={className} onClick={handleContactSales}>
        Contact sales
      </Button>
      <ContactSalesModal
        isOpen={isContactSalesModalOpen}
        onClose={handleModalClose}
        intendedApiServiceLevel={ApiServiceLevelEnum.ENTERPRISE}
      />
    </>
  );
}

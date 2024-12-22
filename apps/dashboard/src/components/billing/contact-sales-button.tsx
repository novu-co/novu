import { ApiServiceLevelEnum } from '@novu/shared';
import { useState } from 'react';
import { ContactSalesModal } from './contact-sales-modal';
import { useTelemetry } from '../../hooks/use-telemetry';
import { TelemetryEvent } from '../../utils/telemetry';
import { Button } from '../primitives/button';

interface ContactSalesButtonProps {
  className?: string;
}

export function ContactSalesButton({ className }: ContactSalesButtonProps) {
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
      <Button size="sm" variant={'secondary'} mode="outline" className={className} onClick={handleContactSales}>
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

import { Button } from '@/components/primitives/button';
import { ApiServiceLevelEnum } from '@novu/shared';
import { useState } from 'react';
import { ContactSalesModal } from './contact-sales-modal';

interface ContactSalesButtonProps {
  className?: string;
  variant?: 'default' | 'outline';
}

export function ContactSalesButton({ className, variant = 'outline' }: ContactSalesButtonProps) {
  const [isContactSalesModalOpen, setIsContactSalesModalOpen] = useState(false);

  return (
    <>
      <Button variant={variant} className={className} onClick={() => setIsContactSalesModalOpen(true)}>
        Contact sales
      </Button>
      <ContactSalesModal
        isOpen={isContactSalesModalOpen}
        onClose={() => setIsContactSalesModalOpen(false)}
        intendedApiServiceLevel={ApiServiceLevelEnum.ENTERPRISE}
      />
    </>
  );
}

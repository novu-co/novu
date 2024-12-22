import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/primitives/dialog';
import { ApiServiceLevelEnum } from '@novu/shared';
import { HubspotForm } from '../hubspot-form';
import { HUBSPOT_FORM_IDS } from './utils/hubspot.constants';
import { useAuth } from '@/context/auth/hooks';
import { showSuccessToast } from '../primitives/sonner-helpers';

interface ContactSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  intendedApiServiceLevel: ApiServiceLevelEnum;
}

export function ContactSalesModal({ isOpen, onClose, intendedApiServiceLevel }: ContactSalesModalProps) {
  const { currentUser, currentOrganization } = useAuth();

  if (!isOpen || !currentUser || !currentOrganization) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-10 sm:max-w-[840px]">
        <DialogHeader>
          <DialogTitle>Contact sales</DialogTitle>
        </DialogHeader>
        <HubspotForm
          formId={HUBSPOT_FORM_IDS.UPGRADE_CONTACT_SALES}
          properties={{
            firstname: currentUser.firstName || '',
            lastname: currentUser.lastName || '',
            email: currentUser.email || '',
            app_organizationid: currentOrganization._id,
            'TICKET.subject': `Contact Sales - ${intendedApiServiceLevel}`,
            'TICKET.content': '',
          }}
          readonlyProperties={['email']}
          focussedProperty="TICKET.content"
          onFormSubmitted={() => {
            showSuccessToast('Thank you for contacting us! We will be in touch soon.');
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

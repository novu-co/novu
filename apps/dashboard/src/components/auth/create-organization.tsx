import { OrganizationList as OrganizationListForm } from '@clerk/clerk-react';
import { ROUTES } from '../../utils/routes';
import { clerkSignupAppearance } from '../../utils/clerk-appearance';
import { AuthCard } from './auth-card';
import { RiArrowLeftSLine } from 'react-icons/ri';

export default function OrganizationCreate() {
  return (
    <div className="mx-auto flex w-full max-w-[1130px] flex-col gap-3">
      <AuthCard>
        <div className="flex min-w-[564px] max-w-[564px] items-center p-[60px]">
          <div className="flex flex-col gap-[4px]">
            <StepIndicator />
            <OrganizationListForm
              appearance={{
                elements: {
                  ...clerkSignupAppearance.elements,
                  cardBox: { boxShadow: 'none' },
                  card: { paddingTop: 0, padding: 0 },
                },
              }}
              hidePersonal
              skipInvitationScreen
              afterSelectOrganizationUrl={ROUTES.ENV}
              afterCreateOrganizationUrl={ROUTES.ENV}
            />
          </div>
        </div>

        <div className="w-full max-w-[564px] flex-1">
          <img src="/images/auth/ui-org.svg" alt="create-org-illustration" className="opacity-70" />
        </div>
      </AuthCard>
    </div>
  );
}

function StepIndicator(): JSX.Element {
  return (
    <div className="text-foreground-600 inline-flex items-center gap-[2px] pl-[20px]">
      <RiArrowLeftSLine className="h-4 w-4" />
      <span className="font-label-x-small text-xs">1/3</span>
    </div>
  );
}

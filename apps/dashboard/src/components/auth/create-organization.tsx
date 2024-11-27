import { OrganizationList as OrganizationListForm } from '@clerk/clerk-react';
import { ROUTES } from '../../utils/routes';
import { clerkSignupAppearance } from '../../utils/clerk-appearance';
import { AuthCard } from './auth-card';
import { StepIndicator } from './shared';

export default function OrganizationCreate() {
  return (
    <div className="mx-auto flex w-full max-w-[1130px] flex-col gap-3">
      <AuthCard>
        <div className="flex min-w-[564px] max-w-[564px] items-center p-[60px]">
          <div className="flex flex-col gap-[4px]">
            <StepIndicator hideBackButton className="pl-[20px]" step={1} />

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
              afterCreateOrganizationUrl={ROUTES.SIGNUP_QUESTIONNAIRE}
            />
          </div>
        </div>

        <div className="w-full max-w-[564px] flex-1">
          <img src="/images/auth/ui-org.svg" alt="Novu dashboard overview" className="opacity-70" />
        </div>
      </AuthCard>
    </div>
  );
}

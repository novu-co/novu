import { SignUp as SignUpForm } from '@clerk/clerk-react';
import { PageMeta } from '@/components/page-meta';
import { ROUTES } from '@/utils/routes';
import { RegionPicker } from '@/components/auth/region-picker';
import { AuthSideBanner } from '@/components/auth/auth-side-banner';
import { clerkSignupAppearance } from '@/utils/clerk-appearance';

export const SignUpPage = () => {
  return (
    <div className="flex max-w-[1100px] gap-36">
      <PageMeta title="Sign up" />
      <AuthSideBanner />
      <div className="flex flex-1 items-center justify-end">
        <div className="flex flex-col items-start justify-start gap-[18px]">
          <SignUpForm
            path={ROUTES.SIGN_UP}
            signInUrl={ROUTES.SIGN_IN}
            appearance={clerkSignupAppearance}
            forceRedirectUrl={ROUTES.SIGNUP_ORGANIZATION_LIST}
          />
          <RegionPicker />
        </div>
      </div>
    </div>
  );
};

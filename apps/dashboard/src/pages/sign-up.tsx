import { SignUp as SignUpForm } from '@clerk/clerk-react';
import { PageMeta } from '@/components/page-meta';
import { ROUTES } from '@/utils/routes';
import { RegionPicker } from '@/components/auth/region-picker';
import { clerkAppearance } from '@/utils/clerk-appearance';

export const SignUpPage = () => {
  return (
    <>
      <PageMeta title="Sign up" />
      <div className="flex flex-col items-start justify-start gap-4">
        <SignUpForm
          path={ROUTES.SIGN_UP}
          signInUrl={ROUTES.SIGN_IN}
          appearance={clerkAppearance}
          forceRedirectUrl={ROUTES.SIGNUP_ORGANIZATION_LIST}
        />
        <RegionPicker />
      </div>
    </>
  );
};

import { ROUTES } from '@/utils/routes';
import { SignIn as SignInForm } from '@clerk/clerk-react';
import { PageMeta } from '../components/page-meta';
import { RegionPicker } from '../components/auth/region-picker';
import { AuthSideBanner } from '../components/auth/auth-side-banner';
import { clerkSignupAppearance } from '@/utils/clerk-appearance';

export const SignInPage = () => {
  return (
    <>
      <PageMeta title="Sign in" />
      <AuthSideBanner />
      <div className="flex flex-1 items-center justify-end">
        <div className="flex flex-col items-start justify-start gap-4">
          <SignInForm path={ROUTES.SIGN_IN} signUpUrl={ROUTES.SIGN_UP} appearance={clerkSignupAppearance} />
          <RegionPicker />
        </div>
      </div>
    </>
  );
};

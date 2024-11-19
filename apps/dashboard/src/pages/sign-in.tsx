import { ROUTES } from '@/utils/routes';
import { SignIn as SignInForm } from '@clerk/clerk-react';
import { PageMeta } from '../components/page-meta';
import { RegionPicker } from '../components/auth/region-picker';
import { clerkAppearance } from '@/utils/clerk-appearance';

export const SignInPage = () => {
  return (
    <>
      <PageMeta title="Sign in" />
      <div className="flex flex-col items-start justify-start gap-4">
        <SignInForm path={ROUTES.SIGN_IN} signUpUrl={ROUTES.SIGN_UP} appearance={clerkAppearance} />
        <RegionPicker />
      </div>
    </>
  );
};

import { AnimatedOutlet } from '@/components/animated-outlet';
import { AuthLayout } from '../components/auth-layout';

export const OnboardingParentRoute = () => {
  return (
    <AuthLayout>
      <AnimatedOutlet />
    </AuthLayout>
  );
};

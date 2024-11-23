import { Outlet } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';
import { useMonitoring } from '@/hooks/use-monitoring';
import { Toaster } from '@/components/primitives/sonner';
import { OptInProvider } from '@/context/opt-in-provider';

export const DashboardRoute = () => {
  useMonitoring();

  return (
    <ProtectedRoute>
      <OptInProvider>
        <Outlet />
        <Toaster />
      </OptInProvider>
    </ProtectedRoute>
  );
};

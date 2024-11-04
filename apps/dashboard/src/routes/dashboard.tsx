import { Outlet } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';
import { useMonitoring } from '@/hooks/use-monitoring';
import { Toaster } from '@/components/primitives/sonner';

export const DashboardRoute = () => {
  useMonitoring();

  return (
    <ProtectedRoute>
      <Outlet />
      <Toaster />
    </ProtectedRoute>
  );
};

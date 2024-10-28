import { Outlet } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';
import { useMonitoring } from '@/hooks/use-monitoring';

export const DashboardRoute = () => {
  useMonitoring();

  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
};

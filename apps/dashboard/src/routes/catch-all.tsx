import { Navigate } from 'react-router-dom';
import { buildRoute, ROUTES } from '@/utils/routes';
import { useEnvironment } from '../context/environment/hooks';

export const CatchAllRoute = () => {
  const { currentEnvironment } = useEnvironment();

  // TODO: check if this is the correct ROUTES
  return (
    <Navigate
      to={
        currentEnvironment?.slug
          ? buildRoute(ROUTES.WORKFLOWS, { environmentSlug: currentEnvironment.slug })
          : ROUTES.ENV
      }
    />
  );
};

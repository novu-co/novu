import { useLocation } from 'react-router-dom';

export const useTestPage = () => {
  const { pathname } = useLocation();

  return {
    isTestPage: pathname.includes('/test'),
  };
};

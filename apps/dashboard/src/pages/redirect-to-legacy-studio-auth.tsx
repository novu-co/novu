import { useEffect } from 'react';
import { LEGACY_ROUTES } from '@/utils/routes';

export const RedirectToLegacyStudioAuth = () => {
  useEffect(() => {
    const currentSearch = window.location.search;
    const redirectUrl = `${LEGACY_ROUTES.LOCAL_STUDIO_AUTH}${currentSearch}&studio_path_hint=/legacy/studio`;
    window.location.href = redirectUrl;
  }, []);

  return null;
};

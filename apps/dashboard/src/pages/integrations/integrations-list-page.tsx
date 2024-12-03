import { ChannelTypeEnum } from '@novu/shared';
import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { IntegrationsList } from './components/integrations-list';
import { ITableIntegration } from './types';
import { DashboardLayout } from '../../components/dashboard-layout';
import { useEnvironment } from '@/context/environment/hooks';
import { buildRoute, ROUTES } from '@/utils/routes';
import { UpdateProviderSidebar } from './components/update-provider-sidebar';
import { CreateProviderSidebar } from './components/create-provider-sidebar';

export function IntegrationsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentEnvironment: environment } = useEnvironment();
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const onRowClickCallback = useCallback((item: { original: ITableIntegration }) => {
    setSelectedIntegrationId(item.original.integrationId);
  }, []);

  const onAddProviderClickCallback = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const onChannelClickCallback = useCallback(
    (channel: ChannelTypeEnum) => {
      setIsCreateModalOpen(true);
      if (!environment?.slug) return;
      navigate(`${buildRoute(ROUTES.INTEGRATIONS, { environmentSlug: environment.slug })}?scrollTo=${channel}`, {
        replace: true,
      });
    },
    [navigate, environment]
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <IntegrationsList
          onAddProviderClick={onAddProviderClickCallback}
          onRowClickCallback={onRowClickCallback}
          onChannelClick={onChannelClickCallback}
        />
        <UpdateProviderSidebar
          isOpened={!!selectedIntegrationId}
          integrationId={selectedIntegrationId}
          onClose={() => setSelectedIntegrationId(undefined)}
        />
        <CreateProviderSidebar
          isOpened={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          scrollToChannel={searchParams.get('scrollTo') as ChannelTypeEnum}
        />
      </div>
    </DashboardLayout>
  );
}

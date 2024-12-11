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
import { Badge } from '../../components/primitives/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { Button } from '@/components/primitives/button';

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
    <DashboardLayout
      headerStartItems={
        <h1 className="text-foreground-950 flex items-center gap-1">
          <span>Integration Store</span>
          <Badge kind="pill" size="2xs">
            BETA
          </Badge>
        </h1>
      }
    >
      <Tabs defaultValue="providers">
        <div className="border-neutral-alpha-200 flex items-center justify-between border-b border-t">
          <TabsList variant="regular" className="border-b-0 border-t-2 border-transparent p-0 !px-3">
            <TabsTrigger value="providers" variant="regular">
              Providers
            </TabsTrigger>
            <TabsTrigger value="data-warehouse" variant="regular" disabled>
              Data Warehouse{' '}
              <Badge kind="pill" size="2xs">
                SOON
              </Badge>
            </TabsTrigger>
          </TabsList>
          <Button size="sm" variant="primary" onClick={onAddProviderClickCallback} className="my-1.5 mr-2.5">
            Connect Provider
          </Button>
        </div>
        <TabsContent value="providers" variant="regular" className="p-2.5">
          <IntegrationsList
            onAddProviderClick={onAddProviderClickCallback}
            onRowClickCallback={onRowClickCallback}
            onChannelClick={onChannelClickCallback}
          />
        </TabsContent>
        <TabsContent value="data-warehouse" variant="regular">
          <div className="text-muted-foreground flex h-64 items-center justify-center">Coming soon</div>
        </TabsContent>
      </Tabs>
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
    </DashboardLayout>
  );
}

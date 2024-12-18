import { ChannelTypeEnum } from '@novu/shared';
import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { IntegrationsList } from './components/integrations-list';
import { ITableIntegration } from './types';
import { DashboardLayout } from '../../components/dashboard-layout';
import { UpdateIntegrationSidebar } from './components/update-integration-sidebar';
import { CreateIntegrationSidebar } from './components/create-integration-sidebar';
import { Badge } from '../../components/primitives/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { Button } from '@/components/primitives/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/primitives/tooltip';

export function IntegrationsListPage() {
  const [searchParams] = useSearchParams();
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const onRowClickCallback = useCallback((item: { original: ITableIntegration }) => {
    setSelectedIntegrationId(item.original.integrationId);
  }, []);

  const onAddIntegrationClickCallback = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

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
        <div className="border-neutral-alpha-200 flex items-center justify-between border-b">
          <TabsList variant="regular" className="border-b-0 border-t-2 border-transparent p-0 !px-2">
            <TabsTrigger value="providers" variant="regular">
              Providers
            </TabsTrigger>
            <Tooltip>
              <TooltipTrigger>
                <TabsTrigger value="data-warehouse" variant="regular" disabled>
                  Data{' '}
                  <Badge kind="pill" size="2xs">
                    SOON
                  </Badge>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Data warehouse connectors for syncing user data and triggering notifications.
                </p>
              </TooltipContent>
            </Tooltip>
          </TabsList>
          <Button size="sm" variant="primary" onClick={onAddIntegrationClickCallback} className="my-1.5 mr-2.5">
            Connect Provider
          </Button>
        </div>
        <TabsContent value="providers" variant="regular" className="!mt-0 p-2.5">
          <IntegrationsList onRowClickCallback={onRowClickCallback} />
        </TabsContent>
        <TabsContent value="data-warehouse" variant="regular">
          <div className="text-muted-foreground flex h-64 items-center justify-center">Coming soon</div>
        </TabsContent>
      </Tabs>
      <UpdateIntegrationSidebar
        isOpened={!!selectedIntegrationId}
        integrationId={selectedIntegrationId}
        onClose={() => setSelectedIntegrationId(undefined)}
      />
      <CreateIntegrationSidebar
        isOpened={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        scrollToChannel={searchParams.get('scrollTo') as ChannelTypeEnum}
      />
    </DashboardLayout>
  );
}

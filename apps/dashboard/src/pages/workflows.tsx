import { CreateWorkflowButton } from '@/components/create-workflow-button';
import { DashboardLayout } from '@/components/dashboard-layout';
import { OptInModal } from '@/components/opt-in-modal';
import { PageMeta } from '@/components/page-meta';
import { Button } from '@/components/primitives/button';
import { Input } from '@/components/primitives/input';
import { useDebounce } from '@/hooks/use-debounce';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryEvent } from '@/utils/telemetry';
import { FeatureFlagsKeysEnum } from '@novu/shared';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiArrowDownSLine, RiFileAddLine, RiFileMarkedLine, RiRouteFill, RiSearchLine } from 'react-icons/ri';
import { useSearchParams } from 'react-router-dom';
import { ButtonGroupItem, ButtonGroupRoot } from '../components/primitives/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/primitives/dropdown-menu';
import { Form, FormField, FormItem } from '../components/primitives/form/form';
import { WorkflowTemplateModal } from '../components/template-store/workflow-template-modal';
import { WorkflowList } from '../components/workflow-list';

interface WorkflowFilters {
  query: string;
}

export const WorkflowsPage = () => {
  const track = useTelemetry();
  const isTemplateStoreEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_V2_TEMPLATE_STORE_ENABLED);
  const [shouldOpenTemplateModal, setShouldOpenTemplateModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams({
    orderDirection: 'desc',
    orderByField: 'updatedAt',
    query: '',
  });
  const form = useForm<WorkflowFilters>({
    defaultValues: {
      query: searchParams.get('query') || '',
    },
  });

  const updateSearchParam = (value: string) => {
    if (value) {
      searchParams.set('query', value);
    } else {
      searchParams.delete('query');
    }
    setSearchParams(searchParams);
  };

  const debouncedSearch = useDebounce((value: string) => updateSearchParam(value), 500);

  const clearFilters = () => {
    form.reset({ query: '' });
  };

  useEffect(() => {
    const subscription = form.watch((value: { query?: string }) => {
      debouncedSearch(value.query || '');
    });

    return () => {
      subscription.unsubscribe();
      debouncedSearch.cancel();
    };
  }, [form, debouncedSearch]);

  useEffect(() => {
    track(TelemetryEvent.WORKFLOWS_PAGE_VISIT);
  }, [track]);

  const hasActiveFilters = searchParams.get('query') !== null;

  return (
    <>
      <PageMeta title="Workflows" />
      <DashboardLayout headerStartItems={<h1 className="text-foreground-950 flex items-center gap-1">Workflows</h1>}>
        <OptInModal />
        <div className="h-full w-full">
          <div className="flex justify-between px-2.5 py-2.5">
            <Form {...form}>
              <form>
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <Input size="xs" {...field} placeholder="Search workflows..." leadingIcon={RiSearchLine} />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            {isTemplateStoreEnabled ? (
              <ButtonGroupRoot size="xs">
                <ButtonGroupItem asChild className="gap-1">
                  <CreateWorkflowButton asChild>
                    <Button
                      mode="gradient"
                      className="rounded-l-lg rounded-r-none border-none p-2 text-white"
                      variant="primary"
                      size="xs"
                      leadingIcon={RiRouteFill}
                    >
                      Create workflow
                    </Button>
                  </CreateWorkflowButton>
                </ButtonGroupItem>
                <ButtonGroupItem asChild>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        mode="gradient"
                        className="rounded-l-none rounded-r-lg border-none text-white"
                        variant="primary"
                        size="xs"
                        leadingIcon={RiArrowDownSLine}
                      ></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuItem className="cursor-pointer" asChild>
                        <CreateWorkflowButton className="w-full">
                          <div className="flex items-center gap-2">
                            <RiFileAddLine />
                            Blank Workflow
                          </div>
                        </CreateWorkflowButton>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onSelect={() => setShouldOpenTemplateModal(true)}>
                        <RiFileMarkedLine />
                        View Workflow Gallery
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ButtonGroupItem>
              </ButtonGroupRoot>
            ) : (
              <CreateWorkflowButton asChild>
                <Button mode="gradient" variant="primary" size="xs" leadingIcon={RiRouteFill}>
                  Create workflow
                </Button>
              </CreateWorkflowButton>
            )}
            {shouldOpenTemplateModal && <WorkflowTemplateModal open={true} onOpenChange={setShouldOpenTemplateModal} />}
          </div>
          <WorkflowList hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters} />
        </div>
      </DashboardLayout>
    </>
  );
};

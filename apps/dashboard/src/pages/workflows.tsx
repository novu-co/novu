import { CreateWorkflowButton } from '@/components/create-workflow-button';
import { DashboardLayout } from '@/components/dashboard-layout';
import { OptInModal } from '@/components/opt-in-modal';
import { PageMeta } from '@/components/page-meta';
import { Button } from '@/components/primitives/button';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryEvent } from '@/utils/telemetry';
import { FeatureFlagsKeysEnum } from '@novu/shared';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiArrowDownSLine, RiFileAddLine, RiFileMarkedLine, RiRouteFill } from 'react-icons/ri';
import { useSearchParams } from 'react-router-dom';
import { ButtonGroupItem, ButtonGroupRoot } from '../components/primitives/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/primitives/dropdown-menu';
import { FacetedFormFilter } from '../components/primitives/form/faceted-filter/facated-form-filter';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const form = useForm<WorkflowFilters>({
    defaultValues: {
      query: searchParams.get('query') || '',
    },
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.query) {
        searchParams.set('query', value.query);
      } else {
        searchParams.delete('query');
      }
      setSearchParams(searchParams);
    });

    return () => subscription.unsubscribe();
  }, [form, searchParams, setSearchParams]);

  useEffect(() => {
    track(TelemetryEvent.WORKFLOWS_PAGE_VISIT);
  }, [track]);

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
                      <FacetedFormFilter
                        type="text"
                        size="small"
                        title="Search"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Search workflows"
                      />
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
          <WorkflowList />
        </div>
      </DashboardLayout>
    </>
  );
};

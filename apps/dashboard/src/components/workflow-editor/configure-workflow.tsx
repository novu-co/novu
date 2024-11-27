import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useLayoutEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as z from 'zod';
// import { RiArrowRightSLine, RiSettingsLine } from 'react-icons/ri';

import { RouteFill } from '../icons';
import { Input, InputField } from '../primitives/input';
import { Separator } from '../primitives/separator';
import { TagInput } from '../primitives/tag-input';
import { Textarea } from '../primitives/textarea';
import { MAX_DESCRIPTION_LENGTH, workflowSchema } from './schema';
import { useTagsQuery } from '@/hooks/use-tags-query';
import { CopyButton } from '../primitives/copy-button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../primitives/form/form';
import { Switch } from '../primitives/switch';
import { useWorkflowEditorContext } from '@/components/workflow-editor/hooks';
import { cn } from '@/utils/ui';
import { SidebarContent, SidebarHeader } from '@/components/side-navigation/sidebar';
import { PageMeta } from '../page-meta';
import { ConfirmationModal } from '../confirmation-modal';
import { PauseModalDescription, PAUSE_MODAL_TITLE } from '@/components/pause-workflow-dialog';
import { buildRoute, ROUTES } from '@/utils/routes';
import { useEnvironment } from '@/context/environment/hooks';

export function ConfigureWorkflow() {
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const tagsQuery = useTagsQuery();
  const { isReadOnly, workflow } = useWorkflowEditorContext();
  const { currentEnvironment } = useEnvironment();
  const { workflowSlug } = useParams<{ workflowSlug: string }>();
  const navigate = useNavigate();
  const [isBlurred, setIsBlurred] = useState(false);

  const { control, watch, setValue } = useFormContext<z.infer<typeof workflowSchema>>();
  const workflowName = watch('name');
  const isWorkflowSlugChanged = workflow && workflow?.slug && workflowSlug !== workflow?.slug;
  const shouldUpdateWorkflowSlug = isBlurred && isWorkflowSlugChanged;

  useLayoutEffect(() => {
    if (shouldUpdateWorkflowSlug) {
      const timeoutId = setTimeout(() => {
        navigate(
          buildRoute(ROUTES.EDIT_WORKFLOW, {
            environmentSlug: currentEnvironment?.slug ?? '',
            workflowSlug: workflow?.slug ?? '',
          }),
          {
            replace: true,
            state: { skipAnimation: true },
          }
        );
      }, 0);
      setIsBlurred(false);

      return () => clearTimeout(timeoutId);
    }
  }, [shouldUpdateWorkflowSlug, workflow?.slug, currentEnvironment?.slug, navigate]);

  const onPauseWorkflow = () => {
    setValue('active', false, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <>
      <ConfirmationModal
        open={isPauseModalOpen}
        onOpenChange={setIsPauseModalOpen}
        onConfirm={() => {
          onPauseWorkflow();
          setIsPauseModalOpen(false);
        }}
        title={PAUSE_MODAL_TITLE}
        description={<PauseModalDescription workflowName={workflowName} />}
        confirmButtonText="Proceed"
      />
      <PageMeta title={workflowName} />
      <motion.div
        className={cn('relative flex h-full w-full flex-col')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0.1 }}
        transition={{ duration: 0.1 }}
      >
        <SidebarHeader className="items-center text-sm font-medium">
          <div className="flex items-center gap-1">
            <RouteFill />
            <span>Configure workflow</span>
          </div>
        </SidebarHeader>
        <Separator />
        <SidebarContent size="md">
          <FormField
            control={control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex w-full items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="bg-success/60 data-[active=false]:shadow-neutral-alpha-100 ml-2 h-1.5 w-1.5 rounded-full [--pulse-color:var(--success)] data-[active=true]:animate-[pulse-shadow_1s_ease-in-out_infinite] data-[active=false]:bg-neutral-300 data-[active=false]:shadow-[0_0px_0px_5px_var(--neutral-alpha-200),0_0px_0px_9px_var(--neutral-alpha-100)]"
                    data-active={field.value}
                  />
                  <FormLabel>Active Workflow</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      if (!checked) {
                        setIsPauseModalOpen(true);
                        return;
                      }
                      field.onChange(checked);
                    }}
                    disabled={isReadOnly}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </SidebarContent>
        <Separator />
        <SidebarContent>
          <FormField
            control={control}
            name="name"
            defaultValue=""
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <InputField>
                    <Input
                      placeholder="New workflow"
                      {...field}
                      disabled={isReadOnly}
                      onFocus={() => setIsBlurred(false)}
                      onBlur={() => setIsBlurred(true)}
                    />
                  </InputField>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="workflowId"
            defaultValue=""
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identifier</FormLabel>
                <FormControl>
                  <InputField className="flex overflow-hidden pr-0">
                    <Input placeholder="Untitled" className="cursor-default" {...field} readOnly />
                    <CopyButton size="input-right" valueToCopy={field.value} />
                  </InputField>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-36"
                    placeholder="Description of what this workflow does"
                    {...field}
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    disabled={isReadOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="tags"
            render={({ field }) => (
              <FormItem className="group" tabIndex={-1}>
                <div className="flex items-center gap-1">
                  <FormLabel>Tags</FormLabel>
                </div>
                <FormControl className="text-xs text-neutral-600">
                  <TagInput
                    {...field}
                    disabled={isReadOnly}
                    value={field.value ?? []}
                    suggestions={tagsQuery.data?.data.map((tag) => tag.name) || []}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </SidebarContent>
        <Separator />
        {/* <SidebarContent size="lg">
        <Button variant="outline" className="flex w-full justify-start gap-1.5 text-xs font-medium" type="button">
          <RiSettingsLine className="h-4 w-4 text-neutral-600" />
          Configure channel preferences <RiArrowRightSLine className="ml-auto h-4 w-4 text-neutral-600" />
        </Button>
      </SidebarContent>
      <Separator /> */}
      </motion.div>
    </>
  );
}

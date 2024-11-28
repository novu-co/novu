import { motion } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { PAUSE_MODAL_TITLE, PauseModalDescription } from '@/components/pause-workflow-dialog';
import { SidebarContent, SidebarHeader } from '@/components/side-navigation/sidebar';
import { useFormAutosave } from '@/hooks/use-form-autosave';
import { useTagsQuery } from '@/hooks/use-tags-query';
import { cn } from '@/utils/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { PatchWorkflowDto, UpdateWorkflowDto, WorkflowOriginEnum, WorkflowResponseDto } from '@novu/shared';
import { ConfirmationModal } from '../confirmation-modal';
import { RouteFill } from '../icons';
import { PageMeta } from '../page-meta';
import { CopyButton } from '../primitives/copy-button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../primitives/form/form';
import { Input, InputField } from '../primitives/input';
import { Separator } from '../primitives/separator';
import { Switch } from '../primitives/switch';
import { TagInput } from '../primitives/tag-input';
import { Textarea } from '../primitives/textarea';
import { MAX_DESCRIPTION_LENGTH, workflowSchema } from '@/components/workflow-editor/schema';
import { z } from 'zod';

type ConfigureWorkflowFormProps = {
  workflow: WorkflowResponseDto;
  debouncedUpdate: (data: UpdateWorkflowDto) => void;
  patch: (data: PatchWorkflowDto) => void;
};

export const ConfigureWorkflowForm = (props: ConfigureWorkflowFormProps) => {
  const { workflow, debouncedUpdate, patch } = props;
  const isReadOnly = workflow.origin === WorkflowOriginEnum.EXTERNAL;
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const tagsQuery = useTagsQuery();

  const form = useForm<z.infer<typeof workflowSchema>>({
    defaultValues: {
      name: workflow.name,
      workflowId: workflow.workflowId,
      description: workflow.description,
      tags: workflow.tags,
    },
    resolver: zodResolver(workflowSchema),
  });

  const statusForm = useForm({
    defaultValues: {
      active: workflow.active,
    },
  });

  const onPauseWorkflow = () => {
    statusForm.setValue('active', false, { shouldValidate: true, shouldDirty: true });
  };

  useFormAutosave(form, (data) => {
    debouncedUpdate({ ...workflow, ...data });
  });

  useFormAutosave(statusForm, (data) => {
    patch(data);
  });

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
        description={<PauseModalDescription workflowName={workflow.name} />}
        confirmButtonText="Proceed"
      />
      <PageMeta title={workflow.name} />
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
        <Form {...statusForm}>
          <form>
            <SidebarContent size="md">
              <FormField
                control={statusForm.control}
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
          </form>
        </Form>
        <Separator />
        <Form {...form}>
          <form>
            <SidebarContent>
              <FormField
                control={form.control}
                name="name"
                defaultValue=""
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <InputField>
                        <Input placeholder="New workflow" {...field} disabled={isReadOnly} />
                      </InputField>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-36"
                        placeholder="Describe what this workflow does"
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
                control={form.control}
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
          </form>
        </Form>
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
};

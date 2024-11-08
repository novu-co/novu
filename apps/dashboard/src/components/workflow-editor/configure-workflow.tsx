import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { RouteFill } from '../icons';
import { Input, InputField } from '../primitives/input';
// import { RiArrowRightSLine, RiSettingsLine } from 'react-icons/ri';
import * as z from 'zod';
import { Separator } from '../primitives/separator';
import { TagInput } from '../primitives/tag-input';
import { Textarea } from '../primitives/textarea';
import { workflowSchema } from './schema';
import { useTagsQuery } from '@/hooks/use-tags-query';
// import { Button } from '../primitives/button';
import { CopyButton } from '../primitives/copy-button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../primitives/form/form';
import { Switch } from '../primitives/switch';
import { useWorkflowEditorContext } from '@/components/workflow-editor/hooks';
import { cn } from '@/utils/ui';
import { SidebarContent, SidebarHeader } from '@/components/side-navigation/Sidebar';

export function ConfigureWorkflow() {
  const tagsQuery = useTagsQuery();
  const { isReadOnly } = useWorkflowEditorContext();

  const { control } = useFormContext<z.infer<typeof workflowSchema>>();
  return (
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
                <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isReadOnly} />
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workflow Name</FormLabel>
              <FormControl>
                <InputField>
                  <Input placeholder="Untitled" {...field} disabled={isReadOnly} />
                </InputField>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="workflowId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workflow Identifier</FormLabel>
              <FormControl>
                <InputField className="flex overflow-hidden pr-0">
                  <Input placeholder="Untitled" {...field} disabled={isReadOnly} />
                  <CopyButton
                    content={field.value}
                    className="rounded-md rounded-s-none border-b-0 border-r-0 border-t-0 text-neutral-400"
                  />
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
                <Textarea placeholder="Description of what this workflow does" {...field} disabled={isReadOnly} />
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
                  showAddButton={!isReadOnly}
                />
              </FormControl>
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
  );
}

import { createWorkflow } from '@/api/workflows';
import { Button } from '@/components/primitives/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { Input, InputField } from '@/components/primitives/input';
import { Separator } from '@/components/primitives/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetMain,
  SheetTitle,
  SheetTrigger,
} from '@/components/primitives/sheet';
import { TagInput } from '@/components/primitives/tag-input';
import { Textarea } from '@/components/primitives/textarea';
import { ExternalLink } from '@/components/shared/external-link';
import { useEnvironment } from '@/context/environment/hooks';
import { useTags } from '@/hooks/use-tags';
import { AUTOCOMPLETE_PASSWORD_MANAGERS_OFF } from '@/utils/constants';
import { QueryKeys } from '@/utils/query-keys';
import { buildRoute, ROUTES } from '@/utils/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { type CreateWorkflowDto, slugify, WorkflowCreationSourceEnum } from '@novu/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ComponentProps, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiArrowRightSLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { MAX_DESCRIPTION_LENGTH, MAX_TAG_ELEMENTS, workflowSchema } from './workflow-editor/schema';

type CreateWorkflowButtonProps = ComponentProps<typeof SheetTrigger>;
export const CreateWorkflowButton = (props: CreateWorkflowButtonProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { currentEnvironment } = useEnvironment();
  const [isOpen, setIsOpen] = useState(false);
  // TODO: Move to a use-create-workflow.ts hook
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (workflow: CreateWorkflowDto) => createWorkflow({ environment: currentEnvironment!, workflow }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: [QueryKeys.fetchWorkflows, currentEnvironment?._id] });
      await queryClient.invalidateQueries({
        queryKey: [QueryKeys.fetchWorkflow, currentEnvironment?._id, result.data.workflowId],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.fetchTags, currentEnvironment?._id],
      });
      setIsOpen(false);
      form.reset();
      navigate(
        buildRoute(ROUTES.EDIT_WORKFLOW, {
          environmentSlug: currentEnvironment?.slug ?? '',
          workflowSlug: result.data.slug ?? '',
        })
      );
    },
  });
  const { tags } = useTags();

  const form = useForm<z.infer<typeof workflowSchema>>({
    resolver: zodResolver(workflowSchema),
    defaultValues: { description: '', workflowId: '', name: '', tags: [] },
  });

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger {...props} />
      <SheetContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader>
          <SheetTitle>Create workflow</SheetTitle>
          <div>
            <SheetDescription>
              Define the steps to notify subscribers using channels like in-app, email, and more.{' '}
              <ExternalLink href="https://docs.novu.co/concepts/workflows">Learn more</ExternalLink>
            </SheetDescription>
          </div>
        </SheetHeader>
        <Separator />
        <SheetMain>
          <Form {...form}>
            <form
              id="create-workflow"
              autoComplete="off"
              noValidate
              onSubmit={form.handleSubmit((values) => {
                mutateAsync({
                  name: values.name,
                  steps: [],
                  __source: WorkflowCreationSourceEnum.DASHBOARD,
                  workflowId: values.workflowId,
                  description: values.description || undefined,
                  tags: values.tags,
                });
              })}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <InputField>
                        <Input
                          {...field}
                          autoFocus
                          {...AUTOCOMPLETE_PASSWORD_MANAGERS_OFF}
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue('workflowId', slugify(e.target.value));
                          }}
                        />
                      </InputField>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workflowId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identifier</FormLabel>
                    <FormControl>
                      <InputField>
                        <Input {...field} readOnly />
                      </InputField>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1">
                      <FormLabel hint={`(max. ${MAX_TAG_ELEMENTS})`}>Add tags</FormLabel>
                    </div>
                    <FormControl>
                      <TagInput
                        suggestions={tags.map((tag) => tag.name)}
                        {...field}
                        value={field.value ?? []}
                        onChange={(tags) => {
                          field.onChange(tags);
                          form.setValue('tags', tags, { shouldValidate: true });
                        }}
                      />
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
                    <div className="flex items-center gap-1">
                      <FormLabel optional>Description</FormLabel>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what this workflow does"
                        {...field}
                        showCounter
                        maxLength={MAX_DESCRIPTION_LENGTH}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </SheetMain>
        <Separator />
        <SheetFooter>
          <Button
            isLoading={isPending}
            trailingIcon={RiArrowRightSLine}
            variant="secondary"
            mode="gradient"
            type="submit"
            form="create-workflow"
          >
            Create workflow
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

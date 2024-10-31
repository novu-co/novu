import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ComponentProps, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiExternalLinkLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { type CreateWorkflowDto, WorkflowCreationSourceEnum, slugify } from '@novu/shared';
import { createWorkflow } from '@/api/workflows';
import { Button } from '@/components/primitives/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/primitives/form/form';
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
import { useEnvironment } from '@/context/environment/hooks';
import { useTagsQuery } from '@/hooks/use-tags-query';
import { QueryKeys } from '@/utils/query-keys';
import { buildRoute, ROUTES } from '@/utils/routes';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  workflowId: z.string(),
  tags: z
    .array(z.string().min(1))
    .max(8)
    .refine((tags) => new Set(tags).size === tags.length, {
      message: 'Duplicate tags are not allowed.',
    }),
  description: z.string().max(200).optional(),
});

type CreateWorkflowButtonProps = ComponentProps<typeof SheetTrigger>;
export const CreateWorkflowButton = (props: CreateWorkflowButtonProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { currentEnvironment } = useEnvironment();
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: CreateWorkflowDto) => createWorkflow(data),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: [QueryKeys.fetchWorkflows, currentEnvironment?._id] });
      await queryClient.invalidateQueries({
        queryKey: [QueryKeys.fetchWorkflow, currentEnvironment?._id, result.data.workflowId],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.fetchTags, currentEnvironment?._id],
      });
      setIsOpen(false);
      navigate(
        buildRoute(ROUTES.EDIT_WORKFLOW, {
          environmentId: currentEnvironment?._id ?? '',
          workflowId: result.data._id,
        })
      );
    },
  });
  const tagsQuery = useTagsQuery();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { description: '', workflowId: '', name: '', tags: [] },
  });

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          form.reset();
        }
      }}
    >
      <SheetTrigger {...props} />
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create workflow</SheetTitle>
          <div>
            <SheetDescription>
              Workflows manage event-driven notifications across multiple channels in a version-controlled flow, with
              the ability to manage preference for each subscriber.
            </SheetDescription>
            <Link
              target="_blank"
              to="https://docs.novu.co/api-reference/workflows/create-workflow"
              className="text-foreground-400 flex items-center text-sm underline"
            >
              Learn more <RiExternalLinkLine className="inline size-4" />
            </Link>
          </div>
        </SheetHeader>
        <Separator />
        <SheetMain>
          <Form {...form}>
            <form
              id="create-workflow"
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
              className="flex flex-col gap-6"
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
                          onChange={(e) => {
                            field.onChange(e);
                            form.setValue('workflowId', slugify(e.target.value));
                          }}
                        />
                      </InputField>
                    </FormControl>
                    <FormMessage>Name is required</FormMessage>
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

              <Separator className="bg-neutral-alpha-100" />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1">
                      <FormLabel hint="(max. 8)">Add tags</FormLabel>
                    </div>
                    <FormControl>
                      <TagInput suggestions={tagsQuery.data?.data.map((tag) => tag.name) || []} {...field} />
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
                      <Textarea placeholder="Description of what this workflow does" {...field} />
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
          <Button disabled={isPending} variant="default" type="submit" form="create-workflow">
            Create workflow
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

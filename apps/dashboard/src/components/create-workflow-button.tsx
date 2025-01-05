import { Button } from '@/components/primitives/button';
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
import { ExternalLink } from '@/components/shared/external-link';
import { CreateWorkflowForm } from '@/components/workflow-editor/create-workflow-form';
import { useCreateWorkflow } from '@/hooks/use-create-workflow';
import { type CreateWorkflowDto } from '@novu/shared';
import { ComponentProps, useState } from 'react';
import { RiArrowRightSLine } from 'react-icons/ri';
import { z } from 'zod';
import { workflowSchema } from './workflow-editor/schema';

interface CreateWorkflowButtonProps extends ComponentProps<typeof SheetTrigger> {
  template?: CreateWorkflowDto;
}

export const CreateWorkflowButton = ({ template, ...props }: CreateWorkflowButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { createWorkflow: createFromTemplate, isLoading: isCreating } = useCreateWorkflow({
    onSuccess: () => setIsOpen(false),
  });

  const handleSubmit = (values: z.infer<typeof workflowSchema>) => {
    createFromTemplate(values, template);
  };

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
          <CreateWorkflowForm onSubmit={handleSubmit} template={template} />
        </SheetMain>
        <Separator />
        <SheetFooter>
          <Button
            isLoading={isCreating}
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

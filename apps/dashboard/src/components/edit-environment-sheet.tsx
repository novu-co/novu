import { Button } from '@/components/primitives/button';
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/primitives/form/form';
import { Separator } from '@/components/primitives/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetMain,
  SheetTitle,
} from '@/components/primitives/sheet';
import { ExternalLink } from '@/components/shared/external-link';
import { useUpdateEnvironment } from '@/hooks/use-environments';
import { zodResolver } from '@hookform/resolvers/zod';
import { IEnvironment } from '@novu/shared';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { RiArrowRightSLine } from 'react-icons/ri';
import { z } from 'zod';

const editEnvironmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type EditEnvironmentFormData = z.infer<typeof editEnvironmentSchema>;

interface EditEnvironmentSheetProps {
  environment?: IEnvironment;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditEnvironmentSheet = ({ environment, isOpen, onOpenChange }: EditEnvironmentSheetProps) => {
  const { mutateAsync: updateEnvironment, isPending } = useUpdateEnvironment();

  const form = useForm<EditEnvironmentFormData>({
    resolver: zodResolver(editEnvironmentSchema),
    defaultValues: {
      name: environment?.name || '',
    },
  });

  useEffect(() => {
    if (environment) {
      form.reset({
        name: environment.name,
      });
    }
  }, [environment, form]);

  const onSubmit = async (values: EditEnvironmentFormData) => {
    if (!environment) return;

    await updateEnvironment({
      environment,
      name: values.name,
    });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader>
          <SheetTitle>Edit environment</SheetTitle>
          <div>
            <SheetDescription>
              Update your environment settings.{' '}
              <ExternalLink href="https://docs.novu.co/concepts/environments">Learn more</ExternalLink>
            </SheetDescription>
          </div>
        </SheetHeader>
        <Separator />
        <SheetMain>
          <Form {...form}>
            <form
              id="edit-environment"
              autoComplete="off"
              noValidate
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Name</FormLabel>
                    <FormControl>
                      <FormInput
                        {...field}
                        autoFocus
                        onChange={(e) => {
                          field.onChange(e);
                        }}
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
            form="edit-environment"
          >
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

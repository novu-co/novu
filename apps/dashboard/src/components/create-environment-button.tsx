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
  SheetTrigger,
} from '@/components/primitives/sheet';
import { ExternalLink } from '@/components/shared/external-link';
import { useCreateEnvironment } from '@/hooks/use-environments';
import { zodResolver } from '@hookform/resolvers/zod';
import { ComponentProps, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiAddLine, RiArrowRightSLine } from 'react-icons/ri';
import { z } from 'zod';

const createEnvironmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type CreateEnvironmentFormData = z.infer<typeof createEnvironmentSchema>;

type CreateEnvironmentButtonProps = ComponentProps<typeof Button>;

export const CreateEnvironmentButton = (props: CreateEnvironmentButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync, isPending } = useCreateEnvironment();

  const form = useForm<CreateEnvironmentFormData>({
    resolver: zodResolver(createEnvironmentSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (values: CreateEnvironmentFormData) => {
    await mutateAsync({
      name: values.name,
    });
    setIsOpen(false);
    form.reset();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button mode="gradient" variant="primary" size="xs" leadingIcon={RiAddLine} {...props}>
          Create environment
        </Button>
      </SheetTrigger>
      <SheetContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <SheetHeader>
          <SheetTitle>Create environment</SheetTitle>
          <div>
            <SheetDescription>
              Create a new environment to manage your notifications.{' '}
              <ExternalLink href="https://docs.novu.co/concepts/environments">Learn more</ExternalLink>
            </SheetDescription>
          </div>
        </SheetHeader>
        <Separator />
        <SheetMain>
          <Form {...form}>
            <form
              id="create-environment"
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
            form="create-environment"
          >
            Create environment
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

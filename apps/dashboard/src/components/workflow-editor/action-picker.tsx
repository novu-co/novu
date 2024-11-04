import { ComponentProps } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { RiEdit2Line, RiExpandUpDownLine, RiForbid2Line } from 'react-icons/ri';
import { z } from 'zod';
import { RedirectTargetEnum } from '@novu/shared';
import { Button, buttonVariants } from '@/components/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/primitives/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { InputField } from '@/components/primitives/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/primitives/popover';
import { Separator } from '@/components/primitives/separator';
import { URLInput } from '@/components/primitives/url-input';
import { cn } from '@/utils/ui';
import { urlTargetTypes } from '@/utils/url';
import { Editor } from '../primitives/editor';

type Action = {
  label: string;
  redirect: {
    url: string;
    type: string;
  };
};

type Actions = {
  primaryAction?: Action;
  secondaryAction?: Action;
};

type ActionPickerProps = {
  className?: string;
  value: Actions | undefined;
  onChange: (value: Actions) => void;
};

export const ActionPicker = (props: ActionPickerProps) => {
  const { className, value, onChange } = props;
  const primaryAction = value?.primaryAction;
  const secondaryAction = value?.secondaryAction;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="border-neutral-alpha-200 flex min-h-10 w-full flex-wrap items-center justify-end gap-1 rounded-md border p-1 shadow-sm">
        {!primaryAction && !secondaryAction && (
          <div className={buttonVariants({ variant: 'dashed', size: 'sm' })}>
            <RiForbid2Line className="size-4" />
            No action
          </div>
        )}
        {primaryAction && (
          <ConfigureActionPopover
            asChild
            action={primaryAction}
            setAction={(primaryAction) => {
              onChange({ primaryAction, secondaryAction });
            }}
          >
            <Button variant="primary" size="xs">
              {primaryAction.label}
            </Button>
          </ConfigureActionPopover>
        )}
        {secondaryAction && (
          <ConfigureActionPopover
            asChild
            action={secondaryAction}
            setAction={(secondaryAction) => {
              onChange({ primaryAction, secondaryAction });
            }}
          >
            <Button variant="outline" size="xs">
              {secondaryAction.label}
            </Button>
          </ConfigureActionPopover>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={'icon'} variant={'ghost'}>
            <RiExpandUpDownLine className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-1">
          <DropdownMenuItem
            onClick={() => {
              onChange({});
            }}
          >
            <div className={cn(buttonVariants({ variant: 'dashed', size: 'xs' }), 'pointer-events-none gap-2')}>
              <RiForbid2Line className="size-4" />
              No action
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onChange({
                primaryAction: value?.primaryAction || {
                  label: 'Primary action',
                  redirect: { type: '_self', url: '' },
                },
                secondaryAction: undefined,
              });
            }}
          >
            <div className={cn(buttonVariants({ variant: 'primary', size: 'xs' }), 'pointer-events-none')}>
              Primary action
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              onChange({
                primaryAction: value?.primaryAction || {
                  label: 'Primary action',
                  redirect: { type: '_self', url: '' },
                },
                secondaryAction: value?.secondaryAction || {
                  label: 'Secondary action',
                  redirect: { type: '_self', url: '' },
                },
              });
            }}
          >
            <div className={cn(buttonVariants({ variant: 'primary', size: 'xs' }), 'pointer-events-none')}>
              Primary action
            </div>
            <div className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), 'pointer-events-none')}>
              Secondary action
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const formSchema = z.object({
  label: z.string(),
  redirect: z.object({
    url: z.string(),
    type: z.union([
      z.literal(RedirectTargetEnum.BLANK),
      z.literal(RedirectTargetEnum.PARENT),
      z.literal(RedirectTargetEnum.SELF),
      z.literal(RedirectTargetEnum.TOP),
      z.literal(RedirectTargetEnum.UNFENCED_TOP),
    ]),
  }),
});

const ConfigureActionPopover = (
  props: ComponentProps<typeof PopoverTrigger> & { action: Action; setAction: (action: Action) => void }
) => {
  const { setAction, action, ...rest } = props;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: action.label,
      redirect: action.redirect,
    },
  });

  return (
    <Popover
      modal={true}
      onOpenChange={(open) => {
        if (!open) {
          form.handleSubmit((values) => {
            setAction(values);
          })();
        }
      }}
    >
      <PopoverTrigger {...rest} />
      <PopoverContent className="max-w-72">
        <Form {...form}>
          <form className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                <RiEdit2Line className="size-4" /> Customize button
              </div>
              <Separator />
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1">
                      <FormLabel optional>Button text</FormLabel>
                    </div>
                    <FormControl>
                      <InputField>
                        <Editor placeholder="Button text" value={field.value} onChange={field.onChange} height="30px" />
                      </InputField>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="redirect"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1">
                      <FormLabel optional>Redirect URL</FormLabel>
                    </div>
                    <FormControl>
                      <URLInput
                        {...field}
                        options={urlTargetTypes}
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        asEditor
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
};

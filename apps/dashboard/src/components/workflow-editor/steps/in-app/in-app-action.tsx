import { ComponentProps } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { RiEdit2Line, RiExpandUpDownLine, RiForbid2Line } from 'react-icons/ri';
import { liquid } from '@codemirror/lang-liquid';
import { EditorView } from '@uiw/react-codemirror';

import { Button, buttonVariants } from '@/components/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/primitives/dropdown-menu';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormMessagePure,
} from '@/components/primitives/form/form';
import { InputField } from '@/components/primitives/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/primitives/popover';
import { Separator } from '@/components/primitives/separator';
import { URLInput } from '@/components/workflow-editor/url-input';
import { cn } from '@/utils/ui';
import { urlTargetTypes } from '@/utils/url';
import { Editor } from '@/components/primitives/editor';

const primaryActionKey = 'primaryAction';
const secondaryActionKey = 'secondaryAction';

export const InAppAction = () => {
  const { control, setValue, getFieldState } = useFormContext();
  const primaryAction = useWatch({ control, name: primaryActionKey });
  const secondaryAction = useWatch({ control, name: secondaryActionKey });
  const primaryActionLabel = getFieldState(`${primaryActionKey}.label`);
  const primaryActionRedirectUrl = getFieldState(`${primaryActionKey}.redirect.url`);
  const secondaryActionLabel = getFieldState(`${secondaryActionKey}.label`);
  const secondaryActionRedirectUrl = getFieldState(`${secondaryActionKey}.redirect.url`);
  const error =
    primaryActionLabel.error ||
    primaryActionRedirectUrl.error ||
    secondaryActionLabel.error ||
    secondaryActionRedirectUrl.error;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className={cn('mt-3 flex items-center gap-1')}>
            <div className="border-neutral-alpha-200 flex min-h-10 w-full flex-wrap items-center justify-end gap-1 rounded-md border p-1 shadow-sm">
              {!primaryAction && !secondaryAction && (
                <div className={buttonVariants({ variant: 'dashed', size: 'xs' })}>
                  <RiForbid2Line className="size-4" />
                  <span className="cursor-default">No action</span>
                </div>
              )}
              {primaryAction && (
                <ConfigureActionPopover asChild fields={{ actionKey: primaryActionKey }}>
                  <Button variant="primary" size="xs">
                    {primaryAction.label}
                  </Button>
                </ConfigureActionPopover>
              )}
              {secondaryAction && (
                <ConfigureActionPopover asChild fields={{ actionKey: secondaryActionKey }}>
                  <Button variant="outline" size="xs">
                    {secondaryAction.label}
                  </Button>
                </ConfigureActionPopover>
              )}
            </div>
            <Button size={'icon'} variant={'ghost'}>
              <RiExpandUpDownLine className="size-4" />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-1" align="end">
          <DropdownMenuItem
            onClick={() => {
              setValue(primaryActionKey, undefined, { shouldDirty: true, shouldValidate: false });
              setValue(secondaryActionKey, undefined, { shouldDirty: true, shouldValidate: false });
            }}
          >
            <div className={cn(buttonVariants({ variant: 'dashed', size: 'xs' }), 'pointer-events-none gap-2')}>
              <RiForbid2Line className="size-4" />
              <span className="cursor-default">No action</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setValue(
                primaryActionKey,
                {
                  label: 'Primary action',
                  redirect: { target: '_self', url: '' },
                },
                { shouldDirty: true, shouldValidate: false }
              );
              setValue(secondaryActionKey, undefined, { shouldDirty: true, shouldValidate: false });
            }}
          >
            <div className={cn(buttonVariants({ variant: 'primary', size: 'xs' }), 'pointer-events-none')}>
              Primary action
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setValue(
                primaryActionKey,
                {
                  label: 'Primary action',
                  redirect: { target: '_self', url: '' },
                },
                { shouldDirty: true, shouldValidate: false }
              );
              setValue(
                secondaryActionKey,
                {
                  label: 'Secondary action',
                  redirect: { target: '_self', url: '' },
                },
                { shouldDirty: true, shouldValidate: false }
              );
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
      <FormMessagePure error={error ? String(error.message) : undefined} />
    </>
  );
};

const ConfigureActionPopover = (props: ComponentProps<typeof PopoverTrigger> & { fields: { actionKey: string } }) => {
  const {
    fields: { actionKey },
    ...rest
  } = props;
  const { control } = useFormContext();

  return (
    <Popover modal={false}>
      <PopoverTrigger {...rest} />
      <PopoverContent className="max-w-72">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-medium leading-none">
            <RiEdit2Line className="size-4" /> Customize button
          </div>
          <Separator decorative />
          <FormField
            control={control}
            name={`${actionKey}.label`}
            defaultValue=""
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-1">
                  <FormLabel>Button text</FormLabel>
                </div>
                <FormControl>
                  <InputField>
                    <Editor
                      placeholder="Button text"
                      value={field.value}
                      onChange={field.onChange}
                      height="30px"
                      extensions={[
                        liquid({
                          variables: [{ type: 'variable', label: 'asdf' }],
                        }),
                        EditorView.lineWrapping,
                      ]}
                    />
                  </InputField>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <FormLabel className="mb-1">Redirect URL</FormLabel>
            <URLInput
              options={urlTargetTypes}
              asEditor
              fields={{
                urlKey: `${actionKey}.redirect.url`,
                targetKey: `${actionKey}.redirect.target`,
              }}
              withHint={false}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

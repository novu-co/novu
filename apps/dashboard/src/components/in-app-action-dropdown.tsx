import { EditorView } from '@uiw/react-codemirror';
import { ComponentProps, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { RiEdit2Line, RiExpandUpDownLine, RiForbid2Line } from 'react-icons/ri';
import merge from 'lodash.merge';

import { Button, buttonVariants } from '@/components/primitives/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/primitives/dropdown-menu';
import { Editor } from '@/components/primitives/editor';
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
import { completions } from '@/utils/liquid-autocomplete';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { cn } from '@/utils/ui';
import { urlTargetTypes } from '@/utils/url';
import { autocompletion } from '@codemirror/autocomplete';
import { useStep } from '@/components/workflow-editor/steps/step-provider';

const primaryActionKey = 'primaryAction';
const secondaryActionKey = 'secondaryAction';

export const InAppActionDropdown = ({ onMenuItemClick }: { onMenuItemClick?: () => void }) => {
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
        <div className={cn('mt-3 flex items-center gap-1')}>
          <div className="border-neutral-alpha-200 relative flex min-h-10 w-full flex-wrap items-center justify-end gap-1 rounded-md border p-1 shadow-sm">
            {!primaryAction && !secondaryAction && (
              <div className={cn(buttonVariants({ variant: 'dashed', size: 'xs' }), 'z-10 cursor-not-allowed')}>
                <RiForbid2Line className="size-4" />
                <span>No action</span>
              </div>
            )}
            {primaryAction && (
              <ConfigureActionPopover asChild fields={{ actionKey: primaryActionKey }}>
                <Button variant="primary" size="xs" className="z-10">
                  {primaryAction.label}
                </Button>
              </ConfigureActionPopover>
            )}
            {secondaryAction && (
              <ConfigureActionPopover asChild fields={{ actionKey: secondaryActionKey }}>
                <Button variant="outline" size="xs" className="z-10">
                  {secondaryAction.label}
                </Button>
              </ConfigureActionPopover>
            )}
            <DropdownMenuTrigger className="absolute size-full" />
          </div>
          <DropdownMenuTrigger asChild>
            <Button size={'icon'} variant={'ghost'}>
              <RiExpandUpDownLine className="size-4" />
            </Button>
          </DropdownMenuTrigger>
        </div>
        <DropdownMenuContent
          className="p-1"
          align="end"
          onBlur={(e) => {
            // weird behaviour but onBlur event happens when hovering over the menu items, this is used to prevent
            // the blur event that submits the form
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <DropdownMenuItem
            onClick={() => {
              setValue(primaryActionKey, null, { shouldDirty: true, shouldValidate: true });
              setValue(secondaryActionKey, null, { shouldDirty: true, shouldValidate: true });
              onMenuItemClick?.();
            }}
          >
            <div className={cn(buttonVariants({ variant: 'dashed', size: 'xs' }), 'pointer-events-none gap-2')}>
              <RiForbid2Line className="size-4" />
              <span className="cursor-default">No action</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const primaryActionValue = merge(
                {
                  label: 'Primary action',
                  redirect: { target: '_self', url: '' },
                },
                primaryAction
              );
              setValue(primaryActionKey, primaryActionValue, { shouldDirty: true, shouldValidate: true });
              setValue(secondaryActionKey, null, { shouldDirty: true, shouldValidate: true });
              onMenuItemClick?.();
            }}
          >
            <div className={cn(buttonVariants({ variant: 'primary', size: 'xs' }), 'pointer-events-none')}>
              Primary action
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const primaryActionValue = merge(
                {
                  label: 'Primary action',
                  redirect: { target: '_self', url: '' },
                },
                primaryAction
              );
              const secondaryActionValue = {
                label: 'Secondary action',
                redirect: { target: '_self', url: '' },
              };
              setValue(primaryActionKey, primaryActionValue, { shouldDirty: true, shouldValidate: true });
              setValue(secondaryActionKey, secondaryActionValue, { shouldDirty: true, shouldValidate: true });
              onMenuItemClick?.();
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
  const { step } = useStep();
  const variables = useMemo(() => (step ? parseStepVariablesToLiquidVariables(step.variables) : []), [step]);
  const extensions = useMemo(
    () => [autocompletion({ override: [completions(variables)] }), EditorView.lineWrapping],
    [variables]
  );

  return (
    <Popover modal={true}>
      <PopoverTrigger {...rest} />
      <PopoverContent className="max-w-72" side="bottom" align="end">
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
                  <InputField size="fit">
                    <Editor
                      fontFamily="inherit"
                      placeholder="Button text"
                      value={field.value}
                      onChange={field.onChange}
                      extensions={extensions}
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
              variables={variables}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

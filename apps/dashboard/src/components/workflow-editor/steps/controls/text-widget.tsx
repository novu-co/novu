import { Editor } from '@/components/primitives/editor';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { Input, InputField } from '@/components/primitives/input';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { completions } from '@/utils/liquid-autocomplete';
import { parseStepVariablesToLiquidVariables } from '@/utils/parseStepVariablesToLiquidVariables';
import { capitalize } from '@/utils/string';
import { autocompletion } from '@codemirror/autocomplete';
import { type WidgetProps } from '@rjsf/utils';
import { EditorView } from '@uiw/react-codemirror';
import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { getFieldName } from './template-utils';
import { RiInformation2Line } from 'react-icons/ri';
import { Tooltip, TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import { cn } from '../../../../utils/ui';

export function TextWidget(props: WidgetProps) {
  const { label, readonly, disabled, schema, id, required } = props;
  const { control } = useFormContext();
  const { step } = useWorkflow();
  const variables = useMemo(() => (step ? parseStepVariablesToLiquidVariables(step.variables) : []), [step]);

  const extractedName = useMemo(() => getFieldName(id), [id]);
  const isNumberType = useMemo(() => props.schema.type === 'number', [props.schema.type]);
  const extensions = useMemo(
    () => [autocompletion({ override: [completions(variables)] }), EditorView.lineWrapping],
    [variables]
  );

  return (
    <FormField
      control={control}
      name={extractedName}
      render={({ field }) => (
        <FormItem className="w-full py-1">
          <FormLabel className="text-xs">
            {capitalize(label)}

            {schema.description ? (
              <Tooltip>
                <TooltipTrigger>
                  <span className={cn('text-foreground-400 hover:cursor ml-1 inline-block')}>
                    <RiInformation2Line className={`size-3.5`} />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="rounded-4 z-50 max-w-xl bg-neutral-700 p-3 text-white">
                  <p>{schema.description}</p>
                </TooltipContent>
              </Tooltip>
            ) : null}
          </FormLabel>
          <FormControl>
            <InputField size="fit" className="w-full">
              {isNumberType ? (
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => {
                    if (e.target.value === '') {
                      field.onChange(undefined);
                      return;
                    }
                    const val = Number(e.target.value);
                    const isNaN = Number.isNaN(val);
                    const finalValue = isNaN ? undefined : val;
                    field.onChange(finalValue);
                  }}
                  required={required}
                  readOnly={readonly}
                  disabled={disabled}
                  placeholder={capitalize(label)}
                />
              ) : (
                <Editor
                  indentWithTab={false}
                  fontFamily="inherit"
                  placeholder={capitalize(label)}
                  id={label}
                  extensions={extensions}
                  readOnly={readonly || disabled}
                  {...field}
                />
              )}
            </InputField>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

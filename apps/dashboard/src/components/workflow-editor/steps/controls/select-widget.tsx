import { useMemo } from 'react';
import { type WidgetProps } from '@rjsf/utils';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { capitalize } from '@/utils/string';
import { useFlushFormUpdates } from '@/components/workflow-editor/steps/flush-form-updates-context';
import { getFieldName } from './template-utils';

export function SelectWidget(props: WidgetProps) {
  const { label, required, readonly, options, disabled, id } = props;

  const data = useMemo(
    () =>
      options.enumOptions?.map((option) => {
        return {
          label: option.label,
          value: String(option.value),
        };
      }),
    [options.enumOptions]
  );
  const extractedName = useMemo(() => getFieldName(id), [id]);

  const { control } = useFormContext();
  const { flushFormUpdates } = useFlushFormUpdates();

  return (
    <FormField
      control={control}
      name={extractedName}
      render={({ field }) => (
        <FormItem className="py-1">
          <FormLabel>{capitalize(label)}</FormLabel>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                flushFormUpdates();
              }}
              disabled={disabled || readonly}
              required={required}
            >
              <SelectTrigger className="group p-1.5 shadow-sm last:[&>svg]:hidden">
                <SelectValue asChild>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground text-sm">{field.value}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {data?.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

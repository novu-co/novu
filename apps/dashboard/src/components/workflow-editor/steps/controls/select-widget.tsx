import { type WidgetProps } from '@rjsf/utils';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { capitalize } from '@/utils/string';

export function SelectWidget(props: WidgetProps) {
  const { label, required, readonly, options, name } = props;

  const data = options.enumOptions?.map((option) => {
    return {
      label: option.label,
      value: String(option.value),
    };
  });

  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="my-2 py-1">
          <FormLabel>{capitalize(label)}</FormLabel>
          <FormControl>
            <Select value={field.value} onValueChange={field.onChange} disabled={readonly} required={required}>
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

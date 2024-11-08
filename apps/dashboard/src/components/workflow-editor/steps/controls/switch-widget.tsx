import { type WidgetProps } from '@rjsf/utils';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { Switch } from '@/components/primitives/switch';
import { capitalize } from '@/utils/string';

export function SwitchWidget(props: WidgetProps) {
  const { label, readonly, name } = props;

  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="my-2 flex w-full items-center justify-between space-y-0 py-1">
            <FormLabel className="cursor-pointer">{capitalize(label)}</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} disabled={readonly} />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

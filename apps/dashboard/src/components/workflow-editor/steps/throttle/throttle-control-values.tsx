import { TimeUnitEnum } from '@novu/shared';
import { useFormContext } from 'react-hook-form';

import { FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { Input } from '@/components/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';

export const ThrottleControlValues = () => {
  const { control } = useFormContext();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <FormField
          control={control}
          name="controlValues.amount"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Maximum number of notifications</FormLabel>
              <Input type="number" min={1} {...field} value={field.value || ''} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="controlValues.timeValue"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Time value</FormLabel>
              <Input type="number" min={1} {...field} value={field.value || ''} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="controlValues.timeUnit"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Time unit</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TimeUnitEnum.SECONDS}>Seconds</SelectItem>
                  <SelectItem value={TimeUnitEnum.MINUTES}>Minutes</SelectItem>
                  <SelectItem value={TimeUnitEnum.HOURS}>Hours</SelectItem>
                  <SelectItem value={TimeUnitEnum.DAYS}>Days</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

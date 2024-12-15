import { useFormContext } from 'react-hook-form';
import { RiAccountPinBoxFill } from 'react-icons/ri';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/primitives/form/form';
import { Input, InputFieldPure } from '@/components/primitives/input';
import { cn } from '@/utils/ui';
import { Code2 } from '@/components/icons/code-2';

export const DigestKey = () => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="controlValues.digestKey"
      render={({ field }) => (
        <FormItem className="flex w-full flex-col overflow-hidden">
          <>
            <FormLabel tooltip="Digest is aggregated by the subscriberId by default. You can add one more aggregation key to group events further.">
              <span className="flex items-center gap-1">
                <RiAccountPinBoxFill className="size-4" />
                <span>Aggregated by</span>
              </span>
            </FormLabel>
            <InputFieldPure className="h-7 rounded-lg border pr-0">
              <FormLabel className="flex h-full items-center gap-1 border-r border-neutral-100 pr-1">
                <Code2 className="-ml-1.5 size-5" />
                <span className="text-foreground-600 mt-[1px] text-xs font-normal">subscriberId</span>
              </FormLabel>
              <FormControl>
                <Input
                  className={cn(
                    'min-w-[20ch] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                  )}
                  placeholder="Add additional digest..."
                  {...field}
                />
              </FormControl>
            </InputFieldPure>
            <FormMessage />
          </>
        </FormItem>
      )}
    />
  );
};

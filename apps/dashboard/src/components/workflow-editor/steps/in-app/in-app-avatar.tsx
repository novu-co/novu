import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem } from '@/components/primitives/form/form';
import { AvatarPicker } from '@/components/primitives/form/avatar-picker';
import { useFlushFormUpdates } from '@/components/workflow-editor/steps/flush-form-updates-context';

const avatarKey = 'avatar';

export const InAppAvatar = () => {
  const { control } = useFormContext();
  const { flushFormUpdates } = useFlushFormUpdates();

  return (
    <FormField
      control={control}
      name={avatarKey}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <AvatarPicker
              {...field}
              onPick={(value) => {
                field.onChange(value);
                flushFormUpdates();
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

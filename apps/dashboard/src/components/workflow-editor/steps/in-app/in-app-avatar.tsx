import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem } from '@/components/primitives/form/form';
import { AvatarPicker } from '@/components/primitives/form/avatar-picker';

const avatarKey = 'avatar';

export const InAppAvatar = () => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={avatarKey}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <AvatarPicker {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

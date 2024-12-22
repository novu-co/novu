import { RiAddLine, RiSubtractFill } from 'react-icons/ri';
import { IconButtonProps } from '@rjsf/utils';
import { LegacyButton } from '@/components/primitives/legacy-button';

export const AddButton = (props: IconButtonProps) => {
  return (
    <LegacyButton variant="ghost" className="size-4 rounded-sm p-0.5" type="button" {...props} title="Add item">
      <RiAddLine className="text-foreground-600 size-3" />
    </LegacyButton>
  );
};

export const RemoveButton = (props: IconButtonProps) => {
  return (
    <LegacyButton variant="ghost" className="size-4 rounded-sm p-0.5" type="button" {...props} title="Remove item">
      <RiSubtractFill className="text-foreground-600 size-3" />
    </LegacyButton>
  );
};

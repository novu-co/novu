import { RiAddLine, RiSubtractFill } from 'react-icons/ri';
import { IconButtonProps } from '@rjsf/utils';
import { Button } from '@/components/primitives/button';

export const AddButton = (props: IconButtonProps) => {
  return (
    <Button variant="ghost" className="size-4 rounded-sm p-0.5" type="button" {...props} title="Add item">
      <RiAddLine className="text-foreground-600 size-3" />
    </Button>
  );
};

export const RemoveButton = (props: IconButtonProps) => {
  return (
    <Button variant="ghost" className="size-4 rounded-sm p-0.5" type="button" {...props} title="Remove item">
      <RiSubtractFill className="text-foreground-600 size-3" />
    </Button>
  );
};

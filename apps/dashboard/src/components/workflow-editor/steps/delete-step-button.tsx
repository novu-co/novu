import { Button } from '@/components/primitives/button';
import { Separator } from '@/components/primitives/separator';
import { RiDeleteBin2Line } from 'react-icons/ri';

export function DeleteStepButton() {
  return (
    <div className="mt-auto flex flex-col gap-2 px-3 py-4 pb-0">
      <Separator />
      <div>
        <Button variant="ghost" className="text-destructive gap-1" type="button">
          <RiDeleteBin2Line className="size-4" />
          Delete step
        </Button>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { RiArrowRightSLine, RiPencilRuler2Fill } from 'react-icons/ri';
import { Button } from '../../primitives/button';
import { Separator } from '../../primitives/separator';
import { CommonFields } from './common-fields';
import { DeleteStepButton } from './delete-step-button';

export function InApp() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 p-3">
        <CommonFields />
      </div>
      <Separator />
      <div className="px-3 py-4">
        <Link to={'./edit'} relative="path">
          <Button variant="outline" className="flex w-full justify-start gap-1.5 text-xs font-medium" type="button">
            <RiPencilRuler2Fill className="h-4 w-4 text-neutral-600" />
            Configure in-app template <RiArrowRightSLine className="ml-auto h-4 w-4 text-neutral-600" />
          </Button>
        </Link>
      </div>
      <DeleteStepButton />
    </div>
  );
}

/**
 * This component is used as a placeholder for the other step configuration until the actual configuration is implemented.
 */
import { Separator } from '@/components/primitives/separator';
import { CommonFields } from './common-fields';
import { SdkBanner } from './sdk-banner';
import { Link } from 'react-router-dom';
import { Button } from '@/components/primitives/button';
import { RiArrowRightSLine, RiPencilRuler2Fill } from 'react-icons/ri';

export default function ConfigureOtherSteps({ channelName }: { channelName?: string }) {
  return (
    <>
      <div className="flex flex-col gap-4 p-3">
        <CommonFields />
      </div>
      <Separator />

      {channelName && (
        <>
          <div className="flex flex-col gap-4 p-3">
            <Link to={'./edit'} relative="path">
              <Button variant="outline" className="flex w-full justify-start gap-1.5 text-xs font-medium" type="button">
                <RiPencilRuler2Fill className="h-4 w-4 text-neutral-600" />
                Configure {channelName} template <RiArrowRightSLine className="ml-auto h-4 w-4 text-neutral-600" />
              </Button>
            </Link>
          </div>
          <Separator />
        </>
      )}

      <div className="px-3 py-4">
        <SdkBanner />
      </div>
    </>
  );
}

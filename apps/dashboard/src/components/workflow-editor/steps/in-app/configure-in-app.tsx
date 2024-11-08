import { Link } from 'react-router-dom';
import { RiArrowRightSLine, RiPencilRuler2Fill } from 'react-icons/ri';
import { Button } from '../../../primitives/button';
import { Separator } from '../../../primitives/separator';
import { CommonFields } from '../common-fields';
import { SidebarContent } from '@/components/side-navigation/Sidebar';
import { ConfigureInAppPreview } from './configure-in-app-preview';

export function ConfigureInApp() {
  return (
    <>
      <SidebarContent>
        <CommonFields />
      </SidebarContent>
      <Separator />
      <SidebarContent>
        <Link to={'./edit'} relative="path">
          <Button variant="outline" className="flex w-full justify-start gap-1.5 text-xs font-medium" type="button">
            <RiPencilRuler2Fill className="h-4 w-4 text-neutral-600" />
            Configure in-app template <RiArrowRightSLine className="ml-auto h-4 w-4 text-neutral-600" />
          </Button>
        </Link>

        <ConfigureInAppPreview />
      </SidebarContent>
    </>
  );
}

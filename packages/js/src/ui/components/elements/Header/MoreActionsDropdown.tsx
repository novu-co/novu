import { Show } from 'solid-js';
import { NotificationStatus } from '../../../types';
import { useInboxContext } from 'src/ui/context';
import { useStyle } from '../../../helpers';
import { DotsMenu } from '../../../icons';
import { Button, Dropdown } from '../../primitives';
import { MoreActionsOptions } from './MoreActionsOptions';

export const MoreActionsDropdown = () => {
  const style = useStyle();
  const { status } = useInboxContext();

  return (
    <Show when={status() !== NotificationStatus.ARCHIVED}>
      <Dropdown.Root>
        <Dropdown.Trigger
          class={style('moreActions__dropdownTrigger')}
          asChild={(triggerProps) => (
            <Button variant="ghost" size="icon" {...triggerProps}>
              <DotsMenu />
            </Button>
          )}
        />
        <Dropdown.Content appearanceKey="moreActions__dropdownContent">
          <MoreActionsOptions />
        </Dropdown.Content>
      </Dropdown.Root>
    </Show>
  );
};

import { RiQuestionFill } from 'react-icons/ri';
import { HeaderButton } from './header-button';
import { usePlainChat } from '@/hooks/use-plain-chat';

export const CustomerSupportButton = () => {
  const { showPlainLiveChat } = usePlainChat();

  return (
    <button tabIndex={-1} className="flex items-center justify-center" onClick={showPlainLiveChat}>
      <HeaderButton label="Help">
        <RiQuestionFill className="text-foreground-600 size-4" />
      </HeaderButton>
    </button>
  );
};

import { RiArrowLeftSLine } from 'react-icons/ri';
import { LegacyButton } from './primitives/legacy-button';
import { useNavigate } from 'react-router-dom';
import { LinkButton } from './primitives/button-link';

interface UsecasePlaygroundHeaderProps {
  title: string;
  description: string;
  skipPath: string;
  onSkip?: () => void;
}

export function UsecasePlaygroundHeader({ title, description, skipPath, onSkip }: UsecasePlaygroundHeaderProps) {
  const navigate = useNavigate();

  const handleSkip = () => {
    onSkip?.();
    navigate(skipPath);
  };

  return (
    <div className="flex items-center justify-between gap-4 border-b p-4">
      <div className="flex items-start gap-1">
        <LegacyButton variant="ghost" size="icon" className="mt-[5px] h-5 w-5" onClick={() => navigate(-1)}>
          <RiArrowLeftSLine className="h-5 w-5" />
        </LegacyButton>

        <div className="flex-1">
          <h2 className="text-lg font-medium">{title}</h2>
          <p className="text-foreground-400 text-sm">{description}</p>
        </div>
      </div>

      <LinkButton size="md" className="text-xs" onClick={handleSkip}>
        Skip, I'll explore myself
      </LinkButton>
    </div>
  );
}

import { X } from 'lucide-react';
import { Button } from '../primitives/button';
import { Card, CardContent } from '../primitives/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/primitives/toggle-group';
import { toast } from 'sonner';
import { useEffect, useCallback, useRef } from 'react';

const reactions = [
  { value: '100', emoji: '💯' },
  { value: 'ok', emoji: '👌' },
  { value: 'thinking', emoji: '🤔' },
  { value: 'thumbsdown', emoji: '👎' },
] as const;

type Reaction = (typeof reactions)[number]['value'];

interface UseComingSoonBannerProps {
  onReactionSelect?: (reaction: Reaction) => void;
  onDismiss?: () => void;
}

function ComingSoonBannerContent({ onDismiss, onReactionSelect }: UseComingSoonBannerProps) {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-[#E6E9F0] bg-white p-3 shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="text-foreground-950 flex items-center gap-2 text-xs font-semibold">
            <span>🚧</span> Export to Code is on the way!
          </h3>
          <p className="text-foreground-600 text-xs">
            With Export to Code, design workflows in the GUI and switch to code anytime for custom logic and advanced
            features!
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2.5 top-3 mt-[-3px] h-6 w-6 p-0 hover:bg-neutral-100"
          onClick={onDismiss}
        >
          <X className="text-foreground-600 h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-foreground-950 text-xs font-semibold">Sounds like a feature you'd need?</h3>
        <Card className="border-netural-200 overflow-hidden rounded-lg">
          <CardContent className="p-0">
            <ToggleGroup
              type="single"
              className="flex gap-0 [&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg"
              onValueChange={onReactionSelect}
            >
              {reactions.map((reaction) => (
                <ToggleGroupItem
                  key={reaction.value}
                  value={reaction.value}
                  className="flex-1 rounded-none border-r border-[#E6E9F0] py-2.5 text-xl transition-colors last:border-r-0 hover:bg-[#F8F9FB] data-[state=on]:bg-[#F8F9FB]"
                >
                  {reaction.emoji}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface UseComingSoonBannerResult {
  show: () => void;
  hide: () => void;
}

export function useComingSoonBanner(props: UseComingSoonBannerProps = {}): UseComingSoonBannerResult {
  const toastId = useRef<string | number>();

  const hide = useCallback(() => {
    if (toastId.current) {
      toast.dismiss(toastId.current);
      toastId.current = undefined;
    }
  }, []);

  const show = useCallback(() => {
    if (toastId.current) return;

    const id = toast.custom(
      (id) => (
        <ComingSoonBannerContent
          onDismiss={() => {
            toast.dismiss(id);
            toastId.current = undefined;
            props.onDismiss?.();
          }}
          onReactionSelect={(reaction) => {
            props.onReactionSelect?.(reaction);
          }}
        />
      ),
      {
        duration: Infinity,
        position: 'bottom-right',
        className: 'bg-transparent !p-0 mb-4 mr-4',
      }
    );

    toastId.current = id;
  }, [props.onDismiss, props.onReactionSelect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      hide();
    };
  }, [hide]);

  return { show, hide };
}

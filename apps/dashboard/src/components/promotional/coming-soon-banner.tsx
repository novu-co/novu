import { X } from 'lucide-react';
import { Button } from '../primitives/button';
import { Card, CardContent } from '../primitives/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/primitives/toggle-group';
import { toast } from 'sonner';
import { useEffect, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTelemetry } from '@/hooks/use-telemetry';
import { TelemetryEvent } from '@/utils/telemetry';

const reactions = [
  { value: '100', emoji: '💯' },
  { value: 'ok', emoji: '👌' },
  { value: 'thinking', emoji: '🤔' },
  { value: 'thumbsdown', emoji: '👎' },
] as const;

type Reaction = (typeof reactions)[number]['value'];

interface PromotionalBannerContent {
  emoji?: string;
  title: string;
  description: string;
  feedbackQuestion?: string;
  telemetryEvent: TelemetryEvent;
}

interface UsePromotionalBannerProps {
  onReactionSelect?: (reaction: Reaction) => void;
  onDismiss?: () => void;
  content: PromotionalBannerContent;
}

function PromotionalBannerContent({ onDismiss, onReactionSelect, content }: UsePromotionalBannerProps) {
  const track = useTelemetry();
  const [showThankYou, setShowThankYou] = useState(false);

  const handleReactionSelect = (reaction: Reaction) => {
    track(content.telemetryEvent, {
      title: content.title,
      question: content.feedbackQuestion,
      reaction,
    });
    setShowThankYou(true);
    onReactionSelect?.(reaction);
    setTimeout(() => {
      onDismiss?.();
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-6 rounded-2xl border border-[#E6E9F0] bg-white p-3 shadow-lg"
    >
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-2"
        >
          <h3 className="text-foreground-950 flex items-center gap-2 text-xs font-semibold">
            {content.emoji && (
              <motion.span animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5, delay: 0.2 }}>
                {content.emoji}
              </motion.span>
            )}
            {content.title}
          </h3>
          <p className="text-foreground-600 text-xs">{content.description}</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2.5 top-3 mt-[-3px] h-6 w-6 p-0 hover:bg-neutral-100"
            onClick={onDismiss}
          >
            <X className="text-foreground-600 h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {showThankYou ? (
          <motion.div
            key="thank-you"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-2 py-2 text-center"
          >
            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }} className="text-2xl">
              🙏
            </motion.span>
            <div className="space-y-1">
              <p className="text-foreground-950 text-sm font-medium">Thank you for your feedback!</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="feedback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-3"
          >
            <h3 className="text-foreground-950 text-xs font-semibold">
              {content.feedbackQuestion || "Sounds like a feature you'd need?"}
            </h3>
            <Card className="border-netural-200 overflow-hidden rounded-lg">
              <CardContent className="p-0">
                <ToggleGroup
                  type="single"
                  className="flex gap-0 [&>*:first-child]:rounded-l-lg [&>*:last-child]:rounded-r-lg"
                  onValueChange={handleReactionSelect}
                >
                  {reactions.map((reaction, index) => (
                    <motion.div
                      key={reaction.value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="w-full rounded-none border-r-[1px] border-[#D1D5DB] transition-colors last:border-r-0 hover:bg-[#F8F9FB] data-[state=on]:bg-[#F8F9FB]"
                      whileTap={{ scale: 0.95 }}
                    >
                      <ToggleGroupItem className="w-full py-2.5 text-xl transition-colors" value={reaction.value}>
                        {reaction.emoji}
                      </ToggleGroupItem>
                    </motion.div>
                  ))}
                </ToggleGroup>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface UsePromotionalBannerResult {
  show: () => void;
  hide: () => void;
}

export function usePromotionalBanner(props: UsePromotionalBannerProps): UsePromotionalBannerResult {
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
        <PromotionalBannerContent
          onDismiss={() => {
            toast.dismiss(id);
            toastId.current = undefined;
            props.onDismiss?.();
          }}
          onReactionSelect={(reaction) => {
            props.onReactionSelect?.(reaction);
          }}
          content={props.content}
        />
      ),
      {
        duration: Infinity,
        position: 'bottom-right',
      }
    );

    toastId.current = id;
  }, [props.onDismiss, props.onReactionSelect, props.content]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      hide();
    };
  }, [hide]);

  return { show, hide };
}

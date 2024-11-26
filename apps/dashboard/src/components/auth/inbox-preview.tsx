import { SVGProps, useState } from 'react';
import { Info, Layers, LightbulbIcon } from 'lucide-react';
import { Separator } from '../primitives/separator';
import { Button } from '../primitives/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../primitives/accordion';
import { AlertDialog, AlertDialogDescription } from '../primitives/alert-dialog';
import { Inbox, Notifications } from '@novu/react';
import { RiArrowLeftSLine, RiInputField, RiLayoutLine } from 'react-icons/ri';

interface PreviewStyle {
  id: string;
  label: string;
  image: string;
}

const previewStyles: PreviewStyle[] = [
  { id: 'popover', label: 'Popover', image: '/images/auth/popover-layout.svg' },
  { id: 'sidebar', label: 'Side Menu', image: '/images/auth/sidebar-layout.svg' },
  { id: 'full-width', label: 'Full Width', image: '/images/auth/full-width-layout.svg' },
];

export function InboxPreview() {
  const [selectedStyle, setSelectedStyle] = useState<string>('popover');

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b p-4">
        <div className="flex items-start gap-1">
          <Button variant="ghost" size="icon" className="mt-[5px] h-5 w-5">
            <RiArrowLeftSLine className="h-5 w-5" />
          </Button>

          <div className="flex-1">
            <h2 className="text-lg font-medium">Send your first Inbox notification</h2>
            <p className="text-foreground-400 text-sm">Customise your notification and hit 'Send notification' 🎉</p>
          </div>
        </div>

        <Button variant="link" className="text-foreground-600 text-xs">
          Skip, I'll explore myself
        </Button>
      </div>

      <div className="flex flex-1">
        <div className="flex w-[480px] flex-col">
          <div className="space-y-3 p-3">
            <Accordion type="single" collapsible value={'inbox'}>
              <AccordionItem value="inbox" className="bg-white p-0">
                <AccordionTrigger className="bg-neutral-alpha-50 border-b p-2">
                  <div className="flex items-center gap-1 text-xs">
                    <RiLayoutLine className="text-feature size-5" />
                    Customize Inbox
                  </div>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-2 p-2">
                  <div className="grid grid-cols-3 gap-2.5">
                    {previewStyles.map((style) => (
                      <div
                        key={style.id}
                        className={`group relative h-[100px] cursor-pointer overflow-hidden rounded-lg border transition-all duration-200 active:scale-[0.98] ${
                          selectedStyle === style.id
                            ? 'shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05),0px_0px_0px_2px_#F2F4F7,0px_0px_2px_0px_#E0E0E0,0px_1px_4px_-2px_rgba(24,39,75,0.02),0px_4px_4px_-2px_rgba(24,39,75,0.06)]'
                            : 'hover:shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05),0px_0px_0px_2px_#F2F4F7,0px_0px_2px_0px_#E0E0E0,0px_1px_4px_-2px_rgba(24,39,75,0.02),0px_4px_4px_-2px_rgba(24,39,75,0.06)]'
                        }`}
                        style={{
                          backgroundImage: `url(${style.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'top',
                        }}
                        onClick={() => setSelectedStyle(style.id)}
                        role="radio"
                        aria-checked={selectedStyle === style.id}
                        tabIndex={0}
                      >
                        <div
                          className={`absolute bottom-0 w-full translate-y-full transform border-t bg-neutral-50/90 text-center opacity-0 transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 ${selectedStyle === style.id ? '!translate-y-0 !opacity-100' : ''}`}
                        >
                          <span className="text-[11px] leading-[24px]">{style.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-lg border p-0.5">
                        <div className="flex items-center justify-between p-2">
                          <span className="text-sm">Primary color</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground text-sm">#DD2450</span>
                            <div className="h-4 w-4 rounded border bg-[#dd2450] shadow-sm" />
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 rounded-lg border p-0.5">
                        <div className="flex items-center justify-between p-2">
                          <span className="text-sm">Appearance: Light mode</span>
                          <LightbulbIcon className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-1 text-xs">
                      <Info className="text-foreground-400 mt-0.5 h-4 w-4" />
                      <p className="text-foreground-400 leading-[21px]">
                        The Inbox is completely customizable, using the{' '}
                        <a href="#" className="cursor-pointer underline">
                          appearance prop
                        </a>
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible value={'inbox'}>
              <AccordionItem value="inbox" className="bg-white p-0">
                <AccordionTrigger className="bg-neutral-alpha-50 border-b p-2">
                  <div className="flex items-center gap-1 text-xs">
                    <RiInputField className="text-feature size-5" />
                    Configure notification
                  </div>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-2 p-2">aaaa</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Footer */}
          <div className="bg-muted mt-auto border-t p-2">
            <div className="flex justify-end gap-3 px-3 py-2">
              <Button variant="outline" className="gap-1">
                <Layers className="h-5 w-5" />
                Copy cURL
              </Button>
              <Button>Send notification</Button>
            </div>
          </div>
        </div>

        <div className="flex-1 border-l">
          <div className="relative flex h-full flex-col items-center">
            {selectedStyle === 'popover' && (
              <div className="mt-10 flex w-full max-w-[440px] items-end">
                <Inbox applicationIdentifier="123" subscriberId="123" open />{' '}
              </div>
            )}
            {selectedStyle === 'sidebar' && (
              <div className="mt-10 max-h-[400px] min-h-[200px] w-full">
                <Inbox applicationIdentifier="123" subscriberId="123">
                  <Notifications />
                </Inbox>
              </div>
            )}
            {selectedStyle === 'full-width' && (
              <div className="mt-10 max-h-[400px] min-h-[200px] w-full">
                <Inbox applicationIdentifier="123" subscriberId="123">
                  <Notifications />
                </Inbox>
              </div>
            )}

            <div className="absolute bottom-24 left-2">
              <p className="text-success text-[10px] italic">Hit send, to get an notification!</p>
              <SendNotificationArrow className="mt-2 h-[73px] w-[86px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SendNotificationArrow(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="87" height="73" viewBox="0 0 87 73" fill="none" {...props}>
      <path
        d="M46.7042 38.5367C45.9523 34.1342 42.2234 19.9485 34.0857 23.4153C31.7808 24.3973 29.2755 28.6188 31.7983 30.67C35.1624 33.4054 37.9395 27.6374 37.3445 24.9824C35.7772 17.9881 26.4508 15.3565 20.157 16.3625C14.8716 17.2074 10.2676 20.6788 6.61735 24.3822C4.90504 26.1195 4.21087 28.3203 2.65616 30.084C0.250967 32.8124 2.04904 28.0442 2.01456 26.0896C1.94411 22.0956 2.26233 28.5742 2.27848 29.9515C2.30512 32.224 7.85706 30.608 10.037 30.3405"
        stroke="#1FC16B"
        stroke-linecap="round"
      />
    </svg>
  );
}

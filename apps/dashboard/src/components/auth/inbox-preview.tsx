import { SVGProps, useState } from 'react';
import { Info, Layers, LightbulbIcon } from 'lucide-react';
import { Button } from '../primitives/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../primitives/accordion';
import { Inbox, InboxContent, Notifications } from '@novu/react';
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

const novuAppearance = {
  baseTheme: {
    variables: {
      colorPrimary: '#DD2450',
      colorBackground: 'white',
      colorBackgroundHover: '#F9FAFB',
      colorBorder: '#E5E7EB',
    },
  },
  elements: {
    notificationItem: {
      borderRadius: '8px',
      marginBottom: '8px',
      backgroundColor: 'white',
    },
    popoverContent: {
      boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1)',
      borderRadius: '12px',
      border: '1px solid #E5E7EB',
    },
    unseenBadge: {
      backgroundColor: '#DD2450',
    },
    dropdown: {
      padding: '16px',
    },
  },
};

export function InboxPreview() {
  const [selectedStyle, setSelectedStyle] = useState<string>('popover');
  const [openAccordion, setOpenAccordion] = useState<string | undefined>('layout');

  return (
    <div className="flex flex-1 flex-col">
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
        <div className="flex min-w-[480px] flex-col">
          <div className="space-y-3 p-3">
            <Accordion type="single" collapsible value={openAccordion} onValueChange={setOpenAccordion}>
              <AccordionItem value="layout" className="bg-white p-0">
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

            <Accordion type="single" collapsible value={openAccordion} onValueChange={setOpenAccordion}>
              <AccordionItem value="configure" className="bg-white p-0">
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
          <div className="bg-muted mt-auto border-t">
            <div className="flex justify-end gap-3 p-2">
              <Button variant="outline" className="gap-1">
                <Layers className="h-5 w-5" />
                Copy cURL
              </Button>
              <Button>Send notification</Button>
            </div>
          </div>
        </div>

        <div className="w-full border-l">
          {selectedStyle === 'popover' && (
            <div className="relative flex h-full w-full flex-col items-center">
              <div className="mt-10 flex w-full max-w-[440px] items-center justify-end">
                <Inbox applicationIdentifier="123" subscriberId="123" open appearance={novuAppearance} />
              </div>
              <div className="absolute bottom-[-10px] left-2 flex flex-col items-start">
                <SendNotificationArrow className="mt-2 h-[73px] w-[86px]" />

                <p className="text-success relative top-[-32px] text-[10px] italic">
                  Hit send, to get an notification!
                </p>
              </div>
            </div>
          )}
          {selectedStyle === 'sidebar' && (
            <div className="h-full">
              <div className="h-full w-[300px] border-r">
                <Inbox
                  applicationIdentifier="123"
                  subscriberId="123"
                  appearance={{
                    variables: {
                      colorBackground: '#FCFCFC',
                      colorForeground: '#1A1523',
                      colorPrimary: '#0081F1',
                      colorPrimaryForeground: '#ffffff',
                      colorSecondary: '#F3F3F3',
                      colorSecondaryForeground: '#1A1523',
                      colorCounter: '#E5484D',
                      colorCounterForeground: 'white',
                      colorNeutral: 'black',
                      fontSize: 'inherit',
                      borderRadius: '0.375rem',
                    },
                    elements: {
                      notificationListNewNotificationsNotice__button: {
                        background: '#2b6cb0',
                      },
                      notificationListContainer: {
                        paddingRight: '10px',
                      },
                      inboxHeader: {
                        padding: '8px 16px',
                      },
                      inboxStatus__dropdownTrigger: {
                        gap: '2px',
                      },
                      moreActionsContainer: {
                        marginRight: '-4px',
                      },
                      inboxStatus__title: {
                        fontSize: '14px',
                        fontWeight: '500',
                      },
                      bellContainer: {
                        display: 'none',
                      },
                      preferences__button: {
                        display: 'none',
                      },
                      popoverContent: {
                        width: '100%',
                        maxWidth: '390px',
                        height: 'calc(100% - 136px)',
                        maxHeight: '100%',
                        borderRadius: '0px',
                        overflow: 'auto',
                        boxShadow:
                          'rgba(15, 15, 15, 0.04) 0px 0px 0px 1px, rgba(15, 15, 15, 0.03) 0px 3px 6px, rgba(15, 15, 15, 0.06) 0px 9px 24px',
                        backgroundColor: '#fff',
                        marginTop: '-64px',
                        marginLeft: '-32px',
                        fontSize: '14px',
                        fontWeight: '500',
                      },
                      notificationImage: {
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                      },
                      notificationDot: {
                        marginTop: '2px',
                        backgroundColor: '#0081F1',
                      },
                      notificationSubject: {
                        color: 'black',
                        fontSize: '14px',
                        fontWeight: '600',
                      },
                      notificationBody: {},
                      notificationPrimaryAction__button: {
                        variant: 'outline',
                        paddingLeft: '8px',
                        paddingRight: '8px',
                        height: '26px',
                        borderRadius: '4px',
                        border: '0.5px solid #dfdfdf',
                        fontWeight: '500',
                        backgroundColor: 'transparent',
                        color: 'black',
                        fontSize: '14px',
                      },
                      notificationSecondaryAction__button: {
                        variant: 'outline',
                        paddingLeft: '8px',
                        paddingRight: '8px',
                        height: '26px',
                        borderRadius: '4px',
                        border: '0.5px solid #dfdfdf',
                        fontWeight: '500',
                        backgroundColor: 'transparent',
                        color: 'black',
                        fontSize: '14px',
                      },
                    },
                  }}
                >
                  <InboxContent />
                </Inbox>
              </div>
            </div>
          )}
          {selectedStyle === 'full-width' && (
            <div className="mt-10 h-full w-full">
              <Inbox applicationIdentifier="123" subscriberId="123">
                <InboxContent />
              </Inbox>
            </div>
          )}
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

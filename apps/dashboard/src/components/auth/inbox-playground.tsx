import { useEffect, useState } from 'react';
import { Info, LightbulbIcon, Loader2 } from 'lucide-react';
import { Button } from '../primitives/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../primitives/accordion';
import { RiArrowLeftSLine, RiInputField, RiLayoutLine, RiNotification2Fill } from 'react-icons/ri';
import { InboxPreviewContent } from './inbox-preview-content';
import { useTriggerWorkflow } from '@/hooks/use-trigger-workflow';
import { useAuth } from '../../context/auth/hooks';
import { getComponentByType } from '../workflow-editor/steps/component-utils';
import { StepTypeEnum, UiComponentEnum, WorkflowCreationSourceEnum } from '@novu/shared';
import { createWorkflow } from '../../api/workflows';
import { useWorkflows } from '../../hooks/use-workflows';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { showToast } from '../primitives/sonner-helpers';
import { ToastIcon } from '../primitives/sonner';
import { ROUTES } from '../../utils/routes';
import { useNavigate } from 'react-router-dom';

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

export function InboxPlayground() {
  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(
      z.object({
        subject: z.string(),
        body: z.string(),
        primaryAction: z.object({
          label: z.string(),
          redirect: z.object({
            target: z.string(),
            url: z.string(),
          }),
        }),
        secondaryAction: z.object({
          label: z.string(),
          redirect: z.object({
            target: z.string(),
            url: z.string(),
          }),
        }),
      })
    ),
    values: {
      subject: '**Welcome to Inbox!**',
      body: 'This is your first notification. Customize and explore more features.',
      primaryAction: {
        label: 'Add to your app',
        redirect: {
          target: '_self',
          url: '/',
        },
      },
      secondaryAction: null,
    },
    shouldFocusError: true,
  });

  const [selectedStyle, setSelectedStyle] = useState<string>('popover');
  const [openAccordion, setOpenAccordion] = useState<string | undefined>('layout');
  const { triggerWorkflow, isPending } = useTriggerWorkflow();
  const { data } = useWorkflows();
  const auth = useAuth();
  const [hasNotificationBeenSent, setHasNotificationBeenSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!data) return;

    (async () => {
      const workflow = data?.workflows.find((workflow) => workflow.workflowId === 'onboarding-demo-workflow');

      if (!workflow) {
        await createWorkflow({
          name: 'Onboarding Demo Workflow',
          description: 'A demo workflow to showcase the Inbox component',
          workflowId: 'onboarding-demo-workflow',
          steps: [
            {
              name: 'Inbox',
              type: StepTypeEnum.IN_APP,
              controlValues: {
                subject: '{{payload.subject}}',
                body: '{{payload.body}}',
                primaryAction: {
                  label: '{{payload.primaryActionLabel}}',
                  redirect: {
                    target: '_self',
                    url: '',
                  },
                },
                secondaryAction: {
                  label: '{{payload.secondaryActionLabel}}',
                  redirect: {
                    target: '_self',
                    url: '',
                  },
                },
              },
            },
          ],
          __source: WorkflowCreationSourceEnum.DASHBOARD,
        });
      }
    })();
  }, [data]);

  async function handleSendNotification() {
    try {
      await triggerWorkflow({
        name: 'onboarding-demo-workflow',
        to: auth.currentUser?._id,
        payload: {
          subject: form.getValues('subject'),
          body: form.getValues('body'),
          primaryActionLabel: form.getValues('primaryAction.label') || '',
          secondaryActionLabel: form.getValues('secondaryAction.label') || '',
        },
      });

      setHasNotificationBeenSent(true);

      showToast({
        children: () => (
          <>
            <ToastIcon variant="success" />
            <span className="text-sm">Notification sent successfully!</span>
          </>
        ),
        options: {
          position: 'bottom-center',
        },
      });
    } catch (error) {
      showToast({
        children: () => (
          <>
            <ToastIcon variant="error" />
            <span className="text-sm">Failed to save</span>
          </>
        ),
        options: {
          position: 'bottom-center',
        },
      });
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
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

            <FormProvider {...form}>
              <Accordion type="single" collapsible value={openAccordion} onValueChange={setOpenAccordion}>
                <AccordionItem value="configure" className="bg-white p-0">
                  <AccordionTrigger className="bg-neutral-alpha-50 border-b p-2">
                    <div className="flex items-center gap-1 text-xs">
                      <RiInputField className="text-feature size-5" />
                      Configure notification
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-2 p-2">
                    <div className="flex flex-col gap-1 p-1">
                      <div className="flex gap-1">
                        {getComponentByType({ component: UiComponentEnum.IN_APP_SUBJECT })}
                      </div>
                      {getComponentByType({ component: UiComponentEnum.IN_APP_BODY })}
                      {getComponentByType({ component: UiComponentEnum.IN_APP_BUTTON_DROPDOWN })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </FormProvider>

            {hasNotificationBeenSent && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-100 bg-neutral-50 px-2 py-1.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-[16px] items-center">
                    <div className="h-full w-1 rounded-full bg-[#717784]" />
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">Send Again?</span> Edit the notification and resend
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  className="p-0 text-xs font-medium text-[#DD2450] hover:bg-transparent"
                  onClick={handleSendNotification}
                  disabled={isPending}
                >
                  Send again
                  {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : ''}
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-muted mt-auto border-t">
            <div className="flex justify-end gap-3 p-2">
              {!hasNotificationBeenSent ? (
                <>
                  <Button size="sm" onClick={handleSendNotification} disabled={isPending} className="px-2">
                    Send notification
                    {isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RiNotification2Fill className="h-3 w-3" />
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="gap-1">
                    Skip to Dashboard
                  </Button>
                  <Button size="sm" className="px-2" onClick={() => navigate(ROUTES.INBOX_EMBED)}>
                    Implement &lt;Inbox /&gt;
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="max-h-[610px] w-full border-l">
          <InboxPreviewContent selectedStyle={selectedStyle} hideHint={hasNotificationBeenSent} />
        </div>
      </div>
    </div>
  );
}

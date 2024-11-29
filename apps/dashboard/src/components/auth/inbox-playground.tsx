import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '../primitives/button';
import { RiNotification2Fill } from 'react-icons/ri';
import { InboxPreviewContent } from './inbox-preview-content';
import { useTriggerWorkflow } from '@/hooks/use-trigger-workflow';
import { useAuth } from '../../context/auth/hooks';
import { StepTypeEnum, WorkflowCreationSourceEnum } from '@novu/shared';
import { createWorkflow } from '../../api/workflows';
import { useWorkflows } from '../../hooks/use-workflows';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { showToast } from '../primitives/sonner-helpers';
import { ToastIcon } from '../primitives/sonner';
import { ROUTES } from '../../utils/routes';
import { useNavigate } from 'react-router-dom';
import { InlineToast } from '../primitives/inline-toast';
import { UsecasePlaygroundHeader } from '../usecase-playground-header';
import { CustomizeInbox } from './customize-inbox-playground';

export function InboxPlayground() {
  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(
      z.object({
        subject: z.string(),
        body: z.string(),
        primaryColor: z.string(),
        foregroundColor: z.string(),
        selectedStyle: z.string(),
        openAccordion: z.string().optional(),
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
      primaryColor: '#DD2450',
      foregroundColor: '#0E121B',
      selectedStyle: 'popover',
      openAccordion: 'layout',
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
        await createDemoWorkflow();
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
      <UsecasePlaygroundHeader
        title="Send your first Inbox notification"
        description="Customize your notification and hit 'Send notification' 🎉"
        skipPath={ROUTES.WELCOME}
      />

      <div className="flex flex-1">
        <div className="flex min-w-[480px] flex-col">
          <CustomizeInbox form={form} />

          {hasNotificationBeenSent && (
            <InlineToast
              variant="tip"
              title="Send Again?"
              description="Edit the notification and resend"
              ctaLabel="Send again"
              onCtaClick={handleSendNotification}
              isCtaLoading={isPending}
            />
          )}

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
                  <Button
                    size="sm"
                    className="px-2"
                    onClick={() => {
                      const primaryColor = form.getValues('primaryColor');
                      const foregroundColor = form.getValues('foregroundColor');
                      const queryParams = new URLSearchParams({
                        primaryColor,
                        foregroundColor,
                      }).toString();
                      navigate(`${ROUTES.INBOX_EMBED}?${queryParams}`);
                    }}
                  >
                    Implement &lt;Inbox /&gt;
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="max-h-[610px] w-full border-l">
          <InboxPreviewContent
            selectedStyle={form.watch('selectedStyle')}
            hideHint={hasNotificationBeenSent}
            primaryColor={form.watch('primaryColor')}
            foregroundColor={form.watch('foregroundColor')}
          />
        </div>
      </div>
    </div>
  );
}

async function createDemoWorkflow() {
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

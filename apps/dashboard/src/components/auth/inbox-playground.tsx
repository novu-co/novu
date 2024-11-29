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

interface ActionConfig {
  label: string;
  redirect: {
    target: string;
    url: string;
  };
}

interface InboxPlaygroundFormData {
  subject: string;
  body: string;
  primaryColor: string;
  foregroundColor: string;
  selectedStyle: string;
  openAccordion?: string;
  primaryAction: ActionConfig;
  secondaryAction: ActionConfig | null;
}

const formSchema = z.object({
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
  secondaryAction: z
    .object({
      label: z.string(),
      redirect: z.object({
        target: z.string(),
        url: z.string(),
      }),
    })
    .nullable(),
});

const defaultFormValues: InboxPlaygroundFormData = {
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
};

export function InboxPlayground() {
  const form = useForm<InboxPlaygroundFormData>({
    mode: 'onSubmit',
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
    shouldFocusError: true,
  });

  const { triggerWorkflow, isPending } = useTriggerWorkflow();
  const { data } = useWorkflows();
  const auth = useAuth();
  const [hasNotificationBeenSent, setHasNotificationBeenSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!data) return;

    /**
     * We only want to create the demo workflow if it doesn't exist yet.
     * This workflow will be used by the inbox preview examples
     */
    const initializeDemoWorkflow = async () => {
      const workflow = data?.workflows.find((workflow) => workflow.workflowId === 'onboarding-demo-workflow');
      if (!workflow) {
        await createDemoWorkflow();
      }
    };

    initializeDemoWorkflow();
  }, [data]);

  // Handlers
  const handleSendNotification = async () => {
    try {
      const formValues = form.getValues();

      await triggerWorkflow({
        name: 'onboarding-demo-workflow',
        to: auth.currentUser?._id,
        payload: {
          subject: formValues.subject,
          body: formValues.body,
          primaryActionLabel: formValues.primaryAction?.label || '',
          secondaryActionLabel: formValues.secondaryAction?.label || '',
        },
      });

      setHasNotificationBeenSent(true);
      showSuccessToast();
    } catch (error) {
      showErrorToast();
    }
  };

  const handleImplementClick = () => {
    const { primaryColor, foregroundColor } = form.getValues();
    const queryParams = new URLSearchParams({ primaryColor, foregroundColor }).toString();
    navigate(`${ROUTES.INBOX_EMBED}?${queryParams}`);
  };

  const showSuccessToast = () => {
    showToast({
      children: () => (
        <>
          <ToastIcon variant="success" />
          <span className="text-sm">Notification sent successfully!</span>
        </>
      ),
      options: { position: 'bottom-center' },
    });
  };

  const showErrorToast = () => {
    showToast({
      children: () => (
        <>
          <ToastIcon variant="error" />
          <span className="text-sm">Failed to save</span>
        </>
      ),
      options: { position: 'bottom-center' },
    });
  };

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
            <div className="px-2">
              <InlineToast
                variant="tip"
                title="Send Again?"
                description="Edit the notification and resend"
                ctaLabel="Send again"
                onCtaClick={handleSendNotification}
                isCtaLoading={isPending}
              />
            </div>
          )}

          {/* Footer */}
          <div className="bg-muted mt-auto border-t">
            <div className="flex justify-end gap-3 p-2">
              {!hasNotificationBeenSent ? (
                <Button size="sm" onClick={handleSendNotification} disabled={isPending} className="px-2">
                  Send notification
                  {isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RiNotification2Fill className="h-3 w-3" />
                  )}
                </Button>
              ) : (
                <Button size="sm" className="px-2" onClick={handleImplementClick}>
                  Implement &lt;Inbox /&gt;
                </Button>
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

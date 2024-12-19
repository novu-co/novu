import { providerSchemas } from '@novu/framework';
import { ChannelTypeEnum, EmailProviderIdEnum } from '@novu/shared';
import { useMemo } from 'react';
import { JsonForm } from './json-form';
import { RJSFSchema } from '@rjsf/utils';
import { Accordion } from '@radix-ui/react-accordion';
import { cn } from '../../../../utils/ui';
import { AccordionContent, AccordionItem, AccordionTrigger } from '../../../primitives/accordion';
import { RiInputField } from 'react-icons/ri';
import { Form } from '../../../primitives/form/form';
import { useForm } from 'react-hook-form';
import { TooltipProvider } from '@radix-ui/react-tooltip';

export function ProviderControl() {
  const { isLoading, integrations } = {
    isLoading: false,
    integrations: [
      {
        _id: '1',
        providerId: 'sendgrid',
        name: 'SendGrid',
        channel: ChannelTypeEnum.EMAIL,
      },
      {
        _id: '2',
        providerId: 'mailgun',
        name: 'MailGun',
        channel: ChannelTypeEnum.EMAIL,
      },
      {
        _id: '3',
        providerId: 'slack',
        name: 'Slack',
        channel: ChannelTypeEnum.CHAT,
      },
    ],
  };

  const schemas = useMemo(() => {
    return integrations
      ?.filter((item) => {
        return item.providerId !== 'novu-email' && item.providerId !== 'novu-sms';
      })
      .map((item) => {
        return {
          schema: providerSchemas[item.channel]?.[item?.providerId as EmailProviderIdEnum]?.output,
          integration: item,
        };
      });
  }, [integrations]);

  if (isLoading) return null;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="mx-auto mt-12 max-w-[700px]">
        <Accordion
          className={cn(
            'bg-neutral-alpha-50 border-neutral-alpha-200 flex w-full flex-col gap-2 rounded-lg border p-2 text-sm'
          )}
          type="single"
          collapsible
        >
          {schemas?.map((item) => {
            return <ProviderAccordion schema={item.schema} integration={item.integration} />;
          })}
        </Accordion>
      </div>
    </TooltipProvider>
  );
}

function ProviderAccordion({ schema, integration }: { schema: any; integration: any }) {
  const form = useForm();

  return (
    <Form {...form}>
      <form
        autoComplete="off"
        noValidate
        onSubmit={form.handleSubmit((values) => {
          console.log(values);
        })}
      >
        <AccordionItem value={integration._id}>
          <AccordionTrigger className="flex w-full items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <RiInputField className="text-feature size-5" />
              <span className="text-sm font-medium">{integration.name} overrides</span>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="bg-background rounded-md border border-dashed p-3">
              <JsonForm schema={(schema as unknown as RJSFSchema) || {}} />;
            </div>
          </AccordionContent>
        </AccordionItem>
      </form>
    </Form>
  );
}

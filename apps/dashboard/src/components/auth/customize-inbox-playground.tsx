import { Info } from 'lucide-react';
import { RiInputField, RiLayoutLine } from 'react-icons/ri';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../primitives/accordion';
import { ColorPicker } from '../primitives/color-picker';
import { getComponentByType } from '../workflow-editor/steps/component-utils';
import { UiComponentEnum } from '@novu/shared';

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

interface CustomizeInboxProps {
  form: UseFormReturn<any>;
}

export function CustomizeInbox({ form }: CustomizeInboxProps) {
  const selectedStyle = form.watch('selectedStyle');
  const openAccordion = form.watch('openAccordion');

  return (
    <div className="space-y-3 p-3">
      <Accordion
        type="single"
        collapsible
        value={openAccordion}
        onValueChange={(value) => form.setValue('openAccordion', value)}
      >
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
                  onClick={() => form.setValue('selectedStyle', style.id)}
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
                <div className="flex-1 rounded-lg border">
                  <div className="flex items-center justify-between p-1 px-2">
                    <span className="text-xs font-medium">Primary</span>
                    <ColorPicker
                      value={form.watch('primaryColor')}
                      onChange={(color) => form.setValue('primaryColor', color)}
                    />
                  </div>
                </div>

                <div className="flex-1 rounded-lg border">
                  <div className="flex items-center justify-between p-1 px-2">
                    <span className="text-xs font-medium">Foreground</span>
                    <ColorPicker
                      value={form.watch('foregroundColor')}
                      onChange={(color) => form.setValue('foregroundColor', color)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-1 text-xs">
                <Info className="text-foreground-400 mt-0.5 h-4 w-4" />
                <p className="text-foreground-400 leading-[21px]">
                  The Inbox is completely customizable, using the{' '}
                  <a
                    href="https://docs.novu.co/inbox/react/styling#appearance-prop"
                    className="cursor-pointer underline"
                  >
                    appearance prop
                  </a>
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <FormProvider {...form}>
        <Accordion
          type="single"
          collapsible
          value={openAccordion}
          onValueChange={(value) => form.setValue('openAccordion', value)}
        >
          <AccordionItem value="configure" className="bg-white p-0">
            <AccordionTrigger className="bg-neutral-alpha-50 border-b p-2">
              <div className="flex items-center gap-1 text-xs">
                <RiInputField className="text-feature size-5" />
                Configure notification
              </div>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2 p-2">
              <div className="flex flex-col gap-1 p-1">
                <div className="flex gap-1">{getComponentByType({ component: UiComponentEnum.IN_APP_SUBJECT })}</div>
                {getComponentByType({ component: UiComponentEnum.IN_APP_BODY })}
                {getComponentByType({ component: UiComponentEnum.IN_APP_BUTTON_DROPDOWN })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </FormProvider>
    </div>
  );
}

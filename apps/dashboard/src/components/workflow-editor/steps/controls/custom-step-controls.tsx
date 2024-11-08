import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/primitives/accordion';
import { RiInputField } from 'react-icons/ri';

export function CustomStepControls() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex items-center gap-1">
            <RiInputField /> Custom step controls
          </div>
        </AccordionTrigger>
        <AccordionContent className="rounded-md border border-dashed p-3">
          <div>Yes. It adheres to the WAI-ARIA design pattern.</div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

import { useMemo } from 'react';
import { Tabs } from '@radix-ui/react-tabs';
import { RiCalendarScheduleFill } from 'react-icons/ri';
import { useFormContext } from 'react-hook-form';
import { JSONSchemaDto, TimeUnitEnum } from '@novu/shared';

import { FormLabel, FormMessagePure } from '@/components/primitives/form/form';
import { AmountInput } from '@/components/amount-input';
import { Separator } from '@/components/primitives/separator';
import { TabsContent, TabsList, TabsTrigger } from '@/components/primitives/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/primitives/tooltip';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { useSaveForm } from '../save-form-context';

const defaultUnitValues = Object.values(TimeUnitEnum);
const amountKey = 'controlValues.amount';
const unitKey = 'controlValues.unit';

export const DigestWindow = () => {
  const { step } = useWorkflow();
  const { saveForm } = useSaveForm();
  const { getFieldState } = useFormContext();
  const { dataSchema, uiSchema } = step?.controls ?? {};
  const amountField = getFieldState(`${amountKey}`);
  const unitField = getFieldState(`${unitKey}`);
  const digestError = amountField.error || unitField.error;

  const minAmountValue = useMemo(() => {
    const fixedDurationSchema = dataSchema?.anyOf?.[0];
    if (typeof fixedDurationSchema === 'object') {
      const amountField = fixedDurationSchema.properties?.amount;

      if (typeof amountField === 'object' && amountField.type === 'number') {
        return amountField.minimum ?? 1;
      }
    }

    return 1;
  }, [dataSchema]);

  const unitOptions = useMemo(
    () => ((dataSchema?.anyOf?.[0] as JSONSchemaDto).properties?.unit as any).enum ?? defaultUnitValues,
    [dataSchema]
  );

  const defaultUnitOption = useMemo(
    () => (uiSchema?.properties?.unit as any).placeholder ?? TimeUnitEnum.SECONDS,
    [uiSchema?.properties]
  );

  return (
    <div className="flex flex-col gap-2">
      <FormLabel>
        <span className="flex items-center gap-1">
          <RiCalendarScheduleFill className="size-4" />
          <span>Digest window</span>
        </span>
      </FormLabel>
      <Tabs defaultValue="editor" className="flex h-full flex-1 flex-col" value="editor">
        <div className="bg-neutral-alpha-50 flex flex-col rounded-lg border border-solid border-neutral-100">
          <div className="rounded-t-lg p-2">
            <TabsList className="w-full">
              <Tooltip>
                <TooltipTrigger className="ml-1" asChild>
                  <span className="flex-1">
                    <TabsTrigger value="editor" className="w-full text-xs">
                      Fixed duration
                    </TabsTrigger>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-48" side="top" sideOffset={10}>
                  <span>
                    Digest begins after the last sent digest, collecting events until the set time, then sends a
                    summary.
                  </span>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger className="ml-1" asChild>
                  <span className="flex-1">
                    <TabsTrigger value="preview" className="w-full text-xs">
                      Interval
                    </TabsTrigger>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-48" side="top" sideOffset={10}>
                  <span>Coming soon...</span>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </div>
          <Separator className="bg-neutral-100" />
          <div className="bg-background rounded-b-lg p-2">
            <TabsContent value="editor">
              <div className="flex items-center justify-between">
                <span className="text-foreground-600 text-xs font-medium">Digest events for</span>
                <AmountInput
                  fields={{ inputKey: `${amountKey}`, selectKey: `${unitKey}` }}
                  options={unitOptions}
                  defaultOption={defaultUnitOption}
                  className="w-min [&_input]:!w-[3ch] [&_input]:!min-w-[3ch]"
                  onValueChange={() => saveForm()}
                  showError={false}
                  min={minAmountValue}
                />
              </div>
            </TabsContent>
            <TabsContent value="preview">
              <span className="text-foreground-600 text-xs font-medium">Coming next...</span>
            </TabsContent>
          </div>
        </div>
      </Tabs>
      <FormMessagePure error={digestError ? String(digestError.message) : undefined} />
    </div>
  );
};

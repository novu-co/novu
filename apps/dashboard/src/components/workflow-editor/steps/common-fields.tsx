import { useLayoutEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkflowEditorContext } from '@/components/workflow-editor/hooks';
import { CopyButton } from '../../primitives/copy-button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../primitives/form/form';
import { Input, InputField } from '../../primitives/input';
import { useStep } from './use-step';
import { buildRoute, ROUTES } from '@/utils/routes';

export function CommonFields() {
  const { stepIndex, control, step } = useStep();
  const navigate = useNavigate();
  const { stepSlug } = useParams<{ stepSlug: string }>();
  const { isReadOnly } = useWorkflowEditorContext();
  const [isBlurred, setIsBlurred] = useState(false);

  const isStepSlugChanged = step && step?.slug && stepSlug !== step.slug;
  const shouldUpdateStepSlug = isBlurred && isStepSlugChanged;

  useLayoutEffect(() => {
    if (shouldUpdateStepSlug) {
      setTimeout(() => {
        navigate(buildRoute(`../${ROUTES.CONFIGURE_STEP}`, { stepSlug: step?.slug ?? '' }), {
          replace: true,
          state: { skipAnimation: true },
        });
      }, 0);
      setIsBlurred(false);
    }
  }, [shouldUpdateStepSlug, step, navigate]);

  return (
    <>
      <FormField
        control={control}
        name={`steps.${stepIndex}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Step Name</FormLabel>
            <FormControl>
              <InputField>
                <Input
                  placeholder="Untitled"
                  {...field}
                  disabled={isReadOnly}
                  onFocus={() => setIsBlurred(false)}
                  onBlur={() => setIsBlurred(true)}
                />
              </InputField>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name={`steps.${stepIndex}.stepId`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Step Identifier</FormLabel>
            <FormControl>
              <InputField className="flex overflow-hidden pr-0">
                <Input placeholder="Untitled" className="cursor-default" {...field} readOnly />
                <CopyButton
                  content={field.value}
                  className="rounded-md rounded-s-none border-b-0 border-r-0 border-t-0 text-neutral-400"
                />
              </InputField>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

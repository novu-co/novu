import { useLayoutEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkflowEditorContext } from '@/components/workflow-editor/hooks';
import { CopyButton } from '../../primitives/copy-button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../primitives/form/form';
import { Input, InputField } from '../../primitives/input';
import { useStep } from './use-step';
import { buildRoute, ROUTES } from '@/utils/routes';
import { EXCLUDED_EDITOR_TYPES } from '@/utils/constants';

export function CommonFields() {
  const { stepIndex, control, step } = useStep();
  const navigate = useNavigate();
  const { stepSlug } = useParams<{ stepSlug: string }>();
  const { isReadOnly: isWorkflowReadOnly } = useWorkflowEditorContext();
  const [isBlurred, setIsBlurred] = useState(false);

  const isReadOnly = isWorkflowReadOnly || EXCLUDED_EDITOR_TYPES.includes(step?.type ?? '');

  const isStepSlugChanged = step && step?.slug && stepSlug !== step.slug;
  const shouldUpdateStepSlug = isBlurred && isStepSlugChanged;

  useLayoutEffect(() => {
    const timeout = setTimeout(() => {
      if (shouldUpdateStepSlug) {
        navigate(buildRoute(`../${ROUTES.CONFIGURE_STEP}`, { stepSlug: step?.slug ?? '' }), {
          replace: true,
          state: { skipAnimation: true },
        });
      }
      setIsBlurred(false);
    }, 0);
    return () => clearTimeout(timeout);
  }, [shouldUpdateStepSlug, step, navigate]);

  return (
    <>
      <FormField
        control={control}
        name={`steps.${stepIndex}.name`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
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
            <FormLabel>Identifier</FormLabel>
            <FormControl>
              <InputField className="flex overflow-hidden pr-0">
                <Input placeholder="Untitled" className="cursor-default" {...field} readOnly />
                <CopyButton valueToCopy={field.value} size="input-right" />
              </InputField>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

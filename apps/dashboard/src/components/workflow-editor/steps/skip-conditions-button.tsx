import { Button } from '@/components/primitives/button';
import { Separator } from '@/components/primitives/separator';
import { SidebarContent } from '@/components/side-navigation/sidebar';
import { useFeatureFlag } from '@/hooks/use-feature-flag';
import { FeatureFlagsKeysEnum, StepResponseDto } from '@novu/shared';
import { useMemo } from 'react';
import { RiArrowRightSLine, RiGuideFill } from 'react-icons/ri';
import { RQBJsonLogic } from 'react-querybuilder';
import { parseJsonLogic } from 'react-querybuilder/parseJsonLogic';
import { Link } from 'react-router-dom';

export function SkipConditionsButton({ step, inSidebar = false }: { step: StepResponseDto; inSidebar?: boolean }) {
  const isStepConditionsEnabled = useFeatureFlag(FeatureFlagsKeysEnum.IS_STEP_CONDITIONS_ENABLED);
  const uiSchema = step.controls.uiSchema;
  const skip = uiSchema?.properties?.skip;

  const conditionsCount = useMemo(() => {
    if (!step.controls.values.skip) return 0;

    const query = parseJsonLogic(step.controls.values.skip as RQBJsonLogic);

    return query.rules.length;
  }, [step]);

  const button = (
    <Link to={'./conditions'} relative="path" state={{ stepType: step.type }}>
      <Button variant="secondary" mode="outline" className="flex w-full justify-start gap-1.5 text-xs font-medium">
        <RiGuideFill className="h-4 w-4 text-neutral-600" />
        Skip Conditions
        {conditionsCount > 0 && (
          <span className="ml-auto flex items-center gap-0.5">
            <span>{conditionsCount}</span>
            <RiArrowRightSLine className="ml-auto h-4 w-4 text-neutral-600" />
          </span>
        )}
      </Button>
    </Link>
  );

  if (!skip || !isStepConditionsEnabled) {
    return null;
  }

  if (!inSidebar) {
    return button;
  }

  return (
    <>
      <SidebarContent>{button}</SidebarContent>
      <Separator />
    </>
  );
}

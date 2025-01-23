import { useEnvironment } from '@/context/environment/hooks';
import { StepTypeEnum } from '@/utils/enums';
import { buildRoute, ROUTES } from '@/utils/routes';
import { Step } from '@/utils/types';
import { motion } from 'motion/react';
import { RiArrowRightDoubleFill, RiCheckboxCircleFill, RiLoader3Line, RiSparkling2Fill } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/ui';
import { Badge, BadgeIcon } from '../primitives/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../primitives/popover';
import { useWorkflow } from './workflow-provider';

interface WorkflowChecklistProps {
  steps: Step[];
}

interface ChecklistItem {
  title: string;
  isCompleted: (steps: Step[]) => boolean;
  onClick?: () => void;
}

export function WorkflowChecklist({ steps }: WorkflowChecklistProps) {
  const navigate = useNavigate();
  const { currentEnvironment } = useEnvironment();
  const { workflow } = useWorkflow();

  const CHECKLIST_ITEMS: ChecklistItem[] = [
    {
      title: 'Add a Step',
      isCompleted: (steps) => steps.length > 0,
      onClick: () => {
        if (steps.length === 0) {
          return;
        }
      },
    },
    {
      title: 'Configure notification template',
      isCompleted: (steps) => steps.some((step) => step.type !== StepTypeEnum.TRIGGER && step.controls?.values),
      onClick: () => {
        const stepToConfig = steps.find((step) => step.type !== StepTypeEnum.TRIGGER);

        if (stepToConfig) {
          navigate(
            buildRoute(ROUTES.EDIT_STEP_TEMPLATE, {
              environmentSlug: currentEnvironment?.slug ?? '',
              workflowSlug: workflow?.slug ?? '',
              stepSlug: stepToConfig.slug,
            })
          );
        }
      },
    },
    {
      title: 'Trigger from your application',
      isCompleted: (steps) => false,
      onClick: () => {
        navigate(
          buildRoute(ROUTES.TEST_WORKFLOW, {
            environmentSlug: currentEnvironment?.slug ?? '',
            workflowSlug: workflow?.slug ?? '',
          })
        );
      },
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="absolute bottom-[18px] left-[18px]">
          <Badge color="red" size="md" variant="lighter" className="cursor-pointer">
            <motion.div
              variants={{
                initial: { scale: 1, rotate: 0, opacity: 1 },
                hover: {
                  scale: [1, 1.1, 1],
                  rotate: [0, 4, -4, 0],
                  opacity: [0, 1, 1],
                  transition: {
                    duration: 1.4,
                    repeat: 0,
                    ease: 'easeInOut',
                  },
                },
              }}
            >
              <BadgeIcon as={RiSparkling2Fill} />
            </motion.div>
            <span className="text-xs">
              {CHECKLIST_ITEMS.filter((item) => item.isCompleted(steps)).length}/{CHECKLIST_ITEMS.length}
            </span>
          </Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" alignOffset={0} align="start" className="w-[325px] p-4">
        <div>
          <h3 className="text-foreground-900 text-label-sm mb-1 font-medium">Workflow Checklist</h3>
          <p className="text-text-soft text-paragraph-xs mb-3">
            Let's make sure you have everything you need to send notifications to your users
          </p>
        </div>
        <div className="bg-bg-weak rounded-8 flex flex-col p-1.5">
          {CHECKLIST_ITEMS.map((item, index) => (
            <button
              key={index}
              type="button"
              className="hover:bg-background group mb-1.5 flex w-full items-center gap-1 rounded-md p-1.5 transition-colors duration-200"
              onClick={item.onClick}
            >
              <div
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(10,13,20,0.03)]'
                )}
              >
                <div className={`text- flex items-center justify-center`}>
                  {item.isCompleted(steps) ? (
                    <RiCheckboxCircleFill className="text-success h-4 w-4" />
                  ) : (
                    <RiLoader3Line className="text-text-soft h-4 w-4" />
                  )}
                </div>
              </div>
              <div className="text-label-xs text-text-sub">
                <span className={cn(item.isCompleted(steps) && 'line-through')}>{item.title}</span>
              </div>

              <RiArrowRightDoubleFill className="text-text-soft ml-auto h-4 w-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

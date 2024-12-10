import { BaseEdge, Edge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { AddStepMenu } from './add-step-menu';
import { useWorkflow } from '@/components/workflow-editor/workflow-provider';
import { WorkflowOriginEnum } from '@novu/shared';
import { createStep } from '@/components/workflow-editor/step-utils';

export type AddNodeEdgeType = Edge<{ isLast: boolean; addStepIndex: number }>;

export function AddNodeEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = { isLast: false, addStepIndex: 0 },
  markerEnd,
}: EdgeProps<AddNodeEdgeType>) {
  const { workflow, update } = useWorkflow();
  const isReadOnly = workflow?.origin === WorkflowOriginEnum.EXTERNAL;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {!data.isLast && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              // everything inside EdgeLabelRenderer has no pointer events by default
              // if you have an interactive element, set pointer-events: all
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            {!isReadOnly && (
              <AddStepMenu
                onMenuItemClick={(stepType) => {
                  if (workflow) {
                    const indexToAdd = data.addStepIndex;

                    const newStep = createStep(stepType);

                    const updatedSteps = [
                      ...workflow.steps.slice(0, indexToAdd),
                      newStep,
                      ...workflow.steps.slice(indexToAdd),
                    ];

                    update({
                      ...workflow,
                      steps: updatedSteps,
                    });
                  }
                }}
              />
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

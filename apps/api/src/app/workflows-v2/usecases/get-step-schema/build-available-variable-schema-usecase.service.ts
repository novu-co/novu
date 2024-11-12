import { Injectable } from '@nestjs/common';
import { NotificationStepEntity } from '@novu/dal';
import { JSONSchemaDto } from '@novu/shared';
import { computeResultSchema } from '../../shared';

@Injectable()
class BuildAvailableVariableSchemaCommand {
  previousSteps: NotificationStepEntity[] | undefined;
  payloadSchema: JSONSchemaDto;
}

export class BuildAvailableVariableSchemaUsecase {
  execute(command: BuildAvailableVariableSchemaCommand): JSONSchemaDto {
    const { previousSteps, payloadSchema } = command;

    return {
      type: 'object',
      properties: {
        subscriber: buildSubscriberSchema(),
        steps: buildPreviousStepsSchema(previousSteps, payloadSchema),
        payload: payloadSchema,
      },
      additionalProperties: false,
    } as const satisfies JSONSchemaDto;
  }
}

function buildPreviousStepsProperties(
  previousSteps: NotificationStepEntity[] | undefined,
  payloadSchema?: JSONSchemaDto
) {
  return (previousSteps || []).reduce(
    (acc, step) => {
      if (step.stepId && step.template?.type) {
        acc[step.stepId] = computeResultSchema(step.template.type, payloadSchema);
      }

      return acc;
    },
    {} as Record<string, JSONSchemaDto>
  );
}

function buildPreviousStepsSchema(
  previousSteps: NotificationStepEntity[] | undefined,
  payloadSchema?: JSONSchemaDto
): JSONSchemaDto {
  return {
    type: 'object',
    properties: buildPreviousStepsProperties(previousSteps, payloadSchema),
    required: [],
    additionalProperties: false,
    description: 'Previous Steps Results',
  } as const satisfies JSONSchemaDto;
}
const buildSubscriberSchema = () =>
  ({
    type: 'object',
    description: 'Schema representing the subscriber entity',
    properties: {
      firstName: { type: 'string', description: "Subscriber's first name" },
      lastName: { type: 'string', description: "Subscriber's last name" },
      email: { type: 'string', description: "Subscriber's email address" },
      phone: { type: 'string', description: "Subscriber's phone number (optional)" },
      avatar: { type: 'string', description: "URL to the subscriber's avatar image (optional)" },
      locale: { type: 'string', description: 'Locale for the subscriber (optional)' },
      subscriberId: { type: 'string', description: 'Unique identifier for the subscriber' },
      isOnline: { type: 'boolean', description: 'Indicates if the subscriber is online (optional)' },
      lastOnlineAt: {
        type: 'string',
        format: 'date-time',
        description: 'The last time the subscriber was online (optional)',
      },
    },
    additionalProperties: false,
  }) as const satisfies JSONSchemaDto;

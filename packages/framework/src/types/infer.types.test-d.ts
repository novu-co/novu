import { describe, it } from 'vitest';

import { workflow } from '../resources';
import { InferWorkflowId, InferWorkflowPayload } from './infer.types';

const smsWorkflow = workflow(
  'sms-workflow',
  async ({ step, payload }) => {
    await step.sms('send-sms', async () => ({
      body: payload.body,
    }));
  },
  {
    payloadSchema: {
      type: 'object',
      properties: {
        body: {
          type: 'string',
        },
      },
      required: ['body'],
      additionalProperties: false,
    } as const,
  }
);

const emailWorkflow = workflow(
  'my-email-workflow',
  async ({ step, payload }) => {
    await step.email('send-email', async () => ({
      body: 'Static body',
      subject: payload.subject,
    }));
  },
  {
    payloadSchema: {
      type: 'object',
      properties: {
        subject: {
          type: 'string',
        },
      },
      required: ['subject'],
      additionalProperties: false,
    } as const,
  }
);

const workflowWithNoPayloadSchema = workflow('no-payload-schema', async ({ step }) => {
  await step.sms('send-sms', async () => ({
    body: 'Hello there',
  }));
});

const workflows = [smsWorkflow, emailWorkflow, workflowWithNoPayloadSchema];

type Workflows = typeof workflows;

describe('InferWorkflowId', () => {
  it('should compile when the workflow id is the correct type', () => {
    type TestWorkflowId = InferWorkflowId<typeof smsWorkflow>;
    const testWorkflowIdValid: TestWorkflowId = 'sms-workflow';
  });

  it('should compile when a workflowId property is present given a union of workflows', () => {
    type TestWorkflowId = InferWorkflowId<typeof smsWorkflow | typeof emailWorkflow>;
    const testWorkflowIdValid: TestWorkflowId = 'sms-workflow';
  });

  it('should not compile when the workflow id is not the correct type', () => {
    type TestWorkflowId = InferWorkflowId<typeof smsWorkflow>;
    // @ts-expect-error - Type '123' is not assignable to type '"sms-workflow"'
    const testWorkflowIdInvalid: TestWorkflowId = 123;
  });
});

describe('InferWorkflowPayload', () => {
  it('should compile when the workflow payload is the correct type for a literal workflow id', () => {
    type TestWorkflowPayload = InferWorkflowPayload<Workflows, 'sms-workflow'>;
    const testWorkflowPayloadValid: TestWorkflowPayload = { body: 'Hello there' };
  });

  it('should compile when the workflow payload is the correct type for an inferred workflow id', () => {
    type TestWorkflowPayload = InferWorkflowPayload<Workflows, InferWorkflowId<typeof smsWorkflow>>;
    const testWorkflowPayloadValid: TestWorkflowPayload = { body: 'Hello there' };
  });

  it('should compile when the workflow payload is the correct type for defined workflow id', () => {
    type TestWorkflowPayload = InferWorkflowPayload<Workflows, typeof smsWorkflow.definition.workflowId>;
    const testWorkflowPayloadValid: TestWorkflowPayload = { body: 'Hello there' };
  });

  it('should not compile when the workflow payload is not the correct type for a literal workflow id', () => {
    type TestWorkflowPayload = InferWorkflowPayload<Workflows, 'sms-workflow'>;
    // @ts-expect-error - Type '{ foo: string }' is not assignable to type '{ body: string }'
    const testWorkflowPayloadInvalid: TestWorkflowPayload = { foo: 'bar' };
  });

  it('should not compile when the workflow payload is not the correct type for an inferred workflow id', () => {
    type TestWorkflowPayload = InferWorkflowPayload<Workflows, InferWorkflowId<typeof smsWorkflow>>;
    // @ts-expect-error - Type '{ foo: string }' is not assignable to type '{ body: string }'
    const testWorkflowPayloadInvalid: TestWorkflowPayload = { foo: 'bar' };
  });

  it('should not compile when the workflow payload is not the correct type for a defined workflow id', () => {
    type TestWorkflowPayload = InferWorkflowPayload<Workflows, typeof smsWorkflow.definition.workflowId>;
    // @ts-expect-error - Type '{ foo: string }' is not assignable to type '{ body: string }'
    const testWorkflowPayloadInvalid: TestWorkflowPayload = { foo: 'bar' };
  });

  it('should not compile when supplied with a workflow id that is not present in the list of workflows', () => {
    // @ts-expect-error - Type '"non-existent-workflow"' does not satisfy the constraint '"sms-workflow" | "my-email-workflow" | "no-payload-schema"'
    type TestWorkflowPayload = InferWorkflowPayload<Workflows, 'non-existent-workflow'>;
  });

  it('should compile when the workflow payload is untyped', () => {
    type TestWorkflowPayload = InferWorkflowPayload<Workflows, 'no-payload-schema'>;
    const testWorkflowPayloadValid: TestWorkflowPayload = { body: 'Hello there' };
  });
});

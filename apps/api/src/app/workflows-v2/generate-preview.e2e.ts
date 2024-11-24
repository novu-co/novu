import { UserSession } from '@novu/testing';
import { expect } from 'chai';
import { randomUUID } from 'node:crypto';
import { after, beforeEach } from 'mocha';
import { sleep } from '@nestjs/terminus/dist/utils';
import {
  ChannelTypeEnum,
  createWorkflowClient,
  CreateWorkflowDto,
  CronExpressionEnum,
  EmailStepControlSchemaDto,
  GeneratePreviewRequestDto,
  GeneratePreviewResponseDto,
  HttpError,
  NovuRestResult,
  RedirectTargetEnum,
  StepTypeEnum,
  WorkflowCreationSourceEnum,
} from '@novu/shared';
import { buildCreateWorkflowDto } from './workflow.controller.e2e';
import { forSnippet, fullCodeSnippet } from './maily-test-data';
import { InAppControlType } from './shared';

const SUBJECT_TEST_PAYLOAD = '{{payload.subject.test.payload}}';
const PLACEHOLDER_SUBJECT_INAPP = '{{payload.subject}}';
const PLACEHOLDER_SUBJECT_INAPP_PAYLOAD_VALUE = 'this is the replacement text for the placeholder';
describe('Generate Preview', () => {
  let session: UserSession;
  let workflowsClient: ReturnType<typeof createWorkflowClient>;

  beforeEach(async () => {
    session = new UserSession();
    await session.initialize();
    workflowsClient = createWorkflowClient(session.serverUrl, getHeaders());
  });
  after(async () => {
    await sleep(1000);
  });

  async function patchStepWithControlValues(workflowSlug: string, stepSlug: string, controlValues: InAppControlType) {
    const novuRestResult1 = await workflowsClient.patchWorkflowStepData(workflowSlug, stepSlug, {
      controlValues,
    });
    if (!novuRestResult1.isSuccessResult()) {
      throw new Error('shoud patch');
    }

    return novuRestResult1.value;
  }

  describe('Generate Preview', () => {
    describe('Hydration testing', () => {
      it(` should hydrate previous step in iterator email --> digest`, async () => {
        const { workflowId, emailStepDatabaseId, digestStepId } = await createWorkflowWithEmailLookingAtDigestResult();
        const requestDto = {
          controlValues: getTestControlValues(digestStepId)[StepTypeEnum.EMAIL],
          previewPayload: { payload: { subject: PLACEHOLDER_SUBJECT_INAPP_PAYLOAD_VALUE } },
        };
        const previewResponseDto = await generatePreview(workflowId, emailStepDatabaseId, requestDto, 'testing steps');
        expect(previewResponseDto.result!.preview).to.exist;
        expect(previewResponseDto.previewPayloadExample).to.exist;
        expect(previewResponseDto.previewPayloadExample?.steps?.[digestStepId]).to.be.ok;
        if (previewResponseDto.result!.type !== ChannelTypeEnum.EMAIL) {
          throw new Error('Expected email');
        }
        const preview = previewResponseDto.result!.preview.body;
        expect(previewResponseDto.result!.preview.body).to.contain('{{item.payload.country}}');
      });
      it(` should hydrate previous step in iterator sms looking at inApp`, async () => {
        const { workflowId, smsDatabaseStepId, inAppStepId } = await createWorkflowWithSmsLookingAtInAppResult();
        const requestDto = buildDtoNoPayload(StepTypeEnum.SMS, inAppStepId);
        const previewResponseDto = await generatePreview(workflowId, smsDatabaseStepId, requestDto, 'testing steps');
        expect(previewResponseDto.result!.preview).to.exist;
        expect(previewResponseDto.previewPayloadExample).to.exist;
        expect(previewResponseDto.previewPayloadExample?.steps).to.be.ok;
        if (previewResponseDto.result?.type === 'sms' && previewResponseDto.result?.preview.body) {
          expect(previewResponseDto.result!.preview.body).to.contain(`[[{{steps.${inAppStepId}.seen}}]]`);
        }
      });
      it(`IN_APP :should match the body in the preview response`, async () => {
        const { stepDatabaseId, workflowId, stepId } = await createWorkflowAndReturnId(StepTypeEnum.IN_APP);
        const controlValues = buildInAppControlValues();
        const requestDto = {
          controlValues,
          previewPayload: { payload: { subject: PLACEHOLDER_SUBJECT_INAPP_PAYLOAD_VALUE } },
        };
        const previewResponseDto = await generatePreview(workflowId, stepDatabaseId, requestDto, StepTypeEnum.IN_APP);
        expect(previewResponseDto.result!.preview).to.exist;
        controlValues.subject = controlValues.subject!.replace(
          PLACEHOLDER_SUBJECT_INAPP,
          PLACEHOLDER_SUBJECT_INAPP_PAYLOAD_VALUE
        );
        if (previewResponseDto.result?.type !== 'in_app') {
          throw new Error('should have a inapp redview ');
        }
        expect(previewResponseDto.result.preview.subject).to.deep.equal(controlValues.subject);
      });
    });
    describe('Happy Path, no payload, expected same response as requested', () => {
      it(`${StepTypeEnum.IN_APP}: should match the body in the preview response`, async () => {
        const previewResponseDto = await createWorkflowAndPreview(StepTypeEnum.IN_APP, 'InApp');

        expect(previewResponseDto.result).to.exist;
        if (!previewResponseDto.result) {
          throw new Error('missing preview');
        }
        if (previewResponseDto.result!.type !== 'in_app') {
          throw new Error('should be in app preview type');
        }
        const inApp = getTestControlValues().in_app;
        const previewRequestWithoutTheRedirect = { ...inApp, primaryAction: { label: inApp.primaryAction.label } };
        expect(previewResponseDto.result!.preview).to.deep.equal(previewRequestWithoutTheRedirect);
      });

      it(`${StepTypeEnum.SMS}: should match the body in the preview response`, async () => {
        const previewResponseDto = await createWorkflowAndPreview(StepTypeEnum.SMS, 'SMS');

        expect(previewResponseDto.result!.preview).to.exist;
        expect(previewResponseDto.issues).to.exist;
        expect(previewResponseDto.previewPayloadExample).to.exist;
        expect(previewResponseDto.previewPayloadExample.subscriber, 'Expecting to find subscriber in the payload').to
          .exist;

        expect(previewResponseDto.result!.preview).to.deep.equal(getTestControlValues()[StepTypeEnum.SMS]);
      });

      it(`${StepTypeEnum.PUSH}: should match the body in the preview response`, async () => {
        const previewResponseDto = await createWorkflowAndPreview(StepTypeEnum.PUSH, 'Push');

        expect(previewResponseDto.result!.preview).to.exist;
        expect(previewResponseDto.issues).to.exist;
        expect(previewResponseDto.previewPayloadExample).to.exist;
        expect(previewResponseDto.previewPayloadExample.subscriber, 'Expecting to find subscriber in the payload').to
          .exist;

        expect(previewResponseDto.result!.preview).to.deep.equal(getTestControlValues()[StepTypeEnum.PUSH]);
      });

      it(`${StepTypeEnum.CHAT}: should match the body in the preview response`, async () => {
        const previewResponseDto = await createWorkflowAndPreview(StepTypeEnum.CHAT, 'Chat');

        expect(previewResponseDto.result!.preview).to.exist;
        expect(previewResponseDto.issues).to.exist;
        expect(previewResponseDto.previewPayloadExample).to.exist;
        expect(previewResponseDto.previewPayloadExample.subscriber, 'Expecting to find subscriber in the payload').to
          .exist;

        expect(previewResponseDto.result!.preview).to.deep.equal(getTestControlValues()[StepTypeEnum.CHAT]);
      });

      it(`${StepTypeEnum.EMAIL}: should match the body in the preview response`, async () => {
        const previewResponseDto = await createWorkflowAndPreview(StepTypeEnum.EMAIL, 'Email');

        expect(previewResponseDto.result!.preview).to.exist;
        expect(previewResponseDto.issues).to.exist;
        expect(previewResponseDto.previewPayloadExample).to.exist;
        expect(previewResponseDto.previewPayloadExample.subscriber, 'Expecting to find subscriber in the payload').to
          .exist;

        assertEmail(previewResponseDto);
      });

      async function createWorkflowAndPreview(type, description) {
        const { stepDatabaseId, workflowId, stepId } = await createWorkflowAndReturnId(type);
        const requestDto = buildDtoNoPayload(type);

        return await generatePreview(workflowId, stepDatabaseId, requestDto, description);
      }
    });
    describe('email specific features', () => {
      describe('show', () => {
        it('show -> should hide element based on payload', async () => {
          const { stepDatabaseId, workflowId, stepId } = await createWorkflowAndReturnId(StepTypeEnum.EMAIL);
          const previewResponseDto = await generatePreview(
            workflowId,
            stepDatabaseId,
            {
              controlValues: getTestControlValues(stepId)[StepTypeEnum.EMAIL],
              previewPayload: { payload: { params: { isPayedUser: 'false' } } },
            },
            'email'
          );
          expect(previewResponseDto.result!.preview).to.exist;
          if (previewResponseDto.result!.type !== ChannelTypeEnum.EMAIL) {
            throw new Error('Expected email');
          }
          const preview = previewResponseDto.result!.preview.body;
          expect(preview).to.not.contain('should be the fallback value');
        });
        it('show -> should show element based on payload - string', async () => {
          const { stepDatabaseId, workflowId, stepId } = await createWorkflowAndReturnId(StepTypeEnum.EMAIL);
          const previewResponseDto = await generatePreview(
            workflowId,
            stepDatabaseId,
            {
              controlValues: getTestControlValues(stepId)[StepTypeEnum.EMAIL],
              previewPayload: { payload: { params: { isPayedUser: 'true' } } },
            },
            'email'
          );
          expect(previewResponseDto.result!.preview).to.exist;
          if (previewResponseDto.result!.type !== ChannelTypeEnum.EMAIL) {
            throw new Error('Expected email');
          }
          const preview = previewResponseDto.result!.preview.body;
          expect(preview).to.contain('should be the fallback value');
        });
        it('show -> should show element based on payload - boolean', async () => {
          const { stepDatabaseId, workflowId, stepId } = await createWorkflowAndReturnId(StepTypeEnum.EMAIL);
          const previewResponseDto = await generatePreview(
            workflowId,
            stepDatabaseId,
            {
              controlValues: getTestControlValues(stepId)[StepTypeEnum.EMAIL],
              previewPayload: { payload: { params: { isPayedUser: true } } },
            },
            'email'
          );
          if (previewResponseDto.result!.type !== ChannelTypeEnum.EMAIL) {
            throw new Error('Expected email');
          }
          const preview = previewResponseDto.result!.preview.body;
          expect(preview).to.contain('should be the fallback value');
        });
        it('show -> should show element if payload is missing', async () => {
          const { stepDatabaseId, workflowId, stepId } = await createWorkflowAndReturnId(StepTypeEnum.EMAIL);
          const previewResponseDto = await generatePreview(
            workflowId,
            stepDatabaseId,
            {
              controlValues: getTestControlValues(stepId)[StepTypeEnum.EMAIL],
              previewPayload: { payload: { params: { isPayedUser: 'true' } } },
            },
            'email'
          );
          expect(previewResponseDto.result!.preview).to.exist;
          if (previewResponseDto.result!.type !== ChannelTypeEnum.EMAIL) {
            throw new Error('Expected email');
          }
          const preview = previewResponseDto.result!.preview.body;
          expect(preview).to.contain('should be the fallback value');
        });
      });
      describe('for', () => {
        it('should populate for if payload exist with actual values', async () => {
          const { stepDatabaseId, workflowId } = await createWorkflowAndReturnId(StepTypeEnum.EMAIL);
          const name1 = 'ball is round';
          const name2 = 'square is square';
          const previewResponseDto = await generatePreview(
            workflowId,
            stepDatabaseId,
            {
              controlValues: buildSimpleForEmail() as unknown as Record<string, unknown>,
              previewPayload: { payload: { food: { items: [{ name: name1 }, { name: name2 }] } } },
            },
            'email'
          );
          expect(previewResponseDto.result!.preview).to.exist;
          if (previewResponseDto.result!.type !== ChannelTypeEnum.EMAIL) {
            throw new Error('Expected email');
          }
          const preview = previewResponseDto.result!.preview.body;
          expect(preview).to.not.contain('should be the fallback value');
          expect(preview).not.to.contain('{{item.name}}1');
          expect(preview).not.to.contain('{{item.name}}2');
          expect(preview).to.contain(name1);
          expect(preview).to.contain(name2);
        });
      });
    });
    describe('payload sanitation', () => {
      it('Should produce a correct payload when pipe is used etc {{payload.variable | upper}}', async () => {
        const { stepDatabaseId, workflowId } = await createWorkflowAndReturnId(StepTypeEnum.SMS);
        const requestDto = {
          controlValues: {
            body: 'This is a legal placeholder with a pipe [{{payload.variableName | upper}}the pipe should show in the preview]',
          },
        };
        const previewResponseDto = await generatePreview(workflowId, stepDatabaseId, requestDto, 'email');
        expect(previewResponseDto.result!.preview).to.exist;
        if (previewResponseDto.result!.type !== 'sms') {
          throw new Error('Expected sms');
        }
        expect(previewResponseDto.result!.preview.body).to.contain('{{payload.variableName | upper}}');
        expect(previewResponseDto.previewPayloadExample).to.exist;
        expect(previewResponseDto?.previewPayloadExample?.payload?.variableName).to.equal(
          '{{payload.variableName | upper}}'
        );
      });
    });

    describe('Error Handling', () => {
      it('Should not fail on illegal placeholder {{}} ', async () => {
        const { stepDatabaseId, workflowId } = await createWorkflowAndReturnId(StepTypeEnum.SMS);
        const requestDto = {
          controlValues: { body: 'some text that illegal placeholder[{{}}this text should be alone in brackets]' },
        };
        const previewResponseDto = await generatePreview(workflowId, stepDatabaseId, requestDto, 'sms');
        expect(previewResponseDto.result!.preview).to.exist;
        if (previewResponseDto.result!.type === 'sms') {
          expect(previewResponseDto.result!.preview.body).to.contain('[this text should be alone in brackets]');
        }
        const issue = previewResponseDto.issues.body;
        expect(issue).to.exist;
        expect(issue[0].variableName).to.equal('{{}}');
        expect(issue[0].issueType).to.equal('ILLEGAL_VARIABLE_IN_CONTROL_VALUE');
      });
      it('Should return a clear error on illegal placeholder {{name}} ', async () => {
        const { stepDatabaseId, workflowId } = await createWorkflowAndReturnId(StepTypeEnum.SMS);
        const requestDto = {
          controlValues: { body: 'some text that illegal placeholder[{{name}}this text should be alone in brackets]' },
        };
        const previewResponseDto = await generatePreview(workflowId, stepDatabaseId, requestDto, 'sms');
        expect(previewResponseDto.result!.preview).to.exist;
        if (previewResponseDto.result!.type === 'sms') {
          expect(previewResponseDto.result!.preview.body).to.contain('[this text should be alone in brackets]');
        }
        const issue = previewResponseDto.issues.body;
        expect(issue).to.exist;
        expect(issue[0].variableName).to.equal('{{name}}');
        expect(issue[0].issueType).to.equal('ILLEGAL_VARIABLE_IN_CONTROL_VALUE');
      });
      describe('In App Partial control values', () => {
        it('Should show issue about bad URLs without failing ', async () => {
          const steps = [{ name: 'IN_APP_STEP_SHOULD_NOT_FAIL', type: StepTypeEnum.IN_APP }];
          const createDto = buildCreateWorkflowDto('', { steps });
          const novuRestResult = await workflowsClient.createWorkflow(createDto);
          if (!novuRestResult.isSuccessResult()) {
            throw new Error('should create workflow');
          }
          const controlValues = {
            subject: `{{subscriber.firstName}} Hello, World! ${PLACEHOLDER_SUBJECT_INAPP}`,
            body: `Hello, World! {{payload.placeholder.body}}`,
            avatar: 'https://www.example.com/avatar.png',
            primaryAction: {
              label: '{{payload.secondaryUrl}}',
              redirect: {
                url: 'notAUrl.com',
                target: RedirectTargetEnum.BLANK,
              },
            },
            secondaryAction: {
              label: 'some label',
              redirect: {
                url: 'ftp://notAUrl.com',
                target: RedirectTargetEnum.BLANK,
              },
            },
            redirect: {
              target: RedirectTargetEnum.BLANK,
              url: 'not a url',
            },
          };
          const workflowSlug = novuRestResult.value?.slug;
          const stepSlug = novuRestResult.value?.steps[0].slug;
          await patchStepWithControlValues(workflowSlug, stepSlug, controlValues);
          const generatePreviewResponseDto = await generatePreview(
            workflowSlug,
            stepSlug,
            {
              controlValues,
            },
            ''
          );
          expect(generatePreviewResponseDto.issues['redirect.url'][0].issueType).to.equal('INVALID_URL');
          expect(generatePreviewResponseDto.issues['secondaryAction.redirect.url'][0].issueType).to.equal(
            'INVALID_URL'
          );
          expect(generatePreviewResponseDto.issues['primaryAction.redirect.url'][0].issueType).to.equal('INVALID_URL');
          if (generatePreviewResponseDto.result?.type === ChannelTypeEnum.IN_APP) {
            const { preview } = generatePreviewResponseDto.result;
            expect(JSON.stringify(preview.primaryAction)).to.contain('not-good-url-please-replace');
            expect(JSON.stringify(preview.secondaryAction)).to.contain('not-good-url-please-replace');
            expect(JSON.stringify(preview.redirect)).to.contain('not-good-url-please-replace');
          }
        });

        it('Should not fail if inApp is providing partial URL in redirect', async () => {
          const steps = [{ name: 'IN_APP_STEP_SHOULD_NOT_FAIL', type: StepTypeEnum.IN_APP }];
          const createDto = buildCreateWorkflowDto('', { steps });
          const novuRestResult = await workflowsClient.createWorkflow(createDto);
          if (!novuRestResult.isSuccessResult()) {
            throw new Error('should create workflow');
          }
          const controlValues = {
            subject: `{{subscriber.firstName}} Hello, World! ${PLACEHOLDER_SUBJECT_INAPP}`,
            body: `Hello, World! {{payload.placeholder.body}}`,
            avatar: 'https://www.example.com/avatar.png',
            primaryAction: {
              label: '{{payload.secondaryUrl}}',
              redirect: {
                target: RedirectTargetEnum.BLANK,
              },
            },
            secondaryAction: null,
            redirect: {
              target: RedirectTargetEnum.BLANK,
              url: '   ',
            },
          };
          const workflowSlug = novuRestResult.value?.slug;
          const stepSlug = novuRestResult.value?.steps[0].slug;
          const stepDataDto = await patchStepWithControlValues(workflowSlug, stepSlug, controlValues);
          const generatePreviewResponseDto = await generatePreview(workflowSlug, stepSlug, { controlValues }, '');
          if (generatePreviewResponseDto.result?.type === ChannelTypeEnum.IN_APP) {
            expect(generatePreviewResponseDto.result.preview.body).to.equal(
              {
                subject: `{{subscriber.firstName}} Hello, World! ${PLACEHOLDER_SUBJECT_INAPP}`,
                body: `Hello, World! {{payload.placeholder.body}}`,
                avatar: 'https://www.example.com/avatar.png',
                primaryAction: {
                  label: '{{payload.secondaryUrl}}',
                  redirect: {
                    target: RedirectTargetEnum.BLANK,
                  },
                },
                secondaryAction: null,
                redirect: {
                  target: RedirectTargetEnum.BLANK,
                  url: '   ',
                },
              }.body
            );
          }
        });
        it('Should not fail if inApp url ref is a placeholder without payload', async () => {
          const steps = [{ name: 'IN_APP_STEP_SHOULD_NOT_FAIL', type: StepTypeEnum.IN_APP }];
          const createDto = buildCreateWorkflowDto('', { steps });
          const novuRestResult = await workflowsClient.createWorkflow(createDto);
          if (!novuRestResult.isSuccessResult()) {
            throw new Error('should create workflow');
          }
          const workflowSlug = novuRestResult.value?.slug;
          const stepSlug = novuRestResult.value?.steps[0].slug;
          const stepDataDto = await patchStepWithControlValues(
            workflowSlug,
            stepSlug,
            buildInAppControlValueWithAPlaceholderInTheUrl()
          );
          const generatePreviewResponseDto = await generatePreview(
            workflowSlug,
            stepSlug,
            { controlValues: buildInAppControlValueWithAPlaceholderInTheUrl() },
            ''
          );
          if (generatePreviewResponseDto.result?.type === ChannelTypeEnum.IN_APP) {
            expect(generatePreviewResponseDto.result.preview.body).to.equal(
              {
                subject: `{{subscriber.firstName}} Hello, World! ${PLACEHOLDER_SUBJECT_INAPP}`,
                body: `Hello, World! {{payload.placeholder.body}}`,
                avatar: 'https://www.example.com/avatar.png',
                primaryAction: {
                  label: '{{payload.secondaryUrl}}',
                  redirect: {
                    target: RedirectTargetEnum.BLANK,
                  },
                },
                secondaryAction: null,
                redirect: {
                  target: RedirectTargetEnum.BLANK,
                  url: '   ',
                },
              }.body
            );
            expect(generatePreviewResponseDto.result.preview.primaryAction?.redirect?.url).to.be.ok;
            expect(generatePreviewResponseDto.result.preview.primaryAction?.redirect?.url).to.contain('https');
          }
        });
      });
    });
    describe('Missing Required ControlValues', () => {
      const channelTypes = [{ type: StepTypeEnum.IN_APP, description: 'InApp' }];

      channelTypes.forEach(({ type, description }) => {
        it(`${type}: should assign default values to missing elements`, async () => {
          const { stepDatabaseId, workflowId, stepId } = await createWorkflowAndReturnId(type);
          const requestDto = buildDtoWithMissingControlValues(type, stepId);
          const previewResponseDto = await generatePreview(workflowId, stepDatabaseId, requestDto, description);
          if (previewResponseDto.result!.type !== ChannelTypeEnum.IN_APP) {
            throw new Error('Expected email');
          }
          expect(previewResponseDto.result!.preview.body).to.exist;
          expect(previewResponseDto.result!.preview.body).to.equal('PREVIEW_ISSUE:REQUIRED_CONTROL_VALUE_IS_MISSING');
          const { issues } = previewResponseDto;
          expect(issues).to.exist;
          expect(issues.body).to.exist;
        });
      });
    });
  });

  function getHeaders(): HeadersInit {
    return {
      Authorization: session.token, // Fixed space
      'Novu-Environment-Id': session.environment._id,
    };
  }

  async function generatePreview(
    workflowId: string,
    stepDatabaseId: string,
    dto: GeneratePreviewRequestDto,
    description: string
  ): Promise<GeneratePreviewResponseDto> {
    const novuRestResult = await workflowsClient.generatePreview(workflowId, stepDatabaseId, dto);
    if (novuRestResult.isSuccessResult()) {
      return novuRestResult.value;
    }

    throw await assertHttpError(description, novuRestResult, dto);
  }

  async function createWorkflowAndReturnId(type: StepTypeEnum) {
    const createWorkflowDto = buildCreateWorkflowDto(`${type}:${randomUUID()}`);
    createWorkflowDto.steps[0].type = type;
    const workflowResult = await workflowsClient.createWorkflow(createWorkflowDto);
    if (!workflowResult.isSuccessResult()) {
      throw new Error(`Failed to create workflow ${JSON.stringify(workflowResult.error)}`);
    }

    return {
      workflowId: workflowResult.value._id,
      stepDatabaseId: workflowResult.value.steps[0]._id,
      stepId: workflowResult.value.steps[0].stepId,
    };
  }
  async function createWorkflowWithEmailLookingAtDigestResult() {
    const createWorkflowDto: CreateWorkflowDto = {
      tags: [],
      __source: WorkflowCreationSourceEnum.EDITOR,
      name: 'John',
      workflowId: `john:${randomUUID()}`,
      description: 'This is a test workflow',
      active: true,
      steps: [
        {
          name: 'DigestStep',
          type: StepTypeEnum.DIGEST,
        },
        {
          name: 'Email Test Step',
          type: StepTypeEnum.EMAIL,
        },
      ],
    };
    const workflowResult = await workflowsClient.createWorkflow(createWorkflowDto);
    if (!workflowResult.isSuccessResult()) {
      throw new Error(`Failed to create workflow ${JSON.stringify(workflowResult.error)}`);
    }

    return {
      workflowId: workflowResult.value._id,
      emailStepDatabaseId: workflowResult.value.steps[1]._id,
      digestStepId: workflowResult.value.steps[0].stepId,
    };
  }
  async function createWorkflowWithSmsLookingAtInAppResult() {
    const createWorkflowDto: CreateWorkflowDto = {
      tags: [],
      __source: WorkflowCreationSourceEnum.EDITOR,
      name: 'John',
      workflowId: `john:${randomUUID()}`,
      description: 'This is a test workflow',
      active: true,
      steps: [
        {
          name: 'InAppStep',
          type: StepTypeEnum.IN_APP,
        },
        {
          name: 'SmsStep',
          type: StepTypeEnum.SMS,
        },
      ],
    };
    const workflowResult = await workflowsClient.createWorkflow(createWorkflowDto);
    if (!workflowResult.isSuccessResult()) {
      throw new Error(`Failed to create workflow ${JSON.stringify(workflowResult.error)}`);
    }

    return {
      workflowId: workflowResult.value._id,
      smsDatabaseStepId: workflowResult.value.steps[1]._id,
      inAppStepId: workflowResult.value.steps[0].stepId,
    };
  }
});

function buildDtoNoPayload(stepTypeEnum: StepTypeEnum, stepId?: string): GeneratePreviewRequestDto {
  return {
    controlValues: getTestControlValues(stepId)[stepTypeEnum],
  };
}

function buildDtoWithMissingControlValues(stepTypeEnum: StepTypeEnum, stepId: string): GeneratePreviewRequestDto {
  const stepTypeToElement = getTestControlValues(stepId)[stepTypeEnum];
  if (stepTypeEnum === StepTypeEnum.EMAIL) {
    delete stepTypeToElement.subject;
  } else {
    delete stepTypeToElement.body;
  }

  return {
    controlValues: stepTypeToElement,
    previewPayload: { payload: { subject: PLACEHOLDER_SUBJECT_INAPP_PAYLOAD_VALUE } },
  };
}

function buildEmailControlValuesPayload(stepId?: string): EmailStepControlSchemaDto {
  return {
    subject: `Hello, World! ${SUBJECT_TEST_PAYLOAD}`,
    emailEditor: JSON.stringify(fullCodeSnippet(stepId)),
  };
}
function buildSimpleForEmail(): EmailStepControlSchemaDto {
  return {
    subject: `Hello, World! ${SUBJECT_TEST_PAYLOAD}`,
    emailEditor: JSON.stringify(forSnippet),
  };
}
function buildInAppControlValues() {
  return {
    subject: `{{subscriber.firstName}} Hello, World! ${PLACEHOLDER_SUBJECT_INAPP}`,
    body: `Hello, World! {{payload.placeholder.body}}`,
    avatar: 'https://www.example.com/avatar.png',
    primaryAction: {
      label: '{{payload.primaryUrlLabel}}',
      redirect: {
        target: RedirectTargetEnum.BLANK,
      },
    },
    secondaryAction: {
      label: 'Secondary Action',
      redirect: {
        target: RedirectTargetEnum.BLANK,
        url: '/home/secondary-action',
      },
    },
    data: {
      key: 'value',
    },
    redirect: {
      target: RedirectTargetEnum.BLANK,
      url: 'https://www.example.com/redirect',
    },
  };
}

function buildInAppControlValueWithAPlaceholderInTheUrl() {
  return {
    subject: `{{subscriber.firstName}} Hello, World! ${PLACEHOLDER_SUBJECT_INAPP}`,
    body: `Hello, World! {{payload.placeholder.body}}`,
    avatar: 'https://www.example.com/avatar.png',
    primaryAction: {
      label: '{{payload.secondaryUrlLabel}}',
      redirect: {
        url: '{{payload.secondaryUrl}}',
        target: RedirectTargetEnum.BLANK,
      },
    },
    secondaryAction: {
      label: 'Secondary Action',
      redirect: {
        target: RedirectTargetEnum.BLANK,
        url: '',
      },
    },
    redirect: {
      target: RedirectTargetEnum.BLANK,
      url: '   ',
    },
  };
}
function buildSmsControlValuesPayload(stepId: string | undefined) {
  return {
    body: `${stepId ? ` [[{{steps.${stepId}.seen}}]]` : ''} Hello, World! {{subscriber.firstName}}`,
  };
}

function buildPushControlValuesPayload() {
  return {
    subject: 'Hello, World!',
    body: 'Hello, World! {{subscriber.firstName}}',
  };
}

function buildChatControlValuesPayload() {
  return {
    body: 'Hello, World! {{subscriber.firstName}}',
  };
}
function buildDigestControlValuesPayload() {
  return {
    cron: CronExpressionEnum.EVERY_DAY_AT_8AM,
  };
}

export const getTestControlValues = (stepId?: string) => ({
  [StepTypeEnum.SMS]: buildSmsControlValuesPayload(stepId),
  [StepTypeEnum.EMAIL]: buildEmailControlValuesPayload(stepId) as unknown as Record<string, unknown>,
  [StepTypeEnum.PUSH]: buildPushControlValuesPayload(),
  [StepTypeEnum.CHAT]: buildChatControlValuesPayload(),
  [StepTypeEnum.IN_APP]: buildInAppControlValues(),
  [StepTypeEnum.DIGEST]: buildDigestControlValuesPayload(),
});

async function assertHttpError(
  description: string,
  novuRestResult: NovuRestResult<GeneratePreviewResponseDto, HttpError>,
  dto: GeneratePreviewRequestDto
) {
  if (novuRestResult.error) {
    console.log(JSON.stringify(JSON.parse(novuRestResult.error.responseText), null, 2));

    return new Error(
      `${description}: Failed to generate preview: ${novuRestResult.error.message}payload: ${JSON.stringify(dto, null, 2)} `
    );
  }

  return new Error(`${description}: Failed to generate preview, bug in response error mapping `);
}

function assertEmail(dto: GeneratePreviewResponseDto) {
  if (dto.result!.type === ChannelTypeEnum.EMAIL) {
    const preview = dto.result!.preview.body;
    expect(preview).to.exist;
    expect(preview).to.contain('{{item.header}}-1');
    expect(preview).to.contain('{{item.header}}-2');
    expect(preview).to.contain('{{item.name}}-1');
    expect(preview).to.contain('{{item.name}}-2');
    expect(preview).to.contain('{{item.id}}-1');
    expect(preview).to.contain('{{item.id}}-2');
    expect(preview).to.contain('{{item.origin.country}}-1');
    expect(preview).to.contain('{{item.origin.country}}-2');
    expect(preview).to.contain('{{payload.body}}');
    expect(preview).to.contain('should be the fallback value');
  }
}

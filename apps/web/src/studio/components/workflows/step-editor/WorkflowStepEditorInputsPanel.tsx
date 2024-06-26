import { Button, JsonSchemaForm, Tabs } from '@novu/novui';
import { IconOutlineEditNote, IconOutlineTune, IconOutlineSave } from '@novu/novui/icons';
import { FC, useMemo } from 'react';
import { useDocsModal } from '../../../../components/docs/useDocsModal';
import { When } from '../../../../components/utils/When';
import { InputsEmptyPanel } from './InputsEmptyPanel';
import { css } from '@novu/novui/css';
import { Container } from '@novu/novui/jsx';

interface IWorkflowStepEditorInputsPanelProps {
  step: any;
  workflow: any;
  onChange: (type: 'step' | 'payload', data: any) => void;
  onSave?: () => void;
  defaultControls?: Record<string, unknown>;
  isLoadingSave?: boolean;
}

export const WorkflowStepEditorInputsPanel: FC<IWorkflowStepEditorInputsPanelProps> = ({
  step,
  workflow,
  onChange,
  onSave,
  defaultControls,
  isLoadingSave,
}) => {
  const { Component, toggle, setPath } = useDocsModal();
  const havePayloadProperties = useMemo(() => {
    return Object.keys(workflow?.options?.payloadSchema?.properties || {}).length > 0;
  }, [workflow?.options?.payloadSchema]);

  const haveInputProperties = useMemo(() => {
    return Object.keys(step?.controls?.schema?.properties || {}).length > 0;
  }, [step?.controls?.schema]);

  return (
    <>
      <Tabs
        defaultValue="step-controls"
        tabConfigs={[
          {
            icon: <IconOutlineEditNote />,
            value: 'step-controls',
            label: 'Step controls',
            content: (
              <Container className={formContainerClassName}>
                <When truthy={haveInputProperties}>
                  {onSave && (
                    <div style={{ display: 'flex', justifyContent: 'end' }}>
                      <Button
                        loading={isLoadingSave}
                        variant={'filled'}
                        size={'sm'}
                        Icon={IconOutlineSave}
                        onClick={() => {
                          onSave();
                        }}
                      >
                        Save
                      </Button>
                    </div>
                  )}

                  <JsonSchemaForm
                    onChange={(data) => onChange('step', data)}
                    schema={step?.controls?.schema || step?.inputs?.schema || {}}
                    formData={defaultControls || {}}
                  />
                </When>
                <When truthy={!haveInputProperties}>
                  <InputsEmptyPanel
                    content="Modifiable controls defined by the code schema."
                    onDocsClick={() => {
                      setPath('framework/concepts/controls');
                      toggle();
                    }}
                  />
                </When>
              </Container>
            ),
          },
          {
            icon: <IconOutlineTune />,
            value: 'payload',
            label: 'Payload',
            content: (
              <Container className={formContainerClassName}>
                <When truthy={havePayloadProperties}>
                  <JsonSchemaForm
                    onChange={(data) => onChange('payload', data)}
                    schema={workflow?.options?.payloadSchema || {}}
                    formData={{}}
                  />
                </When>
                <When truthy={!havePayloadProperties}>
                  <InputsEmptyPanel
                    content="Payload ensures correct formatting and data validity."
                    onDocsClick={() => {
                      setPath('framework/concepts/payload');
                      toggle();
                    }}
                  />
                </When>
              </Container>
            ),
          },
        ]}
      />
      <Component />
    </>
  );
};

export const formContainerClassName = css({
  h: '80vh',
  overflowY: 'auto !important',
  scrollbar: 'hidden',
});

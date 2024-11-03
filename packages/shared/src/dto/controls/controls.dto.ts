export type ControlsDto = {
  steps?: StepControl;
  payload?: PayloadControl;
};

type PayloadControl = Record<string, unknown>;
type StepControl = Record<stepId, Data>;
type stepId = string;
type Data = Record<string, unknown>;

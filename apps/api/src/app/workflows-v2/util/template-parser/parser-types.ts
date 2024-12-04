export type InvalidVariable = {
  context: string;
  message: string;
  variable: string;
};

export type TemplateParseResult = {
  validVariables: string[];
  invalidVariables: InvalidVariable[];
};

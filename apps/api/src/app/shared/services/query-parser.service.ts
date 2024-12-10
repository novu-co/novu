import jsonLogic, { AdditionalOperation, RulesLogic } from 'json-logic-js';

const initializeCustomOperators = (): void => {
  jsonLogic.add_operation(
    'startsWith',
    (dataInput: unknown, ruleValue: unknown): boolean =>
      typeof dataInput === 'string' && typeof ruleValue === 'string' && dataInput.startsWith(ruleValue)
  );

  jsonLogic.add_operation(
    'endsWith',
    (dataInput: unknown, ruleValue: unknown): boolean =>
      typeof dataInput === 'string' && typeof ruleValue === 'string' && dataInput.endsWith(ruleValue)
  );

  jsonLogic.add_operation(
    'contains',
    (dataInput: unknown, ruleValue: unknown): boolean =>
      typeof dataInput === 'string' && typeof ruleValue === 'string' && dataInput.includes(ruleValue)
  );
};

initializeCustomOperators();

export function evaluateRules(
  rule: RulesLogic<AdditionalOperation>,
  data: unknown,
  safe = true
): { result: boolean; error: string | undefined } {
  try {
    return { result: jsonLogic.apply(rule, data), error: undefined };
  } catch (error) {
    if (safe) {
      return { result: false, error };
    }

    throw new Error(`Failed to evaluate rule: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function isValidRule(rule: RulesLogic<AdditionalOperation>): boolean {
  try {
    return jsonLogic.is_logic(rule);
  } catch {
    return false;
  }
}

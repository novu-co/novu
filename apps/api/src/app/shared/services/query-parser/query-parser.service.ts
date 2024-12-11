import jsonLogic, { AdditionalOperation, RulesLogic } from 'json-logic-js';

const initializeCustomOperators = (): void => {
  jsonLogic.add_operation('=', (dataInput: unknown, ruleValue: unknown): boolean => {
    const result = jsonLogic.apply({ '==': [dataInput, ruleValue] }, {});

    return typeof result === 'boolean' ? result : false;
  });

  jsonLogic.add_operation(
    'beginsWith',
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

  jsonLogic.add_operation(
    'doesNotContain',
    (dataInput: unknown, ruleValue: unknown): boolean =>
      typeof dataInput === 'string' && typeof ruleValue === 'string' && !dataInput.includes(ruleValue)
  );

  jsonLogic.add_operation(
    'doesNotBeginWith',
    (dataInput: unknown, ruleValue: unknown): boolean =>
      typeof dataInput === 'string' && typeof ruleValue === 'string' && !dataInput.startsWith(ruleValue)
  );

  jsonLogic.add_operation(
    'doesNotEndWith',
    (dataInput: unknown, ruleValue: unknown): boolean =>
      typeof dataInput === 'string' && typeof ruleValue === 'string' && !dataInput.endsWith(ruleValue)
  );

  jsonLogic.add_operation('null', (dataInput: unknown): boolean => dataInput === null);

  jsonLogic.add_operation('notNull', (dataInput: unknown): boolean => dataInput !== null);

  jsonLogic.add_operation(
    'notIn',
    (dataInput: unknown, ruleValue: unknown[]): boolean => Array.isArray(ruleValue) && !ruleValue.includes(dataInput)
  );

  jsonLogic.add_operation('between', (dataInput: unknown, ruleValue: unknown[]): boolean => {
    if (!Array.isArray(ruleValue) || ruleValue.length !== 2) return false;
    if (typeof dataInput !== 'number') return false;
    const [min, max] = ruleValue;
    if (typeof min !== 'number' || typeof max !== 'number') return false;

    return dataInput >= min && dataInput <= max;
  });

  jsonLogic.add_operation('notBetween', (dataInput: unknown, ruleValue: unknown[]): boolean => {
    if (!Array.isArray(ruleValue) || ruleValue.length !== 2) return false;
    if (typeof dataInput !== 'number') return false;
    const [min, max] = ruleValue;
    if (typeof min !== 'number' || typeof max !== 'number') return false;

    return dataInput < min || dataInput > max;
  });
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

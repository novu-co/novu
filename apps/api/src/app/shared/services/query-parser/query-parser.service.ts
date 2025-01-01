import jsonLogic, { AdditionalOperation, RulesLogic } from 'json-logic-js';

type RangeValidation =
  | {
      isValid: true;
      min: number;
      max: number;
    }
  | {
      isValid: false;
    };

type StringValidation =
  | {
      isValid: true;
      input: string;
      value: string;
    }
  | {
      isValid: false;
    };

function validateStringInput(dataInput: unknown, ruleValue: unknown): StringValidation {
  if (typeof dataInput !== 'string' || typeof ruleValue !== 'string') {
    return { isValid: false };
  }

  return { isValid: true, input: dataInput, value: ruleValue };
}

function validateRangeInput(dataInput: unknown, ruleValue: unknown): RangeValidation {
  if (!Array.isArray(ruleValue) || ruleValue.length !== 2) {
    return { isValid: false };
  }

  if (typeof dataInput !== 'number') {
    return { isValid: false };
  }

  const [min, max] = ruleValue;
  const valid = typeof min === 'number' && typeof max === 'number';

  return { isValid: valid, min, max };
}

function createStringOperator(evaluator: (input: string, value: string) => boolean) {
  return (dataInput: unknown, ruleValue: unknown): boolean => {
    const validation = validateStringInput(dataInput, ruleValue);
    if (!validation.isValid) return false;

    return evaluator(validation.input, validation.value);
  };
}

const initializeCustomOperators = (): void => {
  jsonLogic.add_operation('=', (dataInput: unknown, ruleValue: unknown): boolean => {
    const result = jsonLogic.apply({ '==': [dataInput, ruleValue] }, {});

    return typeof result === 'boolean' ? result : false;
  });

  jsonLogic.add_operation(
    'beginsWith',
    createStringOperator((input, value) => input.startsWith(value))
  );

  jsonLogic.add_operation(
    'endsWith',
    createStringOperator((input, value) => input.endsWith(value))
  );

  jsonLogic.add_operation(
    'contains',
    createStringOperator((input, value) => input.includes(value))
  );

  jsonLogic.add_operation(
    'doesNotContain',
    createStringOperator((input, value) => !input.includes(value))
  );

  jsonLogic.add_operation(
    'doesNotBeginWith',
    createStringOperator((input, value) => !input.startsWith(value))
  );

  jsonLogic.add_operation(
    'doesNotEndWith',
    createStringOperator((input, value) => !input.endsWith(value))
  );

  jsonLogic.add_operation('null', (dataInput: unknown): boolean => dataInput === null);

  jsonLogic.add_operation('notNull', (dataInput: unknown): boolean => dataInput !== null);

  jsonLogic.add_operation(
    'notIn',
    (dataInput: unknown, ruleValue: unknown[]): boolean => Array.isArray(ruleValue) && !ruleValue.includes(dataInput)
  );

  jsonLogic.add_operation('between', (dataInput, ruleValue) => {
    const validation = validateRangeInput(dataInput, ruleValue);

    if (!validation.isValid) {
      return false;
    }

    return dataInput >= validation.min && dataInput <= validation.max;
  });

  jsonLogic.add_operation('notBetween', (dataInput, ruleValue) => {
    const validation = validateRangeInput(dataInput, ruleValue);

    if (!validation.isValid) {
      return false;
    }

    return dataInput < validation.min || dataInput > validation.max;
  });
};

initializeCustomOperators();

export function evaluateRules(
  rule: RulesLogic<AdditionalOperation>,
  data: unknown,
  safe = false
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

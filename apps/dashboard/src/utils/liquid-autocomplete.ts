import { TRANSFORMERS } from '@/components/primitives/field-editor/variable-popover/constants';
import { LiquidVariable } from '@/utils/parseStepVariablesToLiquidVariables';
import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';

/**
 * Liquid variable autocomplete for the following patterns:
 *
 * 1. Payload Variables:
 *    Valid:
 *    - payload.
 *    - payload.user
 *    - payload.anyNewField (allows any new field)
 *    - payload.deeply.nested.field
 *    Invalid:
 *    - pay (shows suggestions but won't validate)
 *    - payload (shows suggestions but won't validate)
 *
 * 2. Subscriber Variables:
 *    Valid:
 *    - subscriber.data.
 *    - subscriber.data.email
 *    - subscriber.data.firstName
 *    - subscriber.data.anyNewField (allows any new field)
 *    - subscriber.data.custom.nested.field
 *    - subscriber (shows suggestions but won't validate)
 *    - subscriber.email
 *    - subscriber.firstName
 *    Invalid:
 *    - subscriber.someOtherField (must use valid subscriber field)
 *
 * 3. Step Variables:
 *    Valid:
 *    - steps.
 *    - steps.digest-step (must be existing step ID)
 *    - steps.digest-step.events
 *    - steps.digest-step.events[0]
 *    - steps.digest-step.events[0].id
 *    - steps.digest-step.events[0].payload
 *    - steps.digest-step.events[0].payload.summary
 *    - steps.digest-step.events[0].payload.anyNewField (allows any new field after payload)
 *    - steps.digest-step.events[0].payload.deeply.nested.field
 *    Invalid:
 *    - steps.invalid-step (must use existing step ID)
 *    - steps.digest-step.payload (must use events[n].payload pattern)
 *    - steps.digest-step.events.payload (must use events[n] pattern)
 *    - steps.digest-step.invalidProp (only events[] is allowed)
 *
 * Autocomplete Behavior:
 * 1. Shows suggestions when typing partial prefixes:
 *    - 'su' -> shows subscriber.data.* variables
 *    - 'pay' -> shows payload.* variables
 *    - 'ste' -> shows steps.* variables
 *
 * 2. Shows suggestions with closing braces:
 *    - '{{su}}' -> shows subscriber.data.* variables
 *    - '{{payload.}}' -> shows payload.* variables
 *
 * 3. Allows new variables after valid prefixes:
 *    - subscriber.data.* (any new field)
 *    - payload.* (any new field)
 *    - steps.{valid-step}.events[n].payload.* (any new field)
 */

interface CompletionOption {
  label: string;
  type: string;
  boost?: number;
}

interface PathConfig {
  prefix: string;
  getPath: (text: string) => string | null;
  getPrefix: (text: string) => string;
}

/**
 * Defines the valid path patterns and how to extract/validate them
 * Each path config handles a specific variable pattern (payload/subscriber/steps)
 */
const VARIABLE_PATHS: PathConfig[] = [
  {
    prefix: 'payload.',
    getPath: (text) => text.slice(8), // Example: "payload.name" -> "name"
    getPrefix: () => 'payload.',
  },
  {
    prefix: 'subscriber.data.',
    getPath: (text) => text.slice(16), // Example: "subscriber.data.email" -> "email"
    getPrefix: () => 'subscriber.data.',
  },
  {
    prefix: 'steps.',
    getPath: (text) => {
      // Extracts the path after payload in step variables
      // Examples:
      // "steps.digest.events[0].payload.name" -> "name"
      // "steps.digest.events[0].payload.user.firstName" -> "user.firstName"
      // "steps.digest.events[0].payload" -> null (no path after payload)
      // "steps.digest" -> null (invalid format)
      const fullMatch = text.match(/^steps\.[^.]+\.events\[\d+\]\.payload\.(.*?)$/);
      if (fullMatch) return fullMatch[1];

      if (text === 'steps.' || text.startsWith('steps.')) return '';
      return null;
    },
    getPrefix: (text) => {
      // Gets everything up to and including .payload.
      // Examples:
      // "steps.digest.events[0].payload.name" -> "steps.digest.events[0].payload."
      // "steps.digest.events[0]" -> "steps.digest.events[0]"
      const match = text.match(/^(steps\.[^.]+\.events\[\d+\]\.payload)\./);
      if (match) return `${match[1]}.`;
      return text;
    },
  },
];

function isInsideLiquidBlock(beforeCursor: string): boolean {
  const lastOpenBrace = beforeCursor.lastIndexOf('{{');
  return lastOpenBrace !== -1;
}

function getContentAfterPipe(content: string): string | null {
  const pipeIndex = content.lastIndexOf('|');
  if (pipeIndex === -1) return null;
  return content.slice(pipeIndex + 1).trimStart();
}

function createCompletionOption(label: string, type: string, boost?: number): CompletionOption {
  return { label, type, ...(boost && { boost }) };
}

function getFilterCompletions(afterPipe: string): CompletionOption[] {
  return TRANSFORMERS.filter((f) => f.label.toLowerCase().startsWith(afterPipe.toLowerCase())).map((f) =>
    createCompletionOption(f.value, 'function')
  );
}

/**
 * Gets matching variables based on what the user has typed.
 * Different matching strategies based on the input:
 *
 * 1. Ends with dot: Show all variables starting with everything before the dot
 *    Example: "payload." -> shows all payload.* variables
 *
 * 2. Valid prefix: Show all variables for that prefix
 *    Example: "payload" -> shows all payload.* variables
 *    Example: "steps.digest" -> shows all variables for that step
 *
 * 3. Other text: Show any variables containing the text
 *    Example: "user" -> shows payload.user, subscriber.data.username, etc.
 */
function getMatchingVariables(searchText: string, variables: LiquidVariable[]): LiquidVariable[] {
  // Handle empty search
  if (!searchText) {
    return variables;
  }

  const searchLower = searchText.toLowerCase();

  // Handle root prefixes and their partials
  const rootPrefixes = {
    subscriber: 'subscriber.',
    payload: 'payload.',
    steps: 'steps.',
  };

  // Check for partial matches of root prefixes
  for (const [root, prefix] of Object.entries(rootPrefixes)) {
    // If typing part of a root prefix (e.g., 'pay', 'sub', 'ste')
    if (searchLower.startsWith(root) || root.startsWith(searchLower)) {
      const matches = variables.filter((v) => v.label.startsWith(prefix));

      // Special handling for subscriber fields
      if (prefix === 'subscriber.') {
        const parts = searchText.split('.');
        if (parts.length === 2 && parts[0] === 'subscriber') {
          // Only allow subscriber fields that exist in the variables
          if (!matches.some((v) => v.label === searchText)) {
            return [];
          }
        }
      }

      // For subscriber.data., payload., and step payload paths allow new paths
      if (
        searchText.startsWith('subscriber.data.') ||
        searchText.startsWith('payload.') ||
        /^steps\.[^.]+\.events\[\d+\]\.payload\./.test(searchText)
      ) {
        if (!matches.some((v) => v.label === searchText)) {
          matches.push({ label: searchText, type: 'variable' } as LiquidVariable);
        }
      }

      return matches;
    }
  }

  // Handle dot endings
  if (searchText.endsWith('.')) {
    const prefix = searchText.slice(0, -1);
    return variables.filter((v) => v.label.startsWith(prefix));
  }

  // Validate step ID exists in variables
  if (searchText.startsWith('steps.')) {
    const stepMatch = searchText.match(/^steps\.([^.]+)/);
    if (stepMatch) {
      const stepId = stepMatch[1];
      const stepExists = variables.some((v) => v.label.startsWith(`steps.${stepId}.`));
      if (!stepExists) {
        return [];
      }
    }
  }

  // Validate events array format
  if (searchText.includes('.events')) {
    const eventsFormatValid = /^steps\.[^.]+\.events\[\d+\]/.test(searchText);
    if (!eventsFormatValid) {
      return [];
    }
  }

  // Default case: show any variables containing the search text
  const matches = variables.filter((v) => v.label.toLowerCase().includes(searchLower));

  return matches;
}

// Main completion function
export const completions =
  (variables: LiquidVariable[]) =>
  (context: CompletionContext): CompletionResult | null => {
    const { state, pos } = context;
    const beforeCursor = state.sliceDoc(0, pos);

    // Only proceed if we're inside or just after {{
    const lastOpenBrace = beforeCursor.lastIndexOf('{{');
    if (lastOpenBrace === -1) return null;

    // Get the content between {{ and cursor
    const insideBraces = state.sliceDoc(lastOpenBrace + 2, pos);

    // Get clean search text without braces and trim
    const searchText = insideBraces.replace(/}+$/, '').trim();

    // Handle pipe filters
    const afterPipe = getContentAfterPipe(searchText);
    if (afterPipe !== null) {
      return {
        from: pos - afterPipe.length,
        to: pos,
        options: getFilterCompletions(afterPipe),
      };
    }

    // Get matching variables
    const matchingVariables = getMatchingVariables(searchText, variables);

    // If we have matches, show them
    if (matchingVariables.length > 0) {
      return {
        from: lastOpenBrace + 2,
        to: pos,
        options: matchingVariables.map((v) => createCompletionOption(v.label, 'variable')),
      };
    }

    // If no matches but we're in a valid context, show all variables
    if (isInsideLiquidBlock(beforeCursor)) {
      return {
        from: lastOpenBrace + 2,
        to: pos,
        options: variables.map((v) => createCompletionOption(v.label, 'variable')),
      };
    }

    return null;
  };

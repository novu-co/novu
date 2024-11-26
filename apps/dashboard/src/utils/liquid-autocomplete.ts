import { LiquidVariable } from '@/utils/parseStepVariablesToLiquidVariables';
import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';

const filters = [
  // Math filters
  { label: 'plus', type: 'function' },
  { label: 'minus', type: 'function' },
  { label: 'modulo', type: 'function' },
  { label: 'times', type: 'function' },
  { label: 'floor', type: 'function' },
  { label: 'ceil', type: 'function' },
  { label: 'round', type: 'function' },
  { label: 'divided_by', type: 'function' },
  { label: 'abs', type: 'function' },
  { label: 'at_least', type: 'function' },
  { label: 'at_most', type: 'function' },

  // String filters
  { label: 'append', type: 'function' },
  { label: 'prepend', type: 'function' },
  { label: 'capitalize', type: 'function' },
  { label: 'upcase', type: 'function' },
  { label: 'downcase', type: 'function' },
  { label: 'strip', type: 'function' },
  { label: 'lstrip', type: 'function' },
  { label: 'rstrip', type: 'function' },
  { label: 'strip_newlines', type: 'function' },
  { label: 'split', type: 'function' },
  { label: 'replace', type: 'function' },
  { label: 'replace_first', type: 'function' },
  { label: 'replace_last', type: 'function' },
  { label: 'remove', type: 'function' },
  { label: 'remove_first', type: 'function' },
  { label: 'truncate', type: 'function' },
  { label: 'truncatewords', type: 'function' },
  { label: 'normalize_whitespace', type: 'function' },
  { label: 'number_of_words', type: 'function' },
  { label: 'array_to_sentence_string', type: 'function' },

  // HTML/URI filters
  { label: 'escape', type: 'function' },
  { label: 'escape_once', type: 'function' },
  { label: 'url_encode', type: 'function' },
  { label: 'url_decode', type: 'function' },
  { label: 'strip_html', type: 'function' },
  { label: 'newline_to_br', type: 'function' },
  { label: 'xml_escape', type: 'function' },
  { label: 'cgi_escape', type: 'function' },
  { label: 'uri_escape', type: 'function' },
  { label: 'slugify', type: 'function' },

  // Array filters
  { label: 'slice', type: 'function' },
  { label: 'map', type: 'function' },
  { label: 'sort', type: 'function' },
  { label: 'sort_natural', type: 'function' },
  { label: 'uniq', type: 'function' },
  { label: 'where', type: 'function' },
  { label: 'where_exp', type: 'function' },
  { label: 'group_by', type: 'function' },
  { label: 'group_by_exp', type: 'function' },
  { label: 'find', type: 'function' },
  { label: 'find_exp', type: 'function' },
  { label: 'first', type: 'function' },
  { label: 'last', type: 'function' },
  { label: 'join', type: 'function' },
  { label: 'reverse', type: 'function' },
  { label: 'concat', type: 'function' },
  { label: 'compact', type: 'function' },
  { label: 'size', type: 'function' },
  { label: 'push', type: 'function' },
  { label: 'pop', type: 'function' },
  { label: 'shift', type: 'function' },
  { label: 'unshift', type: 'function' },

  // Date filters
  { label: 'date', type: 'function' },
  { label: 'date_to_xmlschema', type: 'function' },
  { label: 'date_to_rfc822', type: 'function' },
  { label: 'date_to_string', type: 'function' },
  { label: 'date_to_long_string', type: 'function' },

  // Misc filters
  { label: 'default', type: 'function' },
  { label: 'json', type: 'function' },
  { label: 'jsonify', type: 'function' },
  { label: 'inspect', type: 'function' },
  { label: 'raw', type: 'function' },
  { label: 'to_integer', type: 'function' },
];

export const completions =
  (variables: LiquidVariable[]) =>
  (context: CompletionContext): CompletionResult | null => {
    const { state, pos } = context;

    const beforeCursor = state.sliceDoc(0, pos);

    // Determine whether we're inside a {{ ... }} block
    const lastOpenBrace = beforeCursor.lastIndexOf('{{');
    const lastCloseBrace = beforeCursor.lastIndexOf('}}');

    if (lastOpenBrace === -1 || lastOpenBrace < lastCloseBrace) {
      // Not inside a {{ ... }} block
      return null;
    }

    // Get the content inside the braces up to the cursor position
    const insideBraces = state.sliceDoc(lastOpenBrace + 2, pos);

    // Detect the position of the last `|` relative to the cursor
    const pipeIndex = insideBraces.lastIndexOf('|');

    if (pipeIndex !== -1 && pos > lastOpenBrace + 2 + pipeIndex) {
      // Cursor is after the pipe (`|`)
      const afterPipe = insideBraces.slice(pipeIndex + 1).trimStart();

      // Filter the list of filters based on the user's input
      const matchingFilters = filters.filter((f) => f.label.toLowerCase().startsWith(afterPipe.toLowerCase()));

      // Suggest filters if content after the pipe is incomplete
      if (/^[\w.]*$/.test(afterPipe)) {
        return {
          from: pos - afterPipe.length, // Start from where the filter name starts
          to: pos, // Extend to the current cursor position
          options: matchingFilters.map((f) => ({
            label: f.label,
            type: 'function',
          })),
        };
      }
    }

    // If no pipe (|) is present, suggest variables
    const word = context.matchBefore(/[\w.]+/); // Match variable names only
    if (!word && insideBraces.trim() === '') {
      return {
        from: pos,
        options: variables.map((v) => ({
          label: v.label,
          type: 'variable',
        })),
      };
    }

    // Suggest variables if typing a valid variable name
    if (word) {
      return {
        from: word.from,
        to: word.to ?? pos,
        options: variables.map((v) => ({
          label: v.label,
          type: 'variable',
        })),
      };
    }

    return null; // No suggestions in other cases
  };

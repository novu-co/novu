// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ValidatedPlaceholderAggregation {
  problematicPlaceholders: Record<string, string>; // key is the placeholder, value is the error message
  validNestedForPlaceholders: Record<string, Record<string, string>>;
  validRegularPlaceholdersToDefaultValue: Record<string, string>;
}

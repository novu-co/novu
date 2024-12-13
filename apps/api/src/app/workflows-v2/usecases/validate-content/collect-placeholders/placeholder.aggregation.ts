// eslint-disable-next-line @typescript-eslint/naming-convention
export interface PlaceholderAggregation {
  nestedForPlaceholders: Record<string, Record<string, string>>;
  regularPlaceholdersToDefaultValue: Record<string, string>;
}

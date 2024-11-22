import { type JSONSchemaDto } from '@novu/shared';
import { type PlaceholderAggregation } from '../collect-placeholders/placeholder.aggregation';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ValidatePlaceholderCommand {
  controlValueToPlaceholders: Record<string, PlaceholderAggregation>;
  variableSchema: JSONSchemaDto;
}

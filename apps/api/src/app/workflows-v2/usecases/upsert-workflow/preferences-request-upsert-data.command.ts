import { ChannelTypeEnum } from '@novu/shared';
import { IsBoolean, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChannelPreferenceData {
  @IsBoolean()
  enabled: boolean;
}

export class WorkflowPreferenceData {
  @IsBoolean()
  enabled: boolean;

  @IsBoolean()
  readOnly: boolean;
}

export class WorkflowPreferencesUpsertData {
  @ValidateNested()
  all: WorkflowPreferenceData;

  @IsObject()
  @ValidateNested({ each: true })
  channels: Record<ChannelTypeEnum, ChannelPreferenceData>;
}

export class PreferencesRequestUpsertDataCommand {
  @IsOptional()
  @ValidateNested()
  @Type(() => WorkflowPreferencesUpsertData)
  user: WorkflowPreferencesUpsertData | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkflowPreferencesUpsertData)
  workflow?: WorkflowPreferencesUpsertData | null;
}

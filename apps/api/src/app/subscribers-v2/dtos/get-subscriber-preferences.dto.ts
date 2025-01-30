import { ApiProperty } from '@nestjs/swagger';
import { ChannelTypeEnum, IPreferenceChannels, IPreferenceOverride, PreferenceOverrideSourceEnum } from '@novu/shared';

export class PreferenceChannelsDto implements IPreferenceChannels {
  @ApiProperty({ description: 'Email channel preference' })
  email?: boolean;

  @ApiProperty({ description: 'SMS channel preference' })
  sms?: boolean;

  @ApiProperty({ description: 'In-app channel preference' })
  in_app?: boolean;

  @ApiProperty({ description: 'Push channel preference' })
  push?: boolean;

  @ApiProperty({ description: 'Chat channel preference' })
  chat?: boolean;
}

export class PreferenceOverride implements IPreferenceOverride {
  @ApiProperty({
    enum: ChannelTypeEnum,
    enumName: 'ChannelTypeEnum',
    description: 'The channel type for the override',
  })
  channel: ChannelTypeEnum;

  @ApiProperty({
    enum: PreferenceOverrideSourceEnum,
    enumName: 'PreferenceOverrideSourceEnum',
    description: 'The source of the override',
  })
  source: PreferenceOverrideSourceEnum;
}

export class WorkflowInfoDto {
  @ApiProperty({ description: 'Unique identifier of the workflow' })
  identifier: string;

  @ApiProperty({ description: 'Display name of the workflow' })
  name: string;
}

export class GlobalPreferenceDto {
  @ApiProperty({ description: 'Whether notifications are enabled globally' })
  enabled: boolean;

  @ApiProperty({ description: 'Channel-specific preference settings', type: PreferenceChannelsDto })
  channels: PreferenceChannelsDto;
}

export class WorkflowPreferenceDto {
  @ApiProperty({ description: 'Whether notifications are enabled for this workflow' })
  enabled: boolean;

  @ApiProperty({ description: 'Channel-specific preference settings for this workflow', type: PreferenceChannelsDto })
  channels: PreferenceChannelsDto;

  @ApiProperty({ description: 'List of preference overrides', type: [PreferenceOverride] })
  overrides: PreferenceOverride[];

  @ApiProperty({ description: 'Workflow information', type: WorkflowInfoDto })
  workflow: WorkflowInfoDto;
}

export class GetSubscriberPreferencesDto {
  @ApiProperty({ description: 'Global preference settings', type: GlobalPreferenceDto })
  global: GlobalPreferenceDto;

  @ApiProperty({ description: 'Workflow-specific preference settings', type: [WorkflowPreferenceDto] })
  workflows: WorkflowPreferenceDto[];
}

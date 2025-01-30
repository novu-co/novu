import { ApiProperty } from '@nestjs/swagger';
import { IPreferenceChannels, IPreferenceOverride } from '@novu/shared';

class WorkflowInfoDto {
  @ApiProperty({ description: 'Unique identifier of the workflow' })
  identifier: string;

  @ApiProperty({ description: 'Display name of the workflow' })
  name: string;
}

class GlobalPreferenceDto {
  @ApiProperty({ description: 'Whether notifications are enabled globally' })
  enabled: boolean;

  @ApiProperty({ description: 'Channel-specific preference settings' })
  channels: IPreferenceChannels;
}

class WorkflowPreferenceDto {
  @ApiProperty({ description: 'Whether notifications are enabled for this workflow' })
  enabled: boolean;

  @ApiProperty({ description: 'Channel-specific preference settings for this workflow' })
  channels: IPreferenceChannels;

  @ApiProperty({ description: 'List of preference overrides', isArray: true })
  overrides: IPreferenceOverride[];

  @ApiProperty({ description: 'Workflow information' })
  workflow: WorkflowInfoDto;
}

export class GetSubscriberPreferencesResponseDto {
  @ApiProperty({ description: 'Global preference settings', type: GlobalPreferenceDto })
  global: GlobalPreferenceDto;

  @ApiProperty({ description: 'Workflow-specific preference settings', type: [WorkflowPreferenceDto] })
  workflows: WorkflowPreferenceDto[];
}

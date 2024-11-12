import { Injectable } from '@nestjs/common';
import { ContentIssue, JSONSchemaDto, StepContentIssueEnum } from '@novu/shared';
import _ = require('lodash');
import { ExtractDefaultsUsecase } from '../get-default-values-from-schema/extract-defaults.usecase';
import { BuildDefaultControlValuesCommand } from './build-default-control-values.command';
import { findMissingKeys } from '../../util/utils';
import { capitalize } from '../../../shared/services/helper/helper.service';

@Injectable()
export class ValidateControlValuesAndConstructPassableStructureUsecase {
  constructor(private extractDefaultsUseCase: ExtractDefaultsUsecase) {}

  execute(command: BuildDefaultControlValuesCommand): {
    augmentedControlValues: Record<string, unknown>;
    issuesMissingValues: Record<string, ContentIssue[]>;
  } {
    const defaultValues = this.extractDefaultsUseCase.execute({
      jsonSchemaDto: command.controlSchema.schema as JSONSchemaDto,
    });

    return {
      augmentedControlValues: _.merge(defaultValues, command.controlValues),
      issuesMissingValues: this.buildMissingControlValuesIssuesList(defaultValues, command.controlValues),
    };
  }

  private buildMissingControlValuesIssuesList(defaultValues: Record<string, any>, controlValues: Record<string, any>) {
    const missingRequiredControlValues = findMissingKeys(defaultValues, controlValues);

    return this.buildContentIssues(missingRequiredControlValues);
  }

  private buildContentIssues(keys: string[]): Record<string, ContentIssue[]> {
    const record: Record<string, ContentIssue[]> = {};

    keys.forEach((key) => {
      record[key] = [
        {
          issueType: StepContentIssueEnum.MISSING_VALUE,
          message: `${capitalize(key)} is missing`, // Custom message for the issue
        },
      ];
    });

    return record;
  }
}

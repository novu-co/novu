import { BaseCommand } from '@novu/application-generic';

export class BuildPayloadNestedStructureCommand extends BaseCommand {
  placeholdersDotNotation: string[];
}

export class BuildPayloadNestedStructureUsecase {
  public execute(command: BuildPayloadNestedStructureCommand): Record<string, any> {
    const defaultPayload: Record<string, any> = {};

    const setNestedValue = (obj: Record<string, any>, path: string, value: any) => {
      const keys = path.split('.');
      let current = obj;

      keys.forEach((key, index) => {
        if (!current.hasOwnProperty(key)) {
          current[key] = index === keys.length - 1 ? value : {};
        }
        current = current[key];
      });
    };

    for (const placeholderWithDotNotation of command.placeholdersDotNotation) {
      setNestedValue(defaultPayload, placeholderWithDotNotation, `{{${placeholderWithDotNotation}}}`);
    }

    return defaultPayload;
  }
}

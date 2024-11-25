import { RegistryWidgetsType, UiSchema } from '@rjsf/utils';
import { SelectWidget } from './select-widget';
import { SwitchWidget } from './switch-widget';
import { TextWidget } from './text-widget';

export const JSON_SCHEMA_FORM_ID_DELIMITER = '~~~';

export const UI_SCHEMA: UiSchema = {
  'ui:globalOptions': { addable: true, copyable: false, label: true, orderable: true },
  'ui:options': {
    hideError: true,
    submitButtonOptions: {
      norender: true,
    },
  },
};

export const WIDGETS: RegistryWidgetsType = {
  TextWidget: TextWidget,
  URLWidget: TextWidget,
  EmailWidget: TextWidget,
  CheckboxWidget: SwitchWidget,
  SelectWidget: SelectWidget,
};

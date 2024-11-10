import Form, { FormProps } from '@rjsf/core';
import { RegistryWidgetsType, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { TextWidget } from './text-widget';
import { SwitchWidget } from './switch-widget';
import { SelectWidget } from './select-widget';

export const JSON_SCHEMA_FORM_ID_DELIMITER = '~~~';

const UI_SCHEMA: UiSchema = {
  'ui:globalOptions': { addable: true, copyable: false, label: true, orderable: true },
  'ui:options': {
    hideError: true,
    submitButtonOptions: {
      norender: true,
    },
  },
};

const WIDGETS: RegistryWidgetsType = {
  TextWidget: TextWidget,
  URLWidget: TextWidget,
  EmailWidget: TextWidget,
  CheckboxWidget: SwitchWidget,
  SelectWidget: SelectWidget,
};

type JsonFormProps<TFormData = unknown> = Pick<
  FormProps<TFormData>,
  'onChange' | 'onSubmit' | 'onBlur' | 'schema' | 'formData' | 'tagName' | 'onError'
> & {
  variables?: string[];
};

export function JsonForm(props: JsonFormProps) {
  return (
    <Form
      tagName={'fieldset'}
      className="[&_.control-label]:hidden [&_.field-decription]:hidden [&_.panel.panel-danger.errors]:hidden"
      uiSchema={UI_SCHEMA}
      widgets={WIDGETS}
      validator={validator}
      autoComplete={'false'}
      /**
       * TODO: Add support for variables
       */
      formContext={{ variables: [] }}
      idSeparator={JSON_SCHEMA_FORM_ID_DELIMITER}
      {...props}
      /**
       * TODO: Add support for Arrays and Nested Objects
       */
    />
  );
}

import Form, { FormProps } from '@rjsf/core';
import {
  ArrayFieldTemplateItemType,
  ArrayFieldTitleProps,
  IconButtonProps,
  RegistryWidgetsType,
  UiSchema,
} from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { RiAddLine, RiSubtractFill } from 'react-icons/ri';
import { cn } from '@/utils/ui';
import { Button } from '@/components/primitives/button';
import { ArrayFieldTemplate } from './array-field-template';
import { ObjectFieldTemplate } from './object-field-template';
import { SelectWidget } from './select-widget';
import { SwitchWidget } from './switch-widget';
import { TextWidget } from './text-widget';

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
      className="*:flex *:flex-col *:gap-3 [&_.control-label]:hidden [&_.field-decription]:hidden [&_.panel.panel-danger.errors]:hidden"
      uiSchema={UI_SCHEMA}
      widgets={WIDGETS}
      validator={validator}
      autoComplete="false"
      idSeparator={JSON_SCHEMA_FORM_ID_DELIMITER}
      templates={{
        ButtonTemplates: {
          AddButton,
          RemoveButton,
        },
        ArrayFieldTemplate,
        ArrayFieldItemTemplate,
        ArrayFieldTitleTemplate,
        ObjectFieldTemplate,
      }}
      {...props}
    />
  );
}

const AddButton = (props: IconButtonProps) => {
  return (
    <Button variant="ghost" className="size-4 rounded-sm p-0.5" type="button" {...props} title="Add item">
      <RiAddLine className="text-foreground-600 size-3" />
    </Button>
  );
};

const RemoveButton = (props: IconButtonProps) => {
  return (
    <Button variant="ghost" className="size-4 rounded-sm p-0.5" type="button" {...props} title="Remove item">
      <RiSubtractFill className="text-foreground-600 size-3" />
    </Button>
  );
};

const ArrayFieldItemTemplate = (props: ArrayFieldTemplateItemType) => {
  const isChildObjectType = props.schema.type === 'object';

  return (
    <div className="relative flex items-center gap-2 *:flex-1">
      {props.children}
      <div
        className={cn(
          'bg-background absolute right-0 top-0 z-10 mt-2 flex w-5 -translate-y-1/2 items-center justify-end',
          { 'right-4 justify-start': isChildObjectType }
        )}
      >
        {props.hasRemove && (
          <RemoveButton
            disabled={props.disabled || props.readonly}
            onClick={(e) => props.onDropIndexClick(props.index)(e)}
            registry={props.registry}
          />
        )}
      </div>
    </div>
  );
};

const ArrayFieldTitleTemplate = (props: ArrayFieldTitleProps) => {
  return <legend className="text-foreground-400 px-1 text-xs">{props.title}</legend>;
};

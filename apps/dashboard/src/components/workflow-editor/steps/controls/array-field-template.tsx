import {
  ArrayFieldTemplateItemType,
  ArrayFieldTemplateProps,
  ArrayFieldTitleProps,
  getTemplate,
  getUiOptions,
} from '@rjsf/utils';

export function ArrayFieldTemplate(props: ArrayFieldTemplateProps) {
  const { canAdd, disabled, idSchema, uiSchema, items, onAddClick, readonly, registry, required, title, schema } =
    props;
  const {
    ButtonTemplates: { AddButton },
  } = registry.templates;
  const uiOptions = getUiOptions(uiSchema);

  const ArrayFieldTitleTemplate = getTemplate('ArrayFieldTitleTemplate', registry, uiOptions);

  const ArrayFieldItemTemplate = getTemplate('ArrayFieldItemTemplate', registry, uiOptions);

  return <div>ArrayFieldTemplate</div>;
}

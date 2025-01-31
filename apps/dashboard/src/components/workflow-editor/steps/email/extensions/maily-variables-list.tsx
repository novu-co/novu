import React, { useMemo, useImperativeHandle } from 'react';
import { VariableListProps } from '@maily-to/core/extensions';

import { VariablesList } from '@/components/variable/variables-list';
import { useListKeyboardNavigation } from '@/components/variable/use-list-keyboard-navigation';

export const MailyVariablesList = React.forwardRef(({ items, command }: VariableListProps, ref) => {
  const options = useMemo(() => items.map((item) => ({ label: item.name, value: item.name })), [items]);
  const { variablesListRef, hoveredOptionIndex, next, prev, reset } = useListKeyboardNavigation({
    maxIndex: options.length - 1,
  });

  const onSelect = (value: string) => {
    const item = items.find((item) => item.name === value);
    if (!item) {
      return;
    }

    command({
      id: item.name,
      required: item.required ?? true,
    });
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        prev();
        return true;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        next();
        return true;
      }

      if (event.key === 'Enter') {
        onSelect(options[hoveredOptionIndex].value ?? '');
        reset();
        return true;
      }

      return false;
    },
  }));

  return (
    <VariablesList
      ref={variablesListRef}
      className="rounded-md border shadow-md outline-none"
      hoveredOptionIndex={hoveredOptionIndex}
      options={options}
      onSelect={onSelect}
      title="Variables"
    />
  );
});

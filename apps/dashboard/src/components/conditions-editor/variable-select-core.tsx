import { useRef, useState, useMemo, forwardRef } from 'react';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/primitives/popover';
import { VariablesList } from './variable-list';
import { type VariableSelectInputProps } from './variable-select-input';
import { InputPure, InputRoot, InputWrapper } from '@/components/primitives/input';
import { AUTOCOMPLETE_PASSWORD_MANAGERS_OFF } from '@/utils/constants';

interface VariableSelectCoreProps {
  disabled?: boolean;
  value?: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  leftIcon?: React.ReactNode;
  title?: string;
  placeholder?: string;
  InputComponent?: React.ForwardRefExoticComponent<VariableSelectInputProps & React.RefAttributes<HTMLInputElement>>;
}

const WrappedVariableSelectInput = forwardRef<HTMLInputElement, VariableSelectInputProps>(
  (
    { inputValue, onOpen, onInputChange, onFocusCapture, onBlurCapture, placeholder, disabled, onKeyDown, leftIcon },
    ref
  ) => {
    return (
      <InputRoot size="2xs" className="w-40">
        <InputWrapper>
          {leftIcon}
          <InputPure
            ref={ref}
            value={inputValue}
            onClick={onOpen}
            onChange={onInputChange}
            onFocusCapture={onFocusCapture}
            onBlurCapture={onBlurCapture}
            placeholder={placeholder}
            disabled={disabled}
            onKeyDown={onKeyDown}
            {...AUTOCOMPLETE_PASSWORD_MANAGERS_OFF}
          />
        </InputWrapper>
      </InputRoot>
    );
  }
);

WrappedVariableSelectInput.displayName = 'WrappedVariableSelectInput';

export function VariableSelectCore({
  disabled,
  value,
  options: optionsProp,
  onChange,
  leftIcon,
  title = 'Variables',
  placeholder = 'Field',
  InputComponent = WrappedVariableSelectInput,
}: VariableSelectCoreProps) {
  const [inputValue, setInputValue] = useState(value ?? '');
  const [filterValue, setFilterValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState(optionsProp);
  const [hoveredOptionIndex, setHoveredOptionIndex] = useState(0);
  const variablesListRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasNoInputOption = useMemo(
    () =>
      inputValue !== '' &&
      !options.find((option) => option.value?.toLocaleLowerCase() === inputValue.toLocaleLowerCase()),
    [inputValue, options]
  );

  const filteredOptions = useMemo(() => {
    if (!filterValue) {
      return options;
    }
    return options.filter((option) => option.value?.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase()));
  }, [options, filterValue]);

  const scrollToOption = (index: number) => {
    if (!variablesListRef.current) return;

    const listElement = variablesListRef.current;
    const optionElement = listElement.children[index] as HTMLLIElement;

    if (optionElement) {
      const containerHeight = listElement.clientHeight;
      const optionTop = optionElement.offsetTop;
      const optionHeight = optionElement.clientHeight;

      if (optionTop < listElement.scrollTop) {
        listElement.scrollTop = optionTop;
      } else if (optionTop + optionHeight > listElement.scrollTop + containerHeight) {
        listElement.scrollTop = optionTop + optionHeight - containerHeight;
      }
    }
  };

  const next = () => {
    if (hoveredOptionIndex === -1) {
      setHoveredOptionIndex(0);
      scrollToOption(0);
    } else {
      setHoveredOptionIndex((oldIndex) => {
        const newIndex = oldIndex === options.length - 1 ? 0 : oldIndex + 1;
        scrollToOption(newIndex);
        return newIndex;
      });
    }
  };

  const prev = () => {
    if (hoveredOptionIndex === -1) {
      setHoveredOptionIndex(options.length - 1);
      scrollToOption(options.length - 1);
    } else {
      setHoveredOptionIndex((oldIndex) => {
        const newIndex = oldIndex === 0 ? options.length - 1 : oldIndex - 1;
        scrollToOption(newIndex);
        return newIndex;
      });
    }
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setIsOpen(true);
    if (e.key === 'ArrowDown') {
      next();
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      prev();
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (hoveredOptionIndex !== -1) {
        e.preventDefault();
        onSelect(filteredOptions[hoveredOptionIndex].value ?? '');
        setHoveredOptionIndex(-1);
      }
    }
  };

  const addOption = () => {
    if (hasNoInputOption) {
      setOptions((oldOptions) => [{ label: inputValue, value: inputValue, name: inputValue }, ...oldOptions]);
    }
  };

  const onSelect = (newValue: string) => {
    console.log('onSelect newValue', newValue);
    setIsOpen(false);
    setFilterValue('');
    setInputValue(newValue);
    onChange(newValue);
  };

  const onOpen = () => {
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const onClose = () => {
    addOption();
    setIsOpen(false);
    setFilterValue('');
    const newInputValue = inputValue !== '' ? inputValue : (value ?? '');
    console.log('onClose newInputValue', newInputValue);
    setInputValue(newInputValue);
    onChange(newInputValue);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trim();
    if (newValue !== inputValue) {
      console.log('onInputChange newValue', newValue);
      setInputValue(newValue);
      setFilterValue(newValue);
    }
  };

  return (
    <Popover open={isOpen}>
      <PopoverAnchor asChild>
        <InputComponent
          ref={inputRef}
          inputValue={inputValue}
          onOpen={onOpen}
          onInputChange={onInputChange}
          onFocusCapture={() => {
            setHoveredOptionIndex(0);
            scrollToOption(0);
          }}
          onBlurCapture={filteredOptions.length === 0 ? onClose : undefined}
          placeholder={placeholder}
          disabled={disabled}
          onKeyDown={onInputKeyDown}
          leftIcon={leftIcon}
        />
      </PopoverAnchor>
      {filteredOptions.length > 0 && (
        <PopoverContent
          className="min-w-[250px] max-w-[250px] p-0"
          side="bottom"
          align="start"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
          }}
          onFocusOutside={onClose}
          onInteractOutside={onClose}
        >
          <VariablesList
            ref={variablesListRef}
            hoveredOptionIndex={hoveredOptionIndex}
            options={filteredOptions}
            onSelect={onSelect}
            selectedValue={value}
            title={title}
          />
        </PopoverContent>
      )}
    </Popover>
  );
}

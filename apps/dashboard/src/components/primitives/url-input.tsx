import { forwardRef } from 'react';
import { RedirectTargetEnum } from '@novu/shared';
import { Input, InputField, InputFieldProps, InputProps } from '@/components/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/primitives/select';
import { Editor } from './editor';

type URLValue = {
  type: string;
  url: string;
};

type URLInputProps = Omit<InputProps, 'value' | 'onChange' | 'size'> & {
  options: string[];
  value: URLValue;
  onChange: (value: URLValue) => void;
  asEditor?: boolean;
} & Pick<InputFieldProps, 'size'>;

export const URLInput = forwardRef<HTMLInputElement, URLInputProps>((props, ref) => {
  const { options, value, onChange, size = 'default', asEditor = false, placeholder, ...rest } = props;

  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="relative flex-grow">
        <InputField className="pr-0" size={size}>
          {asEditor ? (
            <Editor
              size={size}
              placeholder={placeholder}
              value={value.url}
              onChange={(val) => onChange({ ...value, url: val })}
              height={size === 'md' ? '38px' : '30px'}
            />
          ) : (
            <Input
              ref={ref}
              type="text"
              className="min-w-[20ch]"
              value={value.url}
              placeholder={placeholder}
              onChange={(e) => onChange({ ...value, url: e.target.value })}
              {...rest}
            />
          )}
          <Select value={value.type} onValueChange={(val: RedirectTargetEnum) => onChange({ ...value, type: val })}>
            <SelectTrigger className="h-full max-w-24 rounded-l-none border-0 border-l">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InputField>
      </div>
    </div>
  );
});

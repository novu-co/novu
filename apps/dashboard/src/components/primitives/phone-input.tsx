import * as React from 'react';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import * as RPNInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import { cn } from '@/utils/ui';
import { InputPure, InputRoot, InputWrapper } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command';
import { ScrollArea } from './scroll-area';

type PhoneInputProps = Omit<React.ComponentProps<'input'>, 'onChange' | 'value' | 'ref'> &
  Omit<RPNInput.Props<typeof RPNInput.default>, 'onChange'> & {
    onChange?: (value: RPNInput.Value) => void;
  };

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> = React.forwardRef<
  React.ElementRef<typeof RPNInput.default>,
  PhoneInputProps
>(({ className, onChange, ...props }, ref) => {
  return (
    <RPNInput.default
      ref={ref}
      className={cn('flex', className)}
      flagComponent={FlagComponent}
      countrySelectComponent={CountrySelect}
      inputComponent={InputComponent}
      smartCaret={false}
      /**
       * Handles the onChange event.
       *
       * react-phone-number-input might trigger the onChange event as undefined
       * when a valid phone number is not entered. To prevent this,
       * the value is coerced to an empty string.
       *
       * @param {E164Number | undefined} value - The entered value
       */
      onChange={(value) => onChange?.(value || ('' as RPNInput.Value))}
      {...props}
    />
  );
});
PhoneInput.displayName = 'PhoneInput';

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  options: CountryEntry[];
  onChange: (country: RPNInput.Country) => void;
};

const CountrySelect = ({ disabled, value: selectedCountry, options: countryList, onChange }: CountrySelectProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          mode="outline"
          className="flex h-9 gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10"
          disabled={disabled}
        >
          <FlagComponent country={selectedCountry} countryName={selectedCountry} />
          <ChevronsUpDown className={cn('-mr-2 size-4 opacity-50', disabled ? 'hidden' : 'opacity-100')} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <ScrollArea className="h-72">
              <CommandGroup>
                {countryList.map(({ value, label }) =>
                  value ? (
                    <CountrySelectOption
                      key={value}
                      country={value}
                      countryName={label}
                      selectedCountry={selectedCountry}
                      onChange={onChange}
                    />
                  ) : null
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const InputComponent = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof InputPure>>(
  ({ className, ...props }, ref) => (
    <InputRoot size="2xs" className="rounded-s-none">
      <InputWrapper className="flex h-full items-center p-2 py-1">
        <InputPure className={cn('rounded-e-lg rounded-s-none', className)} ref={ref} {...props} />
      </InputWrapper>
    </InputRoot>
  )
);
InputComponent.displayName = 'InputComponent';

interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country;
  onChange: (country: RPNInput.Country) => void;
}

const CountrySelectOption = ({ country, countryName, selectedCountry, onChange }: CountrySelectOptionProps) => {
  return (
    <CommandItem className="gap-2" onSelect={() => onChange(country)}>
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-foreground/50 text-sm">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
      <CheckIcon className={`ml-auto size-4 ${country === selectedCountry ? 'opacity-100' : 'opacity-0'}`} />
    </CommandItem>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return (
    <span className="bg-foreground/20 flex h-4 w-6 overflow-hidden rounded-sm [&_svg]:size-full" key={country}>
      {Flag ? <Flag title={countryName} /> : <span className="size-full rounded-sm bg-neutral-100" />}
    </span>
  );
};

export { PhoneInput };

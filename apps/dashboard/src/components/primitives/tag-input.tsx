'use client';

import { Badge } from '@/components/primitives/badge';
import { CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/primitives/command';
import { inputVariants } from '@/components/primitives/input';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/primitives/popover';
import { cn } from '@/utils/ui';
import { Command } from 'cmdk';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { RiCloseFill } from 'react-icons/ri';

type TagInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  value: string[];
  suggestions: string[];
  onChange: (tags: string[]) => void;
};

const TagInput = forwardRef<HTMLInputElement, TagInputProps>((props, ref) => {
  const { className, suggestions, value, onChange, ...rest } = props;
  const [tags, setTags] = useState<string[]>(value);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const validSuggestions = useMemo(
    () => suggestions.filter((suggestion) => !tags.includes(suggestion)),
    [tags, suggestions]
  );

  useEffect(() => {
    setTags(value);
  }, [value]);

  const addTag = (tag: string) => {
    const newTag = tag.trim();
    if (newTag === '') {
      return;
    }

    const newTags = [...tags, tag];
    if (new Set(newTags).size !== newTags.length) {
      return;
    }

    onChange(newTags);
    setInputValue('');
    setIsOpen(false);
  };

  const removeTag = (tag: string) => {
    const newTags = [...tags];
    const index = newTags.indexOf(tag);
    if (index !== -1) {
      newTags.splice(index, 1);
    }
    onChange(newTags);
    setInputValue('');
  };

  return (
    <Popover open={isOpen}>
      <Command loop>
        <div className="flex flex-col gap-2 pb-0.5">
          <PopoverAnchor asChild>
            <CommandInput
              ref={ref}
              autoComplete="off"
              value={inputValue}
              className={cn(inputVariants(), 'flex-grow', className)}
              placeholder="Type a tag and press Enter"
              onValueChange={(value) => {
                setInputValue(value);
                setIsOpen(true);
              }}
              onFocusCapture={() => setIsOpen(true)}
              onBlurCapture={() => setIsOpen(false)}
              {...rest}
            />
          </PopoverAnchor>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline" kind="tag" className="gap-1">
                <span style={{ wordBreak: 'break-all' }}>{tag}</span>
                <button type="button" onClick={() => removeTag(tag)}>
                  <RiCloseFill className="-mr-0.5 size-3" />
                  <span className="sr-only">Remove tag</span>
                </button>
              </Badge>
            ))}
          </div>
        </div>
        <CommandList>
          {(validSuggestions.length > 0 || inputValue !== '') && (
            <PopoverContent
              className="max-h-64 w-32 p-1"
              portal={false}
              onOpenAutoFocus={(e) => {
                e.preventDefault();
              }}
              onFocusOutside={(e) => e.preventDefault()}
              onInteractOutside={(e) => e.preventDefault()}
            >
              <CommandGroup>
                {inputValue !== '' && !validSuggestions.includes(inputValue) && (
                  <CommandItem
                    value={inputValue}
                    onSelect={() => {
                      addTag(inputValue);
                    }}
                    className="gap-1"
                    disabled={inputValue === '' || tags.includes(inputValue)}
                  >
                    {inputValue}
                  </CommandItem>
                )}

                {validSuggestions.map((tag) => (
                  <CommandItem
                    key={tag}
                    // We can't have duplicate keys in our list so adding a suffix
                    // here to differentiate this from the value typed
                    value={`${tag}-suggestion`}
                    onSelect={() => {
                      addTag(tag);
                    }}
                  >
                    {tag}
                  </CommandItem>
                ))}
              </CommandGroup>
            </PopoverContent>
          )}
        </CommandList>
      </Command>
    </Popover>
  );
});

export { TagInput };

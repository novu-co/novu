import { FormControl, FormItem } from '@/components/primitives/form/form';
import { Input, InputField } from '@/components/primitives/input';
import { Switch } from '@/components/primitives/switch';
import { useState, useEffect } from 'react';

interface DigestWidgetProps {
  value: string;
  onChange: (value: string) => void;
}

export function DigestWidget({ value, onChange }: DigestWidgetProps) {
  // Parse current digest configuration from the value
  const hasDigest = value.includes('| digest:') || value.includes('|digest:');
  const match = value.match(/\|\s*digest:\s*(\d+)(?:,\s*"([^"]*)")?(?:,\s*"([^"]*)")?/);
  const [, defaultMaxNames = '2', defaultKeyPath = '', defaultSeparator = ''] = match || [];

  // Local state for input values
  const [maxNames, setMaxNames] = useState(defaultMaxNames);
  const [keyPath, setKeyPath] = useState(defaultKeyPath);
  const [separator, setSeparator] = useState(defaultSeparator);

  // Update local state when value changes externally
  useEffect(() => {
    setMaxNames(defaultMaxNames);
    setKeyPath(defaultKeyPath);
    setSeparator(defaultSeparator);
  }, [defaultMaxNames, defaultKeyPath, defaultSeparator]);

  const handleDigestChange = (enabled: boolean) => {
    if (!enabled) {
      // Remove digest filter if it exists
      const newValue = value.replace(/\s*\|\s*digest:[^|}]*/, '');
      onChange(newValue);
      return;
    }

    // Add digest filter with default values
    const digestPart = ` | digest: 2`;
    const newValue = value.includes('}}')
      ? value.replace(/\s*\}\}$/, `${digestPart} }}`)
      : value.includes('|')
        ? value.replace(/(\|\s*[^|}]+)(?=\||$)/, `${digestPart}$1`)
        : `${value}${digestPart}`;

    onChange(newValue);
  };

  const updateDigestConfig = (
    newMaxNames: string = maxNames,
    newKeyPath: string = keyPath,
    newSeparator: string = separator
  ) => {
    let digestPart = ` | digest: ${newMaxNames}`;

    // Always include parameters if they exist or are being edited
    if (newKeyPath !== undefined) {
      digestPart += `, '${newKeyPath}'`;
      if (newSeparator !== undefined) {
        digestPart += `, '${newSeparator}'`;
      }
    } else if (newSeparator !== undefined) {
      digestPart += `, ''`; // Add empty keyPath if only separator is specified
      digestPart += `, '${newSeparator}'`;
    }

    // Replace existing digest filter or add new one
    const newValue = hasDigest
      ? value.replace(/\s*\|\s*digest:[^|}]*/, digestPart)
      : value.includes('}}')
        ? value.replace(/\s*\}\}$/, `${digestPart} }}`)
        : value.includes('|')
          ? value.replace(/(\|\s*[^|}]+)(?=\||$)/, `${digestPart}$1`)
          : `${value}${digestPart}`;

    onChange(newValue);
  };

  return (
    <div className="grid gap-2">
      <FormItem>
        <FormControl>
          <div className="flex items-center justify-between">
            <label className="text-text-sub text-label-xs">Enable digest format</label>
            <Switch checked={hasDigest} onCheckedChange={handleDigestChange} className="scale-75" />
          </div>
        </FormControl>
      </FormItem>

      {hasDigest && (
        <>
          <FormItem>
            <FormControl>
              <div className="grid gap-1">
                <label className="text-text-sub text-label-xs">Max names to show</label>
                <InputField size="fit" className="min-h-0">
                  <Input
                    type="number"
                    min={1}
                    value={maxNames}
                    onChange={(e) => {
                      setMaxNames(e.target.value);
                      updateDigestConfig(e.target.value, keyPath, separator);
                    }}
                    className="h-7 text-sm"
                  />
                </InputField>
              </div>
            </FormControl>
          </FormItem>

          <FormItem>
            <FormControl>
              <div className="grid gap-1">
                <label className="text-text-sub text-label-xs">Object key path (optional)</label>
                <InputField size="fit" className="min-h-0">
                  <Input
                    value={keyPath}
                    onChange={(e) => {
                      setKeyPath(e.target.value);
                      updateDigestConfig(maxNames, e.target.value, separator);
                    }}
                    className="h-7 text-sm"
                    placeholder="e.g., name or profile.name"
                  />
                </InputField>
              </div>
            </FormControl>
          </FormItem>

          <FormItem>
            <FormControl>
              <div className="grid gap-1">
                <label className="text-text-sub text-label-xs">Custom separator (optional)</label>
                <InputField size="fit" className="min-h-0">
                  <Input
                    value={separator}
                    onChange={(e) => {
                      setSeparator(e.target.value);
                      updateDigestConfig(maxNames, keyPath, e.target.value);
                    }}
                    className="h-7 text-sm"
                    placeholder="e.g., • or , "
                  />
                </InputField>
              </div>
            </FormControl>
          </FormItem>
        </>
      )}
    </div>
  );
}

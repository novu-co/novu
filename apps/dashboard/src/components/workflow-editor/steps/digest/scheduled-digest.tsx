import { useMemo } from 'react';
import cronParser from 'cron-parser';

import {
  getCronBasedOnPeriod,
  getPeriodFromCronParts,
  parseCronString,
  PeriodValues,
  toCronFields,
  toUiFields,
  UiCronFields,
} from '@/components/workflow-editor/steps/digest/utils';
import { Period } from '@/components/workflow-editor/steps/digest/period';
import { NumbersPicker } from '@/components/workflow-editor/steps/digest/numbers-picker';
import { DaysOfWeek } from '@/components/workflow-editor/steps/digest/days-of-week';
import { MultiSelect } from '@/components/primitives/multi-select';

const MONTHS_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export const ScheduledDigest = ({
  value,
  isDisabled,
  onValueChange,
  onError,
}: {
  value: string;
  isDisabled?: boolean;
  onValueChange: (cron: string) => void;
  onError?: (error: unknown) => void;
}) => {
  const period = useMemo(() => {
    try {
      const cronParts = parseCronString(value);
      return getPeriodFromCronParts(cronParts);
    } catch (e) {
      onError?.(e);
      return PeriodValues.MINUTE;
    }
  }, [value, onError]);

  const { second, month, dayOfMonth, dayOfWeek, hour, minute } = useMemo(() => {
    try {
      const expression = cronParser.parseExpression(value);
      return toUiFields(expression.fields);
    } catch (e) {
      onError?.(e);

      return {
        second: [],
        minute: [],
        hour: [],
        dayOfMonth: [],
        month: [],
        dayOfWeek: [],
      };
    }
  }, [value, onError]);

  const handleValueChange = (fields: Partial<UiCronFields>) => {
    const cronFields = toCronFields({
      second,
      minute,
      hour,
      dayOfWeek,
      dayOfMonth,
      month,
      ...fields,
    });

    onValueChange(cronParser.fieldsToExpression(cronFields).stringify());
  };

  const handlePeriodChange = (period: string) => {
    onValueChange(getCronBasedOnPeriod(period as PeriodValues, { second, minute, hour, dayOfWeek, dayOfMonth, month }));
  };

  return (
    <div className="grid grid-cols-2 gap-x-1 gap-y-2">
      <div className="flex items-center gap-1">
        <span className="text-foreground-600 text-xs font-medium">Every</span>
        <Period value={period} onPeriodChange={handlePeriodChange} isDisabled={isDisabled} />
      </div>
      {period !== PeriodValues.HOUR && period !== PeriodValues.MONTH && <span className="min-w-full" />}
      {period === PeriodValues.YEAR && (
        <div className="flex items-center gap-1">
          <span className="text-foreground-600 text-xs font-medium">in</span>
          <MultiSelect
            className="w-[150px]"
            values={month}
            options={MONTHS_OPTIONS}
            placeholder="Every month"
            placeholderAll="Every month"
            placeholderSelected="months"
            isDisabled={isDisabled}
            onValuesChange={(value) => {
              handleValueChange({ month: value });
            }}
          />
        </div>
      )}
      {(period === PeriodValues.YEAR || period === PeriodValues.MONTH) && (
        <div className="ml-auto flex items-center gap-1">
          <span className="text-foreground-600 text-xs font-medium">on</span>
          <NumbersPicker
            numbers={dayOfMonth}
            length={31}
            label="day(s)"
            onNumbersChange={(value) => {
              handleValueChange({ dayOfMonth: value });
            }}
          />
        </div>
      )}
      {(period === PeriodValues.YEAR || period === PeriodValues.MONTH || period === PeriodValues.WEEK) && (
        <div className="col-span-2 flex min-w-full items-center gap-1">
          <span className="text-foreground-600 text-xs font-medium">and</span>
          <DaysOfWeek
            daysOfWeek={dayOfWeek}
            onDaysChange={(value) => {
              handleValueChange({ dayOfWeek: value });
            }}
          />
        </div>
      )}
      {period !== PeriodValues.HOUR && period !== PeriodValues.MINUTE && (
        <div className="flex items-center gap-1">
          <span className="text-foreground-600 text-xs font-medium">at</span>
          <NumbersPicker
            numbers={hour}
            length={24}
            label="hour(s)"
            onNumbersChange={(value) => {
              handleValueChange({ hour: value });
            }}
            zeroBased
          />
        </div>
      )}
      {period !== PeriodValues.MINUTE && (
        <div className="flex items-center gap-1">
          <span className="text-foreground-600 text-xs font-medium">{period === PeriodValues.HOUR ? 'at' : ':'}</span>
          <NumbersPicker
            numbers={minute}
            length={60}
            label="minute(s)"
            onNumbersChange={(value) => {
              handleValueChange({ minute: value });
            }}
            zeroBased
          />
        </div>
      )}
    </div>
  );
};

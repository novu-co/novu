import { useEffect, useMemo, useRef } from 'react';
import { ChannelTypeEnum } from '@novu/shared';
import { useFetchWorkflows } from '../../hooks/use-fetch-workflows';
import { useForm } from 'react-hook-form';
import { Form, FormItem, FormField } from '../primitives/form/form';
import { FacetedFormFilter } from '../primitives/form/faceted-form-filter';
import { Button } from '../primitives/button';

interface IActivityFilters {
  onFiltersChange: (filters: IActivityFiltersData) => void;
  initialValues: IActivityFiltersData;
}

interface IActivityFiltersData {
  dateRange: string;
  channels: ChannelTypeEnum[];
  templates: string[];
  transactionId: string;
  subscriberId: string;
}

const DATE_RANGE_OPTIONS = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

const CHANNEL_OPTIONS = [
  { value: ChannelTypeEnum.SMS, label: 'SMS' },
  { value: ChannelTypeEnum.EMAIL, label: 'Email' },
  { value: ChannelTypeEnum.IN_APP, label: 'In-App' },
  { value: ChannelTypeEnum.PUSH, label: 'Push' },
];

const defaultValues: IActivityFiltersData = {
  dateRange: '30d',
  channels: [],
  templates: [],
  transactionId: '',
  subscriberId: '',
};

export function ActivityFilters({ onFiltersChange, initialValues }: IActivityFilters) {
  const originalInitialValues = useRef(defaultValues);
  const form = useForm<IActivityFiltersData>({
    defaultValues: initialValues,
  });

  const { data: workflowTemplates } = useFetchWorkflows({ limit: 100 });
  const formValues = form.watch();

  const hasChanges = useMemo(() => {
    const original = originalInitialValues.current;
    return Object.entries(formValues).some(([key, value]) => {
      const defaultValue = original[key as keyof IActivityFiltersData];
      if (Array.isArray(value) && Array.isArray(defaultValue)) {
        return value.length > 0;
      }
      return value !== defaultValue;
    });
  }, [formValues]);

  const handleReset = () => {
    form.reset(originalInitialValues.current);
    onFiltersChange(originalInitialValues.current);
  };

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value) {
        onFiltersChange(value as IActivityFiltersData);
      }
    });

    return () => subscription.unsubscribe();
  }, [onFiltersChange]);

  return (
    <Form {...form}>
      <form className="flex items-center gap-3 px-2.5 py-2">
        <FormField
          control={form.control}
          name="dateRange"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FacetedFormFilter
                size="small"
                type="single"
                title="Time Range"
                options={DATE_RANGE_OPTIONS}
                selected={field.value ? [field.value] : []}
                onSelect={(values) => field.onChange(values[0])}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="templates"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FacetedFormFilter
                size="small"
                type="multi"
                title="Workflows"
                options={
                  workflowTemplates?.workflows?.map((workflow) => ({
                    label: workflow.name,
                    value: workflow._id,
                  })) || []
                }
                selected={field.value}
                onSelect={(values) => field.onChange(values)}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="channels"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <FacetedFormFilter
                size="small"
                type="multi"
                title="Channels"
                options={CHANNEL_OPTIONS}
                selected={field.value}
                onSelect={(values) => field.onChange(values)}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transactionId"
          render={({ field }) => (
            <FormItem className="relative">
              <FacetedFormFilter
                type="text"
                size="small"
                title="Transaction ID"
                value={field.value}
                onChange={field.onChange}
                placeholder="Search by Transaction ID"
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subscriberId"
          render={({ field }) => (
            <FormItem className="relative">
              <FacetedFormFilter
                type="text"
                size="small"
                title="Subscriber ID"
                value={field.value}
                onChange={field.onChange}
                placeholder="Search by Subscriber ID"
              />
            </FormItem>
          )}
        />

        {hasChanges && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
        )}
      </form>
    </Form>
  );
}

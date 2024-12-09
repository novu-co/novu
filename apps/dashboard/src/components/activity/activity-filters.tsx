import { useEffect } from 'react';
import { ChannelTypeEnum } from '@novu/shared';
import { Input, InputField } from '../primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../primitives/select';
import { useFetchWorkflows } from '../../hooks/use-fetch-workflows';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import { Form, FormControl } from '../primitives/form/form';
import { FormItem } from '../primitives/form/form';
import { FormField } from '../primitives/form/form';
import { RiCalendarLine, RiListCheck, RiSearchLine } from 'react-icons/ri';
import { DataTableFacetedFilter } from '../primitives/data-table/data-table-faceted-filter';

interface IActivityFilters {
  onFiltersChange: (filters: IActivityFiltersData) => void;
  initialValues: IActivityFiltersData;
}

interface IActivityFiltersData {
  dateRange: string;
  channels: ChannelTypeEnum[];
  templates: string[];
  searchTerm: string;
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

export function ActivityFilters({ onFiltersChange, initialValues }: IActivityFilters) {
  const form = useForm<IActivityFiltersData>({
    defaultValues: initialValues,
  });

  const { data: workflowTemplates } = useFetchWorkflows({ limit: 100 });

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value) {
        onFiltersChange(value as IActivityFiltersData);
      }
    });

    return () => subscription.unsubscribe();
  }, [onFiltersChange]);

  useEffect(() => {
    const { searchTerm: currentSearchTerm, ...currentValues } = form.getValues();
    const { searchTerm: newSearchTerm, ...newValues } = initialValues;

    const hasNonSearchChanges = Object.entries(newValues).some(([key, value]) => {
      const current = currentValues[key as keyof typeof currentValues];

      return JSON.stringify(value) !== JSON.stringify(current);
    });

    if (hasNonSearchChanges) {
      form.reset({ ...initialValues, searchTerm: currentSearchTerm });
    }
  }, [initialValues]);

  return (
    <Form {...form}>
      <form className="flex items-center gap-3 px-2.5 py-2">
        <FormField
          control={form.control}
          name="templates"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <DataTableFacetedFilter
                size="small"
                type="single"
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
              <DataTableFacetedFilter
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
          name="dateRange"
          render={({ field }) => (
            <FormItem className="space-y-0">
              <DataTableFacetedFilter
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
          name="searchTerm"
          render={({ field }) => (
            <FormItem className="relative border-l border-neutral-100 pl-3">
              <DataTableFacetedFilter
                type="text"
                size="small"
                title="Search"
                value={field.value}
                onChange={field.onChange}
                placeholder="Search by Transaction ID, E-mail, Subscriber ID"
              />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

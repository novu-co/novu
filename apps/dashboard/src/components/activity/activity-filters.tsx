import { useEffect } from 'react';
import { ChannelTypeEnum } from '@novu/shared';
import { Input, InputField } from '../primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../primitives/select';
import { useFetchWorkflows } from '../../hooks/use-fetch-workflows';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import { Form, FormControl } from '../primitives/form/form';
import { FormItem } from '../primitives/form/form';
import { FormField } from '../primitives/form/form';
import { Search, Filter } from 'lucide-react';
import { RiCalendarLine, RiListCheck, RiRouteFill, RiSearchLine } from 'react-icons/ri';

interface IActivityFilters {
  onFiltersChange: (filters: IActivityFiltersData) => void;
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
  { value: '90d', label: 'Last 90 days' },
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
  searchTerm: '',
};

export function ActivityFilters({ onFiltersChange }: IActivityFilters) {
  const form = useForm<IActivityFiltersData>({
    defaultValues,
  });

  const { data: workflowTemplates } = useFetchWorkflows({ limit: 100 });

  useEffect(() => {
    const subscription = form.watch((value) => {
      onFiltersChange(value as IActivityFiltersData);
    });

    return () => subscription.unsubscribe();
  }, [form.watch, onFiltersChange]);

  return (
    <Form {...form}>
      <form className="flex items-center gap-3 px-2.5 py-2">
        <FormField
          control={form.control}
          name="dateRange"
          render={({ field }: { field: ControllerRenderProps<IActivityFiltersData, 'dateRange'> }) => (
            <FormItem className="space-y-0">
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="text-foreground-400 h-[26px] min-w-[74px] px-2 py-1.5 text-xs">
                    <RiCalendarLine className="mr-1 h-4 w-4" />
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DATE_RANGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="channels"
          render={({ field }: { field: ControllerRenderProps<IActivityFiltersData, 'channels'> }) => (
            <FormItem className="space-y-0">
              <Select
                value={field.value?.join(',')}
                onValueChange={(value) => {
                  if (value === 'all') {
                    field.onChange([]);
                  } else {
                    field.onChange(value ? (value.split(',').filter(Boolean) as ChannelTypeEnum[]) : []);
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger className="text-foreground-400 h-[26px] w-[140px] px-2 py-1.5 text-xs">
                    <RiListCheck className="mr-1 h-4 w-4" />
                    <SelectValue placeholder="Channel Steps" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">Show All</SelectItem>
                  {CHANNEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="templates"
          render={({ field }: { field: ControllerRenderProps<IActivityFiltersData, 'templates'> }) => (
            <FormItem className="space-y-0">
              <Select
                value={field.value?.join(',')}
                onValueChange={(value) => field.onChange(value ? value.split(',').filter(Boolean) : [])}
              >
                <FormControl>
                  <SelectTrigger className="text-foreground-400 h-[26px] min-w-[115px] px-2 py-1.5 text-xs">
                    <RiRouteFill className="mr-1 h-4 w-4" />
                    <SelectValue placeholder="Workflows" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {workflowTemplates?.workflows?.map((template) => (
                    <SelectItem key={template._id} value={template._id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="searchTerm"
          render={({ field }) => (
            <FormItem className="relative border-l border-neutral-100 pl-3">
              <InputField className="text-foreground-400 ml-0 h-[26px] min-w-[346px] gap-0.5 px-2 py-1.5 text-xs">
                <RiSearchLine className="mr-1 h-4 w-4" />
                <Input placeholder="Search by Transaction ID, E-mail, Subscriber ID" {...field} />
              </InputField>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

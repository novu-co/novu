import { useEffect, useMemo, useRef, useState } from 'react';
import { ChannelTypeEnum } from '@novu/shared';
import { useFetchWorkflows } from '../../hooks/use-fetch-workflows';
import { useForm } from 'react-hook-form';
import { Form, FormItem, FormField } from '../primitives/form/form';
import { FacetedFormFilter } from '../primitives/form/faceted-form-filter';
import { Button } from '../primitives/button';
import { cn } from '../../utils/ui';
import { Popover, PopoverContent, PopoverTrigger } from '../primitives/popover';
import { PlusCircle } from 'lucide-react';

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

interface FilterOption {
  value: keyof IActivityFiltersData;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'templates', label: 'Workflows' },
  { value: 'channels', label: 'Channels' },
  { value: 'transactionId', label: 'Transaction ID' },
  { value: 'subscriberId', label: 'Subscriber ID' },
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
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([]);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

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
    setActiveFilters([]);
    setOpenFilter(null);
    setIsFiltersOpen(false);
  };

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value) {
        onFiltersChange(value as IActivityFiltersData);
      }
    });

    return () => subscription.unsubscribe();
  }, [onFiltersChange]);

  // Initialize active filters based on non-empty values
  useEffect(() => {
    const initialActiveFilters = FILTER_OPTIONS.filter((filter) => {
      const value = initialValues[filter.value];
      return Array.isArray(value) ? value.length > 0 : value !== '';
    });
    setActiveFilters(initialActiveFilters);
  }, []);

  const renderFilter = (filter: FilterOption) => {
    switch (filter.value) {
      case 'templates':
        return (
          <FormField
            key={filter.value}
            control={form.control}
            name="templates"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FacetedFormFilter
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
                  open={openFilter === filter.value}
                  onOpenChange={(open) => setOpenFilter(open ? filter.value : null)}
                />
              </FormItem>
            )}
          />
        );
      case 'channels':
        return (
          <FormField
            key={filter.value}
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
                  open={openFilter === filter.value}
                  onOpenChange={(open) => setOpenFilter(open ? filter.value : null)}
                />
              </FormItem>
            )}
          />
        );
      case 'transactionId':
        return (
          <FormField
            key={filter.value}
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
                  open={openFilter === filter.value}
                  onOpenChange={(open) => setOpenFilter(open ? filter.value : null)}
                />
              </FormItem>
            )}
          />
        );
      case 'subscriberId':
        return (
          <FormField
            key={filter.value}
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
                  open={openFilter === filter.value}
                  onOpenChange={(open) => setOpenFilter(open ? filter.value : null)}
                />
              </FormItem>
            )}
          />
        );
    }
  };

  const handleAddFilter = (filter: FilterOption) => {
    setActiveFilters((prev) => [...prev, filter]);
    setOpenFilter(filter.value);
    setIsFiltersOpen(false);
  };

  const availableFilters = FILTER_OPTIONS.filter(
    (filter) => !activeFilters.some((active) => active.value === filter.value)
  );

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
                open={openFilter === 'dateRange'}
                onOpenChange={(open) => setOpenFilter(open ? 'dateRange' : null)}
              />
            </FormItem>
          )}
        />

        {activeFilters.map((filter) => renderFilter(filter))}

        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 px-2 py-1.5 text-xs">
              <PlusCircle className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="min-w-[120px] p-1" align="start">
            <div className="flex flex-col">
              {availableFilters.map((filter) => (
                <div
                  key={filter.value}
                  role="button"
                  onClick={() => handleAddFilter(filter)}
                  className={cn(
                    'flex items-center px-2 py-1.5 text-sm text-neutral-600',
                    'cursor-pointer rounded-sm hover:bg-neutral-50 hover:text-neutral-900',
                    'outline-none focus-visible:bg-neutral-50 focus-visible:text-neutral-900'
                  )}
                >
                  {filter.label}
                </div>
              ))}
              {availableFilters.length === 0 && (
                <p className="px-2 py-1.5 text-sm text-neutral-500">No filters available</p>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {hasChanges && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
        )}
      </form>
    </Form>
  );
}

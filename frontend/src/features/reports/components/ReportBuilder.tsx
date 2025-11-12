import { useState, useEffect } from 'react';
import { Report, CreateReportDto, UpdateReportDto, ReportType, ReportDataSource, ReportMetric, ReportGroupBy } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportBuilderProps {
  report?: Report;
  onSave: (data: CreateReportDto | UpdateReportDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ReportBuilder({ report, onSave, onCancel, isLoading }: ReportBuilderProps) {
  const [formData, setFormData] = useState<CreateReportDto>({
    name: report?.name || '',
    description: report?.description || '',
    type: report?.type || ReportType.CUSTOM,
    config: report?.config || {
      dataSources: [ReportDataSource.TRANSACTIONS],
      metrics: [ReportMetric.SUM],
      filters: {},
      includeCharts: true,
    },
  });

  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  useEffect(() => {
    if (report?.config.filters?.dateRange) {
      setStartDate(new Date(report.config.filters.dateRange.start));
      setEndDate(new Date(report.config.filters.dateRange.end));
    }
  }, [report]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      config: {
        ...formData.config,
        filters: {
          ...formData.config.filters,
          dateRange: startDate && endDate
            ? {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
              }
            : undefined,
        },
      },
    };

    onSave(data);
  };

  const updateConfig = (key: string, value: any) => {
    setFormData({
      ...formData,
      config: {
        ...formData.config,
        [key]: value,
      },
    });
  };

  const toggleDataSource = (source: ReportDataSource) => {
    const current = formData.config.dataSources || [];
    const updated = current.includes(source)
      ? current.filter((s) => s !== source)
      : [...current, source];
    updateConfig('dataSources', updated);
  };

  const toggleMetric = (metric: ReportMetric) => {
    const current = formData.config.metrics || [];
    const updated = current.includes(metric)
      ? current.filter((m) => m !== metric)
      : [...current, metric];
    updateConfig('metrics', updated);
  };

  const toggleGroupBy = (groupBy: ReportGroupBy) => {
    const current = formData.config.groupBy || [];
    const updated = current.includes(groupBy)
      ? current.filter((g) => g !== groupBy)
      : [...current, groupBy];
    updateConfig('groupBy', updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
          <CardDescription>Basic information about your report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Report Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Report Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as ReportType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ReportType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
          <CardDescription>Select the data sources for your report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.values(ReportDataSource).map((source) => (
              <div key={source} className="flex items-center space-x-2">
                <Checkbox
                  id={source}
                  checked={formData.config.dataSources?.includes(source)}
                  onCheckedChange={() => toggleDataSource(source)}
                />
                <Label htmlFor={source} className="font-normal cursor-pointer">
                  {source.charAt(0).toUpperCase() + source.slice(1).replace('_', ' ')}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metrics</CardTitle>
          <CardDescription>Choose metrics to calculate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.values(ReportMetric).map((metric) => (
              <div key={metric} className="flex items-center space-x-2">
                <Checkbox
                  id={metric}
                  checked={formData.config.metrics?.includes(metric)}
                  onCheckedChange={() => toggleMetric(metric)}
                />
                <Label htmlFor={metric} className="font-normal cursor-pointer">
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Apply filters to your report data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Start date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'End date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grouping & Sorting</CardTitle>
          <CardDescription>Organize your report data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Group By</Label>
            <div className="space-y-3">
              {Object.values(ReportGroupBy).map((groupBy) => (
                <div key={groupBy} className="flex items-center space-x-2">
                  <Checkbox
                    id={`group-${groupBy}`}
                    checked={formData.config.groupBy?.includes(groupBy)}
                    onCheckedChange={() => toggleGroupBy(groupBy)}
                  />
                  <Label htmlFor={`group-${groupBy}`} className="font-normal cursor-pointer">
                    {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sort Order</Label>
            <Select
              value={formData.config.sortOrder || 'desc'}
              onValueChange={(value) => updateConfig('sortOrder', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeCharts"
              checked={formData.config.includeCharts}
              onCheckedChange={(checked) => updateConfig('includeCharts', checked)}
            />
            <Label htmlFor="includeCharts" className="font-normal cursor-pointer">
              Include charts and visualizations
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : report ? 'Update Report' : 'Create Report'}
        </Button>
      </div>
    </form>
  );
}

import { useEffect } from 'react';
import { useReport } from '../hooks/useReports';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ReportPreviewProps {
  reportId: string;
}

export default function ReportPreview({ reportId }: ReportPreviewProps) {
  const { report, preview, loadPreview, isLoadingPreview } = useReport(reportId);

  useEffect(() => {
    if (reportId) {
      loadPreview();
    }
  }, [reportId]);

  const formatValue = (value: any): string => {
    if (typeof value === 'number') {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return String(value);
  };

  const formatKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  if (isLoadingPreview) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!preview) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No preview available. Click "Load Preview" to generate a preview of this report.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Report Preview</h3>
          <p className="text-sm text-muted-foreground">
            Showing limited results for preview purposes
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadPreview()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {preview.summary && Object.keys(preview.summary).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Key metrics and totals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(preview.summary).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <p className="text-sm text-muted-foreground">{formatKey(key)}</p>
                  <p className="text-2xl font-bold">{formatValue(value)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {preview.details && preview.details.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              Showing {preview.details.length} of {preview.metadata?.recordCount || 0} records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Array.isArray(preview.details) && preview.details.length > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(preview.details[0]).map((key) => (
                        <TableHead key={key}>{formatKey(key)}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.details.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell key={cellIndex}>{formatValue(value)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {preview.charts && preview.charts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Visualizations</CardTitle>
            <CardDescription>Charts will be included in the generated report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {preview.charts.map((chart: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">{chart.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} chart with{' '}
                    {chart.data?.length || 0} data points
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {preview.metadata && (
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Generated At</dt>
                <dd className="font-medium">
                  {new Date(preview.metadata.generatedAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Date Range</dt>
                <dd className="font-medium">
                  {new Date(preview.metadata.dataRange.start).toLocaleDateString()} -{' '}
                  {new Date(preview.metadata.dataRange.end).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Total Records</dt>
                <dd className="font-medium">{preview.metadata.recordCount}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

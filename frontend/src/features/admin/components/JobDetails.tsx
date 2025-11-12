import { useJobById, useJobLogs } from '../hooks/useJobs';
import { Job, JobLogLevel } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, AlertCircle, Info, AlertTriangle, Bug } from 'lucide-react';
import { format } from 'date-fns';

interface JobDetailsProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
}

export default function JobDetails({ job, open, onClose }: JobDetailsProps) {
  const { data: freshJob, isLoading } = useJobById(job?.id || '');
  const { data: logs, isLoading: logsLoading } = useJobLogs(job?.id || '');

  const currentJob = freshJob || job;

  if (!currentJob) return null;

  const getLogIcon = (level: JobLogLevel) => {
    switch (level) {
      case JobLogLevel.ERROR:
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case JobLogLevel.WARNING:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case JobLogLevel.DEBUG:
        return <Bug className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Job Details</DialogTitle>
          <DialogDescription>
            {currentJob.type.replace(/_/g, ' ')} - {currentJob.id}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="error">Error</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="overview" className="space-y-4 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge>{currentJob.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Priority</span>
                      <Badge variant="outline">{currentJob.priority}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Attempts</span>
                      <span className="text-sm">
                        {currentJob.attempts} / {currentJob.maxAttempts}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Duration</span>
                      <span className="text-sm">
                        {currentJob.duration > 0 ? formatDuration(currentJob.duration) : '-'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {currentJob.progress && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Percentage</span>
                        <span className="text-sm">{currentJob.progress.percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${currentJob.progress.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current Step</span>
                        <span className="text-sm">{currentJob.progress.currentStep}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Steps</span>
                        <span className="text-sm">
                          {currentJob.progress.completedSteps} / {currentJob.progress.totalSteps}
                        </span>
                      </div>
                      {currentJob.progress.message && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Message</span>
                          <span className="text-sm">{currentJob.progress.message}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Timestamps</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Created</span>
                      <span className="text-sm">
                        {format(new Date(currentJob.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                      </span>
                    </div>
                    {currentJob.startedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Started</span>
                        <span className="text-sm">
                          {format(new Date(currentJob.startedAt), 'MMM dd, yyyy HH:mm:ss')}
                        </span>
                      </div>
                    )}
                    {currentJob.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Completed</span>
                        <span className="text-sm">
                          {format(new Date(currentJob.completedAt), 'MMM dd, yyyy HH:mm:ss')}
                        </span>
                      </div>
                    )}
                    {currentJob.failedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Failed</span>
                        <span className="text-sm">
                          {format(new Date(currentJob.failedAt), 'MMM dd, yyyy HH:mm:ss')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="data" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto">
                      {JSON.stringify(currentJob.data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>

                {currentJob.result && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle>Job Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto">
                        {JSON.stringify(currentJob.result, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="logs" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Logs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {logsLoading ? (
                      <div className="flex items-center justify-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {logs?.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-start gap-2 p-2 rounded-lg bg-gray-50"
                          >
                            {getLogIcon(log.level)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium">{log.message}</span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {format(new Date(log.createdAt), 'HH:mm:ss')}
                                </span>
                              </div>
                              {log.context && (
                                <pre className="text-xs text-muted-foreground mt-1 overflow-auto">
                                  {JSON.stringify(log.context, null, 2)}
                                </pre>
                              )}
                            </div>
                          </div>
                        ))}
                        {!logs || logs.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No logs available
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="error" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Error Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {currentJob.error ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Error Message</h4>
                          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                            {currentJob.error}
                          </p>
                        </div>
                        {currentJob.stackTrace && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Stack Trace</h4>
                            <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto">
                              {currentJob.stackTrace}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No error information available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

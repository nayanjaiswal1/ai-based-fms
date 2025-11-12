import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useJobStatistics } from '../hooks/useJobs';
import { Activity, CheckCircle2, XCircle, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDuration } from 'date-fns';

export default function JobStatistics() {
  const { data: stats, isLoading } = useJobStatistics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) return null;

  const formatMs = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">Completed successfully</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMs(stats.avgDuration)}</div>
            <p className="text-xs text-muted-foreground">Per job</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.byStatus.active}</div>
            <p className="text-xs text-muted-foreground">Currently processing</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="flex items-center justify-between space-x-2">
              <span className="text-sm text-muted-foreground">Waiting</span>
              <Badge variant="secondary">{stats.byStatus.waiting}</Badge>
            </div>
            <div className="flex items-center justify-between space-x-2">
              <span className="text-sm text-muted-foreground">Active</span>
              <Badge className="bg-blue-500">{stats.byStatus.active}</Badge>
            </div>
            <div className="flex items-center justify-between space-x-2">
              <span className="text-sm text-muted-foreground">Completed</span>
              <Badge className="bg-green-500">{stats.byStatus.completed}</Badge>
            </div>
            <div className="flex items-center justify-between space-x-2">
              <span className="text-sm text-muted-foreground">Failed</span>
              <Badge className="bg-red-500">{stats.byStatus.failed}</Badge>
            </div>
            <div className="flex items-center justify-between space-x-2">
              <span className="text-sm text-muted-foreground">Delayed</span>
              <Badge variant="outline">{stats.byStatus.delayed}</Badge>
            </div>
            <div className="flex items-center justify-between space-x-2">
              <span className="text-sm text-muted-foreground">Paused</span>
              <Badge variant="outline">{stats.byStatus.paused}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* By Type */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.byType.map((typeStats) => (
              <div key={typeStats.type} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {typeStats.type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <Badge variant="outline">{typeStats.count} total</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {typeStats.completed}
                    </span>
                    <span className="text-xs text-red-600 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {typeStats.failed}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatMs(typeStats.avgDuration)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

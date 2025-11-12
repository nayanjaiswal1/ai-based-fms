import { Report } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  MoreVertical,
  Play,
  Copy,
  Edit,
  Trash2,
  Star,
  Calendar,
  Download,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ReportCardProps {
  report: Report;
  onGenerate: (report: Report) => void;
  onEdit: (report: Report) => void;
  onDuplicate: (report: Report) => void;
  onDelete: (report: Report) => void;
  onToggleFavorite: (report: Report) => void;
  onViewGenerated: (report: Report) => void;
}

export default function ReportCard({
  report,
  onGenerate,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  onViewGenerated,
}: ReportCardProps) {
  const getTypeLabel = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      monthly_summary: 'bg-blue-100 text-blue-800',
      tax_report: 'bg-purple-100 text-purple-800',
      year_over_year: 'bg-green-100 text-green-800',
      month_over_month: 'bg-green-100 text-green-800',
      quarter_over_quarter: 'bg-green-100 text-green-800',
      budget_vs_actual: 'bg-yellow-100 text-yellow-800',
      category_spending: 'bg-orange-100 text-orange-800',
      investment_performance: 'bg-indigo-100 text-indigo-800',
      group_expense_settlement: 'bg-pink-100 text-pink-800',
      cash_flow: 'bg-cyan-100 text-cyan-800',
      net_worth: 'bg-emerald-100 text-emerald-800',
      profit_loss: 'bg-red-100 text-red-800',
      custom: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{report.name}</CardTitle>
              {report.isFavorite && (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            <CardDescription className="mt-1">{report.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onGenerate(report)}>
                <Play className="h-4 w-4 mr-2" />
                Generate Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewGenerated(report)}>
                <Download className="h-4 w-4 mr-2" />
                View Generated
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(report)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(report)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleFavorite(report)}>
                <Star className="h-4 w-4 mr-2" />
                {report.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(report)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge className={getTypeBadgeColor(report.type)} variant="secondary">
              {getTypeLabel(report.type)}
            </Badge>
            {report.schedule?.enabled && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Scheduled
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Run count: {report.runCount}</span>
              {report.lastRunAt && (
                <span>
                  Last run: {formatDistanceToNow(new Date(report.lastRunAt), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onGenerate(report)} className="flex-1" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Generate
            </Button>
            <Button
              onClick={() => onViewGenerated(report)}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              History
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

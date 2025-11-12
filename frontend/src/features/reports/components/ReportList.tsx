import { Report } from '../types';
import ReportCard from './ReportCard';

interface ReportListProps {
  reports: Report[];
  isLoading: boolean;
  onGenerate: (report: Report) => void;
  onEdit: (report: Report) => void;
  onDuplicate: (report: Report) => void;
  onDelete: (report: Report) => void;
  onToggleFavorite: (report: Report) => void;
  onViewGenerated: (report: Report) => void;
}

export default function ReportList({
  reports,
  isLoading,
  onGenerate,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  onViewGenerated,
}: ReportListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No reports found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Create a new report or use a template to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onGenerate={onGenerate}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          onViewGenerated={onViewGenerated}
        />
      ))}
    </div>
  );
}

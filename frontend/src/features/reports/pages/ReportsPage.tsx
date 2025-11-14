import { useState } from 'react';
import { useReports, useGeneratedReports } from '../hooks/useReports';
import { Report, ReportFormat, CreateReportDto, UpdateReportDto } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ReportList from '../components/ReportList';
import ReportBuilder from '../components/ReportBuilder';
import ReportTemplates from '../components/ReportTemplates';
import ReportPreview from '../components/ReportPreview';
import { Plus, Search, Star, FileText, Download, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PageHeader } from '@/components/ui/PageHeader';

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'favorites'>('all');
  const [showBuilder, setShowBuilder] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showGeneratedReports, setShowGeneratedReports] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>(ReportFormat.PDF);

  const {
    reports,
    isLoading,
    createReport,
    updateReport,
    deleteReport,
    duplicateReport,
    toggleFavorite,
    isCreating,
    isUpdating,
  } = useReports({
    search: searchQuery,
    isFavorite: filterType === 'favorites' ? true : undefined,
  });

  const {
    generatedReports,
    downloadReport,
    deleteGeneratedReport,
  } = useGeneratedReports(selectedReport?.id || '');

  const handleCreateReport = (data: CreateReportDto) => {
    createReport(data, {
      onSuccess: () => {
        setShowBuilder(false);
        setSelectedReport(null);
      },
    });
  };

  const handleUpdateReport = (data: UpdateReportDto) => {
    if (selectedReport) {
      updateReport(
        { id: selectedReport.id, data },
        {
          onSuccess: () => {
            setShowBuilder(false);
            setSelectedReport(null);
          },
        }
      );
    }
  };

  const handleGenerate = (report: Report) => {
    setSelectedReport(report);
    setShowGenerateDialog(true);
  };

  const confirmGenerate = async () => {
    if (selectedReport) {
      try {
        await fetch(`/api/reports/${selectedReport.id}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ format: selectedFormat }),
        });
        toast.success('Report generation started');
        setShowGenerateDialog(false);
        setShowGeneratedReports(true);
      } catch (error) {
        toast.error('Failed to generate report');
      }
    }
  };

  const handleEdit = (report: Report) => {
    setSelectedReport(report);
    setShowBuilder(true);
  };

  const handleDuplicate = (report: Report) => {
    duplicateReport(report.id);
  };

  const handleDelete = (report: Report) => {
    setSelectedReport(report);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedReport) {
      deleteReport(selectedReport.id);
      setShowDeleteDialog(false);
      setSelectedReport(null);
    }
  };

  const handleToggleFavorite = (report: Report) => {
    toggleFavorite(report.id);
  };

  const handleViewGenerated = (report: Report) => {
    setSelectedReport(report);
    setShowGeneratedReports(true);
  };

  const handlePreview = (report: Report) => {
    setSelectedReport(report);
    setShowPreview(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Page Header with Search and Buttons */}
      <PageHeader
        showSearch={true}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search reports..."
        buttons={[
          {
            label: filterType === 'all' ? 'All Reports' : 'Favorites',
            icon: filterType === 'favorites' ? Star : FileText,
            onClick: () => setFilterType(filterType === 'all' ? 'favorites' : 'all'),
            variant: 'outline' as const,
          },
          {
            label: 'Templates',
            icon: FileText,
            onClick: () => setShowTemplates(true),
            variant: 'outline' as const,
          },
          {
            label: 'Create Report',
            icon: Plus,
            onClick: () => setShowBuilder(true),
            variant: 'primary' as const,
          },
        ]}
      />

      <ReportList
        reports={reports}
        isLoading={isLoading}
        onGenerate={handleGenerate}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onToggleFavorite={handleToggleFavorite}
        onViewGenerated={handleViewGenerated}
      />

      {/* Report Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedReport ? 'Edit Report' : 'Create New Report'}
            </DialogTitle>
            <DialogDescription>
              Configure your report settings and filters
            </DialogDescription>
          </DialogHeader>
          <ReportBuilder
            report={selectedReport || undefined}
            onSave={selectedReport ? handleUpdateReport : handleCreateReport}
            onCancel={() => {
              setShowBuilder(false);
              setSelectedReport(null);
            }}
            isLoading={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Templates</DialogTitle>
            <DialogDescription>
              Choose from pre-built report templates to get started quickly
            </DialogDescription>
          </DialogHeader>
          <ReportTemplates onClose={() => setShowTemplates(false)} />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Preview</DialogTitle>
            <DialogDescription>
              {selectedReport?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && <ReportPreview reportId={selectedReport.id} />}
        </DialogContent>
      </Dialog>

      {/* Generate Report Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Choose the export format for {selectedReport?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select
                value={selectedFormat}
                onValueChange={(value) => setSelectedFormat(value as ReportFormat)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ReportFormat.PDF}>PDF</SelectItem>
                  <SelectItem value={ReportFormat.EXCEL}>Excel</SelectItem>
                  <SelectItem value={ReportFormat.CSV}>CSV</SelectItem>
                  <SelectItem value={ReportFormat.JSON}>JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmGenerate}>Generate</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generated Reports Dialog */}
      <Dialog open={showGeneratedReports} onOpenChange={setShowGeneratedReports}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Generated Reports</DialogTitle>
            <DialogDescription>
              View and download previously generated reports for {selectedReport?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto max-h-[60vh]">
            {generatedReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No generated reports yet
              </div>
            ) : (
              generatedReports.map((genReport) => (
                <div
                  key={genReport.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{genReport.fileName}</p>
                      <Badge
                        variant={
                          genReport.status === 'completed'
                            ? 'default'
                            : genReport.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {genReport.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Generated {format(new Date(genReport.createdAt), 'PPp')}
                      {genReport.fileSize && (
                        <> · {(genReport.fileSize / 1024).toFixed(2)} KB</>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {genReport.status === 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          downloadReport(genReport.id, genReport.fileName || 'report')
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteGeneratedReport(genReport.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedReport?.name}"? This action cannot be
              undone and will also delete all generated reports.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

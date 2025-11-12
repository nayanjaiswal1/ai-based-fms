import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { FileDownload, Close } from '@mui/icons-material';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { ExportFormat, ExportEntity } from './ExportButton';

interface ExportMenuProps {
  open: boolean;
  onClose: () => void;
  entityType: ExportEntity;
  onExport: (format: ExportFormat, options: ExportOptions) => Promise<void>;
  currentFilters?: any;
  itemCount?: number;
}

export interface ExportOptions {
  format: ExportFormat;
  startDate?: string;
  endDate?: string;
  includeCharts?: boolean;
}

const ExportMenu: React.FC<ExportMenuProps> = ({
  open,
  onClose,
  entityType,
  onExport,
  currentFilters = {},
  itemCount,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [startDate, setStartDate] = useState(currentFilters.startDate || '');
  const [endDate, setEndDate] = useState(currentFilters.endDate || '');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);

    try {
      const options: ExportOptions = {
        format: selectedFormat,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        includeCharts: selectedFormat === 'pdf' ? includeCharts : undefined,
      };

      await onExport(selectedFormat, options);
      toast.success(`${entityType} exported successfully!`);
      onClose();
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || `Failed to export ${entityType}`);
    } finally {
      setLoading(false);
    }
  };

  const getEntityLabel = () => {
    return entityType.charAt(0).toUpperCase() + entityType.slice(1);
  };

  const getFormatDescription = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        return 'Comma-separated values file, suitable for importing into spreadsheet applications';
      case 'excel':
        return 'Microsoft Excel file with formatted data and summary sheets';
      case 'pdf':
        return 'Portable Document Format with formatted tables and charts';
    }
  };

  const getAppliedFilters = () => {
    const filters: string[] = [];

    if (startDate) filters.push(`From: ${format(new Date(startDate), 'MMM dd, yyyy')}`);
    if (endDate) filters.push(`To: ${format(new Date(endDate), 'MMM dd, yyyy')}`);
    if (currentFilters.categoryIds?.length > 0)
      filters.push(`${currentFilters.categoryIds.length} categories`);
    if (currentFilters.tagIds?.length > 0)
      filters.push(`${currentFilters.tagIds.length} tags`);
    if (currentFilters.accountIds?.length > 0)
      filters.push(`${currentFilters.accountIds.length} accounts`);
    if (currentFilters.type) filters.push(`Type: ${currentFilters.type}`);

    return filters;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Export {getEntityLabel()}</Typography>
          <Button onClick={onClose} size="small" color="inherit">
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Format Selection */}
        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          <FormLabel component="legend">Export Format</FormLabel>
          <RadioGroup
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
          >
            <FormControlLabel
              value="csv"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">CSV</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getFormatDescription('csv')}
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="excel"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">Excel</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getFormatDescription('excel')}
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="pdf"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="body1">PDF</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getFormatDescription('pdf')}
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>

        {/* Date Range */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Date Range (Optional)
          </Typography>
          <Box display="flex" gap={2}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Box>
        </Box>

        {/* PDF Options */}
        {selectedFormat === 'pdf' && entityType === 'analytics' && (
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Radio
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                />
              }
              label="Include charts in PDF"
            />
          </Box>
        )}

        {/* Applied Filters Summary */}
        {getAppliedFilters().length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Applied Filters:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {getAppliedFilters().map((filter, index) => (
                <Chip key={index} label={filter} size="small" />
              ))}
            </Box>
          </Box>
        )}

        {/* Export Preview */}
        <Alert severity="info" sx={{ mt: 2 }}>
          {itemCount !== undefined ? (
            <>
              You are about to export <strong>{itemCount}</strong> {entityType}.
            </>
          ) : (
            <>You are about to export your {entityType}.</>
          )}
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <FileDownload />}
        >
          {loading ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportMenu;

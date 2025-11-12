import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  FileDownload,
  Description,
  TableChart,
  PictureAsPdf,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

export type ExportFormat = 'csv' | 'excel' | 'pdf';
export type ExportEntity = 'transactions' | 'budgets' | 'analytics' | 'accounts';

interface ExportButtonProps {
  entityType: ExportEntity;
  filters?: any;
  label?: string;
  onExport?: (format: ExportFormat) => Promise<void>;
  formats?: ExportFormat[];
  variant?: 'icon' | 'button';
}

const ExportButton: React.FC<ExportButtonProps> = ({
  entityType,
  filters = {},
  label = 'Export',
  onExport,
  formats = ['csv', 'excel', 'pdf'],
  variant = 'icon',
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExport = async (format: ExportFormat) => {
    setLoading(true);
    setExportingFormat(format);
    handleClose();

    try {
      if (onExport) {
        await onExport(format);
      } else {
        // Default export behavior
        toast.error('Export function not implemented');
      }
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || `Failed to export ${entityType} as ${format.toUpperCase()}`);
    } finally {
      setLoading(false);
      setExportingFormat(null);
    }
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        return <Description fontSize="small" />;
      case 'excel':
        return <TableChart fontSize="small" />;
      case 'pdf':
        return <PictureAsPdf fontSize="small" />;
    }
  };

  const getFormatLabel = (format: ExportFormat) => {
    switch (format) {
      case 'csv':
        return 'Export as CSV';
      case 'excel':
        return 'Export as Excel';
      case 'pdf':
        return 'Export as PDF';
    }
  };

  return (
    <>
      {variant === 'icon' ? (
        <Tooltip title={label}>
          <IconButton
            onClick={handleClick}
            disabled={loading}
            size="small"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <FileDownload fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      ) : (
        <button
          onClick={handleClick}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <CircularProgress size={16} color="inherit" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <FileDownload fontSize="small" />
              <span>{label}</span>
            </>
          )}
        </button>
      )}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {formats.includes('csv') && (
          <MenuItem
            onClick={() => handleExport('csv')}
            disabled={loading && exportingFormat === 'csv'}
          >
            <ListItemIcon>{getFormatIcon('csv')}</ListItemIcon>
            <ListItemText>
              {loading && exportingFormat === 'csv' ? 'Exporting...' : getFormatLabel('csv')}
            </ListItemText>
          </MenuItem>
        )}
        {formats.includes('excel') && (
          <MenuItem
            onClick={() => handleExport('excel')}
            disabled={loading && exportingFormat === 'excel'}
          >
            <ListItemIcon>{getFormatIcon('excel')}</ListItemIcon>
            <ListItemText>
              {loading && exportingFormat === 'excel' ? 'Exporting...' : getFormatLabel('excel')}
            </ListItemText>
          </MenuItem>
        )}
        {formats.includes('pdf') && (
          <MenuItem
            onClick={() => handleExport('pdf')}
            disabled={loading && exportingFormat === 'pdf'}
          >
            <ListItemIcon>{getFormatIcon('pdf')}</ListItemIcon>
            <ListItemText>
              {loading && exportingFormat === 'pdf' ? 'Exporting...' : getFormatLabel('pdf')}
            </ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default ExportButton;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Download, 
  FileText, 
  FileJson, 
  FileType,
  Archive,
  GitBranch,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSopExport } from '../hooks/useSopExport';

interface ExportFormat {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  recommended?: boolean;
}

interface SopExportButtonProps {
  sopId: string;
  sopName?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  availableFormats?: string[];
  showDropdown?: boolean;
  defaultFormat?: string;
  onExportStart?: (format: string) => void;
  onExportComplete?: (format: string) => void;
  onExportError?: (format: string, error: string) => void;
}

export const SopExportButton: React.FC<SopExportButtonProps> = ({
  sopId,
  sopName,
  variant = 'outline',
  size = 'default',
  className,
  availableFormats = ['json', 'text', 'pdf', 'package', 'flow'],
  showDropdown = true,
  defaultFormat = 'json',
  onExportStart,
  onExportComplete,
  onExportError
}) => {
  const { exportSop, isExporting, exportError, exportSuccess } = useSopExport();
  const [lastExportedFormat, setLastExportedFormat] = useState<string | null>(null);

  const exportFormats: ExportFormat[] = [
    {
      id: 'json',
      label: 'JSON Export',
      description: 'Machine-readable SOP definition',
      icon: FileJson,
      recommended: true
    },
    {
      id: 'text',
      label: 'Text Export',
      description: 'Plain text documentation',
      icon: FileText
    },
    {
      id: 'pdf',
      label: 'PDF Export',
      description: 'Professional document format',
      icon: FileType,
      recommended: true
    },
    {
      id: 'package',
      label: 'Complete Package',
      description: 'Implementation package with all formats',
      icon: Archive
    },
    {
      id: 'flow',
      label: 'Activepieces Flow',
      description: 'Ready-to-import flow definition',
      icon: GitBranch
    }
  ];

  const availableExportFormats = exportFormats.filter(format => 
    availableFormats.includes(format.id)
  );

  const handleExport = async (format: string) => {
    if (!sopId) {
      console.error('No SOP ID provided for export');
      return;
    }

    try {
      onExportStart?.(format);
      setLastExportedFormat(format);

      await exportSop(sopId, format, {
        includeHistory: true,
        includeMetadata: true
      });

      onExportComplete?.(format);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      onExportError?.(format, errorMessage);
    }
  };

  const getButtonIcon = () => {
    if (isExporting) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (exportSuccess && lastExportedFormat) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (exportError) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <Download className="h-4 w-4" />;
  };

  const getButtonText = () => {
    if (isExporting) {
      return 'Exporting...';
    }
    if (exportSuccess && lastExportedFormat) {
      return 'Downloaded';
    }
    if (exportError) {
      return 'Export Failed';
    }
    return 'Export';
  };

  // Simple button without dropdown
  if (!showDropdown || availableExportFormats.length === 1) {
    const format = availableExportFormats[0]?.id || defaultFormat;
    const formatInfo = exportFormats.find(f => f.id === format);
    const IconComponent = formatInfo?.icon || Download;

    return (
      <Button
        variant={variant}
        size={size}
        className={cn('gap-2', className)}
        onClick={() => handleExport(format)}
        disabled={isExporting || !sopId}
      >
        {getButtonIcon()}
        {getButtonText()}
      </Button>
    );
  }

  // Dropdown button with multiple export options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn('gap-2', className)}
          disabled={isExporting || !sopId}
        >
          {getButtonIcon()}
          {getButtonText()}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          Export Options
          {sopName && (
            <div className="text-xs text-muted-foreground font-normal truncate">
              {sopName}
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableExportFormats.map((format) => {
          const IconComponent = format.icon;
          const isCurrentlyExporting = isExporting && lastExportedFormat === format.id;
          const wasLastExported = exportSuccess && lastExportedFormat === format.id;
          const hasError = exportError && lastExportedFormat === format.id;
          
          return (
            <DropdownMenuItem
              key={format.id}
              onClick={() => handleExport(format.id)}
              disabled={isExporting}
              className="flex items-start gap-3 py-3"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="p-1.5 rounded bg-primary/10 flex-shrink-0">
                  {isCurrentlyExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <IconComponent className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{format.label}</span>
                    {format.recommended && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {format.description}
                  </p>
                </div>
              </div>
              
              {/* Status indicators */}
              <div className="flex-shrink-0">
                {wasLastExported && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {hasError && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => handleExport('package')}
          disabled={isExporting}
          className="flex items-center gap-3 py-3 font-medium bg-primary/5"
        >
          <div className="p-1.5 rounded bg-primary/20">
            <Archive className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <span className="text-sm">Download All Formats</span>
            <p className="text-xs text-muted-foreground">
              Complete package with implementation guide
            </p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SopExportButton;
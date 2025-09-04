import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  Download, 
  FileText, 
  FileJson, 
  FileType,
  Archive,
  GitBranch,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useTerminology } from '../hooks/useSopDashboardData';
import { DashboardWidgetProps } from '../types/dashboard.types';

interface ExportFormat {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  mimeType: string;
  extension: string;
  recommended?: boolean;
}

interface SopExportWidgetProps extends DashboardWidgetProps {
  sopId?: string;
  onExport?: (format: string, sopId: string) => Promise<void>;
  availableFormats?: string[];
}

export const SopExportWidget: React.FC<SopExportWidgetProps> = ({ 
  title, 
  isLoading, 
  error, 
  className,
  sopId,
  onExport,
  availableFormats = ['json', 'text', 'pdf', 'package', 'flow']
}) => {
  const { translate } = useTerminology();
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<Record<string, 'success' | 'error' | null>>({});

  const exportFormats: ExportFormat[] = [
    {
      id: 'json',
      label: translate('JSON Export'),
      description: translate('Machine-readable SOP definition'),
      icon: FileJson,
      mimeType: 'application/json',
      extension: 'json',
      recommended: true
    },
    {
      id: 'text',
      label: translate('Text Export'),
      description: translate('Plain text documentation'),
      icon: FileText,
      mimeType: 'text/plain',
      extension: 'txt'
    },
    {
      id: 'pdf',
      label: translate('PDF Export'),
      description: translate('Professional documentation format'),
      icon: FileType,
      mimeType: 'application/pdf',
      extension: 'pdf',
      recommended: true
    },
    {
      id: 'package',
      label: translate('Client Package'),
      description: translate('Complete implementation package'),
      icon: Archive,
      mimeType: 'application/zip',
      extension: 'zip'
    },
    {
      id: 'flow',
      label: translate('Activepieces Flow'),
      description: translate('Ready-to-import flow definition'),
      icon: GitBranch,
      mimeType: 'application/json',
      extension: 'json'
    }
  ];

  const availableExportFormats = exportFormats.filter(format => 
    availableFormats.includes(format.id)
  );

  const handleExport = async (format: string) => {
    if (!sopId || !onExport) {
      console.error('Missing sopId or onExport handler');
      return;
    }

    try {
      setExportingFormat(format);
      setExportStatus(prev => ({ ...prev, [format]: null }));
      
      await onExport(format, sopId);
      
      setExportStatus(prev => ({ ...prev, [format]: 'success' }));
      
      // Clear success status after 3 seconds
      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, [format]: null }));
      }, 3000);
    } catch (error) {
      console.error(`Export failed for format ${format}:`, error);
      setExportStatus(prev => ({ ...prev, [format]: 'error' }));
      
      // Clear error status after 5 seconds
      setTimeout(() => {
        setExportStatus(prev => ({ ...prev, [format]: null }));
      }, 5000);
    } finally {
      setExportingFormat(null);
    }
  };

  const getStatusIcon = (format: string) => {
    const status = exportStatus[format];
    if (exportingFormat === format) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    if (status === 'success') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (status === 'error') {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className={cn('h-fit', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-9 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('h-fit', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {translate(title || 'Export SOP')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{translate('Export functionality unavailable')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-blue-600" />
          {translate(title || 'Export SOP')}
        </CardTitle>
        {sopId && (
          <p className="text-sm text-muted-foreground">
            {translate('Export SOP in various formats for sharing and implementation')}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        {!sopId ? (
          <div className="text-center py-6 text-muted-foreground">
            <Download className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{translate('Select a SOP to enable export options')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableExportFormats.map((format) => {
              const IconComponent = format.icon;
              const isExporting = exportingFormat === format.id;
              const status = exportStatus[format.id];
              
              return (
                <div 
                  key={format.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{format.label}</h4>
                        {format.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            {translate('Recommended')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {format.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(format.id)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExport(format.id)}
                      disabled={isExporting || !sopId}
                      className="min-w-[80px]"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {translate('Exporting...')}
                        </>
                      ) : status === 'success' ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          {translate('Downloaded')}
                        </>
                      ) : status === 'error' ? (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                          {translate('Retry')}
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          {translate('Export')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {/* Bulk export option */}
            <div className="mt-6 pt-4 border-t">
              <Button
                variant="default"
                className="w-full"
                onClick={() => handleExport('package')}
                disabled={exportingFormat !== null}
              >
                <Archive className="h-4 w-4 mr-2" />
                {translate('Download Complete Package')}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {translate('Includes all formats plus implementation guide')}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
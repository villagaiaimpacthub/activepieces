import { useState, useCallback } from 'react';

export interface SopExportOptions {
  includeHistory?: boolean;
  includeMetadata?: boolean;
}

export interface SopExportHook {
  exportSop: (sopId: string, format: string, options?: SopExportOptions) => Promise<void>;
  isExporting: boolean;
  exportError: string | null;
  exportSuccess: boolean;
}

export const useSopExport = (): SopExportHook => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const downloadFile = useCallback((blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up object URL
    window.URL.revokeObjectURL(url);
  }, []);

  const exportSop = useCallback(async (
    sopId: string, 
    format: string, 
    options: SopExportOptions = {}
  ) => {
    if (!sopId || !format) {
      setExportError('Missing SOP ID or export format');
      return;
    }

    try {
      setIsExporting(true);
      setExportError(null);
      setExportSuccess(false);

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (options.includeHistory !== undefined) {
        queryParams.set('includeHistory', options.includeHistory.toString());
      }
      if (options.includeMetadata !== undefined) {
        queryParams.set('includeMetadata', options.includeMetadata.toString());
      }

      // Construct API URL
      const baseUrl = process.env.REACT_APP_API_BASE_URL || '/api';
      const queryString = queryParams.toString();
      const url = `${baseUrl}/sops/${sopId}/export/${format}${queryString ? `?${queryString}` : ''}`;

      console.log(`Requesting SOP export: ${url}`);

      // Make the API request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Export failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      // Get content type and disposition for filename
      const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
      const contentDisposition = response.headers.get('Content-Disposition');
      
      // Extract filename from Content-Disposition header or create default
      let filename = `sop_${sopId}_${Date.now()}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      } else {
        // Add appropriate extension based on format
        const extensions: Record<string, string> = {
          json: '.json',
          text: '.txt',
          pdf: '.pdf',
          package: '.zip',
          flow: '.json'
        };
        filename += extensions[format] || '';
      }

      // Get response as blob and download
      const blob = await response.blob();
      const finalBlob = new Blob([blob], { type: contentType });
      
      downloadFile(finalBlob, filename);
      
      setExportSuccess(true);
      
      // Clear success status after 3 seconds
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);

      console.log(`SOP exported successfully: ${filename}`);
      
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed');
      
      // Clear error after 10 seconds
      setTimeout(() => {
        setExportError(null);
      }, 10000);
    } finally {
      setIsExporting(false);
    }
  }, [downloadFile]);

  return {
    exportSop,
    isExporting,
    exportError,
    exportSuccess
  };
};

export default useSopExport;
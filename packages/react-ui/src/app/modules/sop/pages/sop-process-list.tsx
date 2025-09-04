/**
 * SOP Process List Page
 * Display and manage Standard Operating Procedures
 */

import React, { useState, useEffect } from 'react';
import { SOPBreadcrumbs, SOPQuickActions } from '@/app/components/sidebar/sop-navigation-extension';
import { useTerminologyContext } from '@/lib/terminology/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  AlertCircle, 
  RefreshCw,
  Loader2
} from 'lucide-react';

interface SopListState {
  isLoading: boolean;
  error: string | null;
  data: any[];
}

export default function SOPProcessList() {
  // Get terminology if available
  let translate = (text: string) => text;
  try {
    const terminologyContext = useTerminologyContext();
    translate = terminologyContext.translate;
  } catch {
    // Terminology not available, use fallback
  }

  const [state, setState] = useState<SopListState>({
    isLoading: true,
    error: null,
    data: []
  });
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadSopList();
  }, []);

  const loadSopList = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
      }
      
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        data: [], // No data for now
        error: null 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load SOPs'
      }));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadSopList(true);
  };

  const renderSkeletonList = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderErrorState = () => (
    <Card className="border-red-200">
      <CardContent className="p-12 text-center">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-900 mb-2">
          {translate('Failed to Load SOPs')}
        </h3>
        <p className="text-red-600 mb-6">
          {state.error || translate('An error occurred while loading the SOP list.')}
        </p>
        <Button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isRefreshing ? translate('Retrying...') : translate('Retry')}
        </Button>
      </CardContent>
    </Card>
  );

  const renderEmptyState = () => (
    <Card>
      <CardContent className="p-12 text-center">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {translate('No SOPs Found')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {translate('Get started by creating your first Standard Operating Procedure.')}
        </p>
        <Button className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {translate('Create SOP')}
        </Button>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    if (state.isLoading && !isRefreshing) {
      return renderSkeletonList();
    }
    
    if (state.error) {
      return renderErrorState();
    }
    
    if (state.data.length === 0) {
      return renderEmptyState();
    }
    
    // This would render actual SOP list when data is available
    return renderEmptyState();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <SOPBreadcrumbs enableSOPTerminology={true} />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {translate('Standard Operating Procedures')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {translate('Manage and monitor your organization\'s standard operating procedures')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={state.isLoading || isRefreshing}
            className="inline-flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", (state.isLoading || isRefreshing) && "animate-spin")} />
            {translate('Refresh')}
          </Button>
          <Button className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {translate('Create SOP')}
          </Button>
        </div>
      </div>

      <div>
        <SOPQuickActions enableSOPTerminology={true} />
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={translate('Search SOPs...')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={state.isLoading}
              />
            </div>
            <Button variant="outline" className="inline-flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {translate('Filter')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading overlay for refresh */}
      <div className="relative">
        {isRefreshing && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {translate('Refreshing SOP list...')}
            </div>
          </div>
        )}
        
        {/* Main content */}
        {renderContent()}
      </div>
    </div>
  );
}
/**
 * Widget Container - Base container component for dashboard widgets
 * Provides consistent styling, error handling, and common widget functionality
 */

import React, { useState, useEffect, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Settings, Maximize2, Minimize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeSystem } from '@/components/theme/theme-system-provider';

export interface WidgetConfig {
  id: string;
  title: string;
  sopTitle?: string;
  description?: string;
  refreshInterval?: number;
  allowRefresh?: boolean;
  allowSettings?: boolean;
  allowMaximize?: boolean;
  allowRemove?: boolean;
  showHeader?: boolean;
  showBorder?: boolean;
  className?: string;
}

export interface WidgetContainerProps {
  config: WidgetConfig;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onSettings?: () => void;
  onMaximize?: () => void;
  onMinimize?: () => void;
  onRemove?: () => void;
  children: ReactNode;
  className?: string;
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({
  config,
  loading = false,
  error = null,
  onRefresh,
  onSettings,
  onMaximize,
  onMinimize,
  onRemove,
  children,
  className
}) => {
  const { isCustomBranded } = useThemeSystem();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const {
    id,
    title,
    sopTitle,
    description,
    refreshInterval,
    allowRefresh = true,
    allowSettings = true,
    allowMaximize = true,
    allowRemove = false,
    showHeader = true,
    showBorder = true
  } = config;

  // Auto-refresh functionality
  useEffect(() => {
    if (!refreshInterval || !onRefresh) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, onRefresh]);

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Widget refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastRefresh = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">
            {isCustomBranded && sopTitle ? sopTitle : title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
          {lastRefresh && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {formatLastRefresh(lastRefresh)}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {allowRefresh && onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              title="Refresh Widget"
            >
              <RefreshCw className={cn("h-4 w-4", (isRefreshing || loading) && "animate-spin")} />
            </button>
          )}
          
          {allowSettings && onSettings && (
            <button
              onClick={onSettings}
              className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Widget Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
          
          {allowMaximize && onMaximize && (
            <button
              onClick={onMaximize}
              className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Maximize Widget"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}
          
          {allowRemove && onRemove && (
            <button
              onClick={onRemove}
              className="p-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Remove Widget"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mb-3" />
          <h3 className="font-medium text-foreground mb-2">Widget Error</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          {allowRefresh && onRefresh && (
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm"
            >
              Try Again
            </button>
          )}
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">Loading widget...</p>
          </div>
        </div>
      );
    }

    return children;
  };

  return (
    <div
      className={cn(
        "bg-card rounded-lg shadow-sm overflow-hidden",
        showBorder && "border",
        className,
        config.className
      )}
      data-widget-id={id}
    >
      {renderHeader()}
      <div className="h-full overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default WidgetContainer;
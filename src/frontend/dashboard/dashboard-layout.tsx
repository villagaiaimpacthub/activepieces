/**
 * Dashboard Layout - Responsive grid layout for dashboard widgets
 * Supports drag-and-drop, resizing, and responsive breakpoints
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { Plus, Grip, X, Settings as SettingsIcon, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardConfig, DashboardWidget } from './sop-dashboard';
import { useThemeSystem } from '@/components/theme/theme-system-provider';

// Import CSS for react-grid-layout (normally this would be in global CSS)
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface LayoutConfig {
  breakpoints: { lg: number; md: number; sm: number; xs: number };
  cols: { lg: number; md: number; sm: number; xs: number };
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number];
  isDraggable: boolean;
  isResizable: boolean;
  autoSize: boolean;
}

export interface DashboardLayoutProps {
  config: DashboardConfig;
  editMode?: boolean;
  onConfigChange?: (config: DashboardConfig) => void;
  onWidgetAction?: (widgetId: string, action: string, data?: any) => void;
  className?: string;
  children?: React.ReactNode;
}

const defaultLayoutConfig: LayoutConfig = {
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480 },
  cols: { lg: 12, md: 10, sm: 6, xs: 2 },
  rowHeight: 60,
  margin: [16, 16],
  containerPadding: [16, 16],
  isDraggable: true,
  isResizable: true,
  autoSize: true
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  config,
  editMode = false,
  onConfigChange,
  onWidgetAction,
  className,
  children
}) => {
  const { getThemeColor, isCustomBranded } = useThemeSystem();
  const [layouts, setLayouts] = useState<Record<string, Layout[]>>({});
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
  const [compactType, setCompactType] = useState<'vertical' | 'horizontal' | null>('vertical');
  const [mounted, setMounted] = useState(false);

  // Initialize layouts from config
  useEffect(() => {
    const gridLayouts: Record<string, Layout[]> = {};
    
    ['lg', 'md', 'sm', 'xs'].forEach(breakpoint => {
      gridLayouts[breakpoint] = config.widgets.map(widget => ({
        i: widget.id,
        x: widget.position.x,
        y: widget.position.y,
        w: widget.position.w,
        h: widget.position.h,
        minW: 2,
        minH: 2,
        maxW: 12,
        maxH: 12,
        isDraggable: config.customization.allowReorder && editMode,
        isResizable: config.customization.allowResize && editMode
      }));
    });

    setLayouts(gridLayouts);
  }, [config.widgets, config.customization, editMode]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLayoutChange = useCallback(
    (layout: Layout[], allLayouts: Record<string, Layout[]>) => {
      setLayouts(allLayouts);

      if (onConfigChange) {
        // Update widget positions in config
        const updatedWidgets = config.widgets.map(widget => {
          const layoutItem = layout.find(item => item.i === widget.id);
          if (layoutItem) {
            return {
              ...widget,
              position: {
                x: layoutItem.x,
                y: layoutItem.y,
                w: layoutItem.w,
                h: layoutItem.h
              }
            };
          }
          return widget;
        });

        onConfigChange({
          ...config,
          widgets: updatedWidgets
        });
      }
    },
    [config, onConfigChange]
  );

  const handleBreakpointChange = useCallback((breakpoint: string) => {
    setCurrentBreakpoint(breakpoint);
  }, []);

  const handleWidgetAction = (widgetId: string, action: string, data?: any) => {
    switch (action) {
      case 'remove':
        if (onConfigChange) {
          onConfigChange({
            ...config,
            widgets: config.widgets.filter(w => w.id !== widgetId)
          });
        }
        break;
      case 'settings':
        onWidgetAction?.(widgetId, 'open-settings', data);
        break;
      case 'maximize':
        onWidgetAction?.(widgetId, 'maximize', data);
        break;
      case 'minimize':
        onWidgetAction?.(widgetId, 'minimize', data);
        break;
      default:
        onWidgetAction?.(widgetId, action, data);
    }
  };

  const renderWidgetControls = (widget: DashboardWidget) => (
    <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      {editMode && (
        <>
          <button
            onClick={() => handleWidgetAction(widget.id, 'settings')}
            className="p-1 rounded bg-background/80 hover:bg-background border text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Widget Settings"
          >
            <SettingsIcon className="h-3 w-3" />
          </button>
          <button
            onClick={() => handleWidgetAction(widget.id, 'maximize')}
            className="p-1 rounded bg-background/80 hover:bg-background border text-xs text-muted-foreground hover:text-foreground transition-colors"
            title="Maximize Widget"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
          <button
            onClick={() => handleWidgetAction(widget.id, 'remove')}
            className="p-1 rounded bg-destructive/10 hover:bg-destructive border text-xs text-destructive hover:text-destructive-foreground transition-colors"
            title="Remove Widget"
          >
            <X className="h-3 w-3" />
          </button>
        </>
      )}
      <div className="drag-handle p-1 rounded bg-background/80 hover:bg-background border text-xs text-muted-foreground hover:text-foreground transition-colors cursor-move">
        <Grip className="h-3 w-3" />
      </div>
    </div>
  );

  const renderWidget = (widget: DashboardWidget) => (
    <div
      key={widget.id}
      className={cn(
        "group relative border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow",
        editMode && "ring-2 ring-transparent hover:ring-primary/20",
        !editMode && "focus-within:ring-2 focus-within:ring-primary/20"
      )}
      style={{
        backgroundColor: getThemeColor('ui.panel.background'),
        borderColor: getThemeColor('ui.panel.border')
      }}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div>
          <h3 className="font-medium text-sm text-foreground">
            {isCustomBranded && widget.sopName ? widget.sopName : widget.name}
          </h3>
          {widget.category && (
            <span className="text-xs text-muted-foreground capitalize">
              {widget.category}
            </span>
          )}
        </div>
        {renderWidgetControls(widget)}
      </div>

      {/* Widget Content */}
      <div className="p-3 h-full overflow-hidden">
        {widget.component ? (
          <widget.component
            {...(widget.props || {})}
            onActionClick={(action: string, data?: any) => 
              handleWidgetAction(widget.id, action, data)
            }
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Widget not configured</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const addWidgetPlaceholder = (
    <div
      className={cn(
        "border-2 border-dashed border-muted-foreground/30 rounded-lg",
        "flex items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors",
        "cursor-pointer group"
      )}
      onClick={() => onWidgetAction?.('add-widget', 'open-widget-picker')}
    >
      <div className="text-center text-muted-foreground group-hover:text-foreground transition-colors">
        <Plus className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm font-medium">Add Widget</p>
        <p className="text-xs">Click to add a new widget</p>
      </div>
    </div>
  );

  if (!mounted) {
    return (
      <div className={cn("flex items-center justify-center h-full", className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn("h-full overflow-auto", className)}>
      <div className="p-4">
        {/* Layout Controls */}
        {editMode && (
          <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg border">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Edit Mode</span>
              <div className="flex items-center space-x-2">
                <label className="text-xs text-muted-foreground">Compact:</label>
                <select
                  value={compactType || 'none'}
                  onChange={(e) => setCompactType(e.target.value === 'none' ? null : e.target.value as any)}
                  className="text-xs border rounded px-2 py-1 bg-background"
                >
                  <option value="vertical">Vertical</option>
                  <option value="horizontal">Horizontal</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">
                Breakpoint: {currentBreakpoint.toUpperCase()}
              </span>
              <button
                onClick={() => onWidgetAction?.('add-widget', 'open-widget-picker')}
                className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
              >
                Add Widget
              </button>
            </div>
          </div>
        )}

        {/* Responsive Grid Layout */}
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          onLayoutChange={handleLayoutChange}
          onBreakpointChange={handleBreakpointChange}
          {...defaultLayoutConfig}
          isDraggable={config.customization.allowReorder && editMode}
          isResizable={config.customization.allowResize && editMode}
          compactType={compactType}
          preventCollision={false}
          dragHandleClassName="drag-handle"
        >
          {config.widgets.map(renderWidget)}
          
          {/* Add Widget Placeholder (only in edit mode) */}
          {editMode && (
            <div key="add-widget-placeholder" data-grid={{ x: 0, y: 100, w: 4, h: 3, static: true }}>
              {addWidgetPlaceholder}
            </div>
          )}
        </ResponsiveGridLayout>

        {/* Empty State */}
        {config.widgets.length === 0 && !editMode && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="bg-muted/50 rounded-full p-6 mb-4">
              <Plus className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No widgets configured
            </h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Your dashboard is empty. {config.customization.allowCustomWidgets 
                ? 'Add some widgets to get started.' 
                : 'Contact your administrator to configure widgets.'
              }
            </p>
            {config.customization.allowCustomWidgets && (
              <button
                onClick={() => onWidgetAction?.('add-widget', 'open-widget-picker')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Add Your First Widget
              </button>
            )}
          </div>
        )}
      </div>

      {/* Additional children (like modals, overlays) */}
      {children}
    </div>
  );
};

export default DashboardLayout;
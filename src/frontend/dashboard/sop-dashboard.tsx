/**
 * SOPDashboard - Main comprehensive dashboard component
 * Integrates all Phase 2 components into unified SOP management interface
 */

import React, { useState, useEffect } from 'react';
import { Grid, BarChart, Users, Settings, Plus, Filter, Search, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import all Phase 2 components
import { 
  NavigationProvider,
  SOPNavigation,
  ProcessNavigation,
  SOPBreadcrumbs,
  QuickActions,
  DashboardQuickActions,
  useNavigation,
  navigationUtils
} from '@/components/navigation';
import { useThemeSystem } from '@/components/theme/theme-system-provider';

// Dashboard-specific imports
import DashboardLayout from './dashboard-layout';
import ProcessOverviewWidget from './widgets/process-overview-widget';
import AnalyticsDashboard from './analytics-dashboard';
import SOPManagementPanel from './sop-management-panel';
import TeamCollaborationInterface from './team-collaboration-interface';
import QuickActionsCenter from './quick-actions-center';
import { useDashboard } from './dashboard-provider';

export interface DashboardWidget {
  id: string;
  type: string;
  name: string;
  sopName?: string;
  component: React.ComponentType<any>;
  position: { x: number; y: number; w: number; h: number };
  props?: Record<string, any>;
  permissions?: string[];
  category?: 'overview' | 'analytics' | 'management' | 'collaboration' | 'actions' | 'data';
}

export interface DashboardConfig {
  layout: 'grid' | 'masonry' | 'tabs';
  widgets: DashboardWidget[];
  customization: {
    allowReorder: boolean;
    allowResize: boolean;
    allowCustomWidgets: boolean;
    theme?: string;
    density?: 'compact' | 'comfortable' | 'spacious';
  };
  filters?: {
    showSearch: boolean;
    showFilters: boolean;
    defaultFilters?: Record<string, any>;
  };
}

export interface SOPDashboardProps {
  config?: Partial<DashboardConfig>;
  userRole?: 'admin' | 'manager' | 'user';
  initialView?: 'dashboard' | 'analytics' | 'management';
  onConfigChange?: (config: DashboardConfig) => void;
  onWidgetAction?: (widgetId: string, action: string, data?: any) => void;
  className?: string;
}

const SOPDashboard: React.FC<SOPDashboardProps> = ({
  config: propConfig,
  userRole = 'user',
  initialView = 'dashboard',
  onConfigChange,
  onWidgetAction,
  className
}) => {
  const { 
    currentTheme, 
    isCustomBranded, 
    getThemeColor,
    switchTheme,
    toggleCustomBranding 
  } = useThemeSystem();
  
  const { 
    state: navState, 
    navigateTo, 
    setCurrentPath 
  } = useNavigation();
  
  const {
    dashboardConfig,
    updateDashboardConfig,
    resetDashboard,
    exportConfiguration,
    importConfiguration
  } = useDashboard();

  const [currentView, setCurrentView] = useState(initialView);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  // Merge prop config with context config
  const effectiveConfig: DashboardConfig = {
    layout: 'grid',
    widgets: [],
    customization: {
      allowReorder: true,
      allowResize: true,
      allowCustomWidgets: false,
      density: 'comfortable'
    },
    filters: {
      showSearch: true,
      showFilters: true
    },
    ...dashboardConfig,
    ...propConfig
  };

  // Handle view changes
  const handleViewChange = (view: typeof currentView) => {
    setCurrentView(view);
    setCurrentPath(`/dashboard/${view}`);
    
    // Update navigation breadcrumbs
    const breadcrumbs = navigationUtils.generateSOPBreadcrumbs(`/dashboard/${view}`);
    // Breadcrumbs are handled by SOPBreadcrumbs component automatically
  };

  // Handle dashboard actions
  const handleDashboardAction = (actionId: string, data?: any) => {
    switch (actionId) {
      case 'create-sop':
        navigateTo('/processes/new');
        break;
      case 'import-sop':
        // Handle SOP import
        console.log('Importing SOP');
        break;
      case 'manage-team':
        navigateTo('/team');
        break;
      case 'view-analytics':
        setCurrentView('analytics');
        break;
      case 'toggle-edit-mode':
        setIsEditMode(!isEditMode);
        break;
      case 'refresh-dashboard':
        setLoading(true);
        setTimeout(() => setLoading(false), 1000); // Simulate refresh
        break;
      case 'export-config':
        const config = exportConfiguration();
        console.log('Exported configuration:', config);
        break;
      case 'reset-dashboard':
        resetDashboard();
        break;
      default:
        onWidgetAction?.(actionId, 'dashboard-action', data);
    }
  };

  // Widget action handler
  const handleWidgetAction = (widgetId: string, action: string, data?: any) => {
    console.log(`Widget ${widgetId} action: ${action}`, data);
    onWidgetAction?.(widgetId, action, data);
  };

  // Filter handling
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Apply search filter logic here
  };

  const handleFilterChange = (filterKey: string, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  // Update config when changes occur
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(effectiveConfig);
    }
  }, [effectiveConfig, onConfigChange]);

  const renderDashboardHeader = () => (
    <div className="flex items-center justify-between p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isCustomBranded ? 'SOP Management Dashboard' : 'Workflow Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {isCustomBranded 
              ? 'Comprehensive Standard Operating Procedure management' 
              : 'Manage your workflows and processes'
            }
          </p>
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg border bg-background p-1">
          <button
            onClick={() => handleViewChange('dashboard')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              currentView === 'dashboard'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Grid className="h-4 w-4 mr-2 inline" />
            Dashboard
          </button>
          <button
            onClick={() => handleViewChange('analytics')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              currentView === 'analytics'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <BarChart className="h-4 w-4 mr-2 inline" />
            Analytics
          </button>
          <button
            onClick={() => handleViewChange('management')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              currentView === 'management'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Settings className="h-4 w-4 mr-2 inline" />
            Management
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Search */}
        {effectiveConfig.filters?.showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder={isCustomBranded ? "Search SOPs..." : "Search workflows..."}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}

        {/* Quick actions */}
        <DashboardQuickActions
          onActionClick={handleDashboardAction}
          showLabels={false}
          size="sm"
        />

        {/* Dashboard controls */}
        <div className="flex rounded-lg border bg-background">
          <button
            onClick={() => handleDashboardAction('refresh-dashboard')}
            disabled={loading}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-l-md transition-colors"
            title="Refresh Dashboard"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
          <button
            onClick={() => handleDashboardAction('toggle-edit-mode')}
            className={cn(
              "p-2 transition-colors border-x",
              isEditMode
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title="Edit Dashboard Layout"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentView('management')}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-r-md transition-colors"
            title="Dashboard Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderDashboardContent = () => {
    switch (currentView) {
      case 'analytics':
        return (
          <AnalyticsDashboard
            config={{
              showProcessMetrics: true,
              showTeamMetrics: userRole !== 'user',
              showComplianceMetrics: userRole === 'admin',
              timeRange: '30d'
            }}
            onActionClick={handleDashboardAction}
          />
        );
      
      case 'management':
        return (
          <SOPManagementPanel
            userRole={userRole}
            config={{
              showBulkActions: userRole !== 'user',
              showAdvancedSettings: userRole === 'admin',
              enableTemplateManagement: true
            }}
            onActionClick={handleDashboardAction}
          />
        );
      
      case 'dashboard':
      default:
        return (
          <DashboardLayout
            config={effectiveConfig}
            editMode={isEditMode}
            onConfigChange={(newConfig) => {
              updateDashboardConfig(newConfig);
              onConfigChange?.(newConfig);
            }}
            onWidgetAction={handleWidgetAction}
            className="flex-1"
          >
            {/* Render widgets based on configuration */}
            {effectiveConfig.widgets.map((widget) => (
              <div key={widget.id} className="dashboard-widget">
                {renderWidget(widget)}
              </div>
            ))}
          </DashboardLayout>
        );
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    const commonProps = {
      id: widget.id,
      onActionClick: (action: string, data?: any) => handleWidgetAction(widget.id, action, data),
      config: widget.props || {},
      userRole
    };

    switch (widget.type) {
      case 'process-overview':
        return <ProcessOverviewWidget {...commonProps} />;
      case 'analytics':
        return <AnalyticsDashboard {...commonProps} />;
      case 'sop-management':
        return <SOPManagementPanel {...commonProps} />;
      case 'team-collaboration':
        return <TeamCollaborationInterface {...commonProps} />;
      case 'quick-actions':
        return <QuickActionsCenter {...commonProps} />;
      default:
        return (
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Widget type "{widget.type}" not found
            </p>
          </div>
        );
    }
  };

  return (
    <div className={cn("flex flex-col h-screen bg-background", className)}>
      {/* Dashboard Header */}
      {renderDashboardHeader()}

      {/* Breadcrumbs */}
      <div className="px-6 py-2 border-b bg-muted/30">
        <SOPBreadcrumbs 
          showHome={true}
          maxItems={4}
          separator="/"
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="flex-1 overflow-hidden">
        {renderDashboardContent()}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-6 py-2 border-t bg-muted/30 text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>
            Theme: {currentTheme.name} {isCustomBranded ? '(SOP Branding)' : ''}
          </span>
          <span>•</span>
          <span>
            View: {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
          </span>
          {searchQuery && (
            <>
              <span>•</span>
              <span>Search: "{searchQuery}"</span>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span>Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
          {Object.keys(activeFilters).length > 0 && (
            <>
              <span>•</span>
              <span>{Object.keys(activeFilters).length} filters active</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SOPDashboard;
/**
 * SOP Dashboard System - Centralized exports
 * Complete dashboard system that integrates all Phase 2 components into unified SOP management interface
 */

// Main dashboard components
export { default as SOPDashboard } from './sop-dashboard';
export type { SOPDashboardProps, DashboardConfig, DashboardWidget } from './sop-dashboard';

export { default as DashboardLayout } from './dashboard-layout';
export type { DashboardLayoutProps, LayoutConfig } from './dashboard-layout';

export { default as ProcessOverviewWidget } from './widgets/process-overview-widget';
export type { ProcessOverviewWidgetProps, ProcessMetrics } from './widgets/process-overview-widget';

export { default as AnalyticsDashboard } from './analytics-dashboard';
export type { AnalyticsDashboardProps, AnalyticsConfig } from './analytics-dashboard';

export { default as SOPManagementPanel } from './sop-management-panel';
export type { SOPManagementPanelProps, ManagementAction } from './sop-management-panel';

export { default as TeamCollaborationInterface } from './team-collaboration-interface';
export type { TeamCollaborationInterfaceProps, CollaborationFeature } from './team-collaboration-interface';

export { default as DashboardProvider, useDashboard } from './dashboard-provider';
export type { DashboardProviderProps, DashboardContextType } from './dashboard-provider';

// Widget system
export { default as WidgetContainer } from './widgets/widget-container';
export type { WidgetContainerProps, WidgetConfig } from './widgets/widget-container';

export { default as MetricsWidget } from './widgets/metrics-widget';
export type { MetricsWidgetProps, MetricConfig } from './widgets/metrics-widget';

export { default as ProcessTableWidget } from './widgets/process-table-widget';
export type { ProcessTableWidgetProps, ProcessTableConfig } from './widgets/process-table-widget';

export { default as QuickActionsCenter } from './quick-actions-center';
export type { QuickActionsCenterProps, ActionGroup } from './quick-actions-center';

// Dashboard utilities
export const dashboardUtils = {
  /**
   * Generate dashboard configuration based on user role
   */
  generateDashboardConfig: (userRole: string, preferences?: any) => {
    const baseConfig = {
      layout: 'grid',
      widgets: [],
      customization: {
        allowReorder: true,
        allowResize: true,
        allowCustomWidgets: false
      }
    };

    switch (userRole) {
      case 'admin':
        return {
          ...baseConfig,
          widgets: [
            { id: 'overview', type: 'process-overview', position: { x: 0, y: 0, w: 12, h: 4 } },
            { id: 'analytics', type: 'analytics', position: { x: 0, y: 4, w: 8, h: 6 } },
            { id: 'team', type: 'team-collaboration', position: { x: 8, y: 4, w: 4, h: 6 } },
            { id: 'management', type: 'sop-management', position: { x: 0, y: 10, w: 12, h: 6 } }
          ],
          customization: { ...baseConfig.customization, allowCustomWidgets: true }
        };
      
      case 'manager':
        return {
          ...baseConfig,
          widgets: [
            { id: 'overview', type: 'process-overview', position: { x: 0, y: 0, w: 8, h: 4 } },
            { id: 'quick-actions', type: 'quick-actions', position: { x: 8, y: 0, w: 4, h: 4 } },
            { id: 'team', type: 'team-collaboration', position: { x: 0, y: 4, w: 6, h: 6 } },
            { id: 'processes', type: 'process-table', position: { x: 6, y: 4, w: 6, h: 6 } }
          ]
        };
      
      case 'user':
      default:
        return {
          ...baseConfig,
          widgets: [
            { id: 'my-processes', type: 'process-overview', position: { x: 0, y: 0, w: 8, h: 4 } },
            { id: 'quick-actions', type: 'quick-actions', position: { x: 8, y: 0, w: 4, h: 4 } },
            { id: 'recent', type: 'process-table', position: { x: 0, y: 4, w: 12, h: 6 } }
          ],
          customization: { ...baseConfig.customization, allowReorder: false, allowResize: false }
        };
    }
  },

  /**
   * Get default widget configurations
   */
  getDefaultWidgets: () => [
    {
      id: 'process-overview',
      name: 'Process Overview',
      sopName: 'SOP Overview',
      description: 'Overview of all SOP processes',
      component: 'ProcessOverviewWidget',
      defaultSize: { w: 12, h: 4 },
      minSize: { w: 6, h: 3 },
      category: 'overview'
    },
    {
      id: 'analytics',
      name: 'Analytics Dashboard',
      sopName: 'SOP Analytics',
      description: 'Process analytics and performance metrics',
      component: 'AnalyticsDashboard',
      defaultSize: { w: 8, h: 6 },
      minSize: { w: 4, h: 4 },
      category: 'analytics'
    },
    {
      id: 'team-collaboration',
      name: 'Team Collaboration',
      sopName: 'Stakeholder Collaboration',
      description: 'Team management and collaboration tools',
      component: 'TeamCollaborationInterface',
      defaultSize: { w: 4, h: 6 },
      minSize: { w: 4, h: 4 },
      category: 'collaboration'
    },
    {
      id: 'sop-management',
      name: 'SOP Management',
      sopName: 'Process Management',
      description: 'Comprehensive SOP management interface',
      component: 'SOPManagementPanel',
      defaultSize: { w: 12, h: 6 },
      minSize: { w: 6, h: 4 },
      category: 'management'
    },
    {
      id: 'quick-actions',
      name: 'Quick Actions',
      sopName: 'Process Actions',
      description: 'Quick access to common SOP operations',
      component: 'QuickActionsCenter',
      defaultSize: { w: 4, h: 4 },
      minSize: { w: 3, h: 3 },
      category: 'actions'
    },
    {
      id: 'process-table',
      name: 'Process List',
      sopName: 'SOP List',
      description: 'Tabular view of processes with filters',
      component: 'ProcessTableWidget',
      defaultSize: { w: 12, h: 6 },
      minSize: { w: 6, h: 4 },
      category: 'data'
    }
  ],

  /**
   * Calculate optimal layout based on screen size
   */
  calculateOptimalLayout: (screenWidth: number, screenHeight: number) => {
    if (screenWidth < 768) {
      // Mobile layout - single column
      return {
        columns: 1,
        rowHeight: 120,
        margin: [8, 8],
        containerPadding: [8, 8]
      };
    } else if (screenWidth < 1024) {
      // Tablet layout - 2-3 columns
      return {
        columns: 8,
        rowHeight: 80,
        margin: [12, 12],
        containerPadding: [12, 12]
      };
    } else {
      // Desktop layout - full grid
      return {
        columns: 12,
        rowHeight: 60,
        margin: [16, 16],
        containerPadding: [16, 16]
      };
    }
  },

  /**
   * Validate dashboard configuration
   */
  validateDashboardConfig: (config: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!config.layout) {
      errors.push('Layout type is required');
    }

    if (!Array.isArray(config.widgets)) {
      errors.push('Widgets must be an array');
    } else {
      config.widgets.forEach((widget: any, index: number) => {
        if (!widget.id) {
          errors.push(`Widget at index ${index} missing required id`);
        }
        if (!widget.type) {
          errors.push(`Widget at index ${index} missing required type`);
        }
        if (!widget.position) {
          errors.push(`Widget at index ${index} missing required position`);
        }
      });
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Export dashboard configuration
   */
  exportConfiguration: (config: any) => {
    return {
      version: '1.0',
      exported: new Date().toISOString(),
      config: config,
      metadata: {
        source: 'sop-dashboard',
        type: 'configuration'
      }
    };
  },

  /**
   * Import dashboard configuration
   */
  importConfiguration: (data: any): { success: boolean; config?: any; errors?: string[] } => {
    try {
      if (!data.config) {
        return { success: false, errors: ['Invalid configuration format'] };
      }

      const validation = dashboardUtils.validateDashboardConfig(data.config);
      if (!validation.valid) {
        return { success: false, errors: validation.errors };
      }

      return { success: true, config: data.config };
    } catch (error) {
      return { 
        success: false, 
        errors: [`Configuration import failed: ${(error as Error).message}`] 
      };
    }
  }
};

// Dashboard presets for different use cases
export const dashboardPresets = {
  /**
   * Executive dashboard - high-level metrics and KPIs
   */
  executive: {
    name: 'Executive Dashboard',
    sopName: 'Executive SOP Overview',
    description: 'High-level SOP metrics and organizational performance',
    layout: 'grid',
    widgets: [
      { id: 'kpi-overview', type: 'metrics', position: { x: 0, y: 0, w: 12, h: 3 } },
      { id: 'process-health', type: 'analytics', position: { x: 0, y: 3, w: 8, h: 5 } },
      { id: 'compliance', type: 'compliance-metrics', position: { x: 8, y: 3, w: 4, h: 5 } },
      { id: 'trend-analysis', type: 'trend-widget', position: { x: 0, y: 8, w: 12, h: 4 } }
    ]
  },

  /**
   * Operations dashboard - day-to-day process management
   */
  operations: {
    name: 'Operations Dashboard',
    sopName: 'Operations SOP Management',
    description: 'Operational SOP management and execution monitoring',
    layout: 'grid',
    widgets: [
      { id: 'active-processes', type: 'process-overview', position: { x: 0, y: 0, w: 8, h: 4 } },
      { id: 'alerts', type: 'alert-center', position: { x: 8, y: 0, w: 4, h: 4 } },
      { id: 'execution-queue', type: 'execution-queue', position: { x: 0, y: 4, w: 6, h: 6 } },
      { id: 'team-workload', type: 'team-collaboration', position: { x: 6, y: 4, w: 6, h: 6 } }
    ]
  },

  /**
   * Development dashboard - SOP creation and testing
   */
  development: {
    name: 'Development Dashboard',
    sopName: 'SOP Development Center',
    description: 'SOP creation, testing, and version management',
    layout: 'grid',
    widgets: [
      { id: 'draft-sops', type: 'draft-manager', position: { x: 0, y: 0, w: 6, h: 4 } },
      { id: 'testing-suite', type: 'test-results', position: { x: 6, y: 0, w: 6, h: 4 } },
      { id: 'version-control', type: 'version-manager', position: { x: 0, y: 4, w: 8, h: 6 } },
      { id: 'templates', type: 'template-library', position: { x: 8, y: 4, w: 4, h: 6 } }
    ]
  },

  /**
   * Minimal dashboard - essential features only
   */
  minimal: {
    name: 'Minimal Dashboard',
    sopName: 'Essential SOP View',
    description: 'Streamlined interface with essential SOP features',
    layout: 'grid',
    widgets: [
      { id: 'my-sops', type: 'process-overview', position: { x: 0, y: 0, w: 8, h: 6 } },
      { id: 'quick-create', type: 'quick-actions', position: { x: 8, y: 0, w: 4, h: 6 } }
    ]
  }
};

// Dashboard composition helpers
export const createSOPDashboard = (config: {
  preset?: keyof typeof dashboardPresets;
  userRole?: string;
  customization?: any;
}) => {
  const { preset, userRole = 'user', customization = {} } = config;
  
  let baseConfig;
  if (preset && dashboardPresets[preset]) {
    baseConfig = dashboardPresets[preset];
  } else {
    baseConfig = dashboardUtils.generateDashboardConfig(userRole);
  }
  
  return {
    DashboardProvider,
    SOPDashboard,
    DashboardLayout,
    config: { ...baseConfig, ...customization },
    utils: dashboardUtils,
    presets: dashboardPresets
  };
};
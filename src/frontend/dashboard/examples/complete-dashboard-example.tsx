/**
 * Complete Dashboard Example - Demonstrates full SOP Dashboard integration
 * Shows how all Phase 2 components work together in a complete implementation
 */

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// Import all Phase 2 components
import { ThemeSystemProvider } from '@/components/theme/theme-system-provider';
import { NavigationProvider } from '@/components/navigation';
import DashboardProvider from '../dashboard-provider';
import SOPDashboard from '../sop-dashboard';

// Import utility functions
import { dashboardUtils, dashboardPresets } from '../index';

interface CompleteDashboardExampleProps {
  userRole?: 'admin' | 'manager' | 'user';
  preset?: keyof typeof dashboardPresets;
  enableCustomBranding?: boolean;
  enableAnalytics?: boolean;
}

/**
 * Complete SOP Dashboard Implementation Example
 * 
 * This demonstrates the full integration of Phase 2 components:
 * - Theme System (GROUP D) with SOP branding
 * - Navigation Components (GROUP E) 
 * - Dashboard System (GROUP F) with all widgets
 * - Layout Components integration
 * - Terminology Service integration
 */
const CompleteDashboardExample: React.FC<CompleteDashboardExampleProps> = ({
  userRole = 'manager',
  preset = 'operations',
  enableCustomBranding = true,
  enableAnalytics = true
}) => {
  
  // Generate dashboard configuration based on user role and preset
  const dashboardConfig = preset 
    ? dashboardPresets[preset]
    : dashboardUtils.generateDashboardConfig(userRole);

  const handleDashboardAction = (action: string, data?: any) => {
    console.log(`Dashboard Action: ${action}`, data);
    
    // Handle specific actions
    switch (action) {
      case 'create-sop':
        console.log('Navigating to SOP creation...');
        break;
      case 'view-analytics':
        console.log('Opening analytics dashboard...');
        break;
      case 'manage-team':
        console.log('Opening team management...');
        break;
      case 'export-config':
        const config = dashboardUtils.exportConfiguration(dashboardConfig);
        console.log('Exported dashboard configuration:', config);
        break;
      default:
        console.log(`Unhandled action: ${action}`);
    }
  };

  const handleConfigChange = (newConfig: any) => {
    console.log('Dashboard configuration updated:', newConfig);
    
    // Validate configuration
    const validation = dashboardUtils.validateDashboardConfig(newConfig);
    if (!validation.valid) {
      console.error('Invalid dashboard configuration:', validation.errors);
      return;
    }
    
    // Configuration is valid - would normally persist here
    console.log('Configuration saved successfully');
  };

  return (
    <Router>
      <ThemeSystemProvider
        enableCustomBranding={enableCustomBranding}
        defaultThemeId={enableCustomBranding ? 'sop' : 'activepieces'}
        defaultMode="auto"
      >
        <NavigationProvider
          enableShortcuts={true}
          enableBreadcrumbs={true}
          enableAnalytics={enableAnalytics}
          enableCache={true}
        >
          <DashboardProvider
            userRole={userRole}
            persistConfig={true}
            storageKey="sop-dashboard-demo"
            initialConfig={dashboardConfig}
          >
            <div className="min-h-screen bg-background">
              {/* Main SOP Dashboard */}
              <SOPDashboard
                userRole={userRole}
                initialView="dashboard"
                config={{
                  layout: dashboardConfig.layout,
                  widgets: dashboardConfig.widgets,
                  customization: {
                    ...dashboardConfig.customization,
                    allowCustomWidgets: userRole !== 'user'
                  },
                  filters: {
                    showSearch: true,
                    showFilters: true,
                    defaultFilters: {}
                  }
                }}
                onConfigChange={handleConfigChange}
                onWidgetAction={(widgetId, action, data) => {
                  console.log(`Widget ${widgetId} action: ${action}`, data);
                  handleDashboardAction(action, { widgetId, ...data });
                }}
              />
              
              {/* Demo Information Panel */}
              <DemoInfoPanel
                userRole={userRole}
                preset={preset}
                enableCustomBranding={enableCustomBranding}
                dashboardConfig={dashboardConfig}
              />
            </div>
          </DashboardProvider>
        </NavigationProvider>
      </ThemeSystemProvider>
    </Router>
  );
};

/**
 * Demo Information Panel - Shows configuration and features
 */
const DemoInfoPanel: React.FC<{
  userRole: string;
  preset: string;
  enableCustomBranding: boolean;
  dashboardConfig: any;
}> = ({ userRole, preset, enableCustomBranding, dashboardConfig }) => {
  const [showDemo, setShowDemo] = React.useState(false);

  if (!showDemo) {
    return (
      <button
        onClick={() => setShowDemo(true)}
        className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors text-sm z-50"
      >
        Show Demo Info
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">SOP Dashboard Demo</h3>
        <button
          onClick={() => setShowDemo(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3 text-sm">
        <div>
          <p className="font-medium text-foreground">Configuration:</p>
          <ul className="text-muted-foreground mt-1 space-y-1">
            <li>• Role: {userRole}</li>
            <li>• Preset: {preset}</li>
            <li>• Custom Branding: {enableCustomBranding ? 'Enabled' : 'Disabled'}</li>
            <li>• Widgets: {dashboardConfig.widgets?.length || 0}</li>
          </ul>
        </div>
        
        <div>
          <p className="font-medium text-foreground">Features Demonstrated:</p>
          <ul className="text-muted-foreground mt-1 space-y-1">
            <li>• Theme System Integration</li>
            <li>• SOP Navigation Components</li>
            <li>• Process Overview Widget</li>
            <li>• Analytics Dashboard</li>
            <li>• Team Collaboration Interface</li>
            <li>• SOP Management Panel</li>
            <li>• Quick Actions Center</li>
            <li>• Responsive Layout</li>
          </ul>
        </div>
        
        <div>
          <p className="font-medium text-foreground">Phase 2 Components:</p>
          <ul className="text-muted-foreground mt-1 space-y-1">
            <li>✅ Theme System (GROUP D)</li>
            <li>✅ Navigation System (GROUP E)</li>
            <li>✅ Dashboard System (GROUP F)</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t">
        <p className="text-xs text-muted-foreground">
          This completes Phase 2 (UI Customization) and prepares for Phase 3 (SOP Pieces).
        </p>
      </div>
    </div>
  );
};

export default CompleteDashboardExample;
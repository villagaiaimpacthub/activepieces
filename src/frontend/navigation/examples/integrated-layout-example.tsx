/**
 * Integrated Layout Example - Complete SOP Navigation Integration
 * Demonstrates how all navigation components work together with theme and terminology services
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  NavigationProvider,
  SOPNavigation,
  ProcessNavigation,
  SOPBreadcrumbs,
  QuickActions,
  DashboardQuickActions,
  useNavigation,
  useProcessNavigation,
  navigationUtils
} from '../index';
import { useTheme } from '@/components/theme-provider';

// Mock process data
const mockProcesses = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Customer Onboarding SOP',
    status: 'active' as const,
    lastModified: '2024-01-15',
    version: 2,
    permissions: ['read', 'write', 'execute']
  },
  {
    id: '987fcdeb-51a2-43b1-9c8d-123456789abc',
    name: 'Employee Training Protocol',
    status: 'draft' as const,
    lastModified: '2024-01-10',
    version: 1,
    permissions: ['read', 'write']
  }
];

// Main application layout with integrated navigation
export const IntegratedSOPLayout: React.FC = () => {
  return (
    <Router>
      <NavigationProvider
        enableShortcuts={true}
        enableBreadcrumbs={true}
        enableAnalytics={true}
        enableCache={true}
      >
        <div className="min-h-screen bg-background">
          <SOPApplicationShell />
        </div>
      </NavigationProvider>
    </Router>
  );
};

// Application shell with sidebar and main content
const SOPApplicationShell: React.FC = () => {
  const { theme } = useTheme();
  const { state, navigateTo } = useNavigation();
  
  return (
    <div className="flex h-screen">
      {/* Sidebar with SOP Navigation */}
      <aside className="w-64 border-r bg-card">
        <div className="p-4">
          <h1 className="text-lg font-semibold text-foreground">
            SOP Management
          </h1>
        </div>
        
        <div className="px-3">
          <SOPNavigation
            items={[
              {
                id: 'dashboard',
                label: 'Dashboard',
                sopLabel: 'SOP Dashboard',
                icon: '🏠',
                path: '/dashboard'
              },
              {
                id: 'processes',
                label: 'Workflows',
                sopLabel: 'Standard Operating Procedures',
                icon: '⚡',
                path: '/processes',
                children: [
                  {
                    id: 'active-processes',
                    label: 'Active Flows',
                    sopLabel: 'Active SOPs',
                    icon: '✅',
                    path: '/processes/active'
                  },
                  {
                    id: 'draft-processes',
                    label: 'Draft Flows',
                    sopLabel: 'Draft SOPs',
                    icon: '📝',
                    path: '/processes/draft'
                  }
                ]
              },
              {
                id: 'executions',
                label: 'Runs',
                sopLabel: 'Process Executions',
                icon: '⏱️',
                path: '/executions',
                badge: 5
              },
              {
                id: 'approvals',
                label: 'Issues',
                sopLabel: 'Process Approvals',
                icon: '⚠️',
                path: '/approvals',
                badge: 2
              },
              {
                id: 'team',
                label: 'Team',
                sopLabel: 'Process Stakeholders',
                icon: '👥',
                path: '/team'
              }
            ]}
            onNavigate={(path) => navigateTo(path)}
          />
        </div>

        {/* Quick Actions in Sidebar */}
        <div className="mt-6 px-3">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Quick Actions
          </h3>
          <QuickActions
            actions={[
              {
                id: 'create-sop',
                label: 'New SOP',
                sopLabel: 'Create SOP',
                icon: '➕',
                onClick: () => navigateTo('/processes/new'),
                variant: 'primary',
                shortcut: 'Ctrl+N'
              },
              {
                id: 'import-sop',
                label: 'Import',
                sopLabel: 'Import SOP',
                icon: '📥',
                onClick: () => navigateTo('/import'),
                variant: 'outline'
              }
            ]}
            orientation="vertical"
            showLabels={true}
            size="sm"
          />
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-3">
            <SOPBreadcrumbs 
              showHome={true}
              maxItems={4}
            />
          </div>
        </div>

        <div className="p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/processes" element={<ProcessListPage />} />
            <Route path="/processes/:processId/*" element={<ProcessDetailPage />} />
            <Route path="/executions" element={<ExecutionsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

// Dashboard page with dashboard-specific quick actions
const DashboardPage: React.FC = () => {
  const { navigateTo } = useNavigation();

  const handleDashboardAction = (actionId: string) => {
    switch (actionId) {
      case 'create-sop':
        navigateTo('/processes/new');
        break;
      case 'templates':
        navigateTo('/templates');
        break;
      case 'team-management':
        navigateTo('/team');
        break;
      case 'quick-setup':
        // Open quick setup wizard
        console.log('Opening quick setup wizard');
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            SOP Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your Standard Operating Procedures
          </p>
        </div>

        <DashboardQuickActions
          onActionClick={handleDashboardAction}
          showLabels={true}
        />
      </div>

      {/* Dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="font-semibold text-foreground">Active SOPs</h3>
          <p className="text-2xl font-bold text-primary mt-2">12</p>
          <p className="text-sm text-muted-foreground">Currently running</p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="font-semibold text-foreground">Draft SOPs</h3>
          <p className="text-2xl font-bold text-orange-500 mt-2">4</p>
          <p className="text-sm text-muted-foreground">Awaiting approval</p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="font-semibold text-foreground">Process Executions</h3>
          <p className="text-2xl font-bold text-green-500 mt-2">156</p>
          <p className="text-sm text-muted-foreground">This month</p>
        </div>
      </div>

      {/* Recent SOPs */}
      <div className="bg-card rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-foreground">
            Recent SOPs
          </h2>
        </div>
        <div className="divide-y">
          {mockProcesses.map(process => (
            <div 
              key={process.id}
              className="p-4 hover:bg-accent cursor-pointer transition-colors"
              onClick={() => navigateTo(`/processes/${process.id}`)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">
                    {process.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Last modified: {process.lastModified}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  process.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {process.status === 'active' ? 'Active SOP' : 'Draft SOP'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Process list page
const ProcessListPage: React.FC = () => {
  const { navigateTo } = useNavigation();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          Standard Operating Procedures
        </h1>
        
        <QuickActions
          actions={[
            {
              id: 'create-new',
              label: 'Create SOP',
              sopLabel: 'New SOP',
              icon: '➕',
              onClick: () => navigateTo('/processes/new'),
              variant: 'primary'
            },
            {
              id: 'import',
              label: 'Import',
              sopLabel: 'Import SOP',
              icon: '📥',
              onClick: () => console.log('Import SOP'),
              variant: 'outline'
            }
          ]}
          showLabels={true}
        />
      </div>

      <div className="grid gap-4">
        {mockProcesses.map(process => (
          <div 
            key={process.id}
            className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigateTo(`/processes/${process.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {process.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Version {process.version} • Modified {process.lastModified}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    process.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {process.status === 'active' ? 'Active SOP' : 'Draft SOP'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Process detail page with process navigation
const ProcessDetailPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  
  // Extract process ID from URL (in real app, use useParams)
  const processId = '123e4567-e89b-12d3-a456-426614174000';
  const process = mockProcesses.find(p => p.id === processId);
  
  const {
    navigateToOverview,
    navigateToExecutions,
    navigateToTeam,
    navigateToSettings
  } = useProcessNavigation(processId);

  const handleProcessAction = (actionId: string) => {
    switch (actionId) {
      case 'edit':
        navigateTo(`/processes/${processId}/edit`);
        break;
      case 'duplicate':
        console.log('Duplicating process:', processId);
        break;
      case 'publish':
        console.log('Publishing process:', processId);
        break;
      case 'pause':
        console.log('Pausing process:', processId);
        break;
    }
  };

  if (!process) {
    return <NotFoundPage />;
  }

  return (
    <div className="space-y-6">
      <ProcessNavigation
        processId={process.id}
        processName={process.name}
        processStatus={process.status}
        onActionClick={handleProcessAction}
        showBreadcrumbs={false} // Using global breadcrumbs
      />

      {/* Process content based on current view */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          SOP Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-foreground mb-2">Status</h3>
            <p className="text-sm text-muted-foreground">
              {process.status === 'active' ? 'Active SOP' : 'Draft SOP'}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-foreground mb-2">Version</h3>
            <p className="text-sm text-muted-foreground">
              v{process.version}
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-foreground mb-2">Last Modified</h3>
            <p className="text-sm text-muted-foreground">
              {process.lastModified}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <button 
            onClick={navigateToExecutions}
            className="w-full text-left p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <h3 className="font-medium text-foreground">Process Executions</h3>
            <p className="text-sm text-muted-foreground mt-1">
              View execution history and performance metrics
            </p>
          </button>

          <button 
            onClick={navigateToTeam}
            className="w-full text-left p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <h3 className="font-medium text-foreground">Process Stakeholders</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage team members and permissions
            </p>
          </button>

          <button 
            onClick={navigateToSettings}
            className="w-full text-left p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <h3 className="font-medium text-foreground">Process Configuration</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Configure SOP settings and parameters
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

// Other page components
const ExecutionsPage: React.FC = () => (
  <div>
    <h1 className="text-2xl font-bold text-foreground mb-4">
      Process Executions
    </h1>
    <p className="text-muted-foreground">
      View and manage all SOP executions across your organization.
    </p>
  </div>
);

const TeamPage: React.FC = () => (
  <div>
    <h1 className="text-2xl font-bold text-foreground mb-4">
      Process Stakeholders
    </h1>
    <p className="text-muted-foreground">
      Manage team members and their access to SOPs.
    </p>
  </div>
);

const NotFoundPage: React.FC = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold text-foreground mb-4">
      Page Not Found
    </h1>
    <p className="text-muted-foreground">
      The requested SOP or page could not be found.
    </p>
  </div>
);

export default IntegratedSOPLayout;
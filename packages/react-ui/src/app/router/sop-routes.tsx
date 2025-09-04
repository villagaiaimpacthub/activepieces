/**
 * SOP Route Definitions for Activepieces Router
 * Defines all SOP-specific routes and their components
 */

import { lazy } from 'react';
import { PageTitle } from '@/app/components/page-title';
import { DashboardContainer } from '../components/dashboard-container';
import { RoutePermissionGuard } from './permission-guard';
import { ProjectRouterWrapper } from './project-route-wrapper';
import { Permission } from '@activepieces/shared';

// Lazy load SOP components
const SOPDashboard = lazy(() => import('../modules/sop/components/sop-dashboard/SopDashboardDemo'));
const SOPProcessList = lazy(() => import('../modules/sop/pages/sop-process-list'));
const SOPProcessDetail = lazy(() => import('../modules/sop/pages/sop-process-detail'));
const SOPExecutionList = lazy(() => import('../modules/sop/pages/sop-execution-list'));
const SOPExecutionDetail = lazy(() => import('../modules/sop/pages/sop-execution-detail'));
const SOPApprovalList = lazy(() => import('../modules/sop/pages/sop-approval-list'));
const SOPTemplateList = lazy(() => import('../modules/sop/pages/sop-template-list'));
const SOPBuilder = lazy(() => import('../modules/sop/pages/sop-builder'));
const SOPSettings = lazy(() => import('../modules/sop/pages/sop-settings'));

/**
 * SOP Route Paths
 */
export const sopRoutePaths = {
  // Main SOP routes
  dashboard: '/sop/dashboard',
  processes: '/sop/processes',
  process: '/sop/processes/:processId',
  processOverview: '/sop/processes/:processId/overview',
  processExecutions: '/sop/processes/:processId/executions',
  processTeam: '/sop/processes/:processId/team',
  processSettings: '/sop/processes/:processId/settings',
  
  // Execution routes
  executions: '/sop/executions',
  execution: '/sop/executions/:executionId',
  
  // Approval routes
  approvals: '/sop/approvals',
  approval: '/sop/approvals/:approvalId',
  
  // Template routes
  templates: '/sop/templates',
  template: '/sop/templates/:templateId',
  
  // Builder routes
  builder: '/sop/builder',
  builderWithId: '/sop/builder/:processId',
  
  // Settings routes
  settings: '/sop/settings',
  settingsGeneral: '/sop/settings/general',
  settingsTeam: '/sop/settings/team',
  settingsIntegrations: '/sop/settings/integrations'
} as const;

/**
 * Create SOP route objects for React Router
 */
export const createSOPRoutes = () => [
  // SOP Dashboard
  ...ProjectRouterWrapper({
    path: sopRoutePaths.dashboard,
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_FLOW}>
          <PageTitle title="SOP Dashboard">
            <SOPDashboard />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
  
  // SOP Process List
  ...ProjectRouterWrapper({
    path: sopRoutePaths.processes,
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_FLOW}>
          <PageTitle title="Standard Operating Procedures">
            <SOPProcessList />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
  
  // SOP Process Detail - Overview (default)
  ...ProjectRouterWrapper({
    path: sopRoutePaths.process,
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_FLOW}>
          <PageTitle title="SOP Details">
            <SOPProcessDetail />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
  
  // SOP Process Detail - Overview
  ...ProjectRouterWrapper({
    path: sopRoutePaths.processOverview,
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_FLOW}>
          <PageTitle title="SOP Overview">
            <SOPProcessDetail />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
  
  // SOP Process Detail - Executions
  ...ProjectRouterWrapper({
    path: sopRoutePaths.processExecutions,
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_RUN}>
          <PageTitle title="Process Executions">
            <SOPExecutionList />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
  
  // SOP Process Detail - Team
  ...ProjectRouterWrapper({
    path: sopRoutePaths.processTeam,
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_PROJECT_MEMBER}>
          <PageTitle title="Process Stakeholders">
            <SOPProcessDetail />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
  
  // SOP Process Detail - Settings
  ...ProjectRouterWrapper({
    path: sopRoutePaths.processSettings,
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.WRITE_FLOW}>
          <PageTitle title="Process Configuration">
            <SOPSettings />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
  
  // SOP Execution List
  ...ProjectRouterWrapper({
    path: sopRoutePaths.executions,
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_RUN}>
          <PageTitle title="Process Executions">
            <SOPExecutionList />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
  
  // SOP Execution Detail
  ...ProjectRouterWrapper({
    path: sopRoutePaths.execution,
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_RUN}>
          <PageTitle title="Execution Details">
            <SOPExecutionDetail />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
  
  // SOP Approval List
  ...ProjectRouterWrapper({
    path: sopRoutePaths.approvals,
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_RUN}>
          <PageTitle title="Process Approvals">
            <SOPApprovalList />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
  
  // SOP Template List
  ...ProjectRouterWrapper({
    path: sopRoutePaths.templates,
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_FLOW}>
          <PageTitle title="SOP Templates">
            <SOPTemplateList />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
  
  // SOP Builder
  ...ProjectRouterWrapper({
    path: sopRoutePaths.builder,
    element: (
      <RoutePermissionGuard permission={Permission.WRITE_FLOW}>
        <PageTitle title="SOP Builder">
          <SOPBuilder />
        </PageTitle>
      </RoutePermissionGuard>
    ),
  }),
  
  // SOP Builder with ID
  ...ProjectRouterWrapper({
    path: sopRoutePaths.builderWithId,
    element: (
      <RoutePermissionGuard permission={Permission.WRITE_FLOW}>
        <PageTitle title="SOP Builder">
          <SOPBuilder />
        </PageTitle>
      </RoutePermissionGuard>
    ),
  }),
  
  // SOP Settings
  ...ProjectRouterWrapper({
    path: sopRoutePaths.settings,
    element: (
      <DashboardContainer>
        <RoutePermissionGuard permission={Permission.READ_FLOW}>
          <PageTitle title="SOP Configuration">
            <SOPSettings />
          </PageTitle>
        </RoutePermissionGuard>
      </DashboardContainer>
    ),
  }),
];

/**
 * Navigation helper functions
 */
export const sopNavigationHelpers = {
  /**
   * Generate SOP dashboard path
   */
  getDashboardPath: (projectPrefix = '') => `${projectPrefix}${sopRoutePaths.dashboard}`,
  
  /**
   * Generate process list path
   */
  getProcessListPath: (projectPrefix = '') => `${projectPrefix}${sopRoutePaths.processes}`,
  
  /**
   * Generate process detail path
   */
  getProcessPath: (processId: string, view = 'overview', projectPrefix = '') => 
    `${projectPrefix}/sop/processes/${processId}/${view}`,
  
  /**
   * Generate execution list path
   */
  getExecutionListPath: (projectPrefix = '') => `${projectPrefix}${sopRoutePaths.executions}`,
  
  /**
   * Generate execution detail path
   */
  getExecutionPath: (executionId: string, projectPrefix = '') => 
    `${projectPrefix}/sop/executions/${executionId}`,
  
  /**
   * Generate approval list path
   */
  getApprovalListPath: (projectPrefix = '') => `${projectPrefix}${sopRoutePaths.approvals}`,
  
  /**
   * Generate template list path
   */
  getTemplateListPath: (projectPrefix = '') => `${projectPrefix}${sopRoutePaths.templates}`,
  
  /**
   * Generate builder path
   */
  getBuilderPath: (processId?: string, projectPrefix = '') => 
    processId 
      ? `${projectPrefix}/sop/builder/${processId}`
      : `${projectPrefix}${sopRoutePaths.builder}`,
  
  /**
   * Check if current path is SOP-related
   */
  isSOPPath: (pathname: string) => pathname.includes('/sop'),
  
  /**
   * Extract process ID from path
   */
  extractProcessId: (pathname: string) => {
    const match = pathname.match(/\/sop\/processes\/([^\/]+)/);
    return match ? match[1] : null;
  },
  
  /**
   * Extract execution ID from path
   */
  extractExecutionId: (pathname: string) => {
    const match = pathname.match(/\/sop\/executions\/([^\/]+)/);
    return match ? match[1] : null;
  },
  
  /**
   * Get current SOP view from path
   */
  getCurrentSOPView: (pathname: string) => {
    if (pathname.includes('/dashboard')) return 'dashboard';
    if (pathname.includes('/processes')) return 'processes';
    if (pathname.includes('/executions')) return 'executions';
    if (pathname.includes('/approvals')) return 'approvals';
    if (pathname.includes('/templates')) return 'templates';
    if (pathname.includes('/builder')) return 'builder';
    if (pathname.includes('/settings')) return 'settings';
    return null;
  }
};

/**
 * Default export with all SOP routing utilities
 */
export default {
  routes: createSOPRoutes(),
  paths: sopRoutePaths,
  helpers: sopNavigationHelpers
};
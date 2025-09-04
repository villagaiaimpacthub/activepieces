/**
 * SOP Navigation Configuration
 * Centralized configuration for SOP navigation routes and menu items
 */

import {
  Workflow,
  Clock,
  AlertCircle,
  Users,
  Dashboard,
  FileText,
  Settings,
  Play,
  Eye,
  Calendar,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { authenticationSession } from '@/lib/authentication-session';

/**
 * SOP Navigation Menu Configuration
 */
export const sopNavigationConfig = {
  /**
   * Main SOP navigation items
   */
  mainNavigation: [
    {
      id: 'sop-dashboard',
      label: 'Dashboard',
      sopLabel: 'SOP Dashboard',
      icon: Dashboard,
      path: '/sop/dashboard',
      description: 'Overview of all SOPs and metrics',
      isActive: (pathname: string) => pathname.includes('/sop/dashboard')
    },
    {
      id: 'sop-processes',
      label: 'Flows',
      sopLabel: 'Standard Operating Procedures',
      icon: Workflow,
      path: '/sop/processes',
      description: 'Manage your SOPs',
      isActive: (pathname: string) => 
        pathname.includes('/sop/processes') || 
        (pathname.includes('/flows') && !pathname.includes('/sop'))
    },
    {
      id: 'sop-executions',
      label: 'Runs',
      sopLabel: 'Process Executions',
      icon: Clock,
      path: '/sop/executions',
      description: 'Monitor process executions',
      isActive: (pathname: string) => 
        pathname.includes('/sop/executions') || 
        (pathname.includes('/runs') && !pathname.includes('/sop'))
    },
    {
      id: 'sop-approvals',
      label: 'Issues',
      sopLabel: 'Process Approvals',
      icon: AlertCircle,
      path: '/sop/approvals',
      description: 'Review and approve processes',
      notification: true,
      isActive: (pathname: string) => 
        pathname.includes('/sop/approvals') || 
        (pathname.includes('/issues') && !pathname.includes('/sop'))
    }
  ],

  /**
   * Secondary SOP navigation items
   */
  secondaryNavigation: [
    {
      id: 'sop-templates',
      label: 'Templates',
      sopLabel: 'SOP Templates',
      icon: FileText,
      path: '/sop/templates',
      description: 'Pre-built SOP templates'
    },
    {
      id: 'sop-builder',
      label: 'Builder',
      sopLabel: 'SOP Builder',
      icon: Play,
      path: '/sop/builder',
      description: 'Create and edit SOPs',
      isActive: (pathname: string) => pathname.includes('/builder')
    }
  ],

  /**
   * Process-specific navigation (shown when viewing a specific SOP)
   */
  processNavigation: [
    {
      id: 'process-overview',
      label: 'Overview',
      sopLabel: 'SOP Overview',
      icon: Eye,
      path: 'overview',
      description: 'Process overview and details'
    },
    {
      id: 'process-executions',
      label: 'Runs',
      sopLabel: 'Process Executions',
      icon: Clock,
      path: 'executions',
      description: 'View execution history'
    },
    {
      id: 'process-schedule',
      label: 'Schedule',
      sopLabel: 'Process Schedule',
      icon: Calendar,
      path: 'schedule',
      description: 'Scheduled executions'
    },
    {
      id: 'process-analytics',
      label: 'Analytics',
      sopLabel: 'Process Analytics',
      icon: BarChart3,
      path: 'analytics',
      description: 'Performance metrics'
    },
    {
      id: 'process-team',
      label: 'Team',
      sopLabel: 'Stakeholders',
      icon: Users,
      path: 'team',
      description: 'Process stakeholders'
    },
    {
      id: 'process-settings',
      label: 'Settings',
      sopLabel: 'Configuration',
      icon: Settings,
      path: 'settings',
      description: 'Process configuration'
    }
  ],

  /**
   * Quick actions for SOP management
   */
  quickActions: [
    {
      id: 'create-sop',
      label: 'Create SOP',
      sopLabel: 'Create SOP',
      icon: Workflow,
      path: '/sop/builder',
      primary: true,
      description: 'Create a new Standard Operating Procedure'
    },
    {
      id: 'view-executions',
      label: 'View Runs',
      sopLabel: 'View Executions',
      icon: Clock,
      path: '/sop/executions',
      description: 'View recent process executions'
    },
    {
      id: 'manage-approvals',
      label: 'Manage Issues',
      sopLabel: 'Manage Approvals',
      icon: AlertCircle,
      path: '/sop/approvals',
      description: 'Review pending approvals'
    },
    {
      id: 'view-templates',
      label: 'Browse Templates',
      sopLabel: 'Browse Templates',
      icon: FileText,
      path: '/sop/templates',
      description: 'Explore SOP templates'
    }
  ]
};

/**
 * Navigation path helpers
 */
export const sopNavigationHelpers = {
  /**
   * Get full path for SOP route
   */
  getFullPath: (path: string, projectId?: string) => {
    const projectPrefix = projectId 
      ? authenticationSession.appendProjectRoutePrefix('')
      : '';
    return `${projectPrefix}${path}`;
  },

  /**
   * Get process-specific path
   */
  getProcessPath: (processId: string, view = 'overview', projectId?: string) => {
    const projectPrefix = projectId 
      ? authenticationSession.appendProjectRoutePrefix('')
      : '';
    return `${projectPrefix}/sop/processes/${processId}/${view}`;
  },

  /**
   * Check if path is SOP-related
   */
  isSOPPath: (pathname: string) => 
    pathname.includes('/sop') || 
    pathname.includes('/processes'),

  /**
   * Extract process ID from path
   */
  extractProcessId: (pathname: string) => {
    const match = pathname.match(/\/(?:sop\/)?processes\/([^\/]+)/);
    return match ? match[1] : null;
  },

  /**
   * Get current SOP view
   */
  getCurrentView: (pathname: string) => {
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
 * Default SOP sidebar configuration
 */
export const defaultSOPSidebarConfig = {
  enableSOPTerminology: true,
  showNotifications: true,
  showQuickActions: true,
  showBreadcrumbs: true,
  enableKeyboardShortcuts: true,
  groupSeparators: true
};

/**
 * Export all navigation configuration
 */
export default {
  config: sopNavigationConfig,
  helpers: sopNavigationHelpers,
  defaults: defaultSOPSidebarConfig
};
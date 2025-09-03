/**
 * SOP Navigation Components - Centralized exports
 * Complete navigation system with TypeScript support that integrates theme and terminology services
 */

// Main navigation components
export { default as SOPNavigation } from './sop-navigation';
export type { SOPNavigationProps, SOPNavigationItem } from './sop-navigation';

export { default as ProcessNavigation } from './process-navigation';
export type { ProcessNavigationProps, ProcessAction } from './process-navigation';

export { default as SOPBreadcrumbs } from './sop-breadcrumbs';
export type { SOPBreadcrumbsProps, BreadcrumbItem } from './sop-breadcrumbs';

export { default as QuickActions, ProcessQuickActions, DashboardQuickActions } from './quick-actions';
export type { QuickActionsProps, QuickAction } from './quick-actions';

export { 
  default as NavigationProvider, 
  useNavigation, 
  useProcessNavigation, 
  useBreadcrumbs 
} from './navigation-provider';
export type { 
  NavigationProviderProps, 
  NavigationContextType, 
  NavigationState 
} from './navigation-provider';

// Re-export theme provider for convenience
export { useTheme } from '@/components/theme-provider';

// Navigation utilities and helpers
export const navigationUtils = {
  /**
   * Generate SOP-specific path
   */
  getSOPPath: (processId: string, view = 'overview') => `/processes/${processId}/${view}`,
  
  /**
   * Generate execution path
   */
  getExecutionPath: (processId: string, executionId?: string) => 
    executionId 
      ? `/processes/${processId}/executions/${executionId}`
      : `/processes/${processId}/executions`,
  
  /**
   * Check if path is SOP-related
   */
  isSOPPath: (path: string) => path.startsWith('/processes'),
  
  /**
   * Extract process ID from path
   */
  extractProcessId: (path: string) => {
    const match = path.match(/\/processes\/([^\/]+)/);
    return match ? match[1] : null;
  },
  
  /**
   * Convert Activepieces terminology to SOP terminology
   */
  toSOPTerminology: (term: string) => {
    const mappings: Record<string, string> = {
      'flow': 'Standard Operating Procedure',
      'flows': 'Standard Operating Procedures',
      'workflow': 'SOP Process',
      'workflows': 'SOP Processes',
      'run': 'Process Execution',
      'runs': 'Process Executions',
      'execution': 'Process Execution',
      'executions': 'Process Executions',
      'issue': 'Process Approval',
      'issues': 'Process Approvals',
      'connection': 'Process Integration',
      'connections': 'Process Integrations',
      'team': 'Process Stakeholders',
      'members': 'Stakeholders',
      'settings': 'Process Configuration',
      'dashboard': 'SOP Dashboard',
      'builder': 'SOP Builder',
      'template': 'SOP Template',
      'templates': 'SOP Templates'
    };
    
    return mappings[term.toLowerCase()] || term;
  },
  
  /**
   * Generate breadcrumbs for common SOP paths
   */
  generateSOPBreadcrumbs: (path: string) => {
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const currentPath = '/' + segments.slice(0, i + 1).join('/');
      const isLast = i === segments.length - 1;
      
      // Handle special SOP paths
      if (segment === 'processes') {
        breadcrumbs.push({
          label: 'Workflows',
          sopLabel: 'Standard Operating Procedures',
          path: isLast ? undefined : currentPath
        });
      } else if (segment.match(/^[0-9a-f-]{36}$/)) {
        // UUID - process ID
        breadcrumbs.push({
          label: 'Process Details',
          sopLabel: 'SOP Details',
          path: isLast ? undefined : currentPath
        });
      } else {
        const sopLabel = navigationUtils.toSOPTerminology(segment);
        breadcrumbs.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          sopLabel,
          path: isLast ? undefined : currentPath
        });
      }
    }
    
    return breadcrumbs;
  }
};

// Common navigation presets
export const navigationPresets = {
  /**
   * Default SOP navigation items
   */
  defaultSOPNavigation: [
    {
      id: 'processes',
      label: 'Workflows',
      sopLabel: 'Standard Operating Procedures',
      icon: 'Workflow',
      path: '/processes'
    },
    {
      id: 'executions',
      label: 'Runs',
      sopLabel: 'Process Executions',
      icon: 'Clock',
      path: '/executions'
    },
    {
      id: 'approvals',
      label: 'Issues',
      sopLabel: 'Process Approvals',
      icon: 'AlertCircle',
      path: '/approvals'
    },
    {
      id: 'team',
      label: 'Team',
      sopLabel: 'Process Stakeholders',
      icon: 'Users',
      path: '/team'
    }
  ],
  
  /**
   * Process-specific navigation items
   */
  processNavigation: [
    {
      id: 'overview',
      label: 'Overview',
      sopLabel: 'SOP Overview',
      icon: 'Eye',
      path: 'overview'
    },
    {
      id: 'executions',
      label: 'Runs',
      sopLabel: 'Process Executions',
      icon: 'Clock',
      path: 'executions'
    },
    {
      id: 'team',
      label: 'Team',
      sopLabel: 'Stakeholders',
      icon: 'Users',
      path: 'team'
    },
    {
      id: 'settings',
      label: 'Settings',
      sopLabel: 'Configuration',
      icon: 'Settings',
      path: 'settings'
    }
  ]
};

// Navigation component composition helpers
export const createSOPNavigation = (config: {
  showQuickActions?: boolean;
  showBreadcrumbs?: boolean;
  enableKeyboardShortcuts?: boolean;
}) => {
  const { showQuickActions = true, showBreadcrumbs = true, enableKeyboardShortcuts = true } = config;
  
  return {
    NavigationProvider,
    SOPNavigation,
    ProcessNavigation,
    ...(showBreadcrumbs && { SOPBreadcrumbs }),
    ...(showQuickActions && { QuickActions }),
    utils: navigationUtils,
    presets: navigationPresets
  };
};
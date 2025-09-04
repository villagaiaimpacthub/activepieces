/**
 * SOP Navigation Extension for Activepieces Sidebar
 * Integrates SOP-specific navigation items into the existing sidebar
 */

import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
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
  ChevronRight
} from 'lucide-react';
import { t } from 'i18next';

import { useTerminologyContext } from '@/lib/terminology/hooks';
import { authenticationSession } from '@/lib/authentication-session';
import type { SidebarItem, SidebarLink, SidebarGroup } from './index';

// SOP Navigation Item Type
export interface SOPNavigationItem {
  id: string;
  label: string;
  sopLabel?: string;
  icon: React.ElementType;
  path: string;
  notification?: boolean;
  locked?: boolean;
  hasPermission?: boolean;
  children?: SOPNavigationItem[];
  isActive?: (pathname: string) => boolean;
}

// SOP Navigation Props
export interface SOPNavigationProps {
  /** Show SOP branding and terminology */
  enableSOPTerminology?: boolean;
  /** Show notifications on SOP items */
  showNotifications?: boolean;
  /** Current project context (if available) */
  projectId?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SOP Navigation Items Configuration
 */
const createSOPNavigationItems = (projectPrefix: string = ''): SOPNavigationItem[] => [
  {
    id: 'sop-dashboard',
    label: 'Dashboard',
    sopLabel: 'SOP Dashboard',
    icon: Dashboard,
    path: `${projectPrefix}/sop/dashboard`,
    isActive: (pathname) => pathname.includes('/sop/dashboard')
  },
  {
    id: 'sop-processes',
    label: 'Flows',
    sopLabel: 'Standard Operating Procedures',
    icon: Workflow,
    path: `${projectPrefix}/sop/processes`,
    isActive: (pathname) => pathname.includes('/sop/processes') || pathname.includes('/flows')
  },
  {
    id: 'sop-executions',
    label: 'Runs',
    sopLabel: 'Process Executions',
    icon: Clock,
    path: `${projectPrefix}/sop/executions`,
    isActive: (pathname) => pathname.includes('/sop/executions') || pathname.includes('/runs')
  },
  {
    id: 'sop-approvals',
    label: 'Issues',
    sopLabel: 'Process Approvals',
    icon: AlertCircle,
    path: `${projectPrefix}/sop/approvals`,
    notification: true,
    isActive: (pathname) => pathname.includes('/sop/approvals') || pathname.includes('/issues')
  },
  {
    id: 'sop-templates',
    label: 'Templates',
    sopLabel: 'SOP Templates',
    icon: FileText,
    path: `${projectPrefix}/sop/templates`
  },
  {
    id: 'sop-builder',
    label: 'Builder',
    sopLabel: 'SOP Builder',
    icon: Play,
    path: `${projectPrefix}/sop/builder`,
    isActive: (pathname) => pathname.includes('/builder')
  }
];

/**
 * Process-specific navigation items
 */
const createProcessNavigationItems = (processId: string, projectPrefix: string = ''): SOPNavigationItem[] => [
  {
    id: 'process-overview',
    label: 'Overview',
    sopLabel: 'SOP Overview',
    icon: Eye,
    path: `${projectPrefix}/sop/processes/${processId}/overview`
  },
  {
    id: 'process-executions',
    label: 'Runs',
    sopLabel: 'Process Executions',
    icon: Clock,
    path: `${projectPrefix}/sop/processes/${processId}/executions`
  },
  {
    id: 'process-team',
    label: 'Team',
    sopLabel: 'Stakeholders',
    icon: Users,
    path: `${projectPrefix}/sop/processes/${processId}/team`
  },
  {
    id: 'process-settings',
    label: 'Settings',
    sopLabel: 'Configuration',
    icon: Settings,
    path: `${projectPrefix}/sop/processes/${processId}/settings`
  }
];

/**
 * Convert SOP Navigation Item to Sidebar Item
 */
const convertToSidebarItem = (
  item: SOPNavigationItem,
  enableSOPTerminology: boolean,
  useTranslation: (text: string, context?: string) => string
): SidebarLink => {
  const label = enableSOPTerminology && item.sopLabel ? item.sopLabel : item.label;
  const translatedLabel = useTranslation(label, 'general');

  return {
    type: 'link',
    to: item.path,
    label: translatedLabel,
    icon: React.createElement(item.icon, { className: 'size-4' }),
    show: true,
    notification: item.notification || false,
    locked: item.locked || false,
    hasPermission: item.hasPermission !== false,
    isSubItem: false,
    isActive: item.isActive
  };
};

/**
 * Hook for SOP Navigation State
 */
export function useSOPNavigation({
  enableSOPTerminology = true,
  showNotifications = true,
  projectId
}: SOPNavigationProps = {}) {
  const location = useLocation();
  const [sopGroupOpen, setSOPGroupOpen] = useState(true);
  
  // Get terminology translation if available
  let translate = (text: string) => text;
  try {
    const terminologyContext = useTerminologyContext();
    translate = terminologyContext.translate;
  } catch {
    // Terminology not available, use fallback
  }

  // Determine project prefix
  const projectPrefix = projectId 
    ? authenticationSession.appendProjectRoutePrefix('')
    : '';

  // Check if we're in SOP context
  const isSOPContext = location.pathname.includes('/sop') || 
                      location.pathname.includes('/processes');

  // Extract process ID if in process context
  const processId = useMemo(() => {
    const match = location.pathname.match(/\/processes\/([^\/]+)/);
    return match ? match[1] : null;
  }, [location.pathname]);

  // Generate navigation items
  const sopNavigationItems = useMemo(() => {
    return createSOPNavigationItems(projectPrefix).map(item => 
      convertToSidebarItem(item, enableSOPTerminology, translate)
    );
  }, [projectPrefix, enableSOPTerminology, translate]);

  // Generate process navigation items if in process context
  const processNavigationItems = useMemo(() => {
    if (!processId) return [];
    return createProcessNavigationItems(processId, projectPrefix).map(item =>
      convertToSidebarItem(item, enableSOPTerminology, translate)
    );
  }, [processId, projectPrefix, enableSOPTerminology, translate]);

  // Create SOP navigation group
  const sopNavigationGroup: SidebarGroup = {
    type: 'group',
    name: enableSOPTerminology ? 'SOPs' : 'Workflows',
    label: translate(enableSOPTerminology ? 'Standard Operating Procedures' : 'Workflows'),
    icon: Workflow,
    items: sopNavigationItems,
    defaultOpen: true,
    open: sopGroupOpen,
    setOpen: setSOPGroupOpen,
    isActive: (pathname) => pathname.includes('/sop') || pathname.includes('/flows'),
    separatorBefore: true
  };

  // Create process navigation group if in process context
  const processNavigationGroup: SidebarGroup | null = processId ? {
    type: 'group',
    name: enableSOPTerminology ? 'Current SOP' : 'Current Flow',
    label: translate(enableSOPTerminology ? 'Current SOP' : 'Current Flow'),
    icon: ChevronRight,
    items: processNavigationItems,
    defaultOpen: true,
    open: true,
    setOpen: () => {}, // Always open for process context
    isActive: (pathname) => pathname.includes(`/processes/${processId}`)
  } : null;

  return {
    sopNavigationGroup,
    processNavigationGroup,
    isSOPContext,
    processId,
    sopNavigationItems,
    processNavigationItems
  };
}

/**
 * SOP Breadcrumbs Component
 */
export interface SOPBreadcrumbsProps {
  enableSOPTerminology?: boolean;
  className?: string;
}

export function SOPBreadcrumbs({ 
  enableSOPTerminology = true,
  className 
}: SOPBreadcrumbsProps) {
  const location = useLocation();
  
  // Get terminology translation if available
  let translate = (text: string) => text;
  try {
    const terminologyContext = useTerminologyContext();
    translate = terminologyContext.translate;
  } catch {
    // Terminology not available, use fallback
  }

  const generateBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = [];

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const currentPath = '/' + segments.slice(0, i + 1).join('/');
      const isLast = i === segments.length - 1;

      if (segment === 'sop') {
        breadcrumbs.push({
          label: translate(enableSOPTerminology ? 'SOPs' : 'Workflows'),
          path: isLast ? undefined : currentPath
        });
      } else if (segment === 'processes') {
        breadcrumbs.push({
          label: translate(enableSOPTerminology ? 'Standard Operating Procedures' : 'Flows'),
          path: isLast ? undefined : currentPath
        });
      } else if (segment === 'executions') {
        breadcrumbs.push({
          label: translate(enableSOPTerminology ? 'Process Executions' : 'Runs'),
          path: isLast ? undefined : currentPath
        });
      } else if (segment === 'approvals') {
        breadcrumbs.push({
          label: translate(enableSOPTerminology ? 'Process Approvals' : 'Issues'),
          path: isLast ? undefined : currentPath
        });
      } else if (segment.match(/^[0-9a-f-]{36}$/)) {
        // UUID - process/execution ID
        breadcrumbs.push({
          label: translate('Details'),
          path: isLast ? undefined : currentPath
        });
      } else {
        const capitalizedSegment = segment.charAt(0).toUpperCase() + segment.slice(1);
        breadcrumbs.push({
          label: translate(capitalizedSegment),
          path: isLast ? undefined : currentPath
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className={`flex ${className || ''}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
            )}
            {crumb.path ? (
              <a
                href={crumb.path}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
              >
                {crumb.label}
              </a>
            ) : (
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Quick Actions Component
 */
export interface SOPQuickActionsProps {
  enableSOPTerminology?: boolean;
  projectId?: string;
  className?: string;
}

export function SOPQuickActions({ 
  enableSOPTerminology = true,
  projectId,
  className 
}: SOPQuickActionsProps) {
  // Get terminology translation if available
  let translate = (text: string) => text;
  try {
    const terminologyContext = useTerminologyContext();
    translate = terminologyContext.translate;
  } catch {
    // Terminology not available, use fallback
  }

  const projectPrefix = projectId 
    ? authenticationSession.appendProjectRoutePrefix('')
    : '';

  const quickActions = [
    {
      id: 'new-sop',
      label: translate(enableSOPTerminology ? 'Create SOP' : 'New Flow'),
      icon: Workflow,
      path: `${projectPrefix}/sop/builder`,
      primary: true
    },
    {
      id: 'view-executions',
      label: translate(enableSOPTerminology ? 'View Executions' : 'View Runs'),
      icon: Clock,
      path: `${projectPrefix}/sop/executions`
    },
    {
      id: 'manage-approvals',
      label: translate(enableSOPTerminology ? 'Manage Approvals' : 'View Issues'),
      icon: AlertCircle,
      path: `${projectPrefix}/sop/approvals`
    }
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${className || ''}`}>
      {quickActions.map((action) => (
        <a
          key={action.id}
          href={action.path}
          className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            action.primary
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <action.icon className="w-4 h-4 mr-2" />
          {action.label}
        </a>
      ))}
    </div>
  );
}

export default {
  useSOPNavigation,
  SOPBreadcrumbs,
  SOPQuickActions
};
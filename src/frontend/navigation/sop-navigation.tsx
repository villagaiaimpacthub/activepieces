/**
 * SOP Navigation Component - Main navigation with SOP-specific menu items
 * Integrates with existing theme system and terminology service
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Settings, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Workflow
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';

// Define SOP-specific navigation items
export interface SOPNavigationItem {
  id: string;
  label: string;
  sopLabel?: string; // SOP-specific terminology
  icon: React.ReactNode;
  path: string;
  badge?: number;
  children?: SOPNavigationItem[];
  permissions?: string[];
}

export interface SOPNavigationProps {
  items?: SOPNavigationItem[];
  onNavigate?: (path: string) => void;
  className?: string;
}

const defaultSOPItems: SOPNavigationItem[] = [
  {
    id: 'processes',
    label: 'Workflows',
    sopLabel: 'Standard Operating Procedures',
    icon: <Workflow className="h-4 w-4" />,
    path: '/processes',
    children: [
      {
        id: 'active-processes',
        label: 'Active Flows',
        sopLabel: 'Active SOPs',
        icon: <CheckCircle className="h-4 w-4" />,
        path: '/processes/active'
      },
      {
        id: 'draft-processes',
        label: 'Draft Flows', 
        sopLabel: 'Draft SOPs',
        icon: <FileText className="h-4 w-4" />,
        path: '/processes/draft'
      }
    ]
  },
  {
    id: 'execution',
    label: 'Runs',
    sopLabel: 'Process Executions',
    icon: <Clock className="h-4 w-4" />,
    path: '/execution',
    badge: 3
  },
  {
    id: 'approvals',
    label: 'Issues',
    sopLabel: 'Process Approvals',
    icon: <AlertCircle className="h-4 w-4" />,
    path: '/approvals',
    badge: 2
  },
  {
    id: 'team',
    label: 'Team Members',
    sopLabel: 'Process Stakeholders',
    icon: <Users className="h-4 w-4" />,
    path: '/team'
  },
  {
    id: 'settings',
    label: 'Settings',
    sopLabel: 'Process Configuration',
    icon: <Settings className="h-4 w-4" />,
    path: '/settings'
  }
];

export const SOPNavigation: React.FC<SOPNavigationProps> = ({
  items = defaultSOPItems,
  onNavigate,
  className
}) => {
  const location = useLocation();
  const { theme } = useTheme();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['processes']));

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleNavigation = (path: string) => {
    onNavigate?.(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderNavigationItem = (item: SOPNavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups.has(item.id);
    const itemIsActive = isActive(item.path);

    return (
      <div key={item.id} className={cn("space-y-1", level > 0 && "ml-4")}>
        <div
          className={cn(
            "group flex items-center rounded-md px-2 py-2 text-sm font-medium cursor-pointer transition-colors",
            itemIsActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            className
          )}
          onClick={() => {
            if (hasChildren) {
              toggleGroup(item.id);
            } else {
              handleNavigation(item.path);
            }
          }}
        >
          <span className="mr-3 h-4 w-4 flex-shrink-0">
            {item.icon}
          </span>
          
          <span className="flex-1">
            {item.sopLabel || item.label}
          </span>
          
          {item.badge && (
            <span className={cn(
              "ml-2 rounded-full px-2 py-0.5 text-xs font-medium",
              itemIsActive 
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {item.badge}
            </span>
          )}
          
          {hasChildren && (
            <span className="ml-2 h-4 w-4 flex-shrink-0">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={cn("space-y-2", className)} role="navigation" aria-label="SOP Navigation">
      {items.map(item => renderNavigationItem(item))}
    </nav>
  );
};

export default SOPNavigation;
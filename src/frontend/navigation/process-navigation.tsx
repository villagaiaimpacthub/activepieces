/**
 * Process Navigation Component - Specialized navigation for process/workflow management
 * Optimized for SOP workflow management with contextual actions
 */

import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Square, 
  Edit3, 
  Copy, 
  Share2, 
  Archive,
  Eye,
  GitBranch,
  Clock,
  Users,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';

export interface ProcessAction {
  id: string;
  label: string;
  sopLabel?: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
  tooltip?: string;
}

export interface ProcessNavigationProps {
  processId?: string;
  processName?: string;
  processStatus?: 'active' | 'draft' | 'archived' | 'paused';
  actions?: ProcessAction[];
  showBreadcrumbs?: boolean;
  onActionClick?: (actionId: string) => void;
  className?: string;
}

const getDefaultActions = (
  status: string | undefined,
  onActionClick?: (actionId: string) => void
): ProcessAction[] => {
  const commonActions: ProcessAction[] = [
    {
      id: 'view',
      label: 'View Process',
      sopLabel: 'View SOP',
      icon: <Eye className="h-4 w-4" />,
      onClick: () => onActionClick?.('view'),
      variant: 'secondary'
    },
    {
      id: 'edit',
      label: 'Edit Process',
      sopLabel: 'Edit SOP',
      icon: <Edit3 className="h-4 w-4" />,
      onClick: () => onActionClick?.('edit'),
      variant: 'default'
    }
  ];

  const statusSpecificActions: Record<string, ProcessAction[]> = {
    active: [
      {
        id: 'pause',
        label: 'Pause Process',
        sopLabel: 'Pause SOP',
        icon: <Pause className="h-4 w-4" />,
        onClick: () => onActionClick?.('pause'),
        variant: 'secondary'
      },
      {
        id: 'stop',
        label: 'Stop Process',
        sopLabel: 'Stop SOP',
        icon: <Square className="h-4 w-4" />,
        onClick: () => onActionClick?.('stop'),
        variant: 'destructive'
      }
    ],
    draft: [
      {
        id: 'publish',
        label: 'Publish Process',
        sopLabel: 'Activate SOP',
        icon: <Play className="h-4 w-4" />,
        onClick: () => onActionClick?.('publish'),
        variant: 'primary'
      }
    ],
    paused: [
      {
        id: 'resume',
        label: 'Resume Process',
        sopLabel: 'Resume SOP',
        icon: <Play className="h-4 w-4" />,
        onClick: () => onActionClick?.('resume'),
        variant: 'primary'
      }
    ]
  };

  const additionalActions: ProcessAction[] = [
    {
      id: 'copy',
      label: 'Duplicate Process',
      sopLabel: 'Duplicate SOP',
      icon: <Copy className="h-4 w-4" />,
      onClick: () => onActionClick?.('copy'),
      variant: 'secondary'
    },
    {
      id: 'share',
      label: 'Share Process',
      sopLabel: 'Share SOP',
      icon: <Share2 className="h-4 w-4" />,
      onClick: () => onActionClick?.('share'),
      variant: 'secondary'
    },
    {
      id: 'versions',
      label: 'Version History',
      sopLabel: 'SOP History',
      icon: <GitBranch className="h-4 w-4" />,
      onClick: () => onActionClick?.('versions'),
      variant: 'secondary'
    }
  ];

  return [
    ...commonActions,
    ...(statusSpecificActions[status || 'draft'] || []),
    ...additionalActions
  ];
};

export const ProcessNavigation: React.FC<ProcessNavigationProps> = ({
  processId,
  processName = 'Untitled Process',
  processStatus = 'draft',
  actions,
  showBreadcrumbs = true,
  onActionClick,
  className
}) => {
  const location = useLocation();
  const { theme } = useTheme();
  
  const processActions = actions || getDefaultActions(processStatus, onActionClick);

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-600 bg-green-50 border-green-200',
      draft: 'text-orange-600 bg-orange-50 border-orange-200',
      paused: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      archived: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Active SOP',
      draft: 'Draft SOP', 
      paused: 'Paused SOP',
      archived: 'Archived SOP'
    };
    return labels[status as keyof typeof labels] || 'Draft SOP';
  };

  const getVariantClasses = (variant: string = 'default') => {
    const variants = {
      default: 'bg-background text-foreground border-border hover:bg-accent',
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
    };
    return variants[variant as keyof typeof variants] || variants.default;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link 
            to="/processes" 
            className="hover:text-foreground transition-colors"
          >
            Standard Operating Procedures
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            {processName}
          </span>
        </nav>
      )}

      {/* Process Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-foreground">
            {processName}
          </h1>
          
          <span className={cn(
            "px-2 py-1 text-xs font-medium rounded-full border",
            getStatusColor(processStatus)
          )}>
            {getStatusLabel(processStatus)}
          </span>

          {processId && (
            <span className="text-sm text-muted-foreground">
              ID: {processId}
            </span>
          )}
        </div>
      </div>

      {/* Process Actions */}
      <div className="flex items-center space-x-2 overflow-x-auto">
        {processActions.map(action => (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors border",
              getVariantClasses(action.variant),
              action.disabled && "opacity-50 cursor-not-allowed"
            )}
            title={action.tooltip}
          >
            <span className="mr-2">
              {action.icon}
            </span>
            {action.sopLabel || action.label}
          </button>
        ))}
      </div>

      {/* Process Context Navigation */}
      <div className="border-t pt-4">
        <nav className="flex items-center space-x-6">
          <Link
            to={`/processes/${processId}/overview`}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              location.pathname.includes('/overview')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Eye className="h-4 w-4" />
            <span>Overview</span>
          </Link>
          
          <Link
            to={`/processes/${processId}/executions`}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              location.pathname.includes('/executions')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Clock className="h-4 w-4" />
            <span>Executions</span>
          </Link>
          
          <Link
            to={`/processes/${processId}/team`}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              location.pathname.includes('/team')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Users className="h-4 w-4" />
            <span>Stakeholders</span>
          </Link>
          
          <Link
            to={`/processes/${processId}/settings`}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              location.pathname.includes('/settings')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Configuration</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default ProcessNavigation;
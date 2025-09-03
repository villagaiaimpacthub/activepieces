/**
 * Quick Actions Component - Navigation quick actions for common SOP tasks
 * Provides fast access to frequently used SOP operations
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Play, 
  Copy, 
  Import, 
  Export,
  Search,
  Bell,
  BookOpen,
  Users,
  Settings,
  Zap,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';

export interface QuickAction {
  id: string;
  label: string;
  sopLabel?: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'outline';
  shortcut?: string;
  tooltip?: string;
  badge?: number;
  disabled?: boolean;
}

export interface QuickActionsProps {
  actions?: QuickAction[];
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  showShortcuts?: boolean;
  className?: string;
  onActionClick?: (actionId: string) => void;
}

const getDefaultActions = (onActionClick?: (actionId: string) => void): QuickAction[] => [
  {
    id: 'create-sop',
    label: 'Create Flow',
    sopLabel: 'Create New SOP',
    icon: <Plus className="h-4 w-4" />,
    onClick: () => onActionClick?.('create-sop'),
    variant: 'primary',
    shortcut: 'Ctrl+N',
    tooltip: 'Create a new Standard Operating Procedure'
  },
  {
    id: 'run-sop',
    label: 'Run Flow',
    sopLabel: 'Execute SOP',
    icon: <Play className="h-4 w-4" />,
    onClick: () => onActionClick?.('run-sop'),
    variant: 'secondary',
    shortcut: 'Ctrl+R',
    tooltip: 'Execute an existing SOP'
  },
  {
    id: 'duplicate-sop',
    label: 'Duplicate',
    sopLabel: 'Duplicate SOP',
    icon: <Copy className="h-4 w-4" />,
    onClick: () => onActionClick?.('duplicate-sop'),
    variant: 'outline',
    shortcut: 'Ctrl+D',
    tooltip: 'Duplicate an existing SOP'
  },
  {
    id: 'import-sop',
    label: 'Import',
    sopLabel: 'Import SOP',
    icon: <Import className="h-4 w-4" />,
    onClick: () => onActionClick?.('import-sop'),
    variant: 'outline',
    tooltip: 'Import SOP from file'
  },
  {
    id: 'export-sop',
    label: 'Export',
    sopLabel: 'Export SOP',
    icon: <Export className="h-4 w-4" />,
    onClick: () => onActionClick?.('export-sop'),
    variant: 'outline',
    tooltip: 'Export SOP to file'
  },
  {
    id: 'search',
    label: 'Search',
    sopLabel: 'Search SOPs',
    icon: <Search className="h-4 w-4" />,
    onClick: () => onActionClick?.('search'),
    variant: 'outline',
    shortcut: 'Ctrl+K',
    tooltip: 'Search through SOPs'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    sopLabel: 'Process Alerts',
    icon: <Bell className="h-4 w-4" />,
    onClick: () => onActionClick?.('notifications'),
    variant: 'outline',
    badge: 3,
    tooltip: 'View process notifications and alerts'
  }
];

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  orientation = 'horizontal',
  size = 'md',
  showLabels = true,
  showShortcuts = false,
  className,
  onActionClick
}) => {
  const { theme } = useTheme();
  const [activeAction, setActiveAction] = useState<string | null>(null);
  
  const quickActions = actions || getDefaultActions(onActionClick);

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-2 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    };
    return sizes[size];
  };

  const getVariantClasses = (variant: string = 'default') => {
    const variants = {
      default: 'bg-background text-foreground border-border hover:bg-accent',
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border-secondary',
      outline: 'bg-transparent border-border text-foreground hover:bg-accent'
    };
    return variants[variant as keyof typeof variants] || variants.default;
  };

  const handleActionClick = (action: QuickAction) => {
    if (action.disabled) return;
    
    setActiveAction(action.id);
    setTimeout(() => setActiveAction(null), 150); // Brief highlight
    
    action.onClick();
  };

  const renderAction = (action: QuickAction) => {
    const isActive = activeAction === action.id;
    
    return (
      <button
        key={action.id}
        onClick={() => handleActionClick(action)}
        disabled={action.disabled}
        className={cn(
          "relative inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 border",
          getSizeClasses(),
          getVariantClasses(action.variant),
          isActive && "scale-95",
          action.disabled && "opacity-50 cursor-not-allowed",
          !showLabels && "aspect-square",
          className
        )}
        title={action.tooltip}
      >
        <span className={cn(showLabels && "mr-2")}>
          {action.icon}
        </span>
        
        {showLabels && (
          <span className="whitespace-nowrap">
            {action.sopLabel || action.label}
          </span>
        )}
        
        {showShortcuts && action.shortcut && (
          <span className="ml-2 text-xs opacity-60 bg-muted px-1.5 py-0.5 rounded">
            {action.shortcut}
          </span>
        )}
        
        {action.badge && action.badge > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs font-medium rounded-full flex items-center justify-center">
            {action.badge > 99 ? '99+' : action.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <div 
      className={cn(
        "flex gap-2",
        orientation === 'vertical' ? "flex-col" : "flex-row flex-wrap",
        className
      )}
      role="toolbar"
      aria-label="Quick Actions"
    >
      {quickActions.map(action => renderAction(action))}
    </div>
  );
};

// Specialized Quick Actions for different contexts
export const ProcessQuickActions: React.FC<Omit<QuickActionsProps, 'actions'> & { processId?: string }> = ({
  processId,
  onActionClick,
  ...props
}) => {
  const processActions: QuickAction[] = [
    {
      id: 'edit-process',
      label: 'Edit',
      sopLabel: 'Edit SOP',
      icon: <Settings className="h-4 w-4" />,
      onClick: () => onActionClick?.('edit-process'),
      variant: 'primary',
      shortcut: 'E'
    },
    {
      id: 'run-process',
      label: 'Execute',
      sopLabel: 'Run SOP',
      icon: <Play className="h-4 w-4" />,
      onClick: () => onActionClick?.('run-process'),
      variant: 'secondary',
      shortcut: 'R'
    },
    {
      id: 'duplicate-process',
      label: 'Duplicate',
      sopLabel: 'Clone SOP',
      icon: <Copy className="h-4 w-4" />,
      onClick: () => onActionClick?.('duplicate-process'),
      variant: 'outline',
      shortcut: 'D'
    }
  ];

  return <QuickActions actions={processActions} onActionClick={onActionClick} {...props} />;
};

export const DashboardQuickActions: React.FC<Omit<QuickActionsProps, 'actions'>> = ({
  onActionClick,
  ...props
}) => {
  const dashboardActions: QuickAction[] = [
    {
      id: 'create-sop',
      label: 'New SOP',
      sopLabel: 'Create Standard Operating Procedure',
      icon: <Plus className="h-4 w-4" />,
      onClick: () => onActionClick?.('create-sop'),
      variant: 'primary'
    },
    {
      id: 'templates',
      label: 'Templates',
      sopLabel: 'SOP Templates',
      icon: <BookOpen className="h-4 w-4" />,
      onClick: () => onActionClick?.('templates'),
      variant: 'secondary'
    },
    {
      id: 'team-management',
      label: 'Team',
      sopLabel: 'Manage Team',
      icon: <Users className="h-4 w-4" />,
      onClick: () => onActionClick?.('team-management'),
      variant: 'outline'
    },
    {
      id: 'quick-setup',
      label: 'Quick Setup',
      sopLabel: 'SOP Quick Setup',
      icon: <Zap className="h-4 w-4" />,
      onClick: () => onActionClick?.('quick-setup'),
      variant: 'outline'
    }
  ];

  return <QuickActions actions={dashboardActions} onActionClick={onActionClick} {...props} />;
};

export default QuickActions;
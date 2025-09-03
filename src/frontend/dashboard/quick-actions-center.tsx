/**
 * Quick Actions Center - Centralized quick actions for common SOP operations
 * Provides easy access to frequently used features and shortcuts
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Upload, 
  Download, 
  Copy,
  Share2,
  Settings,
  Users,
  Calendar,
  FileText,
  Search,
  Bookmark,
  Clock,
  Zap,
  Folder,
  BarChart3,
  Shield,
  HelpCircle,
  Keyboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeSystem } from '@/components/theme/theme-system-provider';

export interface ActionGroup {
  id: string;
  name: string;
  sopName?: string;
  description: string;
  actions: QuickAction[];
  permissions?: string[];
  category: 'creation' | 'management' | 'collaboration' | 'analytics' | 'system';
}

export interface QuickAction {
  id: string;
  label: string;
  sopLabel?: string;
  description: string;
  icon: React.ReactNode;
  shortcut?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  permissions?: string[];
  category?: string;
  onClick: () => void;
}

export interface QuickActionsCenterProps {
  config?: {
    showCategories?: boolean;
    showShortcuts?: boolean;
    showDescriptions?: boolean;
    maxActionsPerGroup?: number;
    layout?: 'grid' | 'list' | 'compact';
  };
  userRole?: 'admin' | 'manager' | 'user';
  onActionClick?: (action: string, data?: any) => void;
  className?: string;
}

const QuickActionsCenter: React.FC<QuickActionsCenterProps> = ({
  config = {},
  userRole = 'user',
  onActionClick,
  className
}) => {
  const { isCustomBranded } = useThemeSystem();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const {
    showCategories = true,
    showShortcuts = true,
    showDescriptions = true,
    maxActionsPerGroup = 6,
    layout = 'grid'
  } = config;

  const handleActionClick = (actionId: string, data?: any) => {
    onActionClick?.(actionId, data);
  };

  // Define action groups based on user role and branding
  const actionGroups: ActionGroup[] = [
    {
      id: 'creation',
      name: 'Creation & Import',
      sopName: 'SOP Creation',
      description: isCustomBranded ? 'Create and import SOPs' : 'Create and import processes',
      category: 'creation',
      actions: [
        {
          id: 'create-sop',
          label: 'New Process',
          sopLabel: 'New SOP',
          description: isCustomBranded ? 'Create a new Standard Operating Procedure' : 'Create a new workflow process',
          icon: <Plus className="h-4 w-4" />,
          variant: 'primary',
          shortcut: 'Ctrl+N',
          onClick: () => handleActionClick('create-sop')
        },
        {
          id: 'import-sop',
          label: 'Import Process',
          sopLabel: 'Import SOP',
          description: isCustomBranded ? 'Import existing SOP from file' : 'Import existing workflow from file',
          icon: <Upload className="h-4 w-4" />,
          variant: 'secondary',
          shortcut: 'Ctrl+I',
          onClick: () => handleActionClick('import-sop')
        },
        {
          id: 'create-from-template',
          label: 'From Template',
          sopLabel: 'From SOP Template',
          description: isCustomBranded ? 'Create SOP from predefined template' : 'Create process from template',
          icon: <Copy className="h-4 w-4" />,
          variant: 'outline',
          shortcut: 'Ctrl+T',
          onClick: () => handleActionClick('create-from-template')
        },
        {
          id: 'clone-existing',
          label: 'Clone Process',
          sopLabel: 'Clone SOP',
          description: isCustomBranded ? 'Duplicate an existing SOP' : 'Duplicate an existing process',
          icon: <Copy className="h-4 w-4" />,
          variant: 'outline',
          onClick: () => handleActionClick('clone-existing')
        }
      ]
    },
    {
      id: 'management',
      name: 'Management & Organization',
      sopName: 'SOP Management',
      description: isCustomBranded ? 'Manage and organize your SOPs' : 'Manage and organize processes',
      category: 'management',
      actions: [
        {
          id: 'browse-sops',
          label: 'Browse Processes',
          sopLabel: 'Browse SOPs',
          description: isCustomBranded ? 'View and manage all SOPs' : 'View and manage all processes',
          icon: <Folder className="h-4 w-4" />,
          variant: 'secondary',
          shortcut: 'Ctrl+B',
          onClick: () => handleActionClick('browse-sops')
        },
        {
          id: 'search-sops',
          label: 'Search',
          sopLabel: 'Search SOPs',
          description: isCustomBranded ? 'Search across all SOPs' : 'Search across all processes',
          icon: <Search className="h-4 w-4" />,
          variant: 'outline',
          shortcut: 'Ctrl+/',
          onClick: () => handleActionClick('search-sops')
        },
        {
          id: 'favorites',
          label: 'Favorites',
          sopLabel: 'Favorite SOPs',
          description: isCustomBranded ? 'Access your favorite SOPs' : 'Access your favorite processes',
          icon: <Bookmark className="h-4 w-4" />,
          variant: 'outline',
          onClick: () => handleActionClick('favorites')
        },
        {
          id: 'recent-activity',
          label: 'Recent Activity',
          sopLabel: 'Recent SOP Activity',
          description: 'View recent activity and changes',
          icon: <Clock className="h-4 w-4" />,
          variant: 'outline',
          onClick: () => handleActionClick('recent-activity')
        }
      ]
    },
    {
      id: 'collaboration',
      name: 'Team & Collaboration',
      sopName: 'Stakeholder Collaboration',
      description: isCustomBranded ? 'Collaborate with stakeholders' : 'Collaborate with team members',
      category: 'collaboration',
      permissions: ['collaborate'],
      actions: [
        {
          id: 'team-dashboard',
          label: 'Team Dashboard',
          sopLabel: 'Stakeholder Dashboard',
          description: isCustomBranded ? 'View stakeholder performance and activity' : 'View team performance and activity',
          icon: <Users className="h-4 w-4" />,
          variant: 'secondary',
          onClick: () => handleActionClick('team-dashboard')
        },
        {
          id: 'schedule-meeting',
          label: 'Schedule Meeting',
          sopLabel: 'Schedule Review',
          description: isCustomBranded ? 'Schedule SOP review meeting' : 'Schedule process review meeting',
          icon: <Calendar className="h-4 w-4" />,
          variant: 'outline',
          onClick: () => handleActionClick('schedule-meeting')
        },
        {
          id: 'share-sop',
          label: 'Share Process',
          sopLabel: 'Share SOP',
          description: isCustomBranded ? 'Share SOP with stakeholders' : 'Share process with team members',
          icon: <Share2 className="h-4 w-4" />,
          variant: 'outline',
          onClick: () => handleActionClick('share-sop')
        },
        {
          id: 'assign-tasks',
          label: 'Assign Tasks',
          sopLabel: 'Assign SOP Tasks',
          description: 'Assign tasks to team members',
          icon: <Users className="h-4 w-4" />,
          variant: 'outline',
          permissions: ['assign'],
          onClick: () => handleActionClick('assign-tasks')
        }
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics & Reports',
      sopName: 'SOP Analytics',
      description: isCustomBranded ? 'View SOP performance and analytics' : 'View process performance and analytics',
      category: 'analytics',
      permissions: ['analytics'],
      actions: [
        {
          id: 'view-analytics',
          label: 'Analytics Dashboard',
          sopLabel: 'SOP Analytics',
          description: isCustomBranded ? 'View detailed SOP analytics' : 'View detailed process analytics',
          icon: <BarChart3 className="h-4 w-4" />,
          variant: 'secondary',
          shortcut: 'Ctrl+A',
          onClick: () => handleActionClick('view-analytics')
        },
        {
          id: 'generate-report',
          label: 'Generate Report',
          sopLabel: 'Generate SOP Report',
          description: 'Create performance and compliance reports',
          icon: <FileText className="h-4 w-4" />,
          variant: 'outline',
          onClick: () => handleActionClick('generate-report')
        },
        {
          id: 'export-data',
          label: 'Export Data',
          sopLabel: 'Export SOP Data',
          description: 'Export data for external analysis',
          icon: <Download className="h-4 w-4" />,
          variant: 'outline',
          onClick: () => handleActionClick('export-data')
        }
      ]
    }
  ];

  // Add system actions for admins
  if (userRole === 'admin') {
    actionGroups.push({
      id: 'system',
      name: 'System & Settings',
      sopName: 'System Administration',
      description: 'System configuration and administration',
      category: 'system',
      permissions: ['admin'],
      actions: [
        {
          id: 'system-settings',
          label: 'System Settings',
          sopLabel: 'SOP System Settings',
          description: 'Configure system-wide settings',
          icon: <Settings className="h-4 w-4" />,
          variant: 'outline',
          onClick: () => handleActionClick('system-settings')
        },
        {
          id: 'user-management',
          label: 'User Management',
          sopLabel: 'Stakeholder Management',
          description: isCustomBranded ? 'Manage stakeholders and permissions' : 'Manage users and permissions',
          icon: <Shield className="h-4 w-4" />,
          variant: 'outline',
          onClick: () => handleActionClick('user-management')
        },
        {
          id: 'automation-settings',
          label: 'Automation',
          sopLabel: 'SOP Automation',
          description: 'Configure automation and integrations',
          icon: <Zap className="h-4 w-4" />,
          variant: 'outline',
          onClick: () => handleActionClick('automation-settings')
        }
      ]
    });
  }

  // Filter actions based on search and category
  const filteredGroups = React.useMemo(() => {
    return actionGroups
      .filter(group => {
        if (!showCategories || selectedCategory === 'all') return true;
        return group.category === selectedCategory;
      })
      .map(group => ({
        ...group,
        actions: group.actions
          .filter(action => {
            if (!searchQuery) return true;
            return (
              action.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (action.sopLabel && action.sopLabel.toLowerCase().includes(searchQuery.toLowerCase())) ||
              action.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
          })
          .slice(0, maxActionsPerGroup)
      }))
      .filter(group => group.actions.length > 0);
  }, [actionGroups, searchQuery, selectedCategory, showCategories, maxActionsPerGroup]);

  const categories = Array.from(new Set(actionGroups.map(group => group.category)));

  const renderAction = (action: QuickAction, compact = false) => {
    const variantClasses = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
    };

    return (
      <button
        key={action.id}
        onClick={action.onClick}
        className={cn(
          "group relative p-3 rounded-lg transition-all text-left",
          compact ? "flex items-center space-x-2" : "space-y-2",
          variantClasses[action.variant || 'outline']
        )}
        title={action.description}
      >
        <div className={cn(
          "flex items-center",
          compact ? "space-x-2" : "space-x-2 justify-between"
        )}>
          <div className="flex items-center space-x-2">
            {action.icon}
            <span className={cn("font-medium", compact ? "text-sm" : "")}>
              {isCustomBranded && action.sopLabel ? action.sopLabel : action.label}
            </span>
          </div>
          
          {showShortcuts && action.shortcut && !compact && (
            <span className="text-xs opacity-60 bg-black/10 px-1.5 py-0.5 rounded">
              {action.shortcut}
            </span>
          )}
        </div>
        
        {showDescriptions && !compact && (
          <p className="text-xs opacity-75 line-clamp-2">
            {action.description}
          </p>
        )}
        
        {compact && showShortcuts && action.shortcut && (
          <span className="text-xs opacity-60 ml-auto">
            {action.shortcut}
          </span>
        )}
      </button>
    );
  };

  const renderActionGroup = (group: ActionGroup) => (
    <div key={group.id} className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">
          {isCustomBranded && group.sopName ? group.sopName : group.name}
        </h3>
        {group.actions.length > maxActionsPerGroup && (
          <button
            onClick={() => handleActionClick('view-all-actions', { groupId: group.id })}
            className="text-xs text-primary hover:text-primary/80"
          >
            View All
          </button>
        )}
      </div>
      
      {showDescriptions && (
        <p className="text-sm text-muted-foreground">{group.description}</p>
      )}
      
      <div className={cn(
        layout === 'grid' ? "grid grid-cols-2 gap-2" :
        layout === 'list' ? "space-y-2" :
        "flex flex-wrap gap-2"
      )}>
        {group.actions.map(action => renderAction(action, layout === 'compact'))}
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {isCustomBranded ? 'SOP Quick Actions' : 'Quick Actions'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Fast access to common operations and shortcuts
          </p>
        </div>

        <button
          onClick={() => handleActionClick('keyboard-shortcuts')}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          title="View Keyboard Shortcuts"
        >
          <Keyboard className="h-4 w-4" />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        {showCategories && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-input rounded bg-background text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Action Groups */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-8">
          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No actions found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'Try adjusting your search query.' : 'No actions available for your role.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map(renderActionGroup)}
        </div>
      )}

      {/* Help Section */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
          <button
            onClick={() => handleActionClick('help-center')}
            className="flex items-center space-x-1 hover:text-foreground transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Help Center</span>
          </button>
          
          {showShortcuts && (
            <button
              onClick={() => handleActionClick('keyboard-shortcuts')}
              className="flex items-center space-x-1 hover:text-foreground transition-colors"
            >
              <Keyboard className="h-4 w-4" />
              <span>Shortcuts</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActionsCenter;
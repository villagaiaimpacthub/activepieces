import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  FileText, 
  Play, 
  BarChart3, 
  Settings, 
  Users, 
  Calendar,
  BookOpen,
  Target,
  Zap
} from 'lucide-react';
import { useTerminology } from '../hooks/useSopDashboardData';
import { DashboardWidgetProps, QuickAction } from '../types/dashboard.types';

interface ActionButtonProps {
  action: QuickAction;
  onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ action, onClick }) => {
  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ElementType> = {
      Plus,
      FileText,
      Play,
      BarChart3,
      Settings,
      Users,
      Calendar,
      BookOpen,
      Target,
      Zap
    };
    
    const IconComponent = icons[iconName] || FileText;
    return <IconComponent className="h-5 w-5" />;
  };

  const handleClick = () => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      window.location.href = action.href;
    } else {
      onClick?.();
    }
  };

  return (
    <Button
      variant="outline"
      className="h-auto p-4 flex flex-col items-center justify-center space-y-2 hover:border-primary/50 hover:bg-accent/50 transition-all duration-200"
      onClick={handleClick}
    >
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        {getIcon(action.icon)}
      </div>
      <div className="text-center">
        <div className="font-medium text-sm">{action.title}</div>
        {action.description && (
          <div className="text-xs text-muted-foreground mt-1">
            {action.description}
          </div>
        )}
      </div>
    </Button>
  );
};

export const QuickActionsWidget: React.FC<DashboardWidgetProps & {
  onCreateSOP?: () => void;
  onBrowseLibrary?: () => void;
  onExecuteTemplate?: () => void;
  onViewReports?: () => void;
  onManageUsers?: () => void;
  onScheduleReview?: () => void;
  customActions?: QuickAction[];
}> = ({ 
  title, 
  isLoading, 
  error, 
  className,
  onCreateSOP,
  onBrowseLibrary,
  onExecuteTemplate,
  onViewReports,
  onManageUsers,
  onScheduleReview,
  customActions = []
}) => {
  const { translate } = useTerminology();

  // Default quick actions
  const defaultActions: QuickAction[] = [
    {
      id: 'create-sop',
      title: translate('Create SOP'),
      description: translate('Start a new procedure'),
      icon: 'Plus',
      action: 'create',
      onClick: onCreateSOP
    },
    {
      id: 'browse-library',
      title: translate('Browse Library'),
      description: translate('View all SOPs'),
      icon: 'BookOpen',
      action: 'browse',
      onClick: onBrowseLibrary
    },
    {
      id: 'execute-template',
      title: translate('Execute Template'),
      description: translate('Run existing SOP'),
      icon: 'Play',
      action: 'execute',
      onClick: onExecuteTemplate
    },
    {
      id: 'view-reports',
      title: translate('View Reports'),
      description: translate('Analytics & insights'),
      icon: 'BarChart3',
      action: 'reports',
      onClick: onViewReports
    },
    {
      id: 'manage-users',
      title: translate('Manage Users'),
      description: translate('Team & permissions'),
      icon: 'Users',
      action: 'users',
      onClick: onManageUsers
    },
    {
      id: 'schedule-review',
      title: translate('Schedule Review'),
      description: translate('Plan audits'),
      icon: 'Calendar',
      action: 'schedule',
      onClick: onScheduleReview
    }
  ];

  // Combine default and custom actions
  const allActions = [...defaultActions, ...customActions];

  if (isLoading) {
    return (
      <Card className={cn('h-fit', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <Skeleton className="h-6 w-28" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 border rounded-lg p-4">
                <Skeleton className="h-5 w-5 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto mb-1" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          {translate(title || 'Quick Actions')}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {allActions.map((action) => (
            <ActionButton 
              key={action.id} 
              action={action}
            />
          ))}
        </div>
        
        {/* Additional helpful actions section */}
        <div className="mt-6 pt-4 border-t space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">
            {translate('Need Help?')}
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="justify-start h-auto py-2"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium text-xs">{translate('Documentation')}</div>
                <div className="text-xs text-muted-foreground">{translate('Learn SOP best practices')}</div>
              </div>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="justify-start h-auto py-2"
            >
              <Target className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium text-xs">{translate('Training')}</div>
                <div className="text-xs text-muted-foreground">{translate('Team training resources')}</div>
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
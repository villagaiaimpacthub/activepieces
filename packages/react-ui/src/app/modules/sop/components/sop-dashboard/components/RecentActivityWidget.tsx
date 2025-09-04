import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  Activity, 
  Play, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Edit, 
  User, 
  Clock,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useSopActivity, useTerminology } from '../hooks/useSopDashboardData';
import { DashboardWidgetProps, SopActivity } from '../types/dashboard.types';

interface ActivityItemProps {
  activity: SopActivity;
  onClick?: (activityId: string) => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onClick }) => {
  const { translate } = useTerminology();
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'execution_started':
        return <Play className="h-4 w-4 text-blue-600" />;
      case 'execution_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'execution_failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'sop_created':
        return <Plus className="h-4 w-4 text-purple-600" />;
      case 'sop_updated':
        return <Edit className="h-4 w-4 text-amber-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityMessage = (activity: SopActivity) => {
    switch (activity.type) {
      case 'execution_started':
        return `${translate('Started execution of')} ${activity.sopName}`;
      case 'execution_completed':
        return `${translate('Completed execution of')} ${activity.sopName}`;
      case 'execution_failed':
        return `${translate('Failed execution of')} ${activity.sopName}`;
      case 'sop_created':
        return `${translate('Created SOP')} ${activity.sopName}`;
      case 'sop_updated':
        return `${translate('Updated SOP')} ${activity.sopName}`;
      default:
        return `${translate('Activity on')} ${activity.sopName}`;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-200' },
      error: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-200' },
      pending: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      in_progress: { variant: 'outline' as const, className: 'bg-blue-100 text-blue-800 border-blue-200' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.success;
    return (
      <Badge variant={config.variant} className={cn('text-xs', config.className)}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return activityTime.toLocaleDateString();
  };

  return (
    <div 
      className={cn(
        'p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors',
        onClick && 'hover:border-accent-foreground/20'
      )}
      onClick={() => onClick?.(activity.id)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getActivityIcon(activity.type)}
        </div>
        
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-tight">
              {getActivityMessage(activity)}
            </p>
            {getStatusBadge(activity.status)}
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{activity.userName}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(activity.timestamp)}</span>
            </div>
          </div>
          
          {activity.details && (
            <p className="text-xs text-muted-foreground italic">
              {activity.details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const RecentActivityWidget: React.FC<DashboardWidgetProps & {
  limit?: number;
  onActivityClick?: (activityId: string) => void;
  onViewAllClick?: () => void;
}> = ({ 
  title, 
  isLoading, 
  error, 
  className, 
  limit = 10,
  onActivityClick,
  onViewAllClick 
}) => {
  const { data: activities, isLoading: activitiesLoading, error: activitiesError } = useSopActivity(limit);
  const { translate } = useTerminology();

  const loading = isLoading || activitiesLoading;
  const hasError = error || activitiesError;

  if (loading) {
    return (
      <Card className={cn('h-fit', className)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-8 w-20" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-4 w-4 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <div className="flex gap-4">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card className={cn('h-fit', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            {translate(title || 'Recent Activity')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Failed to load activity</p>
            <p className="text-sm text-muted-foreground">
              {hasError?.toString() || 'An error occurred while fetching recent activity'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('h-fit', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            {translate(title || 'Recent Activity')}
          </div>
          {onViewAllClick && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onViewAllClick}
              className="text-xs"
            >
              {translate('View All')}
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {activities && activities.length > 0 ? (
              activities.map((activity) => (
                <ActivityItem 
                  key={activity.id} 
                  activity={activity} 
                  onClick={onActivityClick}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">{translate('No recent activity')}</h4>
                <p className="text-sm text-muted-foreground">
                  {translate('SOP activities will appear here when they occur')}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
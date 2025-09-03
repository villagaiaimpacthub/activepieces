import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Plus,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Archive
} from 'lucide-react';

export interface SOPMetrics {
  totalSOPs: number;
  activeSOPs: number;
  completedExecutions: number;
  averageCompletionTime: number;
  complianceRate: number;
  recentActivity: number;
}

export interface RecentSOP {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'archived';
  lastModified: Date;
  lastModifiedBy: string;
  category: string;
  executionCount?: number;
}

export interface ActiveExecution {
  id: string;
  sopTitle: string;
  assignee: string;
  currentStep: string;
  progress: number;
  startedAt: Date;
  estimatedCompletion?: Date;
}

export interface SOPDashboardProps extends React.HTMLAttributes<HTMLDivElement> {
  metrics: SOPMetrics;
  recentSOPs: RecentSOP[];
  activeExecutions: ActiveExecution[];
  onCreateSOP?: () => void;
  onSOPClick?: (sopId: string) => void;
  onExecutionClick?: (executionId: string) => void;
  onViewAllSOPs?: () => void;
  onViewAllExecutions?: () => void;
}

const statusColors = {
  draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  archived: 'bg-gray-100 text-gray-800 border-gray-200'
};

const SOPDashboard = React.forwardRef<HTMLDivElement, SOPDashboardProps>(
  ({
    className,
    metrics,
    recentSOPs,
    activeExecutions,
    onCreateSOP,
    onSOPClick,
    onExecutionClick,
    onViewAllSOPs,
    onViewAllExecutions,
    ...props
  }, ref) => {
    const formatDuration = (minutes: number) => {
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    };

    const formatDate = (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) return 'Today';
      if (days === 1) return 'Yesterday';
      if (days < 7) return `${days} days ago`;
      return date.toLocaleDateString();
    };

    const renderMetricCard = (
      title: string,
      value: string | number,
      icon: React.ComponentType<{ className?: string }>,
      trend?: { value: number; isPositive: boolean },
      color: string = 'text-primary'
    ) => {
      const IconComponent = icon;
      
      return (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
              <IconComponent className={cn('h-4 w-4', color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{value}</div>
              {trend && (
                <div className={cn(
                  'flex items-center text-xs',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}>
                  <TrendingUp className={cn(
                    'h-3 w-3 mr-1',
                    !trend.isPositive && 'rotate-180'
                  )} />
                  {Math.abs(trend.value)}%
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    };

    return (
      <div
        ref={ref}
        className={cn('p-6 space-y-6', className)}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">SOP Dashboard</h1>
            <p className="text-muted-foreground">
              Manage and monitor your Standard Operating Procedures
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Button>
            
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            
            <Button onClick={onCreateSOP} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create SOP</span>
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderMetricCard(
            'Total SOPs',
            metrics.totalSOPs,
            FileText,
            undefined,
            'text-blue-600'
          )}
          
          {renderMetricCard(
            'Active SOPs',
            metrics.activeSOPs,
            CheckCircle,
            { value: 12, isPositive: true },
            'text-green-600'
          )}
          
          {renderMetricCard(
            'Avg. Completion Time',
            formatDuration(metrics.averageCompletionTime),
            Clock,
            { value: 8, isPositive: false },
            'text-amber-600'
          )}
          
          {renderMetricCard(
            'Compliance Rate',
            `${metrics.complianceRate}%`,
            TrendingUp,
            { value: 5, isPositive: true },
            'text-purple-600'
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent SOPs */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Recent SOPs</span>
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onViewAllSOPs}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSOPs.length > 0 ? (
                  recentSOPs.map((sop) => (
                    <div
                      key={sop.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => onSOPClick?.(sop.id)}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{sop.title}</h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>{sop.category}</span>
                            <span>•</span>
                            <span>Modified {formatDate(sop.lastModified)}</span>
                            <span>•</span>
                            <span>by {sop.lastModifiedBy}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="outline"
                            className={statusColors[sop.status]}
                          >
                            {sop.status}
                          </Badge>
                          
                          {sop.executionCount && (
                            <Badge variant="secondary">
                              {sop.executionCount} runs
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-3">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No SOPs yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first SOP to get started
                    </p>
                    <Button onClick={onCreateSOP}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First SOP
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Executions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Active Executions</span>
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={onViewAllExecutions}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-3">
                  {activeExecutions.length > 0 ? (
                    activeExecutions.map((execution) => (
                      <div
                        key={execution.id}
                        className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => onExecutionClick?.(execution.id)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm leading-tight">
                              {execution.sopTitle}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {execution.progress}%
                            </Badge>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            <p>{execution.assignee}</p>
                            <p className="truncate">{execution.currentStep}</p>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-primary h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${execution.progress}%` }}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Started {formatDate(execution.startedAt)}</span>
                            {execution.estimatedCompletion && (
                              <span>
                                Est. {formatDate(execution.estimatedCompletion)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <h4 className="font-medium mb-2">No active executions</h4>
                      <p className="text-xs text-muted-foreground">
                        Start executing an SOP to see progress here
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center space-y-2"
                onClick={onCreateSOP}
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm">Create SOP</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center space-y-2"
                onClick={onViewAllSOPs}
              >
                <FileText className="h-6 w-6" />
                <span className="text-sm">Browse Library</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center space-y-2"
              >
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Schedule Review</span>
              </Button>
              
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center space-y-2"
              >
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

SOPDashboard.displayName = 'SOPDashboard';

export { SOPDashboard };
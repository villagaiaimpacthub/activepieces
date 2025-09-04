import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  Play, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  AlertCircle 
} from 'lucide-react';
import { useSopStats, useTerminology } from '../hooks/useSopDashboardData';
import { DashboardWidgetProps } from '../types/dashboard.types';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  status?: 'success' | 'warning' | 'error' | 'default';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  status = 'default' 
}) => {
  const statusColors = {
    success: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
    error: 'text-red-600 bg-red-50 border-red-200',
    default: 'text-primary bg-muted/20 border-muted-foreground/20'
  };

  return (
    <div className={cn('p-4 rounded-lg border', statusColors[status])}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-5 w-5" />
        {trend && (
          <div className={cn(
            'flex items-center text-xs font-medium',
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
      <div className="space-y-1">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium opacity-80">{label}</p>
      </div>
    </div>
  );
};

export const SopOverviewWidget: React.FC<DashboardWidgetProps> = ({ 
  title, 
  isLoading, 
  error, 
  className 
}) => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useSopStats();
  const { translate } = useTerminology();

  const loading = isLoading || statsLoading;
  const hasError = error || statsError;

  if (loading) {
    return (
      <Card className={cn('h-fit', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 rounded-lg border">
                <Skeleton className="h-5 w-5 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
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
            {translate(title || 'SOP Overview')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Failed to load SOP data</p>
            <p className="text-sm text-muted-foreground">
              {hasError?.toString() || 'An error occurred while fetching SOP statistics'}
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
            <FileText className="h-5 w-5 text-blue-600" />
            {translate(title || 'SOP Overview')}
          </div>
          <Badge variant="secondary" className="text-xs">
            Live Data
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            label={translate('Total SOPs')}
            value={stats?.totalSops || 0}
            icon={FileText}
            status="default"
          />
          
          <MetricCard
            label={translate('Active Executions')}
            value={stats?.activeExecutions || 0}
            icon={Play}
            trend={{ value: 8, isPositive: true }}
            status="success"
          />
          
          <MetricCard
            label={translate('Completed Today')}
            value={stats?.completedToday || 0}
            icon={CheckCircle}
            trend={{ value: 12, isPositive: true }}
            status="success"
          />
          
          <MetricCard
            label={translate('Success Rate')}
            value={`${stats?.successRate || 0}%`}
            icon={TrendingUp}
            trend={{ value: 3, isPositive: true }}
            status={
              (stats?.successRate || 0) >= 95 ? 'success' : 
              (stats?.successRate || 0) >= 85 ? 'warning' : 'error'
            }
          />
        </div>
        
        {/* Additional summary metrics */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">
              {translate('Average Execution Time')}
            </span>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="font-semibold">
                {stats?.averageExecutionTime ? `${Math.round(stats.averageExecutionTime / 60)}m` : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">
              {translate('Compliance Score')}
            </span>
            <div className="flex items-center gap-2">
              <div className={cn(
                'h-2 w-2 rounded-full',
                (stats?.complianceScore || 0) >= 90 ? 'bg-green-500' :
                (stats?.complianceScore || 0) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              )} />
              <span className="font-semibold">
                {stats?.complianceScore || 0}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity,
  Calendar,
  AlertCircle,
  Target
} from 'lucide-react';
import { useSopPerformance, useTerminology } from '../hooks/useSopDashboardData';
import { DashboardWidgetProps, PerformanceMetric } from '../types/dashboard.types';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  icon: React.ElementType;
  status?: 'good' | 'warning' | 'poor';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  change, 
  icon: Icon, 
  status = 'good' 
}) => {
  const statusColors = {
    good: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    poor: 'border-red-200 bg-red-50'
  };

  return (
    <div className={cn('p-3 rounded-lg border', statusColors[status])}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={cn('h-4 w-4',
          status === 'good' ? 'text-green-600' :
          status === 'warning' ? 'text-yellow-600' : 'text-red-600'
        )} />
        {change && (
          <div className={cn(
            'flex items-center text-xs font-medium',
            change.isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {change.isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {Math.abs(change.value)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-lg font-bold">{value}</p>
        <p className="text-xs font-medium opacity-80">{label}</p>
        {change && (
          <p className="text-xs text-muted-foreground">
            vs {change.period}
          </p>
        )}
      </div>
    </div>
  );
};

interface PeriodButtonProps {
  period: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const PeriodButton: React.FC<PeriodButtonProps> = ({ 
  period, 
  label, 
  isActive, 
  onClick 
}) => (
  <Button
    variant={isActive ? 'default' : 'ghost'}
    size="sm"
    onClick={onClick}
    className={cn(
      'text-xs',
      isActive && 'bg-primary text-primary-foreground'
    )}
  >
    {label}
  </Button>
);

export const PerformanceMetricsWidget: React.FC<DashboardWidgetProps & {
  onViewDetailedReport?: () => void;
}> = ({ 
  title, 
  isLoading, 
  error, 
  className,
  onViewDetailedReport 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const { data: performance, isLoading: performanceLoading, error: performanceError } = useSopPerformance(selectedPeriod);
  const { translate } = useTerminology();

  const loading = isLoading || performanceLoading;
  const hasError = error || performanceError;

  // Calculate aggregated metrics from performance data
  const aggregatedMetrics = React.useMemo(() => {
    if (!performance || performance.length === 0) {
      return {
        totalExecutions: 0,
        avgSuccessRate: 0,
        avgExecutionTime: 0,
        totalFailures: 0
      };
    }

    const totalExecutions = performance.reduce((sum, p) => sum + p.executionCount, 0);
    const totalFailures = performance.reduce((sum, p) => sum + p.failureCount, 0);
    const avgSuccessRate = performance.reduce((sum, p) => sum + p.successRate, 0) / performance.length;
    const avgExecutionTime = performance.reduce((sum, p) => sum + p.averageTime, 0) / performance.length;

    return {
      totalExecutions,
      avgSuccessRate: Math.round(avgSuccessRate),
      avgExecutionTime: Math.round(avgExecutionTime),
      totalFailures
    };
  }, [performance]);

  const periods = [
    { key: '1d', label: '24h' },
    { key: '7d', label: '7d' },
    { key: '30d', label: '30d' },
    { key: '90d', label: '90d' }
  ];

  if (loading) {
    return (
      <Card className={cn('h-fit', className)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-12" />
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-5 w-12 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
          
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-2 border rounded">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
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
            {translate(title || 'Performance Metrics')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Failed to load performance data</p>
            <p className="text-sm text-muted-foreground">
              {hasError?.toString() || 'An error occurred while fetching performance metrics'}
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
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            {translate(title || 'Performance Metrics')}
          </div>
          
          {/* Period selector */}
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
            {periods.map(({ key, label }) => (
              <PeriodButton
                key={key}
                period={key}
                label={label}
                isActive={selectedPeriod === key}
                onClick={() => setSelectedPeriod(key)}
              />
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            label={translate('Total Executions')}
            value={aggregatedMetrics.totalExecutions}
            icon={Activity}
            change={{ value: 15, isPositive: true, period: 'last period' }}
            status="good"
          />
          
          <MetricCard
            label={translate('Success Rate')}
            value={`${aggregatedMetrics.avgSuccessRate}%`}
            icon={CheckCircle}
            change={{ value: 3, isPositive: true, period: 'last period' }}
            status={
              aggregatedMetrics.avgSuccessRate >= 95 ? 'good' :
              aggregatedMetrics.avgSuccessRate >= 85 ? 'warning' : 'poor'
            }
          />
          
          <MetricCard
            label={translate('Avg Execution Time')}
            value={`${Math.round(aggregatedMetrics.avgExecutionTime / 60)}m`}
            icon={Clock}
            change={{ value: 5, isPositive: false, period: 'last period' }}
            status={
              aggregatedMetrics.avgExecutionTime <= 300 ? 'good' :
              aggregatedMetrics.avgExecutionTime <= 600 ? 'warning' : 'poor'
            }
          />
          
          <MetricCard
            label={translate('Failures')}
            value={aggregatedMetrics.totalFailures}
            icon={XCircle}
            change={{ value: 20, isPositive: false, period: 'last period' }}
            status={
              aggregatedMetrics.totalFailures === 0 ? 'good' :
              aggregatedMetrics.totalFailures <= 5 ? 'warning' : 'poor'
            }
          />
        </div>
        
        {/* Performance trends */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            {translate('Performance Trends')}
          </h4>
          
          {performance && performance.length > 0 ? (
            <div className="space-y-2">
              {performance.slice(0, 3).map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{metric.period}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{metric.executionCount} {translate('runs')}</div>
                      <div className="text-xs text-muted-foreground">
                        {metric.successRate}% {translate('success')}
                      </div>
                    </div>
                    
                    <Badge 
                      variant={metric.successRate >= 95 ? 'default' : 'secondary'}
                      className={cn(
                        'text-xs',
                        metric.successRate >= 95 ? 'bg-green-100 text-green-800 border-green-200' :
                        metric.successRate >= 85 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      )}
                    >
                      {metric.successRate >= 95 ? 'Excellent' :
                       metric.successRate >= 85 ? 'Good' : 'Needs Attention'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {translate('No performance data available for selected period')}
              </p>
            </div>
          )}
        </div>
        
        {/* View detailed report button */}
        {onViewDetailedReport && (
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onViewDetailedReport}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {translate('View Detailed Report')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
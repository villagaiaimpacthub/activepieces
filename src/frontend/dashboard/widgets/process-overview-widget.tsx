/**
 * Process Overview Widget - Displays key SOP process metrics and status
 * Shows active processes, completion rates, and performance indicators
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Users,
  Play,
  Pause,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeSystem } from '@/components/theme/theme-system-provider';

export interface ProcessMetrics {
  activeProcesses: number;
  completedToday: number;
  avgCompletionTime: number;
  successRate: number;
  pendingApprovals: number;
  teamUtilization: number;
  trendsData: {
    period: string;
    completions: number;
    avgTime: number;
    successRate: number;
  }[];
  topProcesses: {
    id: string;
    name: string;
    executions: number;
    successRate: number;
    avgTime: number;
    status: 'active' | 'paused' | 'draft';
  }[];
}

export interface ProcessOverviewWidgetProps {
  id?: string;
  config?: {
    showTrends?: boolean;
    showTopProcesses?: boolean;
    timeRange?: '24h' | '7d' | '30d';
    maxProcesses?: number;
  };
  onActionClick?: (action: string, data?: any) => void;
  userRole?: 'admin' | 'manager' | 'user';
  className?: string;
}

const mockMetrics: ProcessMetrics = {
  activeProcesses: 12,
  completedToday: 48,
  avgCompletionTime: 24.5,
  successRate: 94.2,
  pendingApprovals: 3,
  teamUtilization: 87.5,
  trendsData: [
    { period: 'Mon', completions: 45, avgTime: 25.2, successRate: 92.1 },
    { period: 'Tue', completions: 52, avgTime: 23.8, successRate: 95.3 },
    { period: 'Wed', completions: 48, avgTime: 24.5, successRate: 94.2 },
    { period: 'Thu', completions: 51, avgTime: 22.1, successRate: 96.8 },
    { period: 'Fri', completions: 46, avgTime: 26.3, successRate: 91.5 }
  ],
  topProcesses: [
    {
      id: '1',
      name: 'Customer Onboarding SOP',
      executions: 23,
      successRate: 96.5,
      avgTime: 18.2,
      status: 'active'
    },
    {
      id: '2',
      name: 'Employee Training Protocol',
      executions: 15,
      successRate: 100,
      avgTime: 32.5,
      status: 'active'
    },
    {
      id: '3',
      name: 'Quality Assurance Checklist',
      executions: 31,
      successRate: 89.7,
      avgTime: 12.8,
      status: 'active'
    },
    {
      id: '4',
      name: 'Incident Response Procedure',
      executions: 8,
      successRate: 87.5,
      avgTime: 45.2,
      status: 'paused'
    }
  ]
};

const ProcessOverviewWidget: React.FC<ProcessOverviewWidgetProps> = ({
  id,
  config = {},
  onActionClick,
  userRole = 'user',
  className
}) => {
  const { isCustomBranded, getThemeColor } = useThemeSystem();
  const [metrics, setMetrics] = useState<ProcessMetrics>(mockMetrics);
  const [loading, setLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(config.timeRange || '7d');

  const {
    showTrends = true,
    showTopProcesses = true,
    maxProcesses = 4
  } = config;

  useEffect(() => {
    // In a real app, fetch metrics based on timeRange
    setLoading(true);
    setTimeout(() => {
      setMetrics(mockMetrics);
      setLoading(false);
    }, 500);
  }, [selectedTimeRange]);

  const handleActionClick = (action: string, data?: any) => {
    onActionClick?.(action, { widgetId: id, ...data });
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-3 w-3 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="h-3 w-3 text-red-500" />;
    }
    return null;
  };

  const renderMetricCard = (
    title: string, 
    value: string | number, 
    subtitle?: string, 
    icon?: React.ReactNode,
    trend?: { current: number; previous: number },
    color: 'primary' | 'success' | 'warning' | 'info' = 'primary'
  ) => {
    const colorClasses = {
      primary: 'bg-primary/10 text-primary border-primary/20',
      success: 'bg-green-500/10 text-green-600 border-green-500/20',
      warning: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      info: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    };

    return (
      <div className={cn(
        "p-4 rounded-lg border bg-card",
        "hover:shadow-md transition-shadow cursor-pointer"
      )}
      onClick={() => handleActionClick('view-metric-details', { metric: title.toLowerCase().replace(/\s+/g, '-') })}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            {icon && (
              <div className={cn("p-2 rounded-full", colorClasses[color])}>
                {icon}
              </div>
            )}
            {trend && getTrendIcon(trend.current, trend.previous)}
          </div>
        </div>
      </div>
    );
  };

  const renderProcessItem = (process: typeof metrics.topProcesses[0]) => (
    <div
      key={process.id}
      className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors cursor-pointer"
      onClick={() => handleActionClick('view-process', { processId: process.id })}
    >
      <div className="flex items-center space-x-3">
        <div className={cn(
          "w-2 h-2 rounded-full",
          process.status === 'active' ? 'bg-green-500' : 
          process.status === 'paused' ? 'bg-orange-500' : 'bg-gray-400'
        )} />
        
        <div>
          <p className="text-sm font-medium text-foreground">
            {process.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {process.executions} executions • {process.successRate}% success
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-xs text-muted-foreground">
          {formatDuration(process.avgTime)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleActionClick('process-action', { processId: process.id, action: 'options' });
          }}
          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-48", className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          {isCustomBranded ? 'SOP Overview' : 'Process Overview'}
        </h3>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="text-xs border rounded px-2 py-1 bg-background"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {renderMetricCard(
          isCustomBranded ? 'Active SOPs' : 'Active Processes',
          metrics.activeProcesses,
          'Currently running',
          <Play className="h-4 w-4" />,
          undefined,
          'primary'
        )}
        
        {renderMetricCard(
          'Completed Today',
          metrics.completedToday,
          `${metrics.successRate}% success rate`,
          <CheckCircle className="h-4 w-4" />,
          { current: metrics.completedToday, previous: 45 },
          'success'
        )}
        
        {renderMetricCard(
          'Avg. Duration',
          formatDuration(metrics.avgCompletionTime),
          'Per execution',
          <Clock className="h-4 w-4" />,
          { current: metrics.avgCompletionTime, previous: 28.2 },
          'info'
        )}
        
        {renderMetricCard(
          'Pending Approvals',
          metrics.pendingApprovals,
          `${metrics.teamUtilization}% team utilization`,
          <AlertTriangle className="h-4 w-4" />,
          undefined,
          'warning'
        )}
      </div>

      {/* Top Processes */}
      {showTopProcesses && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">
              {isCustomBranded ? 'Top SOPs' : 'Top Processes'}
            </h4>
            <button
              onClick={() => handleActionClick('view-all-processes')}
              className="text-xs text-primary hover:text-primary/80 font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-2">
            {metrics.topProcesses.slice(0, maxProcesses).map(renderProcessItem)}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleActionClick('create-process')}
            className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            {isCustomBranded ? 'Create SOP' : 'New Process'}
          </button>
          
          {userRole !== 'user' && (
            <button
              onClick={() => handleActionClick('view-analytics')}
              className="px-3 py-1.5 text-xs border border-input rounded hover:bg-accent transition-colors"
            >
              Analytics
            </button>
          )}
        </div>
        
        <button
          onClick={() => handleActionClick('refresh-data')}
          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ProcessOverviewWidget;
/**
 * Analytics Dashboard - Comprehensive SOP analytics and performance metrics
 * Displays charts, trends, and detailed analytics for process performance
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Filter,
  Download,
  RefreshCw,
  PieChart,
  LineChart,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeSystem } from '@/components/theme/theme-system-provider';

export interface AnalyticsConfig {
  showProcessMetrics?: boolean;
  showTeamMetrics?: boolean;
  showComplianceMetrics?: boolean;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  chartTypes?: ('bar' | 'line' | 'pie' | 'area')[];
  enableExport?: boolean;
  refreshInterval?: number;
}

export interface AnalyticsDashboardProps {
  config?: AnalyticsConfig;
  onActionClick?: (action: string, data?: any) => void;
  userRole?: 'admin' | 'manager' | 'user';
  className?: string;
}

interface AnalyticsData {
  processPerformance: {
    labels: string[];
    completions: number[];
    successRates: number[];
    avgDurations: number[];
  };
  teamMetrics: {
    members: { name: string; completions: number; efficiency: number }[];
    utilization: number;
    collaboration: number;
  };
  complianceMetrics: {
    overallScore: number;
    auditResults: { process: string; score: number; issues: number }[];
    trends: { period: string; score: number }[];
  };
  kpiData: {
    totalProcesses: number;
    totalExecutions: number;
    avgSuccessRate: number;
    avgCompletionTime: number;
    costSavings: number;
    timesSaved: number;
  };
}

const mockAnalyticsData: AnalyticsData = {
  processPerformance: {
    labels: ['Customer Onboarding', 'Employee Training', 'Quality Assurance', 'Incident Response', 'Data Processing'],
    completions: [156, 89, 234, 45, 178],
    successRates: [94.2, 98.9, 87.3, 91.1, 95.6],
    avgDurations: [24.5, 45.2, 12.8, 67.3, 18.9]
  },
  teamMetrics: {
    members: [
      { name: 'Alice Johnson', completions: 89, efficiency: 94.2 },
      { name: 'Bob Smith', completions: 76, efficiency: 91.8 },
      { name: 'Carol Davis', completions: 112, efficiency: 97.1 },
      { name: 'David Wilson', completions: 67, efficiency: 89.5 }
    ],
    utilization: 87.5,
    collaboration: 92.3
  },
  complianceMetrics: {
    overallScore: 91.2,
    auditResults: [
      { process: 'Customer Onboarding SOP', score: 95.5, issues: 2 },
      { process: 'Employee Training Protocol', score: 98.2, issues: 0 },
      { process: 'Quality Assurance Checklist', score: 84.7, issues: 5 },
      { process: 'Incident Response Procedure', score: 89.1, issues: 3 }
    ],
    trends: [
      { period: 'Jan', score: 87.2 },
      { period: 'Feb', score: 89.1 },
      { period: 'Mar', score: 91.2 },
      { period: 'Apr', score: 90.8 },
      { period: 'May', score: 91.2 }
    ]
  },
  kpiData: {
    totalProcesses: 47,
    totalExecutions: 1247,
    avgSuccessRate: 93.4,
    avgCompletionTime: 28.7,
    costSavings: 125800,
    timesSaved: 847
  }
};

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  config = {},
  onActionClick,
  userRole = 'user',
  className
}) => {
  const { isCustomBranded, getThemeColor } = useThemeSystem();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(mockAnalyticsData);
  const [loading, setLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(config.timeRange || '30d');
  const [selectedMetric, setSelectedMetric] = useState<'performance' | 'team' | 'compliance'>('performance');

  const {
    showProcessMetrics = true,
    showTeamMetrics = userRole !== 'user',
    showComplianceMetrics = userRole === 'admin',
    enableExport = userRole !== 'user'
  } = config;

  useEffect(() => {
    // In a real app, fetch analytics data based on timeRange
    setLoading(true);
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setLoading(false);
    }, 800);
  }, [selectedTimeRange]);

  const handleActionClick = (action: string, data?: any) => {
    onActionClick?.(action, data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const renderKPICard = (
    title: string,
    value: string | number,
    subtitle: string,
    icon: React.ReactNode,
    trend?: { value: number; isPositive: boolean },
    color: string = 'primary'
  ) => (
    <div className="p-4 bg-card rounded-lg border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        
        <div className="flex flex-col items-end space-y-1">
          <div className={`p-2 rounded-full bg-${color}/10 text-${color}`}>
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`h-3 w-3 mr-1 ${!trend.isPositive && 'rotate-180'}`} />
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProcessPerformanceChart = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">
        {isCustomBranded ? 'SOP Performance' : 'Process Performance'}
      </h3>
      
      {/* Simplified bar chart representation */}
      <div className="space-y-2">
        {analyticsData.processPerformance.labels.map((label, index) => {
          const completion = analyticsData.processPerformance.completions[index];
          const successRate = analyticsData.processPerformance.successRates[index];
          const maxCompletion = Math.max(...analyticsData.processPerformance.completions);
          const width = (completion / maxCompletion) * 100;
          
          return (
            <div key={label} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">{label}</span>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{completion} runs</span>
                  <span>•</span>
                  <span>{formatPercentage(successRate)} success</span>
                </div>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderTeamMetrics = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          {isCustomBranded ? 'Stakeholder Performance' : 'Team Performance'}
        </h3>
        <button
          onClick={() => handleActionClick('view-team-details')}
          className="text-xs text-primary hover:text-primary/80"
        >
          View Details
        </button>
      </div>

      {/* Team overview metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">Team Utilization</p>
          <p className="text-lg font-semibold text-foreground">
            {formatPercentage(analyticsData.teamMetrics.utilization)}
          </p>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">Collaboration Score</p>
          <p className="text-lg font-semibold text-foreground">
            {formatPercentage(analyticsData.teamMetrics.collaboration)}
          </p>
        </div>
      </div>

      {/* Individual team member performance */}
      <div className="space-y-2">
        {analyticsData.teamMetrics.members.map((member) => (
          <div 
            key={member.name}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.completions} completions</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {formatPercentage(member.efficiency)}
              </p>
              <p className="text-xs text-muted-foreground">efficiency</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderComplianceMetrics = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Compliance Metrics</h3>
        <div className="flex items-center space-x-2">
          <div className={cn(
            "px-2 py-1 rounded text-xs font-medium",
            analyticsData.complianceMetrics.overallScore >= 90
              ? "bg-green-100 text-green-800"
              : analyticsData.complianceMetrics.overallScore >= 80
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          )}>
            {formatPercentage(analyticsData.complianceMetrics.overallScore)} Overall
          </div>
        </div>
      </div>

      {/* Compliance audit results */}
      <div className="space-y-2">
        {analyticsData.complianceMetrics.auditResults.map((audit) => (
          <div key={audit.process} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="text-sm font-medium text-foreground">{audit.process}</p>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {audit.issues === 0 ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    <span>No issues found</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 text-orange-500" />
                    <span>{audit.issues} issues found</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                {formatPercentage(audit.score)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center h-96", className)}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isCustomBranded ? 'SOP Analytics' : 'Process Analytics'}
          </h2>
          <p className="text-muted-foreground">
            Performance insights and process optimization metrics
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="text-sm border rounded px-3 py-1 bg-background"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          {enableExport && (
            <button
              onClick={() => handleActionClick('export-analytics')}
              className="px-3 py-1 text-sm border border-input rounded hover:bg-accent transition-colors"
            >
              <Download className="h-4 w-4 mr-1 inline" />
              Export
            </button>
          )}

          <button
            onClick={() => handleActionClick('refresh-analytics')}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh Analytics"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {renderKPICard(
          isCustomBranded ? 'Total SOPs' : 'Total Processes',
          analyticsData.kpiData.totalProcesses,
          'Active processes',
          <BarChart3 className="h-4 w-4" />,
          { value: 12.3, isPositive: true }
        )}
        
        {renderKPICard(
          'Executions',
          analyticsData.kpiData.totalExecutions.toLocaleString(),
          'This period',
          <TrendingUp className="h-4 w-4" />,
          { value: 8.7, isPositive: true }
        )}
        
        {renderKPICard(
          'Success Rate',
          formatPercentage(analyticsData.kpiData.avgSuccessRate),
          'Average across all',
          <CheckCircle2 className="h-4 w-4" />,
          { value: 2.1, isPositive: true }
        )}
        
        {renderKPICard(
          'Avg. Duration',
          `${analyticsData.kpiData.avgCompletionTime.toFixed(1)}m`,
          'Per execution',
          <Clock className="h-4 w-4" />,
          { value: 5.2, isPositive: false }
        )}
        
        {renderKPICard(
          'Cost Savings',
          formatCurrency(analyticsData.kpiData.costSavings),
          'Estimated savings',
          <TrendingUp className="h-4 w-4" />,
          { value: 15.8, isPositive: true }
        )}
        
        {renderKPICard(
          'Time Saved',
          `${analyticsData.kpiData.timesSaved}h`,
          'Through automation',
          <Clock className="h-4 w-4" />,
          { value: 23.4, isPositive: true }
        )}
      </div>

      {/* Analytics Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analytics Chart */}
        {showProcessMetrics && (
          <div className="lg:col-span-2 p-6 bg-card rounded-lg border">
            {renderProcessPerformanceChart()}
          </div>
        )}

        {/* Side Panel - Team or Compliance */}
        <div className="space-y-6">
          {showTeamMetrics && (
            <div className="p-6 bg-card rounded-lg border">
              {renderTeamMetrics()}
            </div>
          )}

          {showComplianceMetrics && (
            <div className="p-6 bg-card rounded-lg border">
              {renderComplianceMetrics()}
            </div>
          )}
        </div>
      </div>

      {/* Additional Analytics Actions */}
      <div className="flex items-center justify-center p-6 border-t">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleActionClick('view-detailed-analytics')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            View Detailed Report
          </button>
          
          <button
            onClick={() => handleActionClick('schedule-report')}
            className="px-4 py-2 border border-input rounded hover:bg-accent transition-colors"
          >
            Schedule Report
          </button>
          
          {userRole === 'admin' && (
            <button
              onClick={() => handleActionClick('configure-analytics')}
              className="px-4 py-2 border border-input rounded hover:bg-accent transition-colors"
            >
              Configure Metrics
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
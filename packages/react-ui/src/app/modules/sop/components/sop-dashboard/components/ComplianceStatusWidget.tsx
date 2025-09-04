import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useSopCompliance, useTerminology } from '../hooks/useSopDashboardData';
import { DashboardWidgetProps, ComplianceMetric } from '../types/dashboard.types';

interface ComplianceItemProps {
  metric: ComplianceMetric;
}

const ComplianceItem: React.FC<ComplianceItemProps> = ({ metric }) => {
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      case 'stable':
        return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatLastAudit = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-3 p-3 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">{metric.category}</h4>
          {getTrendIcon(metric.trend)}
        </div>
        
        <div className="flex items-center gap-2">
          <span className={cn('font-bold', getScoreColor(metric.score))}>
            {metric.score}%
          </span>
          {metric.issues > 0 && (
            <Badge variant="destructive" className="text-xs">
              {metric.issues} issues
            </Badge>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Progress 
          value={metric.score} 
          className="h-2"
          style={{
            '--progress-foreground': getProgressColor(metric.score)
          } as React.CSSProperties}
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Last audit: {formatLastAudit(metric.lastAudit)}</span>
          </div>
          
          {metric.score >= 90 ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>Compliant</span>
            </div>
          ) : metric.score >= 70 ? (
            <div className="flex items-center gap-1 text-yellow-600">
              <AlertTriangle className="h-3 w-3" />
              <span>Attention needed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle className="h-3 w-3" />
              <span>Critical</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ComplianceStatusWidget: React.FC<DashboardWidgetProps> = ({ 
  title, 
  isLoading, 
  error, 
  className 
}) => {
  const { data: compliance, isLoading: complianceLoading, error: complianceError } = useSopCompliance();
  const { translate } = useTerminology();

  const loading = isLoading || complianceLoading;
  const hasError = error || complianceError;

  // Calculate overall compliance score
  const overallScore = compliance && compliance.length > 0 
    ? Math.round(compliance.reduce((sum, metric) => sum + metric.score, 0) / compliance.length)
    : 0;
    
  const totalIssues = compliance?.reduce((sum, metric) => sum + metric.issues, 0) || 0;

  if (loading) {
    return (
      <Card className={cn('h-fit', className)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <Skeleton className="h-6 w-36" />
            </div>
            <Skeleton className="h-8 w-12" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex justify-between mb-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full mb-2" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
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
            {translate(title || 'Compliance Status')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Failed to load compliance data</p>
            <p className="text-sm text-muted-foreground">
              {hasError?.toString() || 'An error occurred while fetching compliance metrics'}
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
            <Shield className="h-5 w-5 text-blue-600" />
            {translate(title || 'Compliance Status')}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={
                overallScore >= 90 ? 'default' :
                overallScore >= 70 ? 'secondary' : 'destructive'
              }
              className={cn(
                'font-bold',
                overallScore >= 90 ? 'bg-green-100 text-green-800 border-green-200' :
                overallScore >= 70 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                'bg-red-100 text-red-800 border-red-200'
              )}
            >
              {overallScore}%
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall compliance summary */}
        <div className="space-y-2 p-4 bg-muted/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">
              {translate('Overall Compliance')}
            </span>
            <div className="flex items-center gap-2">
              <span className={cn('font-bold', 
                overallScore >= 90 ? 'text-green-600' :
                overallScore >= 70 ? 'text-yellow-600' : 'text-red-600'
              )}>
                {overallScore}%
              </span>
              {overallScore >= 90 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : overallScore >= 70 ? (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
          </div>
          
          <Progress 
            value={overallScore} 
            className="h-3"
            style={{
              '--progress-foreground': 
                overallScore >= 90 ? '#10b981' :
                overallScore >= 70 ? '#f59e0b' : '#ef4444'
            } as React.CSSProperties}
          />
          
          {totalIssues > 0 && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span>{totalIssues} {translate('issues require attention')}</span>
            </div>
          )}
        </div>
        
        {/* Individual compliance metrics */}
        <div className="space-y-3">
          {compliance && compliance.length > 0 ? (
            compliance.map((metric, index) => (
              <ComplianceItem key={index} metric={metric} />
            ))
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium mb-2">{translate('No compliance data')}</h4>
              <p className="text-sm text-muted-foreground">
                {translate('Compliance metrics will appear here once audits are performed')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
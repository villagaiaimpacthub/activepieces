// SOP Dashboard Components Export
export { SopOverviewWidget } from './components/SopOverviewWidget';
export { RecentActivityWidget } from './components/RecentActivityWidget';
export { ComplianceStatusWidget } from './components/ComplianceStatusWidget';
export { QuickActionsWidget } from './components/QuickActionsWidget';
export { PerformanceMetricsWidget } from './components/PerformanceMetricsWidget';
export { SopExportWidget } from './components/SopExportWidget';

// Hooks
export { 
  useSopStats, 
  useSopActivity, 
  useSopCompliance, 
  useSopPerformance,
  useSopProjects,
  useSopExecutions,
  useSopTemplates,
  useTerminology 
} from './hooks/useSopDashboardData';
export { useSopExport } from '../hooks/useSopExport';

// Types
export type {
  SopStats,
  SopActivity,
  ComplianceMetric,
  PerformanceMetric,
  QuickAction,
  DashboardWidgetProps
} from './types/dashboard.types';

// Main Dashboard Assembly Component
import React from 'react';
import { cn } from '@/lib/utils';
import { SopOverviewWidget } from './components/SopOverviewWidget';
import { RecentActivityWidget } from './components/RecentActivityWidget';
import { ComplianceStatusWidget } from './components/ComplianceStatusWidget';
import { QuickActionsWidget } from './components/QuickActionsWidget';
import { PerformanceMetricsWidget } from './components/PerformanceMetricsWidget';
import { SopExportWidget } from './components/SopExportWidget';
import { useTerminology } from './hooks/useSopDashboardData';
import { useSopExport } from '../hooks/useSopExport';

export interface SopDashboardProps {
  className?: string;
  onCreateSOP?: () => void;
  onBrowseLibrary?: () => void;
  onExecuteTemplate?: () => void;
  onViewReports?: () => void;
  onManageUsers?: () => void;
  onScheduleReview?: () => void;
  onActivityClick?: (activityId: string) => void;
  onViewAllActivity?: () => void;
  layout?: 'default' | 'compact' | 'wide';
  selectedSopId?: string;
  showExportWidget?: boolean;
}

export const SopDashboard: React.FC<SopDashboardProps> = ({
  className,
  onCreateSOP,
  onBrowseLibrary,
  onExecuteTemplate,
  onViewReports,
  onManageUsers,
  onScheduleReview,
  onActivityClick,
  onViewAllActivity,
  layout = 'default',
  selectedSopId,
  showExportWidget = true
}) => {
  const { translate } = useTerminology();
  const { exportSop } = useSopExport();

  const layoutClasses = {
    default: 'grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
    compact: 'grid gap-4 grid-cols-1 md:grid-cols-2',
    wide: 'grid gap-6 grid-cols-1 xl:grid-cols-4'
  };

  return (
    <div className={cn('p-6 space-y-6', className)}>
      {/* Dashboard Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{translate('SOP Dashboard')}</h1>
        <p className="text-muted-foreground">
          {translate('Monitor and manage your Standard Operating Procedures')}
        </p>
      </div>

      {/* Widgets Grid */}
      <div className={cn(layoutClasses[layout])}>
        {/* Row 1: Overview and Quick Actions */}
        <div className={cn(
          layout === 'wide' ? 'xl:col-span-2' : 'lg:col-span-1'
        )}>
          <SopOverviewWidget title="SOP Overview" />
        </div>
        
        <div className={cn(
          layout === 'compact' ? 'md:col-span-1' : 'lg:col-span-1'
        )}>
          <QuickActionsWidget 
            title="Quick Actions"
            onCreateSOP={onCreateSOP}
            onBrowseLibrary={onBrowseLibrary}
            onExecuteTemplate={onExecuteTemplate}
            onViewReports={onViewReports}
            onManageUsers={onManageUsers}
            onScheduleReview={onScheduleReview}
          />
        </div>

        {/* Row 2: Activity and Compliance */}
        <div className={cn(
          layout === 'wide' ? 'xl:col-span-2' : 'lg:col-span-1'
        )}>
          <RecentActivityWidget 
            title="Recent Activity"
            onActivityClick={onActivityClick}
            onViewAllClick={onViewAllActivity}
            limit={8}
          />
        </div>

        <div className={cn(
          layout === 'compact' ? 'md:col-span-1' : 'lg:col-span-1'
        )}>
          <ComplianceStatusWidget title="Compliance Status" />
        </div>

        {/* Export Widget (conditional) */}
        {showExportWidget && (
          <div className={cn(
            layout === 'compact' ? 'md:col-span-1' : 'lg:col-span-1'
          )}>
            <SopExportWidget 
              title="Export SOP"
              sopId={selectedSopId}
              onExport={async (format, sopId) => {
                await exportSop(sopId, format, {
                  includeHistory: true,
                  includeMetadata: true
                });
              }}
            />
          </div>
        )}

        {/* Row 3: Performance Metrics (spans full width) */}
        <div className={cn(
          layout === 'compact' ? 'md:col-span-2' :
          layout === 'wide' ? 'xl:col-span-4' : 'lg:col-span-2 xl:col-span-3'
        )}>
          <PerformanceMetricsWidget 
            title="Performance Metrics"
            onViewDetailedReport={onViewReports}
          />
        </div>
      </div>
    </div>
  );
};
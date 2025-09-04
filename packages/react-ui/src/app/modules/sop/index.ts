// SOP Module Main Exports

// Dashboard Components
export {
  SopDashboard,
  SopOverviewWidget,
  RecentActivityWidget,
  ComplianceStatusWidget,
  QuickActionsWidget,
  PerformanceMetricsWidget,
  SopExportWidget,
  useSopStats,
  useSopActivity,
  useSopCompliance,
  useSopPerformance,
  useSopProjects,
  useSopExecutions,
  useSopTemplates,
  useTerminology,
  useSopExport
} from './components/sop-dashboard';

// Export Components
export { default as SopExportButton } from './components/SopExportButton';

// Types
export type {
  SopStats,
  SopActivity,
  ComplianceMetric,
  PerformanceMetric,
  QuickAction,
  DashboardWidgetProps,
  SopDashboardProps
} from './components/sop-dashboard';

export type {
  SopExportOptions,
  SopExportHook
} from './hooks/useSopExport';
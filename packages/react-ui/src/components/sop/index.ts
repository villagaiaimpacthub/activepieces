// SOP Layout Components
export { SOPHeader } from './sop-header';
export type { SOPHeaderProps } from './sop-header';

export { SOPSidebar } from './sop-sidebar';
export type { 
  SOPSidebarProps, 
  SOPProcess, 
  SOPCategory 
} from './sop-sidebar';

export { ProcessFlowLayout } from './process-flow-layout';
export type { 
  ProcessFlowLayoutProps, 
  ProcessStep 
} from './process-flow-layout';

export { StepByStepView } from './step-by-step-view';
export type { 
  StepByStepViewProps, 
  StepDetail, 
  StepResource 
} from './step-by-step-view';

export { SOPDashboard } from './sop-dashboard';
export type { 
  SOPDashboardProps, 
  SOPMetrics, 
  RecentSOP, 
  ActiveExecution 
} from './sop-dashboard';

// Demo component for testing and showcase
export { SOPLayoutDemo } from './sop-layout-demo';

export { 
  ComprehensiveThemeDemo 
} from './comprehensive-theme-demo';

export { 
  ThemeIntegrationTest 
} from './theme-integration-test';
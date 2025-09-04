// SOP Dashboard Types
export interface SopStats {
  totalSops: number;
  activeExecutions: number;
  completedToday: number;
  pendingTasks: number;
  successRate: number;
  averageExecutionTime: number;
  complianceScore: number;
  activeTemplates: number;
}

export interface SopActivity {
  id: string;
  type: 'execution_started' | 'execution_completed' | 'execution_failed' | 'sop_created' | 'sop_updated';
  sopId: string;
  sopName: string;
  userId: string;
  userName: string;
  timestamp: string;
  status: 'success' | 'error' | 'pending' | 'in_progress';
  details?: string;
}

export interface ComplianceMetric {
  category: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  issues: number;
  lastAudit: string;
}

export interface PerformanceMetric {
  period: string;
  executionCount: number;
  successRate: number;
  averageTime: number;
  failureCount: number;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  href?: string;
  onClick?: () => void;
}

export interface DashboardWidgetProps {
  title: string;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}
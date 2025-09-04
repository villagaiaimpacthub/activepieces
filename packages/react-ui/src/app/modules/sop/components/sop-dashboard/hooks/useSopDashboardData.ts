import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SopStats, SopActivity, ComplianceMetric, PerformanceMetric } from '../types/dashboard.types';

// SOP API client
const sopApi = {
  getStats: async (): Promise<SopStats> => {
    return api.get<SopStats>('/v1/sop/stats');
  },
  
  getRecentActivity: async (limit = 10): Promise<SopActivity[]> => {
    return api.get<SopActivity[]>(`/v1/sop/activity?limit=${limit}`);
  },
  
  getComplianceMetrics: async (): Promise<ComplianceMetric[]> => {
    return api.get<ComplianceMetric[]>('/v1/sop/compliance');
  },
  
  getPerformanceMetrics: async (period = '7d'): Promise<PerformanceMetric[]> => {
    return api.get<PerformanceMetric[]>(`/v1/sop/performance?period=${period}`);
  },
  
  getProjects: async (params?: { limit?: number; status?: string[] }) => {
    return api.get('/v1/sop/projects', params || {});
  },
  
  getExecutions: async (params?: { limit?: number; status?: string[] }) => {
    return api.get('/v1/sop/executions', params || {});
  },
  
  getTemplates: async (params?: { limit?: number }) => {
    return api.get('/v1/sop/templates', params || {});
  },
};

export const useSopStats = () => {
  return useQuery<SopStats, Error>({
    queryKey: ['sop-stats'],
    queryFn: sopApi.getStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useSopActivity = (limit = 10) => {
  return useQuery<SopActivity[], Error>({
    queryKey: ['sop-activity', limit],
    queryFn: () => sopApi.getRecentActivity(limit),
    refetchInterval: 15000, // Refresh every 15 seconds
  });
};

export const useSopCompliance = () => {
  return useQuery<ComplianceMetric[], Error>({
    queryKey: ['sop-compliance'],
    queryFn: sopApi.getComplianceMetrics,
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useSopPerformance = (period = '7d') => {
  return useQuery<PerformanceMetric[], Error>({
    queryKey: ['sop-performance', period],
    queryFn: () => sopApi.getPerformanceMetrics(period),
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useSopProjects = (params?: { limit?: number; status?: string[] }) => {
  return useQuery({
    queryKey: ['sop-projects', params],
    queryFn: () => sopApi.getProjects(params),
  });
};

export const useSopExecutions = (params?: { limit?: number; status?: string[] }) => {
  return useQuery({
    queryKey: ['sop-executions', params],
    queryFn: () => sopApi.getExecutions(params),
  });
};

export const useSopTemplates = (params?: { limit?: number }) => {
  return useQuery({
    queryKey: ['sop-templates', params],
    queryFn: () => sopApi.getTemplates(params),
  });
};

// Terminology translation hook (placeholder until B2.1 implementation)
export const useTerminology = () => {
  const translate = (key: string): string => {
    // Terminology mapping will be implemented in B2.1
    const terminologyMap: Record<string, string> = {
      'flows': 'SOPs',
      'flow': 'SOP',
      'Flow': 'SOP',
      'Flows': 'SOPs',
      'automation': 'process',
      'trigger': 'initiate',
      'action': 'step',
      'run': 'execution',
      'runs': 'executions',
      'Active flows': 'Active SOPs',
      'Total flows': 'Total SOPs',
      'Flow executions': 'SOP executions',
      'Create flow': 'Create SOP',
      'Edit flow': 'Edit SOP',
      'SOP Overview': 'SOP Overview',
      'Recent Activity': 'Recent Activity',
      'Compliance Status': 'Compliance Status',
      'Quick Actions': 'Quick Actions',
      'Performance Metrics': 'Performance Metrics',
    };
    
    return terminologyMap[key] || key;
  };
  
  return { translate };
};
/**
 * Dashboard Provider - Centralized dashboard state management
 * Manages dashboard configuration, layout, and user preferences
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { DashboardConfig } from './sop-dashboard';

interface DashboardState {
  dashboardConfig: DashboardConfig;
  userPreferences: {
    defaultView: 'dashboard' | 'analytics' | 'management';
    gridSettings: {
      columns: number;
      rowHeight: number;
      margin: [number, number];
    };
    widgetSettings: Record<string, any>;
    theme: {
      density: 'compact' | 'comfortable' | 'spacious';
      showAnimations: boolean;
      autoRefresh: boolean;
      refreshInterval: number;
    };
  };
  layoutHistory: DashboardConfig[];
  isLoading: boolean;
  error: string | null;
}

type DashboardAction = 
  | { type: 'SET_CONFIG'; payload: DashboardConfig }
  | { type: 'UPDATE_CONFIG'; payload: Partial<DashboardConfig> }
  | { type: 'ADD_WIDGET'; payload: any }
  | { type: 'REMOVE_WIDGET'; payload: string }
  | { type: 'UPDATE_WIDGET'; payload: { id: string; updates: any } }
  | { type: 'RESET_DASHBOARD' }
  | { type: 'SET_USER_PREFERENCES'; payload: Partial<DashboardState['userPreferences']> }
  | { type: 'SAVE_LAYOUT_TO_HISTORY' }
  | { type: 'RESTORE_LAYOUT'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

export interface DashboardContextType extends DashboardState {
  updateDashboardConfig: (config: Partial<DashboardConfig>) => void;
  addWidget: (widget: any) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: any) => void;
  resetDashboard: () => void;
  updateUserPreferences: (preferences: Partial<DashboardState['userPreferences']>) => void;
  saveCurrentLayout: () => void;
  restoreLayout: (historyIndex: number) => void;
  exportConfiguration: () => any;
  importConfiguration: (config: any) => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface DashboardProviderProps {
  children: ReactNode;
  initialConfig?: DashboardConfig;
  userRole?: 'admin' | 'manager' | 'user';
  persistConfig?: boolean;
  storageKey?: string;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

// Default dashboard configuration
const defaultDashboardConfig: DashboardConfig = {
  layout: 'grid',
  widgets: [
    {
      id: 'process-overview',
      type: 'process-overview',
      name: 'Process Overview',
      sopName: 'SOP Overview',
      component: null as any,
      position: { x: 0, y: 0, w: 8, h: 4 },
      category: 'overview'
    },
    {
      id: 'quick-actions',
      type: 'quick-actions',
      name: 'Quick Actions',
      sopName: 'Process Actions',
      component: null as any,
      position: { x: 8, y: 0, w: 4, h: 4 },
      category: 'actions'
    },
    {
      id: 'recent-processes',
      type: 'process-table',
      name: 'Recent Processes',
      sopName: 'Recent SOPs',
      component: null as any,
      position: { x: 0, y: 4, w: 12, h: 6 },
      category: 'data'
    }
  ],
  customization: {
    allowReorder: true,
    allowResize: true,
    allowCustomWidgets: false,
    density: 'comfortable'
  },
  filters: {
    showSearch: true,
    showFilters: true,
    defaultFilters: {}
  }
};

const defaultUserPreferences: DashboardState['userPreferences'] = {
  defaultView: 'dashboard',
  gridSettings: {
    columns: 12,
    rowHeight: 60,
    margin: [16, 16]
  },
  widgetSettings: {},
  theme: {
    density: 'comfortable',
    showAnimations: true,
    autoRefresh: false,
    refreshInterval: 30000
  }
};

const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'SET_CONFIG':
      return {
        ...state,
        dashboardConfig: action.payload
      };

    case 'UPDATE_CONFIG':
      return {
        ...state,
        dashboardConfig: {
          ...state.dashboardConfig,
          ...action.payload
        }
      };

    case 'ADD_WIDGET':
      return {
        ...state,
        dashboardConfig: {
          ...state.dashboardConfig,
          widgets: [...state.dashboardConfig.widgets, action.payload]
        }
      };

    case 'REMOVE_WIDGET':
      return {
        ...state,
        dashboardConfig: {
          ...state.dashboardConfig,
          widgets: state.dashboardConfig.widgets.filter(w => w.id !== action.payload)
        }
      };

    case 'UPDATE_WIDGET':
      return {
        ...state,
        dashboardConfig: {
          ...state.dashboardConfig,
          widgets: state.dashboardConfig.widgets.map(w => 
            w.id === action.payload.id 
              ? { ...w, ...action.payload.updates }
              : w
          )
        }
      };

    case 'RESET_DASHBOARD':
      return {
        ...state,
        dashboardConfig: defaultDashboardConfig,
        layoutHistory: []
      };

    case 'SET_USER_PREFERENCES':
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          ...action.payload
        }
      };

    case 'SAVE_LAYOUT_TO_HISTORY':
      return {
        ...state,
        layoutHistory: [
          ...state.layoutHistory.slice(-9), // Keep last 10 layouts
          { ...state.dashboardConfig }
        ]
      };

    case 'RESTORE_LAYOUT':
      const layoutToRestore = state.layoutHistory[action.payload];
      if (!layoutToRestore) return state;
      
      return {
        ...state,
        dashboardConfig: layoutToRestore
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    default:
      return state;
  }
};

const DashboardProvider: React.FC<DashboardProviderProps> = ({
  children,
  initialConfig,
  userRole = 'user',
  persistConfig = true,
  storageKey = 'sop-dashboard-config'
}) => {
  const [state, dispatch] = useReducer(dashboardReducer, {
    dashboardConfig: initialConfig || defaultDashboardConfig,
    userPreferences: defaultUserPreferences,
    layoutHistory: [],
    isLoading: false,
    error: null
  });

  // Load persisted configuration on mount
  useEffect(() => {
    if (persistConfig) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsedConfig = JSON.parse(stored);
          dispatch({ type: 'SET_CONFIG', payload: parsedConfig.dashboardConfig });
          if (parsedConfig.userPreferences) {
            dispatch({ type: 'SET_USER_PREFERENCES', payload: parsedConfig.userPreferences });
          }
        }
      } catch (error) {
        console.warn('Failed to load dashboard configuration from storage:', error);
      }
    }
  }, [persistConfig, storageKey]);

  // Persist configuration changes
  useEffect(() => {
    if (persistConfig) {
      try {
        const configToStore = {
          dashboardConfig: state.dashboardConfig,
          userPreferences: state.userPreferences,
          timestamp: Date.now()
        };
        localStorage.setItem(storageKey, JSON.stringify(configToStore));
      } catch (error) {
        console.warn('Failed to persist dashboard configuration:', error);
      }
    }
  }, [state.dashboardConfig, state.userPreferences, persistConfig, storageKey]);

  // Action handlers
  const updateDashboardConfig = (config: Partial<DashboardConfig>) => {
    dispatch({ type: 'SAVE_LAYOUT_TO_HISTORY' });
    dispatch({ type: 'UPDATE_CONFIG', payload: config });
  };

  const addWidget = (widget: any) => {
    dispatch({ type: 'SAVE_LAYOUT_TO_HISTORY' });
    dispatch({ type: 'ADD_WIDGET', payload: widget });
  };

  const removeWidget = (widgetId: string) => {
    dispatch({ type: 'SAVE_LAYOUT_TO_HISTORY' });
    dispatch({ type: 'REMOVE_WIDGET', payload: widgetId });
  };

  const updateWidget = (widgetId: string, updates: any) => {
    dispatch({ type: 'UPDATE_WIDGET', payload: { id: widgetId, updates } });
  };

  const resetDashboard = () => {
    dispatch({ type: 'RESET_DASHBOARD' });
  };

  const updateUserPreferences = (preferences: Partial<DashboardState['userPreferences']>) => {
    dispatch({ type: 'SET_USER_PREFERENCES', payload: preferences });
  };

  const saveCurrentLayout = () => {
    dispatch({ type: 'SAVE_LAYOUT_TO_HISTORY' });
  };

  const restoreLayout = (historyIndex: number) => {
    dispatch({ type: 'RESTORE_LAYOUT', payload: historyIndex });
  };

  const exportConfiguration = () => {
    return {
      version: '1.0',
      exported: new Date().toISOString(),
      userRole,
      config: {
        dashboardConfig: state.dashboardConfig,
        userPreferences: state.userPreferences
      },
      metadata: {
        source: 'sop-dashboard-provider',
        layoutHistory: state.layoutHistory.length
      }
    };
  };

  const importConfiguration = async (configData: any): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      if (!configData.config) {
        throw new Error('Invalid configuration format');
      }

      // Validate configuration
      const { dashboardConfig, userPreferences } = configData.config;
      
      if (!dashboardConfig.widgets || !Array.isArray(dashboardConfig.widgets)) {
        throw new Error('Invalid dashboard configuration');
      }

      // Save current layout to history before importing
      dispatch({ type: 'SAVE_LAYOUT_TO_HISTORY' });

      // Apply imported configuration
      dispatch({ type: 'SET_CONFIG', payload: dashboardConfig });
      if (userPreferences) {
        dispatch({ type: 'SET_USER_PREFERENCES', payload: userPreferences });
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const contextValue: DashboardContextType = {
    ...state,
    updateDashboardConfig,
    addWidget,
    removeWidget,
    updateWidget,
    resetDashboard,
    updateUserPreferences,
    saveCurrentLayout,
    restoreLayout,
    exportConfiguration,
    importConfiguration,
    setLoading,
    setError
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardProvider;
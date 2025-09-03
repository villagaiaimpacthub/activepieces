/**
 * Navigation Provider - Context provider for navigation state management
 * Manages global navigation state, routing, and SOP-specific navigation context
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/theme-provider';

export interface NavigationState {
  currentPath: string;
  currentProcess?: string;
  currentView?: string;
  navigationHistory: string[];
  breadcrumbs: BreadcrumbItem[];
  isLoading: boolean;
}

export interface BreadcrumbItem {
  label: string;
  sopLabel?: string;
  path?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

export interface NavigationContextType {
  // Navigation state
  state: NavigationState;
  
  // Navigation actions
  navigateTo: (path: string, options?: { replace?: boolean; state?: any }) => void;
  goBack: () => void;
  goForward: () => void;
  
  // Breadcrumb management
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void;
  
  // Process context
  setCurrentProcess: (processId: string | undefined) => void;
  setCurrentView: (view: string | undefined) => void;
  
  // Navigation helpers
  isCurrentPath: (path: string) => boolean;
  isParentPath: (path: string) => boolean;
  
  // Loading state
  setLoading: (loading: boolean) => void;
  
  // SOP-specific navigation
  navigateToProcess: (processId: string, view?: string) => void;
  navigateToProcessExecution: (processId: string, executionId?: string) => void;
  navigateToSettings: (section?: string) => void;
  
  // Shortcuts and hotkeys
  registerShortcut: (key: string, callback: () => void) => void;
  unregisterShortcut: (key: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const MAX_HISTORY_LENGTH = 50;

export interface NavigationProviderProps {
  children: React.ReactNode;
  enableShortcuts?: boolean;
  enableBreadcrumbs?: boolean;
  maxHistoryLength?: number;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
  enableShortcuts = true,
  enableBreadcrumbs = true,
  maxHistoryLength = MAX_HISTORY_LENGTH
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [state, setState] = useState<NavigationState>({
    currentPath: location.pathname,
    navigationHistory: [location.pathname],
    breadcrumbs: [],
    isLoading: false
  });

  const [shortcuts, setShortcuts] = useState<Map<string, () => void>>(new Map());

  // Update current path when location changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      currentPath: location.pathname,
      navigationHistory: [
        ...prev.navigationHistory.slice(-maxHistoryLength + 1),
        location.pathname
      ].filter((path, index, arr) => arr.indexOf(path) === index) // Remove duplicates
    }));
  }, [location.pathname, maxHistoryLength]);

  // Keyboard shortcuts handler
  useEffect(() => {
    if (!enableShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcutKey = [
        event.ctrlKey && 'ctrl',
        event.metaKey && 'cmd',
        event.altKey && 'alt',
        event.shiftKey && 'shift',
        event.key.toLowerCase()
      ].filter(Boolean).join('+');

      const callback = shortcuts.get(shortcutKey);
      if (callback) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcuts, shortcuts]);

  // Navigation actions
  const navigateTo = useCallback((path: string, options?: { replace?: boolean; state?: any }) => {
    if (options?.replace) {
      navigate(path, { replace: true, state: options.state });
    } else {
      navigate(path, { state: options?.state });
    }
  }, [navigate]);

  const goBack = useCallback(() => {
    const history = state.navigationHistory;
    const currentIndex = history.lastIndexOf(state.currentPath);
    const previousPath = history[currentIndex - 1];
    
    if (previousPath) {
      navigate(-1);
    }
  }, [navigate, state.currentPath, state.navigationHistory]);

  const goForward = useCallback(() => {
    navigate(1);
  }, [navigate]);

  // Breadcrumb management
  const setBreadcrumbs = useCallback((breadcrumbs: BreadcrumbItem[]) => {
    if (!enableBreadcrumbs) return;
    
    setState(prev => ({
      ...prev,
      breadcrumbs
    }));
  }, [enableBreadcrumbs]);

  const addBreadcrumb = useCallback((breadcrumb: BreadcrumbItem) => {
    if (!enableBreadcrumbs) return;
    
    setState(prev => ({
      ...prev,
      breadcrumbs: [...prev.breadcrumbs, breadcrumb]
    }));
  }, [enableBreadcrumbs]);

  // Process context management
  const setCurrentProcess = useCallback((processId: string | undefined) => {
    setState(prev => ({
      ...prev,
      currentProcess: processId
    }));
  }, []);

  const setCurrentView = useCallback((view: string | undefined) => {
    setState(prev => ({
      ...prev,
      currentView: view
    }));
  }, []);

  // Navigation helpers
  const isCurrentPath = useCallback((path: string) => {
    return state.currentPath === path;
  }, [state.currentPath]);

  const isParentPath = useCallback((path: string) => {
    return state.currentPath.startsWith(path) && state.currentPath !== path;
  }, [state.currentPath]);

  // Loading state
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading
    }));
  }, []);

  // SOP-specific navigation helpers
  const navigateToProcess = useCallback((processId: string, view = 'overview') => {
    setCurrentProcess(processId);
    setCurrentView(view);
    navigateTo(`/processes/${processId}/${view}`);
  }, [navigateTo, setCurrentProcess, setCurrentView]);

  const navigateToProcessExecution = useCallback((processId: string, executionId?: string) => {
    setCurrentProcess(processId);
    setCurrentView('executions');
    const path = executionId 
      ? `/processes/${processId}/executions/${executionId}`
      : `/processes/${processId}/executions`;
    navigateTo(path);
  }, [navigateTo, setCurrentProcess, setCurrentView]);

  const navigateToSettings = useCallback((section = 'general') => {
    setCurrentView('settings');
    navigateTo(`/settings/${section}`);
  }, [navigateTo, setCurrentView]);

  // Shortcut management
  const registerShortcut = useCallback((key: string, callback: () => void) => {
    setShortcuts(prev => new Map(prev).set(key, callback));
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    setShortcuts(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  // Register default shortcuts
  useEffect(() => {
    if (!enableShortcuts) return;

    const defaultShortcuts = [
      ['ctrl+/', () => navigateTo('/help')],
      ['ctrl+shift+n', () => navigateTo('/processes/new')],
      ['ctrl+shift+d', () => navigateTo('/dashboard')],
      ['ctrl+shift+s', () => navigateTo('/settings')],
      ['alt+left', goBack],
      ['alt+right', goForward]
    ] as [string, () => void][];

    defaultShortcuts.forEach(([key, callback]) => {
      registerShortcut(key, callback);
    });

    return () => {
      defaultShortcuts.forEach(([key]) => {
        unregisterShortcut(key);
      });
    };
  }, [enableShortcuts, navigateTo, goBack, goForward, registerShortcut, unregisterShortcut]);

  const contextValue: NavigationContextType = {
    state,
    navigateTo,
    goBack,
    goForward,
    setBreadcrumbs,
    addBreadcrumb,
    setCurrentProcess,
    setCurrentView,
    isCurrentPath,
    isParentPath,
    setLoading,
    navigateToProcess,
    navigateToProcessExecution,
    navigateToSettings,
    registerShortcut,
    unregisterShortcut
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

// Hook for process-specific navigation
export const useProcessNavigation = (processId?: string) => {
  const navigation = useNavigation();

  useEffect(() => {
    if (processId) {
      navigation.setCurrentProcess(processId);
    }
  }, [processId, navigation]);

  return {
    ...navigation,
    navigateToOverview: () => navigation.navigateToProcess(processId!, 'overview'),
    navigateToExecutions: () => navigation.navigateToProcess(processId!, 'executions'),
    navigateToTeam: () => navigation.navigateToProcess(processId!, 'team'),
    navigateToSettings: () => navigation.navigateToProcess(processId!, 'settings'),
    navigateToBuilder: () => navigation.navigateToProcess(processId!, 'builder')
  };
};

// Hook for managing breadcrumbs automatically
export const useBreadcrumbs = (breadcrumbs?: BreadcrumbItem[]) => {
  const { setBreadcrumbs, state } = useNavigation();

  useEffect(() => {
    if (breadcrumbs) {
      setBreadcrumbs(breadcrumbs);
    }
  }, [breadcrumbs, setBreadcrumbs]);

  return {
    breadcrumbs: state.breadcrumbs,
    setBreadcrumbs
  };
};

export default NavigationProvider;
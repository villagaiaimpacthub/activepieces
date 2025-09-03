/**
 * SOP Terminology React Hooks
 * 
 * React hooks for integrating terminology service with React components
 */

import { useState, useEffect, useCallback, useContext, createContext, useMemo } from 'react';
import { 
  UseTerminologyReturn,
  TerminologyConfig,
  TerminologySet,
  TerminologyContext,
  TerminologySetType,
  TranslationResult,
  TerminologyStats
} from './types';
import { terminologyService } from './service';

// Context for Terminology Provider
const TerminologyContext = createContext<UseTerminologyReturn | null>(null);

/**
 * Provider component for terminology service
 */
export function TerminologyProvider({ 
  children, 
  initialConfig, 
  initialSet = 'sop' 
}: {
  children: React.ReactNode;
  initialConfig?: Partial<TerminologyConfig>;
  initialSet?: TerminologySetType;
}) {
  const terminology = useTerminology(initialConfig, initialSet);
  
  return (
    <TerminologyContext.Provider value={terminology}>
      {children}
    </TerminologyContext.Provider>
  );
}

/**
 * Main hook for using terminology service
 */
export function useTerminology(
  initialConfig?: Partial<TerminologyConfig>,
  initialSet?: TerminologySetType
): UseTerminologyReturn {
  const [config, setConfig] = useState<TerminologyConfig>(terminologyService.getConfig());
  const [currentSet, setCurrentSet] = useState<TerminologySet>(terminologyService.getCurrentSet());
  const [isReady, setIsReady] = useState(terminologyService.isReady());
  const [isLoading, setIsLoading] = useState(!terminologyService.isReady());
  const [error, setError] = useState<Error | null>(null);

  // Initialize service on mount
  useEffect(() => {
    let mounted = true;

    const initializeService = async () => {
      try {
        setIsLoading(true);
        
        if (!terminologyService.isReady()) {
          await terminologyService.initialize(initialConfig);
        }
        
        if (initialSet && initialSet !== terminologyService.getCurrentSet().id) {
          await terminologyService.switchSet(initialSet);
        }

        if (mounted) {
          setIsReady(true);
          setConfig(terminologyService.getConfig());
          setCurrentSet(terminologyService.getCurrentSet());
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize terminology service'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeService();

    return () => {
      mounted = false;
    };
  }, [initialConfig, initialSet]);

  // Set up event listeners
  useEffect(() => {
    const handleConfigChanged = (newConfig: TerminologyConfig) => {
      setConfig(newConfig);
    };

    const handleSetChanged = (newSet: TerminologySet) => {
      setCurrentSet(newSet);
    };

    const handleError = (err: Error) => {
      setError(err);
    };

    terminologyService.on('config-changed', handleConfigChanged);
    terminologyService.on('set-changed', handleSetChanged);
    terminologyService.on('error', handleError);

    return () => {
      terminologyService.off('config-changed', handleConfigChanged);
      terminologyService.off('set-changed', handleSetChanged);
      terminologyService.off('error', handleError);
    };
  }, []);

  // Memoized translate function
  const translate = useCallback((text: string, context?: TerminologyContext): string => {
    try {
      return terminologyService.translate(text, context);
    } catch (err) {
      console.warn('Translation failed:', err);
      return text; // Fallback to original
    }
  }, []);

  // Memoized translate with details function
  const translateWithDetails = useCallback((text: string, context?: TerminologyContext): TranslationResult => {
    try {
      return terminologyService.translateWithDetails(text, context);
    } catch (err) {
      console.warn('Translation with details failed:', err);
      return {
        translated: false,
        originalText: text,
        translatedText: text,
        appliedMappings: [],
        context: context || 'general',
        fromCache: false,
        duration: 0
      };
    }
  }, []);

  // Update config function
  const updateConfig = useCallback((updates: Partial<TerminologyConfig>) => {
    try {
      terminologyService.updateConfig(updates);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update config'));
    }
  }, []);

  // Switch set function
  const switchSet = useCallback(async (setType: TerminologySetType) => {
    try {
      setIsLoading(true);
      await terminologyService.switchSet(setType);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to switch terminology set'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    translate,
    translateWithDetails,
    config,
    updateConfig,
    currentSet,
    switchSet,
    isReady,
    isLoading,
    error
  };
}

/**
 * Hook to use terminology from context
 */
export function useTerminologyContext(): UseTerminologyReturn {
  const context = useContext(TerminologyContext);
  if (!context) {
    throw new Error('useTerminologyContext must be used within a TerminologyProvider');
  }
  return context;
}

/**
 * Hook for translating a single text value with automatic updates
 */
export function useTranslation(
  text: string, 
  context?: TerminologyContext,
  fallback?: string
): string {
  const { translate, config, currentSet } = useTerminologyContext();
  
  return useMemo(() => {
    if (!config.enabled) {
      return fallback || text;
    }
    
    try {
      return translate(text, context);
    } catch (error) {
      console.warn('Translation hook failed:', error);
      return fallback || text;
    }
  }, [text, context, fallback, translate, config.enabled, currentSet.id]);
}

/**
 * Hook for translating multiple text values
 */
export function useTranslations(
  texts: Record<string, string>, 
  context?: TerminologyContext
): Record<string, string> {
  const { translate, config, currentSet } = useTerminologyContext();
  
  return useMemo(() => {
    if (!config.enabled) {
      return texts;
    }
    
    const result: Record<string, string> = {};
    
    for (const [key, text] of Object.entries(texts)) {
      try {
        result[key] = translate(text, context);
      } catch (error) {
        console.warn(`Translation hook failed for key ${key}:`, error);
        result[key] = text;
      }
    }
    
    return result;
  }, [texts, context, translate, config.enabled, currentSet.id]);
}

/**
 * Hook for terminology statistics
 */
export function useTerminologyStats(): {
  stats: TerminologyStats;
  refreshStats: () => void;
  resetStats: () => void;
} {
  const [stats, setStats] = useState<TerminologyStats>(terminologyService.getStats());

  const refreshStats = useCallback(() => {
    setStats(terminologyService.getStats());
  }, []);

  const resetStats = useCallback(() => {
    terminologyService.resetStats();
    refreshStats();
  }, [refreshStats]);

  // Auto-refresh stats periodically
  useEffect(() => {
    const interval = setInterval(refreshStats, 5000); // Every 5 seconds
    return () => clearInterval(interval);
  }, [refreshStats]);

  return { stats, refreshStats, resetStats };
}

/**
 * Hook for managing enabled contexts
 */
export function useTerminologyContexts(): {
  enabledContexts: TerminologyContext[];
  allContexts: TerminologyContext[];
  toggleContext: (context: TerminologyContext) => void;
  enableAllContexts: () => void;
  disableAllContexts: () => void;
} {
  const { config, updateConfig } = useTerminologyContext();

  const allContexts: TerminologyContext[] = [
    'general', 'flow-builder', 'dashboard', 'settings', 
    'auth', 'admin', 'help', 'forms', 'buttons', 'status', 'errors'
  ];

  const toggleContext = useCallback((context: TerminologyContext) => {
    const currentContexts = config.enabledContexts;
    const newContexts = currentContexts.includes(context)
      ? currentContexts.filter(c => c !== context)
      : [...currentContexts, context];
    
    updateConfig({ enabledContexts: newContexts });
  }, [config.enabledContexts, updateConfig]);

  const enableAllContexts = useCallback(() => {
    updateConfig({ enabledContexts: [...allContexts] });
  }, [updateConfig, allContexts]);

  const disableAllContexts = useCallback(() => {
    updateConfig({ enabledContexts: [] });
  }, [updateConfig]);

  return {
    enabledContexts: config.enabledContexts,
    allContexts,
    toggleContext,
    enableAllContexts,
    disableAllContexts
  };
}

/**
 * Hook for managing terminology sets
 */
export function useTerminologySets(): {
  currentSetId: TerminologySetType;
  switchToDefault: () => Promise<void>;
  switchToSOP: () => Promise<void>;
  switchToCustom: () => Promise<void>;
  isDefault: boolean;
  isSOP: boolean;
  isCustom: boolean;
} {
  const { currentSet, switchSet } = useTerminologyContext();

  const switchToDefault = useCallback(() => switchSet('default'), [switchSet]);
  const switchToSOP = useCallback(() => switchSet('sop'), [switchSet]);
  const switchToCustom = useCallback(() => switchSet('custom'), [switchSet]);

  return {
    currentSetId: currentSet.id,
    switchToDefault,
    switchToSOP,
    switchToCustom,
    isDefault: currentSet.id === 'default',
    isSOP: currentSet.id === 'sop',
    isCustom: currentSet.id === 'custom'
  };
}

/**
 * Hook for debugging terminology translations
 */
export function useTerminologyDebug(): {
  debugMode: boolean;
  toggleDebug: () => void;
  getTranslationDetails: (text: string, context?: TerminologyContext) => TranslationResult;
  clearCache: () => void;
} {
  const { config, updateConfig, translateWithDetails } = useTerminologyContext();

  const toggleDebug = useCallback(() => {
    updateConfig({ debugMode: !config.debugMode });
  }, [config.debugMode, updateConfig]);

  const clearCache = useCallback(() => {
    terminologyService.clearCache();
  }, []);

  return {
    debugMode: config.debugMode,
    toggleDebug,
    getTranslationDetails: translateWithDetails,
    clearCache
  };
}

/**
 * Performance monitoring hook
 */
export function useTerminologyPerformance(): {
  averageTranslationTime: number;
  totalTranslations: number;
  cacheHitRatio: number;
  isPerformanceGood: boolean;
} {
  const { stats } = useTerminologyStats();

  const isPerformanceGood = useMemo(() => {
    return stats.averageTranslationTime < 10 && // Less than 10ms average
           stats.cacheHitRatio > 0.8 &&          // More than 80% cache hits
           stats.errorRate < 0.01;               // Less than 1% error rate
  }, [stats]);

  return {
    averageTranslationTime: stats.averageTranslationTime,
    totalTranslations: stats.totalTranslations,
    cacheHitRatio: stats.cacheHitRatio,
    isPerformanceGood
  };
}
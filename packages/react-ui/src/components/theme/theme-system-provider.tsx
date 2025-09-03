/**
 * Unified Theme System Provider
 * 
 * This provider integrates all theme functionality into a single cohesive system:
 * - Wraps existing ThemeProvider and SOPThemeProvider
 * - Provides unified theme management interface
 * - Handles theme persistence and restoration
 * - Manages dynamic CSS variable updates
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { SOPThemeProvider } from '@/components/sop/sop-theme-provider';
import { 
  ThemeConfig, 
  ThemeMode, 
  ComponentThemeConfig,
  availableThemes,
  ThemeUtils,
  THEME_STORAGE_KEYS 
} from '@/lib/theme-config';

interface ThemeSystemContextType {
  // Theme state
  currentTheme: ThemeConfig;
  activeThemeId: string;
  themeMode: ThemeMode;
  isCustomBranded: boolean;
  effectiveMode: 'light' | 'dark';
  
  // Theme actions
  switchTheme: (themeId: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleCustomBranding: () => void;
  setCustomBranding: (enabled: boolean) => void;
  
  // Utility functions
  getThemeColor: (colorPath: string) => string;
  resetTheme: () => void;
  exportThemeConfig: () => ComponentThemeConfig;
  
  // Theme management
  availableThemes: Record<string, ThemeConfig>;
  isThemeSystemReady: boolean;
}

const ThemeSystemContext = createContext<ThemeSystemContextType | null>(null);

interface ThemeSystemProviderProps {
  children: ReactNode;
  defaultThemeId?: string;
  defaultMode?: ThemeMode;
  enableCustomBranding?: boolean;
}

/**
 * Unified Theme System Provider
 * Wraps all theme providers and provides a single interface
 */
export function ThemeSystemProvider({
  children,
  defaultThemeId = 'activepieces',
  defaultMode = 'auto',
  enableCustomBranding = false,
}: ThemeSystemProviderProps) {
  const [isThemeSystemReady, setIsThemeSystemReady] = useState(false);
  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    return localStorage.getItem(THEME_STORAGE_KEYS.THEME_ID) || defaultThemeId;
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem(THEME_STORAGE_KEYS.THEME_MODE) as ThemeMode) || defaultMode;
  });

  const [isCustomBranded, setIsCustomBrandedState] = useState<boolean>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEYS.CUSTOM_BRANDING);
    return stored !== null ? stored === 'true' : enableCustomBranding;
  });

  // Get current theme configuration
  const currentTheme = availableThemes[activeThemeId] || availableThemes.activepieces;
  
  // Calculate effective mode
  const effectiveMode: 'light' | 'dark' = React.useMemo(() => {
    if (themeMode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode]);

  /**
   * Switch to a different theme
   */
  const switchTheme = React.useCallback((themeId: string) => {
    if (!availableThemes[themeId]) {
      console.warn(`Theme "${themeId}" not found`);
      return;
    }

    setActiveThemeId(themeId);
    localStorage.setItem(THEME_STORAGE_KEYS.THEME_ID, themeId);
    
    // Update branding based on theme
    const shouldEnableBranding = themeId === 'sop';
    setIsCustomBrandedState(shouldEnableBranding);
    localStorage.setItem(THEME_STORAGE_KEYS.CUSTOM_BRANDING, shouldEnableBranding.toString());
  }, []);

  /**
   * Set theme mode
   */
  const setThemeMode = React.useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem(THEME_STORAGE_KEYS.THEME_MODE, mode);
  }, []);

  /**
   * Toggle custom branding
   */
  const toggleCustomBranding = React.useCallback(() => {
    const newState = !isCustomBranded;
    setIsCustomBrandedState(newState);
    localStorage.setItem(THEME_STORAGE_KEYS.CUSTOM_BRANDING, newState.toString());
    
    // Auto-switch theme based on branding
    const newThemeId = newState ? 'sop' : 'activepieces';
    setActiveThemeId(newThemeId);
    localStorage.setItem(THEME_STORAGE_KEYS.THEME_ID, newThemeId);
  }, [isCustomBranded]);

  /**
   * Set custom branding state
   */
  const setCustomBranding = React.useCallback((enabled: boolean) => {
    setIsCustomBrandedState(enabled);
    localStorage.setItem(THEME_STORAGE_KEYS.CUSTOM_BRANDING, enabled.toString());
    
    // Auto-switch theme based on branding
    const newThemeId = enabled ? 'sop' : 'activepieces';
    setActiveThemeId(newThemeId);
    localStorage.setItem(THEME_STORAGE_KEYS.THEME_ID, newThemeId);
  }, []);

  /**
   * Get theme color by path
   */
  const getThemeColor = React.useCallback((colorPath: string): string => {
    return ThemeUtils.getThemeColor(currentTheme, effectiveMode, colorPath);
  }, [currentTheme, effectiveMode]);

  /**
   * Reset theme to defaults
   */
  const resetTheme = React.useCallback(() => {
    setActiveThemeId(defaultThemeId);
    setThemeModeState(defaultMode);
    setIsCustomBrandedState(enableCustomBranding);
    
    // Clear storage
    localStorage.removeItem(THEME_STORAGE_KEYS.THEME_ID);
    localStorage.removeItem(THEME_STORAGE_KEYS.THEME_MODE);
    localStorage.removeItem(THEME_STORAGE_KEYS.CUSTOM_BRANDING);
    
    // Remove theme colors
    ThemeUtils.removeThemeColors();
  }, [defaultThemeId, defaultMode, enableCustomBranding]);

  /**
   * Export current theme configuration
   */
  const exportThemeConfig = React.useCallback((): ComponentThemeConfig => {
    return {
      themeId: activeThemeId,
      mode: themeMode,
      isCustomBranded,
    };
  }, [activeThemeId, themeMode, isCustomBranded]);

  // Apply theme colors when theme changes
  useEffect(() => {
    if (currentTheme && isThemeSystemReady) {
      ThemeUtils.applyThemeColors(currentTheme, effectiveMode);
    }
  }, [currentTheme, effectiveMode, isThemeSystemReady]);

  // Listen for system theme changes in auto mode
  useEffect(() => {
    if (themeMode !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Trigger re-render to update effectiveMode
      setThemeModeState('auto');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  // Mark system as ready after initial setup
  useEffect(() => {
    setIsThemeSystemReady(true);
  }, []);

  const contextValue: ThemeSystemContextType = {
    // State
    currentTheme,
    activeThemeId,
    themeMode,
    isCustomBranded,
    effectiveMode,
    
    // Actions
    switchTheme,
    setThemeMode,
    toggleCustomBranding,
    setCustomBranding,
    
    // Utilities
    getThemeColor,
    resetTheme,
    exportThemeConfig,
    
    // Meta
    availableThemes,
    isThemeSystemReady,
  };

  return (
    <ThemeSystemContext.Provider value={contextValue}>
      <ThemeProvider storageKey="ap-ui-theme">
        <SOPThemeProvider 
          enableSOPBranding={isCustomBranded}
          defaultTheme={themeMode}
        >
          {children}
        </SOPThemeProvider>
      </ThemeProvider>
    </ThemeSystemContext.Provider>
  );
}

/**
 * Hook to access the unified theme system
 */
export function useThemeSystem(): ThemeSystemContextType {
  const context = useContext(ThemeSystemContext);
  if (!context) {
    throw new Error('useThemeSystem must be used within a ThemeSystemProvider');
  }
  return context;
}

/**
 * Hook for theme-aware styling with runtime color computation
 */
export function useThemeSystemStyles() {
  const { currentTheme, effectiveMode, getThemeColor, isCustomBranded } = useThemeSystem();

  return React.useMemo(() => ({
    // Primary colors
    primary: getThemeColor('primary.600'),
    primaryLight: getThemeColor('primary.100'),
    primaryDark: getThemeColor('primary.800'),
    
    // Accent colors
    accent: getThemeColor('accent.500'),
    accentLight: getThemeColor('accent.100'),
    accentDark: getThemeColor('accent.800'),
    
    // Text colors
    textPrimary: getThemeColor('text.primary'),
    textSecondary: getThemeColor('text.secondary'),
    textDisabled: getThemeColor('text.disabled'),
    textInverse: getThemeColor('text.inverse'),
    
    // UI colors
    sidebarBg: getThemeColor('ui.sidebar.background'),
    sidebarBorder: getThemeColor('ui.sidebar.border'),
    canvasBg: getThemeColor('ui.canvas.background'),
    canvasGrid: getThemeColor('ui.canvas.grid'),
    panelBg: getThemeColor('ui.panel.background'),
    panelBorder: getThemeColor('ui.panel.border'),
    
    // Step colors
    stepPrimary: getThemeColor('steps.primary'),
    stepHuman: getThemeColor('steps.human'),
    stepCompliance: getThemeColor('steps.compliance'),
    stepIntegration: getThemeColor('steps.integration'),
    stepConditional: getThemeColor('steps.conditional'),
    
    // State
    mode: effectiveMode,
    themeName: currentTheme.name,
    isCustomBranded,
    
    // Style generators
    buttonStyle: (variant: 'primary' | 'secondary' = 'primary') => ({
      backgroundColor: variant === 'primary' ? getThemeColor('primary.600') : getThemeColor('accent.100'),
      color: variant === 'primary' ? getThemeColor('text.inverse') : getThemeColor('text.primary'),
      border: `1px solid ${variant === 'primary' ? getThemeColor('primary.600') : getThemeColor('accent.300')}`,
    }),
    
    panelStyle: () => ({
      backgroundColor: getThemeColor('ui.panel.background'),
      borderColor: getThemeColor('ui.panel.border'),
      color: getThemeColor('text.primary'),
    }),
    
    cardStyle: () => ({
      backgroundColor: effectiveMode === 'dark' ? getThemeColor('accent.100') : '#ffffff',
      borderColor: getThemeColor('accent.200'),
      color: getThemeColor('text.primary'),
    }),
  }), [currentTheme, effectiveMode, getThemeColor, isCustomBranded]);
}
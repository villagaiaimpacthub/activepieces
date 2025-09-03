/**
 * Comprehensive Theme Manager Hook
 * 
 * This hook provides a unified interface for managing themes in the Activepieces application.
 * It integrates with the existing theme system and provides additional functionality for
 * custom SOP branding and theme switching.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useTheme } from '@/components/theme-provider';
import { useSOPTheme } from '@/components/sop/sop-theme-provider';
import {
  ThemeConfig,
  ThemeMode,
  ComponentThemeConfig,
  availableThemes,
  activepiecesTheme,
  sopTheme,
  ThemeUtils,
  THEME_STORAGE_KEYS,
} from '@/lib/theme-config';

export interface UseThemeManagerReturn {
  // Current theme state
  currentTheme: ThemeConfig;
  currentMode: ThemeMode;
  isCustomBranded: boolean;
  effectiveMode: 'light' | 'dark';
  
  // Available themes
  availableThemes: Record<string, ThemeConfig>;
  
  // Theme actions
  setTheme: (themeId: string) => void;
  setMode: (mode: ThemeMode) => void;
  toggleCustomBranding: () => void;
  setCustomBranding: (enabled: boolean) => void;
  
  // Utility functions
  getThemeColor: (colorPath: string) => string;
  applyTheme: (themeId: string, mode?: ThemeMode) => void;
  resetToDefault: () => void;
  
  // Theme classes and styles
  getThemeClasses: () => string;
  getComponentThemeConfig: () => ComponentThemeConfig;
}

/**
 * Enhanced theme manager hook that works with existing theme providers
 */
export function useThemeManager(): UseThemeManagerReturn {
  const { theme: systemTheme, setTheme: setSystemTheme } = useTheme();
  const { 
    sopTheme: sopMode, 
    setSopTheme, 
    isSOPBranded, 
    setIsSOPBranded 
  } = useSOPTheme();

  // Determine current theme ID based on branding state
  const currentThemeId = isSOPBranded ? 'sop' : 'activepieces';
  const currentTheme = availableThemes[currentThemeId];
  
  // Determine effective mode
  const effectiveMode: 'light' | 'dark' = useMemo(() => {
    if (isSOPBranded) {
      if (sopMode === 'auto') {
        return systemTheme === 'dark' ? 'dark' : 'light';
      }
      return sopMode;
    }
    return systemTheme === 'dark' ? 'dark' : 'light';
  }, [systemTheme, sopMode, isSOPBranded]);

  // Current mode (includes 'auto')
  const currentMode: ThemeMode = useMemo(() => {
    return isSOPBranded ? sopMode : (systemTheme as ThemeMode);
  }, [isSOPBranded, sopMode, systemTheme]);

  /**
   * Set theme by ID
   */
  const setTheme = useCallback((themeId: string) => {
    if (!availableThemes[themeId]) {
      console.warn(`Theme "${themeId}" not found`);
      return;
    }

    localStorage.setItem(THEME_STORAGE_KEYS.THEME_ID, themeId);

    if (themeId === 'sop') {
      setIsSOPBranded(true);
    } else {
      setIsSOPBranded(false);
    }
  }, [setIsSOPBranded]);

  /**
   * Set theme mode
   */
  const setMode = useCallback((mode: ThemeMode) => {
    localStorage.setItem(THEME_STORAGE_KEYS.THEME_MODE, mode);
    
    if (isSOPBranded) {
      setSopTheme(mode);
    } else {
      setSystemTheme(mode);
    }
  }, [isSOPBranded, setSopTheme, setSystemTheme]);

  /**
   * Toggle custom branding
   */
  const toggleCustomBranding = useCallback(() => {
    const newState = !isSOPBranded;
    setIsSOPBranded(newState);
    localStorage.setItem(THEME_STORAGE_KEYS.CUSTOM_BRANDING, newState.toString());
  }, [isSOPBranded, setIsSOPBranded]);

  /**
   * Set custom branding state
   */
  const setCustomBranding = useCallback((enabled: boolean) => {
    setIsSOPBranded(enabled);
    localStorage.setItem(THEME_STORAGE_KEYS.CUSTOM_BRANDING, enabled.toString());
  }, [setIsSOPBranded]);

  /**
   * Get theme color by path
   */
  const getThemeColor = useCallback((colorPath: string): string => {
    return ThemeUtils.getThemeColor(currentTheme, effectiveMode, colorPath);
  }, [currentTheme, effectiveMode]);

  /**
   * Apply theme programmatically
   */
  const applyTheme = useCallback((themeId: string, mode?: ThemeMode) => {
    const theme = availableThemes[themeId];
    if (!theme) {
      console.warn(`Theme "${themeId}" not found`);
      return;
    }

    const targetMode = mode || effectiveMode;
    ThemeUtils.applyThemeColors(theme, targetMode);
    
    // Update state
    setTheme(themeId);
    if (mode) {
      setMode(mode);
    }
  }, [effectiveMode, setTheme, setMode]);

  /**
   * Reset to default theme
   */
  const resetToDefault = useCallback(() => {
    ThemeUtils.removeThemeColors();
    setIsSOPBranded(false);
    setSystemTheme('system');
    localStorage.removeItem(THEME_STORAGE_KEYS.THEME_ID);
    localStorage.removeItem(THEME_STORAGE_KEYS.THEME_MODE);
    localStorage.removeItem(THEME_STORAGE_KEYS.CUSTOM_BRANDING);
  }, [setIsSOPBranded, setSystemTheme]);

  /**
   * Get theme classes for styling
   */
  const getThemeClasses = useCallback((): string => {
    return ThemeUtils.generateThemeClasses(currentTheme, effectiveMode);
  }, [currentTheme, effectiveMode]);

  /**
   * Get component theme configuration
   */
  const getComponentThemeConfig = useCallback((): ComponentThemeConfig => {
    return {
      themeId: currentThemeId,
      mode: currentMode,
      isCustomBranded: isSOPBranded,
    };
  }, [currentThemeId, currentMode, isSOPBranded]);

  // Apply theme colors when theme or mode changes
  useEffect(() => {
    if (currentTheme) {
      ThemeUtils.applyThemeColors(currentTheme, effectiveMode);
    }
  }, [currentTheme, effectiveMode]);

  return {
    // Current state
    currentTheme,
    currentMode,
    isCustomBranded: isSOPBranded,
    effectiveMode,
    
    // Available themes
    availableThemes,
    
    // Actions
    setTheme,
    setMode,
    toggleCustomBranding,
    setCustomBranding,
    
    // Utilities
    getThemeColor,
    applyTheme,
    resetToDefault,
    getThemeClasses,
    getComponentThemeConfig,
  };
}

/**
 * Hook to get theme-aware CSS classes
 */
export function useThemeClasses() {
  const { currentTheme, effectiveMode, isCustomBranded } = useThemeManager();
  
  return useMemo(() => ({
    // Base theme classes
    theme: `theme-${currentTheme.id}`,
    mode: effectiveMode,
    branded: isCustomBranded ? 'custom-branded' : 'default-branded',
    
    // Component classes
    sidebar: `theme-sidebar ${isCustomBranded ? 'custom-sidebar' : 'default-sidebar'}`,
    canvas: `theme-canvas ${isCustomBranded ? 'custom-canvas' : 'default-canvas'}`,
    panel: `theme-panel ${isCustomBranded ? 'custom-panel' : 'default-panel'}`,
    
    // Utility function to get component class
    getComponentClass: (component: string, customClass?: string) => {
      const baseClass = `theme-${component}`;
      const brandedClass = isCustomBranded && customClass ? customClass : '';
      return `${baseClass} ${brandedClass}`.trim();
    },
  }), [currentTheme.id, effectiveMode, isCustomBranded]);
}

/**
 * Hook for theme-aware component styling
 */
export function useThemeStyles() {
  const { getThemeColor, effectiveMode, isCustomBranded } = useThemeManager();
  
  return useMemo(() => ({
    // Color getters
    primary: getThemeColor('primary.600'),
    primaryLight: getThemeColor('primary.100'),
    primaryDark: getThemeColor('primary.700'),
    accent: getThemeColor('accent.600'),
    textPrimary: getThemeColor('text.primary'),
    textSecondary: getThemeColor('text.secondary'),
    
    // UI colors
    sidebarBg: getThemeColor('ui.sidebar.background'),
    canvasBg: getThemeColor('ui.canvas.background'),
    panelBg: getThemeColor('ui.panel.background'),
    
    // Step colors
    stepPrimary: getThemeColor('steps.primary'),
    stepHuman: getThemeColor('steps.human'),
    stepCompliance: getThemeColor('steps.compliance'),
    stepIntegration: getThemeColor('steps.integration'),
    stepConditional: getThemeColor('steps.conditional'),
    
    // Mode and branding state
    mode: effectiveMode,
    isCustomBranded,
    
    // Style object generator
    getComponentStyles: (component: 'button' | 'panel' | 'sidebar' | 'canvas') => {
      switch (component) {
        case 'button':
          return {
            backgroundColor: getThemeColor('primary.600'),
            color: getThemeColor('text.inverse'),
            border: `1px solid ${getThemeColor('primary.600')}`,
          };
        case 'panel':
          return {
            backgroundColor: getThemeColor('ui.panel.background'),
            borderColor: getThemeColor('ui.panel.border'),
            color: getThemeColor('text.primary'),
          };
        case 'sidebar':
          return {
            backgroundColor: getThemeColor('ui.sidebar.background'),
            borderColor: getThemeColor('ui.sidebar.border'),
            color: getThemeColor('text.primary'),
          };
        case 'canvas':
          return {
            backgroundColor: getThemeColor('ui.canvas.background'),
            backgroundImage: `radial-gradient(circle, ${getThemeColor('ui.canvas.grid')} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          };
        default:
          return {};
      }
    },
  }), [getThemeColor, effectiveMode, isCustomBranded]);
}
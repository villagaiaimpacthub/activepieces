/**
 * TypeScript Type Definitions for Theme System
 * 
 * This file provides comprehensive type definitions for the theme system,
 * ensuring type safety throughout the application.
 */

declare module '@/lib/theme-config' {
  export interface ThemeColors {
    primary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    
    accent: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    
    steps: {
      primary: string;
      human: string;
      compliance: string;
      integration: string;
      conditional: string;
    };
    
    ui: {
      sidebar: {
        background: string;
        border: string;
      };
      canvas: {
        background: string;
        grid: string;
      };
      panel: {
        background: string;
        border: string;
      };
    };
    
    text: {
      primary: string;
      secondary: string;
      disabled: string;
      inverse: string;
    };
  }

  export interface ThemeConfig {
    id: string;
    name: string;
    description: string;
    light: ThemeColors;
    dark: ThemeColors;
  }

  export type ThemeMode = 'light' | 'dark' | 'auto';

  export interface ComponentThemeConfig {
    themeId: string;
    mode: ThemeMode;
    isCustomBranded: boolean;
  }
}

declare module '@/hooks/use-theme-manager' {
  export interface UseThemeManagerReturn {
    currentTheme: import('@/lib/theme-config').ThemeConfig;
    currentMode: import('@/lib/theme-config').ThemeMode;
    isCustomBranded: boolean;
    effectiveMode: 'light' | 'dark';
    availableThemes: Record<string, import('@/lib/theme-config').ThemeConfig>;
    setTheme: (themeId: string) => void;
    setMode: (mode: import('@/lib/theme-config').ThemeMode) => void;
    toggleCustomBranding: () => void;
    setCustomBranding: (enabled: boolean) => void;
    getThemeColor: (colorPath: string) => string;
    applyTheme: (themeId: string, mode?: import('@/lib/theme-config').ThemeMode) => void;
    resetToDefault: () => void;
    getThemeClasses: () => string;
    getComponentThemeConfig: () => import('@/lib/theme-config').ComponentThemeConfig;
  }

  export function useThemeManager(): UseThemeManagerReturn;
  export function useThemeClasses(): {
    theme: string;
    mode: 'light' | 'dark';
    branded: string;
    sidebar: string;
    canvas: string;
    panel: string;
    getComponentClass: (component: string, customClass?: string) => string;
  };
  export function useThemeStyles(): {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
    textPrimary: string;
    textSecondary: string;
    sidebarBg: string;
    canvasBg: string;
    panelBg: string;
    stepPrimary: string;
    stepHuman: string;
    stepCompliance: string;
    stepIntegration: string;
    stepConditional: string;
    mode: 'light' | 'dark';
    isCustomBranded: boolean;
    getComponentStyles: (component: 'button' | 'panel' | 'sidebar' | 'canvas') => React.CSSProperties;
  };
}

declare module '@/components/theme/theme-system-provider' {
  export interface ThemeSystemContextType {
    currentTheme: import('@/lib/theme-config').ThemeConfig;
    activeThemeId: string;
    themeMode: import('@/lib/theme-config').ThemeMode;
    isCustomBranded: boolean;
    effectiveMode: 'light' | 'dark';
    switchTheme: (themeId: string) => void;
    setThemeMode: (mode: import('@/lib/theme-config').ThemeMode) => void;
    toggleCustomBranding: () => void;
    setCustomBranding: (enabled: boolean) => void;
    getThemeColor: (colorPath: string) => string;
    resetTheme: () => void;
    exportThemeConfig: () => import('@/lib/theme-config').ComponentThemeConfig;
    availableThemes: Record<string, import('@/lib/theme-config').ThemeConfig>;
    isThemeSystemReady: boolean;
  }

  export interface ThemeSystemProviderProps {
    children: React.ReactNode;
    defaultThemeId?: string;
    defaultMode?: import('@/lib/theme-config').ThemeMode;
    enableCustomBranding?: boolean;
  }

  export function ThemeSystemProvider(props: ThemeSystemProviderProps): JSX.Element;
  export function useThemeSystem(): ThemeSystemContextType;
  export function useThemeSystemStyles(): {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    accent: string;
    accentLight: string;
    accentDark: string;
    textPrimary: string;
    textSecondary: string;
    textDisabled: string;
    textInverse: string;
    sidebarBg: string;
    sidebarBorder: string;
    canvasBg: string;
    canvasGrid: string;
    panelBg: string;
    panelBorder: string;
    stepPrimary: string;
    stepHuman: string;
    stepCompliance: string;
    stepIntegration: string;
    stepConditional: string;
    mode: 'light' | 'dark';
    themeName: string;
    isCustomBranded: boolean;
    buttonStyle: (variant?: 'primary' | 'secondary') => React.CSSProperties;
    panelStyle: () => React.CSSProperties;
    cardStyle: () => React.CSSProperties;
  };
}

declare module '@/components/sop/enhanced-theme-switcher' {
  export interface EnhancedThemeSwitcherProps {
    variant?: 'compact' | 'card' | 'dropdown';
    showAdvanced?: boolean;
    showPreview?: boolean;
    className?: string;
  }

  export function EnhancedThemeSwitcher(props: EnhancedThemeSwitcherProps): JSX.Element;
}

// CSS Module declarations for theme-related styling
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Extend the global Document interface for theme classes
declare global {
  interface DocumentElement {
    classList: DOMTokenList;
  }

  interface CSSStyleDeclaration {
    setProperty(property: string, value: string | null, priority?: string): void;
    removeProperty(property: string): string;
  }
}

// Theme-aware component props
export interface ThemeAwareProps {
  themeId?: string;
  mode?: 'light' | 'dark' | 'auto';
  customBranded?: boolean;
}

// Component style variants
export type ComponentStyleVariant = 'button' | 'panel' | 'sidebar' | 'canvas' | 'card';

// Theme event types
export interface ThemeChangeEvent {
  themeId: string;
  mode: 'light' | 'dark' | 'auto';
  effectiveMode: 'light' | 'dark';
  isCustomBranded: boolean;
}

// Theme persistence types
export interface ThemeStorage {
  themeId: string;
  mode: 'light' | 'dark' | 'auto';
  customBranding: boolean;
  timestamp: number;
}

export {};
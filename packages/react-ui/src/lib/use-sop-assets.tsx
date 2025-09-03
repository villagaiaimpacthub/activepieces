/**
 * React Hook for SOP Asset Management
 * 
 * Provides React integration for SOP assets, themes, and branding
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { sopAssets } from './sop-assets';
import type { SopThemeName, ThemeChangeCallback } from '../types/sop-assets';

/**
 * Hook for loading and managing SOP assets
 */
export function useSopAssets() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    const preloadAssets = async () => {
      try {
        await sopAssets.loader.preloadAssets();
        setAssetsLoaded(true);
      } catch (error) {
        setLoadingError(error instanceof Error ? error.message : 'Failed to load assets');
      }
    };

    preloadAssets();
  }, []);

  const getAssetUrl = useCallback((assetPath: string): string => {
    return sopAssets.loader.getAssetUrl(assetPath);
  }, []);

  return {
    assetsLoaded,
    loadingError,
    getAssetUrl,
    logos: sopAssets.logos,
    icons: sopAssets.icons,
    branding: sopAssets.branding
  };
}

/**
 * Hook for SOP theme management
 */
export function useSopTheme() {
  const [currentTheme, setCurrentTheme] = useState<string>(
    sopAssets.themeManager.getCurrentTheme()
  );

  useEffect(() => {
    // Initialize theme system
    sopAssets.themeManager.initialize();

    // Subscribe to theme changes
    const unsubscribe = sopAssets.themeManager.onThemeChange((theme) => {
      setCurrentTheme(theme);
    });

    return unsubscribe;
  }, []);

  const setTheme = useCallback((theme: SopThemeName | string) => {
    sopAssets.themeManager.setTheme(theme);
    // Save preference
    localStorage.setItem('sop-theme', theme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = currentTheme === sopAssets.themes.light 
      ? sopAssets.themes.dark 
      : sopAssets.themes.light;
    setTheme(newTheme);
  }, [currentTheme, setTheme]);

  return {
    currentTheme,
    setTheme,
    toggleTheme,
    themes: sopAssets.themes,
    isDark: currentTheme === sopAssets.themes.dark,
    isLight: currentTheme === sopAssets.themes.light
  };
}

/**
 * Hook for SOP branding customization
 */
export function useSopBranding() {
  const { logos, branding } = useSopAssets();

  const getBrandedTitle = useCallback((defaultTitle?: string): string => {
    return defaultTitle ? `${branding.appTitle} - ${defaultTitle}` : branding.appTitle;
  }, [branding.appTitle]);

  const getFaviconUrl = useCallback((): string => {
    return branding.faviconUrl || logos.icon;
  }, [branding.faviconUrl, logos.icon]);

  const getLogoUrl = useCallback((variant: 'main' | 'icon' | 'iconSmall' = 'main'): string => {
    return logos[variant] || logos.main;
  }, [logos]);

  return {
    branding,
    logos,
    getBrandedTitle,
    getFaviconUrl,
    getLogoUrl
  };
}

/**
 * Hook for SOP asset validation and debugging
 */
export function useSopAssetValidator() {
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    missing: string[];
    errors: string[];
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateAssets = useCallback(async () => {
    setIsValidating(true);
    try {
      const result = await sopAssets.validator.validateAssets();
      setValidationResult(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const generateReport = useCallback(async (): Promise<string> => {
    return sopAssets.validator.generateAssetReport();
  }, []);

  return {
    validationResult,
    isValidating,
    validateAssets,
    generateReport
  };
}

/**
 * Context provider for SOP assets (optional advanced usage)
 */
import React, { createContext, useContext, ReactNode } from 'react';

interface SopAssetContextValue {
  assetsLoaded: boolean;
  loadingError: string | null;
  currentTheme: string;
  branding: typeof sopAssets.branding;
}

const SopAssetContext = createContext<SopAssetContextValue | null>(null);

export function SopAssetProvider({ children }: { children: ReactNode }) {
  const assets = useSopAssets();
  const theme = useSopTheme();

  const value = useMemo(() => ({
    assetsLoaded: assets.assetsLoaded,
    loadingError: assets.loadingError,
    currentTheme: theme.currentTheme,
    branding: assets.branding
  }), [assets.assetsLoaded, assets.loadingError, theme.currentTheme, assets.branding]);

  return (
    <SopAssetContext.Provider value={value}>
      {children}
    </SopAssetContext.Provider>
  );
}

export function useSopAssetContext() {
  const context = useContext(SopAssetContext);
  if (!context) {
    throw new Error('useSopAssetContext must be used within SopAssetProvider');
  }
  return context;
}

/**
 * Higher-order component for SOP asset integration
 */
export function withSopAssets<P extends object>(
  Component: React.ComponentType<P>
) {
  return function SopAssetWrappedComponent(props: P) {
    const sopAssetProps = useSopAssets();
    const sopThemeProps = useSopTheme();
    const sopBrandingProps = useSopBranding();

    return (
      <Component 
        {...props}
        {...sopAssetProps}
        {...sopThemeProps}
        {...sopBrandingProps}
      />
    );
  };
}

/**
 * Utility components for common SOP branding elements
 */
export const SopLogo: React.FC<{
  variant?: 'main' | 'icon' | 'iconSmall';
  className?: string;
  style?: React.CSSProperties;
}> = ({ variant = 'main', className, style }) => {
  const { getLogoUrl } = useSopBranding();
  const { branding } = useSopAssets();

  return (
    <img
      src={getLogoUrl(variant)}
      alt={branding.appTitle}
      className={className}
      style={style}
    />
  );
};

export const SopIcon: React.FC<{
  iconType: 'processStep' | 'humanTask' | 'complianceCheck' | 'integration';
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}> = ({ iconType, className, style, size = 24 }) => {
  const { icons } = useSopAssets();

  return (
    <img
      src={icons[iconType]}
      alt={`${iconType} icon`}
      className={className}
      style={{ width: size, height: size, ...style }}
    />
  );
};

export const SopThemeToggle: React.FC<{
  className?: string;
  showLabel?: boolean;
}> = ({ className, showLabel = false }) => {
  const { currentTheme, toggleTheme, isDark } = useSopTheme();

  return (
    <button
      onClick={toggleTheme}
      className={className}
      aria-label="Toggle SOP theme"
    >
      {isDark ? '☀️' : '🌙'}
      {showLabel && <span>{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );
};

// Development utilities
if (process.env.NODE_ENV === 'development') {
  (window as any).useSopAssets = {
    useSopAssets,
    useSopTheme,
    useSopBranding,
    useSopAssetValidator
  };
}
/**
 * React Hooks for Branding Integration
 * 
 * This module provides React hooks for accessing and managing branding:
 * - useBranding: Access current brand configuration
 * - useBrandAssets: Access brand assets with preloading
 * - useBrandSwitcher: Control brand switching
 * - useBrandColors: Access brand colors with theme integration
 * - useBrandTypography: Access typography configuration
 * 
 * Phase 2 GROUP E - Agent 2 of 2
 * Integrates with branding service and theme system
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  brandingService, 
  BrandConfiguration, 
  BrandAssets, 
  BrandColors, 
  BrandTypography 
} from '@/lib/branding/branding-service';
import { useThemeSystem } from '@/components/theme/theme-system-provider';

// Custom hook types
interface BrandingState {
  activeBrand: BrandConfiguration;
  availableBrands: BrandConfiguration[];
  isLoading: boolean;
  error: string | null;
}

interface BrandSwitcherState extends BrandingState {
  switchBrand: (brandId: string) => Promise<boolean>;
  isSwitching: boolean;
}

interface BrandAssetsState {
  assets: BrandAssets;
  isLoading: boolean;
  preloadAssets: () => Promise<void>;
  getAssetUrl: (assetPath: string) => string;
}

interface BrandColorsState {
  colors: BrandColors;
  getColor: (colorPath: string, mode?: 'light' | 'dark') => string;
  semanticColors: Record<string, string>;
  customColors: Record<string, string>;
}

interface BrandTypographyState {
  typography: BrandTypography;
  getFontFamily: (type: 'primary' | 'secondary' | 'monospace') => string;
  getFontSize: (size: keyof BrandTypography['fontSizes']) => string;
  getFontWeight: (weight: keyof BrandTypography['fontWeights']) => number;
  getLineHeight: (height: keyof BrandTypography['lineHeights']) => string;
}

/**
 * Primary branding hook - provides access to current brand configuration
 */
export function useBranding(): BrandingState {
  const [state, setState] = useState<BrandingState>({
    activeBrand: brandingService.getActiveBrand(),
    availableBrands: brandingService.getAvailableBrands(),
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    // Initialize branding service
    const initializeBranding = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        await brandingService.initialize();
        
        if (isMounted) {
          setState({
            activeBrand: brandingService.getActiveBrand(),
            availableBrands: brandingService.getAvailableBrands(),
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to initialize branding',
          }));
        }
      }
    };

    initializeBranding();

    // Subscribe to brand changes
    const unsubscribe = brandingService.subscribe((brand) => {
      if (isMounted) {
        setState(prev => ({
          ...prev,
          activeBrand: brand,
          availableBrands: brandingService.getAvailableBrands(),
        }));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return state;
}

/**
 * Brand switching hook - provides brand switching functionality
 */
export function useBrandSwitcher(): BrandSwitcherState {
  const brandingState = useBranding();
  const [isSwitching, setIsSwitching] = useState(false);
  const { switchTheme } = useThemeSystem();

  const switchBrand = useCallback(async (brandId: string): Promise<boolean> => {
    setIsSwitching(true);
    
    try {
      const success = await brandingService.switchBrand(brandId);
      
      if (success) {
        // Integrate with theme system
        const brand = brandingService.getBrand(brandId);
        if (brand?.themeIntegration.themeId) {
          switchTheme(brand.themeIntegration.themeId);
        }
      }
      
      return success;
    } catch (error) {
      console.error('Failed to switch brand:', error);
      return false;
    } finally {
      setIsSwitching(false);
    }
  }, [switchTheme]);

  return {
    ...brandingState,
    switchBrand,
    isSwitching,
  };
}

/**
 * Brand assets hook - provides access to brand assets with preloading
 */
export function useBrandAssets(): BrandAssetsState {
  const { activeBrand } = useBranding();
  const [isLoading, setIsLoading] = useState(false);

  const assets = useMemo(() => activeBrand.assets, [activeBrand.assets]);

  const preloadAssets = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const assetsToPreload = [
        assets.logo.main,
        assets.logo.icon,
        assets.logo.iconSmall,
        assets.images.loginBackground,
        assets.images.dashboardHeader,
        ...(assets.images.placeholderImages || []),
      ].filter(Boolean) as string[];

      const preloadPromises = assetsToPreload.map(url => 
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Don't fail on missing assets
          img.src = url;
        })
      );

      await Promise.allSettled(preloadPromises);
    } catch (error) {
      console.warn('Failed to preload some assets:', error);
    } finally {
      setIsLoading(false);
    }
  }, [assets]);

  const getAssetUrl = useCallback((assetPath: string): string => {
    // Handle absolute URLs
    if (assetPath.startsWith('http') || assetPath.startsWith('//')) {
      return assetPath;
    }
    
    // Handle relative paths
    if (assetPath.startsWith('/')) {
      return assetPath;
    }
    
    // Default to assets directory
    return `/src/assets/${assetPath}`;
  }, []);

  return {
    assets,
    isLoading,
    preloadAssets,
    getAssetUrl,
  };
}

/**
 * Brand colors hook - provides access to brand colors with theme integration
 */
export function useBrandColors(): BrandColorsState {
  const { activeBrand } = useBranding();
  const { effectiveMode, getThemeColor } = useThemeSystem();

  const colors = useMemo(() => activeBrand.colors, [activeBrand.colors]);

  const getColor = useCallback((
    colorPath: string, 
    mode?: 'light' | 'dark'
  ): string => {
    const targetMode = mode || effectiveMode;
    
    // Try to get from theme system first (for consistency)
    try {
      const themeColor = getThemeColor(colorPath);
      if (themeColor) return themeColor;
    } catch {
      // Fall back to direct brand color access
    }

    // Direct brand color access
    const pathParts = colorPath.split('.');
    let value: any = colors[targetMode];
    
    for (const part of pathParts) {
      value = value?.[part];
    }
    
    return value || '';
  }, [colors, effectiveMode, getThemeColor]);

  const semanticColors = useMemo(() => {
    if ('semantic' in colors && colors.semantic) {
      return colors.semantic;
    }
    return {};
  }, [colors]);

  const customColors = useMemo(() => {
    if ('custom' in colors && colors.custom) {
      return Object.fromEntries(
        Object.entries(colors.custom).filter(([, value]) => value !== undefined)
      ) as Record<string, string>;
    }
    return {};
  }, [colors]);

  return {
    colors,
    getColor,
    semanticColors,
    customColors,
  };
}

/**
 * Brand typography hook - provides access to typography configuration
 */
export function useBrandTypography(): BrandTypographyState {
  const { activeBrand } = useBranding();

  const typography = useMemo(() => activeBrand.typography, [activeBrand.typography]);

  const getFontFamily = useCallback((type: 'primary' | 'secondary' | 'monospace'): string => {
    switch (type) {
      case 'primary':
        return typography.fontFamily.primary;
      case 'secondary':
        return typography.fontFamily.secondary || typography.fontFamily.primary;
      case 'monospace':
        return typography.fontFamily.monospace;
      default:
        return typography.fontFamily.primary;
    }
  }, [typography.fontFamily]);

  const getFontSize = useCallback((size: keyof BrandTypography['fontSizes']): string => {
    return typography.fontSizes[size];
  }, [typography.fontSizes]);

  const getFontWeight = useCallback((weight: keyof BrandTypography['fontWeights']): number => {
    return typography.fontWeights[weight];
  }, [typography.fontWeights]);

  const getLineHeight = useCallback((height: keyof BrandTypography['lineHeights']): string => {
    return typography.lineHeights[height];
  }, [typography.lineHeights]);

  return {
    typography,
    getFontFamily,
    getFontSize,
    getFontWeight,
    getLineHeight,
  };
}

/**
 * Brand management hook - provides brand management functionality
 */
export function useBrandManagement() {
  const { activeBrand, availableBrands } = useBranding();
  const [isLoading, setIsLoading] = useState(false);

  const registerBrand = useCallback(async (brand: BrandConfiguration): Promise<boolean> => {
    setIsLoading(true);
    try {
      return brandingService.registerCustomBrand(brand);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBrand = useCallback(async (
    brandId: string, 
    updates: Partial<BrandConfiguration>
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      return brandingService.updateBrand(brandId, updates);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeBrand = useCallback(async (brandId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      return brandingService.removeBrand(brandId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportBrand = useCallback((brandId?: string): BrandConfiguration => {
    return brandingService.exportBrandConfig(brandId);
  }, []);

  const importBrand = useCallback(async (brandConfig: BrandConfiguration): Promise<boolean> => {
    setIsLoading(true);
    try {
      return brandingService.importBrandConfig(brandConfig);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getCustomizableBrands = useCallback((): BrandConfiguration[] => {
    return availableBrands.filter(brand => brand.isCustomizable);
  }, [availableBrands]);

  return {
    activeBrand,
    availableBrands,
    isLoading,
    registerBrand,
    updateBrand,
    removeBrand,
    exportBrand,
    importBrand,
    getCustomizableBrands,
  };
}

/**
 * Compound hook that provides all branding functionality
 */
export function useFullBranding() {
  const branding = useBranding();
  const brandSwitcher = useBrandSwitcher();
  const assets = useBrandAssets();
  const colors = useBrandColors();
  const typography = useBrandTypography();
  const management = useBrandManagement();

  return {
    // Core branding
    ...branding,
    
    // Brand switching
    switchBrand: brandSwitcher.switchBrand,
    isSwitching: brandSwitcher.isSwitching,
    
    // Assets
    assets: assets.assets,
    preloadAssets: assets.preloadAssets,
    getAssetUrl: assets.getAssetUrl,
    isAssetsLoading: assets.isLoading,
    
    // Colors
    colors: colors.colors,
    getColor: colors.getColor,
    semanticColors: colors.semanticColors,
    customColors: colors.customColors,
    
    // Typography
    typography: typography.typography,
    getFontFamily: typography.getFontFamily,
    getFontSize: typography.getFontSize,
    getFontWeight: typography.getFontWeight,
    getLineHeight: typography.getLineHeight,
    
    // Management
    registerBrand: management.registerBrand,
    updateBrand: management.updateBrand,
    removeBrand: management.removeBrand,
    exportBrand: management.exportBrand,
    importBrand: management.importBrand,
    getCustomizableBrands: management.getCustomizableBrands,
    isManagementLoading: management.isLoading,
  };
}

// Type exports for component usage
export type {
  BrandingState,
  BrandSwitcherState,
  BrandAssetsState,
  BrandColorsState,
  BrandTypographyState,
};
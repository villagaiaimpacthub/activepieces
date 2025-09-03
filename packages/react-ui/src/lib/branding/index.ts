/**
 * SOP Branding System - Main Export Index
 * 
 * This file provides the main entry point for the SOP branding system:
 * - Exports core branding service and utilities
 * - Provides React hooks and components
 * - Integrates with theme system
 * - Offers TypeScript definitions
 * 
 * Phase 2 GROUP E - Agent 2 of 2
 * Complete branding system integration
 */

// Core branding service
export {
  BrandingService,
  brandingService,
  ACTIVEPIECES_BRAND,
  SOP_BRAND,
  AVAILABLE_BRANDS,
  BRAND_STORAGE_KEYS,
} from './branding-service';

// React hooks for branding
export {
  useBranding,
  useBrandSwitcher,
  useBrandAssets,
  useBrandColors,
  useBrandTypography,
  useBrandManagement,
  useFullBranding,
} from '../../hooks/use-branding';

// React components
export {
  BrandingProvider,
  useBrandingContext,
  withBranding,
  BrandAware,
  BrandConditional,
  BrandLogo,
  BrandTitle,
} from '../../components/branding/branding-provider';

export {
  BrandSwitcher,
  CompactBrandSwitcher,
} from '../../components/branding/brand-switcher';

export {
  BrandControlPanel,
} from '../../components/branding/brand-control-panel';

// TypeScript types
export type {
  BrandConfiguration,
  BrandAssets,
  BrandTypography,
  BrandColors,
  BrandThemeIntegration,
  BrandMetadata,
  BrandLogoAssets,
  BrandImageAssets,
  BrandIconAssets,
  BrandFontFamily,
  BrandFontSizes,
  BrandFontWeights,
  BrandLineHeights,
  BrandSemanticColors,
  BrandCustomColors,
  BrandingState,
  BrandingActions,
  BrandingUtils,
  BrandingContextType,
  BrandValidationResult,
  BrandExportResult,
  BrandImportResult,
  AssetLoadingState,
  AssetManager,
  BrandStylesType,
  BrandedComponentProps,
  BrandAwareComponentProps,
  BrandConditionalProps,
  WithBrandingProps,
} from '../../types/branding';

// Hook return types
export type {
  BrandingState as UseBrandingReturn,
  BrandSwitcherState as UseBrandSwitcherReturn,
  BrandAssetsState as UseBrandAssetsReturn,
  BrandColorsState as UseBrandColorsReturn,
  BrandTypographyState as UseBrandTypographyReturn,
} from '../../hooks/use-branding';

// Component prop types
export type {
  BrandingProviderProps,
  BrandAwareProps,
  BrandConditionalProps,
  BrandLogoProps,
  BrandTitleProps,
  BrandSwitcherProps,
  CompactBrandSwitcherProps,
} from '../../components/branding/branding-provider';

// Integration with theme system
import { ThemeConfig, availableThemes } from '../theme-config';

/**
 * Branding System Utilities
 */
export class BrandingUtils {
  /**
   * Get brand configuration by ID
   */
  static getBrandById(brandId: string) {
    return brandingService.getBrand(brandId);
  }

  /**
   * Get all available brand IDs
   */
  static getAvailableBrandIds(): string[] {
    return brandingService.getAvailableBrands().map(brand => brand.id);
  }

  /**
   * Check if brand exists
   */
  static brandExists(brandId: string): boolean {
    return brandingService.getBrand(brandId) !== null;
  }

  /**
   * Check if brand is customizable
   */
  static isBrandCustomizable(brandId: string): boolean {
    const brand = brandingService.getBrand(brandId);
    return brand?.isCustomizable ?? false;
  }

  /**
   * Get brand theme configuration
   */
  static getBrandTheme(brandId: string): ThemeConfig | null {
    const brand = brandingService.getBrand(brandId);
    return brand?.colors ?? null;
  }

  /**
   * Convert brand colors to CSS custom properties
   */
  static generateBrandCSS(brandId: string, mode: 'light' | 'dark' = 'light'): string {
    const brand = brandingService.getBrand(brandId);
    if (!brand) return '';

    const colors = brand.colors[mode];
    const css: string[] = [];

    // Generate CSS custom properties
    css.push(':root {');

    // Primary colors
    Object.entries(colors.primary).forEach(([shade, color]) => {
      css.push(`  --brand-primary-${shade}: ${color};`);
    });

    // Accent colors
    Object.entries(colors.accent).forEach(([shade, color]) => {
      css.push(`  --brand-accent-${shade}: ${color};`);
    });

    // Step colors
    Object.entries(colors.steps).forEach(([step, color]) => {
      css.push(`  --brand-step-${step}: ${color};`);
    });

    // Typography
    css.push(`  --brand-font-primary: ${brand.typography.fontFamily.primary};`);
    css.push(`  --brand-font-secondary: ${brand.typography.fontFamily.secondary || brand.typography.fontFamily.primary};`);
    css.push(`  --brand-font-mono: ${brand.typography.fontFamily.monospace};`);

    // Semantic colors (if available)
    if ('semantic' in brand.colors) {
      Object.entries(brand.colors.semantic).forEach(([name, color]) => {
        css.push(`  --brand-${name}: ${color};`);
      });
    }

    css.push('}');
    return css.join('\n');
  }

  /**
   * Generate Tailwind CSS configuration for brand
   */
  static generateTailwindConfig(brandId: string) {
    const brand = brandingService.getBrand(brandId);
    if (!brand) return {};

    return {
      theme: {
        extend: {
          colors: {
            'brand-primary': brand.colors.light.primary,
            'brand-accent': brand.colors.light.accent,
            'brand-steps': brand.colors.light.steps,
          },
          fontFamily: {
            'brand-primary': [brand.typography.fontFamily.primary],
            'brand-secondary': [brand.typography.fontFamily.secondary || brand.typography.fontFamily.primary],
            'brand-mono': [brand.typography.fontFamily.monospace],
          },
          fontSize: brand.typography.fontSizes,
          fontWeight: brand.typography.fontWeights,
          lineHeight: brand.typography.lineHeights,
        },
      },
    };
  }

  /**
   * Validate brand configuration
   */
  static validateBrandConfig(brand: Partial<BrandConfiguration>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    const requiredFields = ['id', 'name', 'displayName', 'appTitle', 'assets', 'colors', 'typography'];
    requiredFields.forEach(field => {
      if (!brand[field as keyof BrandConfiguration]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Assets validation
    if (brand.assets) {
      if (!brand.assets.logo?.main) {
        errors.push('Missing main logo asset');
      }
      if (!brand.assets.logo?.icon) {
        errors.push('Missing icon asset');
      }
    }

    // Colors validation
    if (brand.colors) {
      if (!brand.colors.light?.primary) {
        errors.push('Missing light mode primary colors');
      }
      if (!brand.colors.dark?.primary) {
        warnings.push('Missing dark mode primary colors');
      }
    }

    // Typography validation
    if (brand.typography) {
      if (!brand.typography.fontFamily?.primary) {
        errors.push('Missing primary font family');
      }
      if (!brand.typography.fontSizes) {
        errors.push('Missing font sizes configuration');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Create brand preset from template
   */
  static createBrandPreset(
    id: string,
    name: string,
    template: 'minimal' | 'corporate' | 'creative' = 'minimal'
  ): Partial<BrandConfiguration> {
    const basePreset: Partial<BrandConfiguration> = {
      id,
      name,
      displayName: name,
      appTitle: name,
      appDescription: `${name} - Powered by Activepieces`,
      companyName: name,
      version: '1.0.0',
      isActive: false,
      isCustomizable: true,
      themeIntegration: {
        themeId: id,
        supportsLightMode: true,
        supportsDarkMode: true,
        preferredMode: 'light',
      },
    };

    // Template-specific configurations
    switch (template) {
      case 'corporate':
        return {
          ...basePreset,
          description: 'Professional corporate branding',
          colors: {
            ...availableThemes.activepieces,
            light: {
              ...availableThemes.activepieces.light,
              primary: {
                50: '#f0f9ff',
                100: '#e0f2fe',
                200: '#bae6fd',
                300: '#7dd3fc',
                400: '#38bdf8',
                500: '#0ea5e9',
                600: '#0284c7',
                700: '#0369a1',
                800: '#075985',
                900: '#0c4a6e',
              },
            },
          },
        };

      case 'creative':
        return {
          ...basePreset,
          description: 'Creative and colorful branding',
          colors: {
            ...availableThemes.activepieces,
            light: {
              ...availableThemes.activepieces.light,
              primary: {
                50: '#fdf4ff',
                100: '#fae8ff',
                200: '#f5d0fe',
                300: '#f0abfc',
                400: '#e879f9',
                500: '#d946ef',
                600: '#c026d3',
                700: '#a21caf',
                800: '#86198f',
                900: '#701a75',
              },
            },
          },
        };

      default: // minimal
        return basePreset;
    }
  }
}

/**
 * Branding System Constants
 */
export const BRANDING_CONSTANTS = {
  VERSION: '1.0.0',
  DEFAULT_BRAND: 'activepieces',
  STORAGE_PREFIX: 'activepieces-branding-',
  CSS_VARIABLE_PREFIX: '--brand-',
  EVENT_PREFIX: 'brand:',
  
  // Asset defaults
  DEFAULT_LOGO_SIZE: 32,
  DEFAULT_ICON_SIZE: 16,
  ASSET_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  
  // Performance
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  
  // Validation
  MIN_BRAND_NAME_LENGTH: 2,
  MAX_BRAND_NAME_LENGTH: 50,
  SUPPORTED_IMAGE_FORMATS: ['svg', 'png', 'jpg', 'jpeg', 'webp'],
} as const;

/**
 * Development helpers
 */
export const BrandingDebug = {
  /**
   * Get current branding system state
   */
  getCurrentState() {
    return {
      activeBrand: brandingService.getActiveBrand(),
      availableBrands: brandingService.getAvailableBrands(),
      version: BRANDING_CONSTANTS.VERSION,
      timestamp: Date.now(),
    };
  },

  /**
   * Log branding system information
   */
  logSystemInfo() {
    const state = this.getCurrentState();
    console.group('🎨 SOP Branding System');
    console.log('Version:', state.version);
    console.log('Active Brand:', state.activeBrand.displayName);
    console.log('Available Brands:', state.availableBrands.map(b => b.displayName));
    console.log('System State:', state);
    console.groupEnd();
  },

  /**
   * Test brand switching
   */
  async testBrandSwitching() {
    const brands = brandingService.getAvailableBrands();
    console.log('🧪 Testing brand switching...');
    
    for (const brand of brands) {
      console.log(`Switching to: ${brand.displayName}`);
      const success = await brandingService.switchBrand(brand.id);
      console.log(success ? '✅ Success' : '❌ Failed');
    }
  },

  /**
   * Generate CSS variables for current brand
   */
  generateCSSVariables() {
    const brand = brandingService.getActiveBrand();
    return BrandingUtils.generateBrandCSS(brand.id);
  },
};

// Development mode setup
if (process.env.NODE_ENV === 'development') {
  (window as any).__BRANDING_SYSTEM__ = {
    version: BRANDING_CONSTANTS.VERSION,
    service: brandingService,
    utils: BrandingUtils,
    debug: BrandingDebug,
    constants: BRANDING_CONSTANTS,
  };
  
  console.log('🎨 SOP Branding System loaded');
  console.log('Available globally as window.__BRANDING_SYSTEM__');
}
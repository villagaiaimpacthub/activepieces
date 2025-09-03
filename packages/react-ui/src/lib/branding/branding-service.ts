/**
 * SOP Branding Service - Comprehensive Branding Management System
 * 
 * This service provides centralized branding management including:
 * - Brand configuration management (Activepieces, SOP, Custom)
 * - Asset management (logos, icons, images)
 * - Color scheme and typography control
 * - Runtime branding switching
 * - Brand persistence and restoration
 * 
 * Phase 2 GROUP E - Agent 2 of 2
 * Builds on existing theme system and asset management
 */

import { ThemeConfig, availableThemes, ThemeUtils } from '@/lib/theme-config';
import { sopAssets, SOP_BRANDING } from '@/lib/sop-assets';

// Brand Configuration Interfaces
export interface BrandAssets {
  logo: {
    main: string;
    icon: string;
    iconSmall: string;
    favicon?: string;
  };
  images: {
    loginBackground?: string;
    dashboardHeader?: string;
    placeholderImages?: string[];
  };
  icons: {
    stepIcons?: Record<string, string>;
    customIcons?: Record<string, string>;
  };
}

export interface BrandTypography {
  fontFamily: {
    primary: string;
    secondary?: string;
    monospace?: string;
  };
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeights: {
    tight: string;
    normal: string;
    loose: string;
  };
}

export interface BrandColors extends ThemeConfig {
  // Extended color configurations beyond theme
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  custom: {
    brand1?: string;
    brand2?: string;
    brand3?: string;
  };
}

export interface BrandConfiguration {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  
  // Core branding
  appTitle: string;
  appDescription: string;
  companyName: string;
  
  // Visual identity
  assets: BrandAssets;
  colors: BrandColors;
  typography: BrandTypography;
  
  // Runtime configuration
  isActive: boolean;
  isCustomizable: boolean;
  lastModified: string;
  
  // Integration settings
  themeIntegration: {
    themeId: string;
    supportsLightMode: boolean;
    supportsDarkMode: boolean;
    preferredMode: 'light' | 'dark' | 'auto';
  };
}

// Default Brand Configurations
export const ACTIVEPIECES_BRAND: BrandConfiguration = {
  id: 'activepieces',
  name: 'activepieces',
  displayName: 'Activepieces',
  description: 'Default Activepieces branding and visual identity',
  version: '1.0.0',
  
  appTitle: 'Activepieces',
  appDescription: 'No-Code Business Automation Platform',
  companyName: 'Activepieces',
  
  assets: {
    logo: {
      main: '/src/assets/img/logos/activepieces-logo.svg',
      icon: '/src/assets/img/logos/activepieces-icon.svg',
      iconSmall: '/src/assets/img/logos/activepieces-icon-small.svg',
      favicon: '/src/assets/img/logos/activepieces-favicon.ico',
    },
    images: {
      loginBackground: '/src/assets/img/backgrounds/login-bg.svg',
      dashboardHeader: '/src/assets/img/backgrounds/dashboard-header.svg',
    },
    icons: {
      stepIcons: {
        action: '/src/assets/img/icons/action.svg',
        trigger: '/src/assets/img/icons/trigger.svg',
        conditional: '/src/assets/img/icons/conditional.svg',
      },
    },
  },
  
  colors: availableThemes.activepieces as BrandColors,
  
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, -apple-system, sans-serif',
      secondary: 'Inter, system-ui, -apple-system, sans-serif',
      monospace: 'JetBrains Mono, Consolas, Monaco, monospace',
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      loose: '1.75',
    },
  },
  
  isActive: false,
  isCustomizable: false,
  lastModified: new Date().toISOString(),
  
  themeIntegration: {
    themeId: 'activepieces',
    supportsLightMode: true,
    supportsDarkMode: true,
    preferredMode: 'auto',
  },
};

export const SOP_BRAND: BrandConfiguration = {
  id: 'sop',
  name: 'sop',
  displayName: 'SOP Professional',
  description: 'Professional SOP branding with blue corporate identity',
  version: '1.0.0',
  
  appTitle: SOP_BRANDING.appTitle,
  appDescription: SOP_BRANDING.appDescription,
  companyName: SOP_BRANDING.companyName,
  
  assets: {
    logo: {
      main: sopAssets.logos.main,
      icon: sopAssets.logos.icon,
      iconSmall: sopAssets.logos.iconSmall,
      favicon: sopAssets.branding.faviconUrl,
    },
    images: {
      loginBackground: '/src/assets/img/sop/backgrounds/sop-login-bg.svg',
      dashboardHeader: '/src/assets/img/sop/backgrounds/sop-dashboard-header.svg',
      placeholderImages: [
        '/src/assets/img/sop/placeholders/document-placeholder.svg',
        '/src/assets/img/sop/placeholders/process-placeholder.svg',
      ],
    },
    icons: {
      stepIcons: {
        processStep: sopAssets.icons.processStep,
        humanTask: sopAssets.icons.humanTask,
        complianceCheck: sopAssets.icons.complianceCheck,
        integration: sopAssets.icons.integration,
      },
      customIcons: {
        sop: sopAssets.logos.icon,
        document: '/src/assets/img/sop/icons/document.svg',
        checklist: '/src/assets/img/sop/icons/checklist.svg',
        approval: '/src/assets/img/sop/icons/approval.svg',
      },
    },
  },
  
  colors: {
    ...availableThemes.sop,
    semantic: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    custom: {
      brand1: '#2563eb',
      brand2: '#1d4ed8',
      brand3: '#1e40af',
    },
  } as BrandColors,
  
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, -apple-system, sans-serif',
      secondary: 'Roboto, system-ui, -apple-system, sans-serif',
      monospace: 'Source Code Pro, Consolas, Monaco, monospace',
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      loose: '1.75',
    },
  },
  
  isActive: false,
  isCustomizable: true,
  lastModified: new Date().toISOString(),
  
  themeIntegration: {
    themeId: 'sop',
    supportsLightMode: true,
    supportsDarkMode: true,
    preferredMode: 'light',
  },
};

// Brand Registry
export const AVAILABLE_BRANDS: Record<string, BrandConfiguration> = {
  activepieces: ACTIVEPIECES_BRAND,
  sop: SOP_BRAND,
};

// Brand Storage Keys
export const BRAND_STORAGE_KEYS = {
  ACTIVE_BRAND: 'activepieces-active-brand',
  BRAND_CONFIG: 'activepieces-brand-config',
  CUSTOM_BRANDS: 'activepieces-custom-brands',
  BRAND_PREFERENCES: 'activepieces-brand-preferences',
} as const;

// Branding Service Class
export class BrandingService {
  private static instance: BrandingService;
  private activeBrand: BrandConfiguration;
  private brandRegistry: Map<string, BrandConfiguration> = new Map();
  private observers: Set<(brand: BrandConfiguration) => void> = new Set();
  private initialized = false;

  constructor() {
    // Initialize brand registry
    Object.values(AVAILABLE_BRANDS).forEach(brand => {
      this.brandRegistry.set(brand.id, brand);
    });
    
    // Set initial active brand
    this.activeBrand = this.loadActiveBrand();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): BrandingService {
    if (!this.instance) {
      this.instance = new BrandingService();
    }
    return this.instance;
  }

  /**
   * Initialize branding system
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load custom brands from storage
      await this.loadCustomBrands();
      
      // Apply active brand
      await this.applyBrand(this.activeBrand.id);
      
      // Preload brand assets
      await this.preloadBrandAssets(this.activeBrand);
      
      this.initialized = true;
      console.log('🎨 Branding Service initialized:', this.activeBrand.displayName);
    } catch (error) {
      console.error('Failed to initialize branding service:', error);
      // Fallback to default brand
      await this.applyBrand('activepieces');
    }
  }

  /**
   * Get current active brand
   */
  public getActiveBrand(): BrandConfiguration {
    return { ...this.activeBrand };
  }

  /**
   * Get all available brands
   */
  public getAvailableBrands(): BrandConfiguration[] {
    return Array.from(this.brandRegistry.values()).map(brand => ({ ...brand }));
  }

  /**
   * Get brand by ID
   */
  public getBrand(brandId: string): BrandConfiguration | null {
    const brand = this.brandRegistry.get(brandId);
    return brand ? { ...brand } : null;
  }

  /**
   * Switch to different brand
   */
  public async switchBrand(brandId: string): Promise<boolean> {
    const brand = this.brandRegistry.get(brandId);
    if (!brand) {
      console.error(`Brand "${brandId}" not found`);
      return false;
    }

    try {
      await this.applyBrand(brandId);
      return true;
    } catch (error) {
      console.error(`Failed to switch to brand "${brandId}":`, error);
      return false;
    }
  }

  /**
   * Apply brand configuration
   */
  private async applyBrand(brandId: string): Promise<void> {
    const brand = this.brandRegistry.get(brandId);
    if (!brand) {
      throw new Error(`Brand "${brandId}" not found`);
    }

    // Update active brand
    this.activeBrand = { ...brand, isActive: true };
    
    // Mark other brands as inactive
    this.brandRegistry.forEach((b, id) => {
      if (id !== brandId) {
        b.isActive = false;
      }
    });

    // Apply brand styling
    await this.applyBrandStyling(this.activeBrand);
    
    // Apply theme integration
    await this.applyThemeIntegration(this.activeBrand);
    
    // Update document title and meta
    this.updateDocumentMeta(this.activeBrand);
    
    // Save to storage
    this.saveActiveBrand(this.activeBrand);
    
    // Notify observers
    this.notifyObservers(this.activeBrand);
  }

  /**
   * Apply brand styling (CSS variables, fonts, etc.)
   */
  private async applyBrandStyling(brand: BrandConfiguration): Promise<void> {
    const root = document.documentElement;

    // Apply typography
    root.style.setProperty('--brand-font-primary', brand.typography.fontFamily.primary);
    root.style.setProperty('--brand-font-secondary', brand.typography.fontFamily.secondary || brand.typography.fontFamily.primary);
    root.style.setProperty('--brand-font-mono', brand.typography.fontFamily.monospace);

    // Apply font sizes
    Object.entries(brand.typography.fontSizes).forEach(([key, value]) => {
      root.style.setProperty(`--brand-text-${key}`, value);
    });

    // Apply font weights
    Object.entries(brand.typography.fontWeights).forEach(([key, value]) => {
      root.style.setProperty(`--brand-font-${key}`, value.toString());
    });

    // Apply line heights
    Object.entries(brand.typography.lineHeights).forEach(([key, value]) => {
      root.style.setProperty(`--brand-leading-${key}`, value);
    });

    // Apply semantic colors if available
    if ('semantic' in brand.colors) {
      Object.entries(brand.colors.semantic).forEach(([key, value]) => {
        root.style.setProperty(`--brand-${key}`, value);
      });
    }

    // Apply custom brand colors if available
    if ('custom' in brand.colors) {
      Object.entries(brand.colors.custom).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(`--brand-custom-${key}`, value);
        }
      });
    }

    // Apply brand-specific data attribute
    root.setAttribute('data-brand', brand.id);
  }

  /**
   * Apply theme integration
   */
  private async applyThemeIntegration(brand: BrandConfiguration): Promise<void> {
    // Apply theme colors through existing theme system
    const effectiveMode = this.determineEffectiveMode(brand);
    ThemeUtils.applyThemeColors(brand.colors, effectiveMode);
  }

  /**
   * Determine effective theme mode for brand
   */
  private determineEffectiveMode(brand: BrandConfiguration): 'light' | 'dark' {
    const { preferredMode, supportsLightMode, supportsDarkMode } = brand.themeIntegration;
    
    if (preferredMode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark && supportsDarkMode) return 'dark';
      if (!prefersDark && supportsLightMode) return 'light';
    }
    
    if (preferredMode === 'dark' && supportsDarkMode) return 'dark';
    if (preferredMode === 'light' && supportsLightMode) return 'light';
    
    // Fallback
    return supportsLightMode ? 'light' : 'dark';
  }

  /**
   * Update document meta information
   */
  private updateDocumentMeta(brand: BrandConfiguration): void {
    // Update page title
    document.title = brand.appTitle;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', brand.appDescription);
    }

    // Update favicon
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon && brand.assets.logo.favicon) {
      favicon.href = brand.assets.logo.favicon;
    }

    // Update theme color
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      const primaryColor = brand.colors.light.primary[600];
      themeColorMeta.setAttribute('content', primaryColor);
    }
  }

  /**
   * Preload brand assets for performance
   */
  private async preloadBrandAssets(brand: BrandConfiguration): Promise<void> {
    const assetsToPreload: string[] = [
      brand.assets.logo.main,
      brand.assets.logo.icon,
      brand.assets.logo.iconSmall,
    ];

    // Add optional images
    if (brand.assets.images.loginBackground) {
      assetsToPreload.push(brand.assets.images.loginBackground);
    }
    if (brand.assets.images.dashboardHeader) {
      assetsToPreload.push(brand.assets.images.dashboardHeader);
    }

    // Preload assets in parallel
    const preloadPromises = assetsToPreload.map(url => 
      new Promise<void>((resolve) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = url.endsWith('.svg') ? 'image' : 'image';
        link.href = url;
        link.onload = () => resolve();
        link.onerror = () => resolve(); // Don't fail on missing assets
        document.head.appendChild(link);
      })
    );

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Register custom brand
   */
  public registerCustomBrand(brand: BrandConfiguration): boolean {
    try {
      // Validate brand configuration
      if (!this.validateBrandConfig(brand)) {
        throw new Error('Invalid brand configuration');
      }

      // Ensure unique ID
      if (this.brandRegistry.has(brand.id)) {
        throw new Error(`Brand with ID "${brand.id}" already exists`);
      }

      // Register brand
      this.brandRegistry.set(brand.id, { ...brand, isCustomizable: true });
      
      // Save to storage
      this.saveCustomBrands();
      
      console.log(`✅ Custom brand "${brand.displayName}" registered`);
      return true;
    } catch (error) {
      console.error('Failed to register custom brand:', error);
      return false;
    }
  }

  /**
   * Update existing brand
   */
  public updateBrand(brandId: string, updates: Partial<BrandConfiguration>): boolean {
    const brand = this.brandRegistry.get(brandId);
    if (!brand) {
      console.error(`Brand "${brandId}" not found`);
      return false;
    }

    if (!brand.isCustomizable) {
      console.error(`Brand "${brandId}" is not customizable`);
      return false;
    }

    try {
      const updatedBrand = {
        ...brand,
        ...updates,
        id: brand.id, // Prevent ID changes
        lastModified: new Date().toISOString(),
      };

      // Validate updated configuration
      if (!this.validateBrandConfig(updatedBrand)) {
        throw new Error('Invalid brand configuration after update');
      }

      // Update registry
      this.brandRegistry.set(brandId, updatedBrand);
      
      // If this is the active brand, reapply it
      if (this.activeBrand.id === brandId) {
        this.applyBrand(brandId);
      }
      
      // Save to storage
      this.saveCustomBrands();
      
      return true;
    } catch (error) {
      console.error('Failed to update brand:', error);
      return false;
    }
  }

  /**
   * Remove custom brand
   */
  public removeBrand(brandId: string): boolean {
    const brand = this.brandRegistry.get(brandId);
    if (!brand) {
      console.error(`Brand "${brandId}" not found`);
      return false;
    }

    if (!brand.isCustomizable) {
      console.error(`Cannot remove built-in brand "${brandId}"`);
      return false;
    }

    try {
      // If removing active brand, switch to default
      if (this.activeBrand.id === brandId) {
        this.switchBrand('activepieces');
      }

      // Remove from registry
      this.brandRegistry.delete(brandId);
      
      // Save to storage
      this.saveCustomBrands();
      
      return true;
    } catch (error) {
      console.error('Failed to remove brand:', error);
      return false;
    }
  }

  /**
   * Subscribe to brand changes
   */
  public subscribe(callback: (brand: BrandConfiguration) => void): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  /**
   * Get brand assets for current brand
   */
  public getBrandAssets(): BrandAssets {
    return { ...this.activeBrand.assets };
  }

  /**
   * Get brand typography for current brand
   */
  public getBrandTypography(): BrandTypography {
    return { ...this.activeBrand.typography };
  }

  /**
   * Get brand colors for current brand
   */
  public getBrandColors(): BrandColors {
    return { ...this.activeBrand.colors };
  }

  /**
   * Export brand configuration
   */
  public exportBrandConfig(brandId?: string): BrandConfiguration {
    const brand = brandId ? this.getBrand(brandId) : this.getActiveBrand();
    if (!brand) {
      throw new Error(`Brand "${brandId}" not found`);
    }
    return { ...brand };
  }

  /**
   * Import brand configuration
   */
  public importBrandConfig(brandConfig: BrandConfiguration): boolean {
    try {
      if (!this.validateBrandConfig(brandConfig)) {
        throw new Error('Invalid brand configuration');
      }

      return this.registerCustomBrand(brandConfig);
    } catch (error) {
      console.error('Failed to import brand config:', error);
      return false;
    }
  }

  // Private helper methods
  
  private validateBrandConfig(brand: BrandConfiguration): boolean {
    const required = ['id', 'name', 'displayName', 'appTitle', 'assets', 'colors', 'typography'];
    return required.every(field => field in brand && brand[field as keyof BrandConfiguration] !== undefined);
  }

  private loadActiveBrand(): BrandConfiguration {
    try {
      const stored = localStorage.getItem(BRAND_STORAGE_KEYS.ACTIVE_BRAND);
      if (stored) {
        const brandId = stored;
        const brand = this.brandRegistry.get(brandId);
        if (brand) {
          return { ...brand, isActive: true };
        }
      }
    } catch (error) {
      console.warn('Failed to load active brand from storage:', error);
    }
    
    // Fallback to default
    return { ...AVAILABLE_BRANDS.activepieces, isActive: true };
  }

  private saveActiveBrand(brand: BrandConfiguration): void {
    try {
      localStorage.setItem(BRAND_STORAGE_KEYS.ACTIVE_BRAND, brand.id);
    } catch (error) {
      console.warn('Failed to save active brand to storage:', error);
    }
  }

  private async loadCustomBrands(): Promise<void> {
    try {
      const stored = localStorage.getItem(BRAND_STORAGE_KEYS.CUSTOM_BRANDS);
      if (stored) {
        const customBrands: BrandConfiguration[] = JSON.parse(stored);
        customBrands.forEach(brand => {
          if (this.validateBrandConfig(brand)) {
            this.brandRegistry.set(brand.id, brand);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load custom brands from storage:', error);
    }
  }

  private saveCustomBrands(): void {
    try {
      const customBrands = Array.from(this.brandRegistry.values())
        .filter(brand => brand.isCustomizable);
      localStorage.setItem(BRAND_STORAGE_KEYS.CUSTOM_BRANDS, JSON.stringify(customBrands));
    } catch (error) {
      console.warn('Failed to save custom brands to storage:', error);
    }
  }

  private notifyObservers(brand: BrandConfiguration): void {
    this.observers.forEach(callback => {
      try {
        callback(brand);
      } catch (error) {
        console.error('Error in brand change observer:', error);
      }
    });
  }
}

// Singleton instance
export const brandingService = BrandingService.getInstance();

// Development helper
if (process.env.NODE_ENV === 'development') {
  (window as any).brandingService = brandingService;
  console.log('🎨 Branding Service available globally as window.brandingService');
}
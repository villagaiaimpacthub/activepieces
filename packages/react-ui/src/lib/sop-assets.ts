/**
 * SOP Asset Configuration and Management
 * 
 * This module provides centralized access to SOP-specific assets
 * and integrates with the existing Activepieces build system.
 */

// SOP Logo Assets
export const SOP_LOGOS = {
  main: '/src/assets/img/sop/logos/sop-logo.svg',
  icon: '/src/assets/img/sop/logos/sop-icon.svg',
  iconSmall: '/src/assets/img/sop/logos/sop-icon.svg'
} as const;

// SOP Process Step Icons
export const SOP_STEP_ICONS = {
  processStep: '/src/assets/img/sop/icons/process-step.svg',
  humanTask: '/src/assets/img/sop/icons/human-task.svg',
  complianceCheck: '/src/assets/img/sop/icons/compliance-check.svg',
  integration: '/src/assets/img/sop/icons/integration.svg'
} as const;

// SOP Branding Configuration
export const SOP_BRANDING = {
  appTitle: 'SOP Designer',
  appDescription: 'Visual Standard Operating Procedure Design Tool',
  companyName: 'Your Company',
  version: '1.0.0',
  themeColor: '#2563EB',
  backgroundColor: '#FFFFFF',
  logoUrl: '/src/assets/img/sop/logos/sop-logo.svg',
  iconUrl: '/src/assets/img/sop/logos/sop-icon.svg',
  faviconUrl: '/src/assets/img/sop/logos/sop-icon.svg'
} as const;

// SOP Theme Names
export const SOP_THEMES = {
  light: 'sop-light',
  dark: 'sop-dark',
  auto: 'sop-auto'
} as const;

// Asset Loading Utility
export class SopAssetLoader {
  private static cache = new Map<string, string>();
  
  /**
   * Load SOP asset with caching
   */
  static async loadAsset(assetPath: string): Promise<string> {
    if (this.cache.has(assetPath)) {
      return this.cache.get(assetPath)!;
    }
    
    try {
      const response = await fetch(assetPath);
      const content = await response.text();
      this.cache.set(assetPath, content);
      return content;
    } catch (error) {
      console.warn(`Failed to load SOP asset: ${assetPath}`, error);
      return '';
    }
  }
  
  /**
   * Preload all SOP assets for performance
   */
  static async preloadAssets(): Promise<void> {
    const allAssets = [
      ...Object.values(SOP_LOGOS),
      ...Object.values(SOP_STEP_ICONS)
    ];
    
    const loadPromises = allAssets.map(asset => this.loadAsset(asset));
    await Promise.allSettled(loadPromises);
  }
  
  /**
   * Get asset URL for dynamic imports
   */
  static getAssetUrl(assetPath: string): string {
    // Handle both absolute and relative paths
    if (assetPath.startsWith('http') || assetPath.startsWith('//')) {
      return assetPath;
    }
    
    // Convert relative path to absolute
    if (assetPath.startsWith('/src/')) {
      return assetPath;
    }
    
    return `/src/${assetPath}`;
  }
}

// SOP Brand Theme Manager
export class SopThemeManager {
  private static currentTheme: string = SOP_THEMES.light;
  private static observers: ((theme: string) => void)[] = [];
  
  /**
   * Set SOP theme
   */
  static setTheme(theme: string): void {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-sop-theme', theme);
    
    // Update CSS custom properties based on theme
    if (theme === SOP_THEMES.dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Notify observers
    this.observers.forEach(callback => callback(theme));
  }
  
  /**
   * Get current SOP theme
   */
  static getCurrentTheme(): string {
    return this.currentTheme;
  }
  
  /**
   * Subscribe to theme changes
   */
  static onThemeChange(callback: (theme: string) => void): () => void {
    this.observers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }
  
  /**
   * Auto-detect theme preference
   */
  static detectTheme(): string {
    const stored = localStorage.getItem('sop-theme');
    if (stored && Object.values(SOP_THEMES).includes(stored as any)) {
      return stored;
    }
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return SOP_THEMES.dark;
    }
    
    return SOP_THEMES.light;
  }
  
  /**
   * Initialize theme system
   */
  static initialize(): void {
    const theme = this.detectTheme();
    this.setTheme(theme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (this.currentTheme === SOP_THEMES.auto) {
          this.setTheme(e.matches ? SOP_THEMES.dark : SOP_THEMES.light);
        }
      });
  }
}

// SOP Asset Validation
export class SopAssetValidator {
  /**
   * Validate that all required SOP assets are available
   */
  static async validateAssets(): Promise<{
    valid: boolean;
    missing: string[];
    errors: string[];
  }> {
    const allAssets = [
      ...Object.values(SOP_LOGOS),
      ...Object.values(SOP_STEP_ICONS)
    ];
    
    const missing: string[] = [];
    const errors: string[] = [];
    
    for (const asset of allAssets) {
      try {
        const response = await fetch(asset, { method: 'HEAD' });
        if (!response.ok) {
          missing.push(asset);
        }
      } catch (error) {
        missing.push(asset);
        errors.push(`${asset}: ${error}`);
      }
    }
    
    return {
      valid: missing.length === 0,
      missing,
      errors
    };
  }
  
  /**
   * Generate asset report for debugging
   */
  static async generateAssetReport(): Promise<string> {
    const validation = await this.validateAssets();
    
    let report = '# SOP Asset Report\n\n';
    report += `**Status**: ${validation.valid ? '✅ Valid' : '❌ Issues Found'}\n\n`;
    
    if (validation.missing.length > 0) {
      report += '## Missing Assets\n\n';
      validation.missing.forEach(asset => {
        report += `- ${asset}\n`;
      });
      report += '\n';
    }
    
    if (validation.errors.length > 0) {
      report += '## Errors\n\n';
      validation.errors.forEach(error => {
        report += `- ${error}\n`;
      });
      report += '\n';
    }
    
    report += '## Available Assets\n\n';
    report += '### Logos\n';
    Object.entries(SOP_LOGOS).forEach(([key, path]) => {
      report += `- **${key}**: ${path}\n`;
    });
    
    report += '\n### Icons\n';
    Object.entries(SOP_STEP_ICONS).forEach(([key, path]) => {
      report += `- **${key}**: ${path}\n`;
    });
    
    return report;
  }
}

// Export asset constants for easy access
export const sopAssets = {
  logos: SOP_LOGOS,
  icons: SOP_STEP_ICONS,
  branding: SOP_BRANDING,
  themes: SOP_THEMES,
  loader: SopAssetLoader,
  themeManager: SopThemeManager,
  validator: SopAssetValidator
} as const;

// Development helper for asset debugging
if (process.env.NODE_ENV === 'development') {
  (window as any).sopAssets = sopAssets;
  console.log('🎨 SOP Assets loaded:', sopAssets);
}
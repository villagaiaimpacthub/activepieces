/**
 * SOP Asset Type Definitions
 * 
 * TypeScript definitions for SOP-specific assets and theming system
 */

// SOP Asset Types
export interface SopAssetConfig {
  path: string;
  type: 'svg' | 'png' | 'jpg' | 'css' | 'json';
  description: string;
  dimensions?: string;
  color?: string;
  usage: string[];
}

export interface SopAssetManifest {
  name: string;
  version: string;
  description: string;
  assets: {
    logos: Record<string, SopAssetConfig>;
    icons: Record<string, SopAssetConfig>;
    themes: Record<string, SopAssetConfig>;
  };
  buildConfig: {
    publicPath: string;
    optimization: {
      svgOptimization: boolean;
      imageMinification: boolean;
      cssMinification: boolean;
    };
    bundling: {
      inlineSmallAssets: boolean;
      assetThreshold: number;
      generateHashes: boolean;
    };
  };
  integration: {
    vite: {
      aliasPatterns: string[];
      staticCopy: boolean;
      hotReload: boolean;
    };
    typescript: {
      generateTypes: boolean;
      exportConstants: boolean;
    };
  };
  metadata: {
    created: string;
    author: string;
    purpose: string;
    dependencies: string[];
  };
}

// SOP Theme Types
export interface SopThemeConfig {
  name: string;
  colors: {
    primary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
      inverse: string;
    };
  };
  components: {
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
}

// SOP Branding Types
export interface SopBrandingConfig {
  appTitle: string;
  appDescription: string;
  companyName: string;
  version: string;
  themeColor: string;
  backgroundColor: string;
  logoUrl: string;
  iconUrl: string;
  faviconUrl?: string;
}

// SOP Step Type Colors
export interface SopStepColors {
  processStep: string;
  humanTask: string;
  complianceCheck: string;
  integration: string;
  conditional: string;
}

// Asset Loader Types
export interface AssetLoadResult {
  content: string;
  cached: boolean;
  error?: string;
}

export interface AssetValidationResult {
  valid: boolean;
  missing: string[];
  errors: string[];
}

// Theme Manager Types
export type SopThemeName = 'sop-light' | 'sop-dark' | 'sop-auto';

export interface ThemeChangeCallback {
  (theme: string): void;
}

// Asset Constants Types
export interface SopAssetConstants {
  logos: {
    main: string;
    icon: string;
    iconSmall: string;
  };
  icons: {
    processStep: string;
    humanTask: string;
    complianceCheck: string;
    integration: string;
  };
  branding: SopBrandingConfig;
  themes: {
    light: string;
    dark: string;
    auto: string;
  };
}

// Utility Types
export type AssetPath = string;
export type AssetUrl = string;
export type AssetKey = keyof SopAssetConstants['logos'] | keyof SopAssetConstants['icons'];

// Module Augmentation for Window Object
declare global {
  interface Window {
    sopAssets?: {
      logos: SopAssetConstants['logos'];
      icons: SopAssetConstants['icons'];
      branding: SopBrandingConfig;
      themes: SopAssetConstants['themes'];
      loader: typeof SopAssetLoader;
      themeManager: typeof SopThemeManager;
      validator: typeof SopAssetValidator;
    };
  }
}

// Asset Manager Class Types
export interface SopAssetLoader {
  loadAsset(assetPath: string): Promise<string>;
  preloadAssets(): Promise<void>;
  getAssetUrl(assetPath: string): string;
}

export interface SopThemeManager {
  setTheme(theme: string): void;
  getCurrentTheme(): string;
  onThemeChange(callback: ThemeChangeCallback): () => void;
  detectTheme(): string;
  initialize(): void;
}

export interface SopAssetValidator {
  validateAssets(): Promise<AssetValidationResult>;
  generateAssetReport(): Promise<string>;
}

// CSS Custom Properties
export interface SopCSSProperties {
  '--sop-primary-50': string;
  '--sop-primary-100': string;
  '--sop-primary-200': string;
  '--sop-primary-300': string;
  '--sop-primary-400': string;
  '--sop-primary-500': string;
  '--sop-primary-600': string;
  '--sop-primary-700': string;
  '--sop-primary-800': string;
  '--sop-primary-900': string;
  '--sop-accent-50': string;
  '--sop-accent-100': string;
  '--sop-accent-200': string;
  '--sop-accent-300': string;
  '--sop-accent-400': string;
  '--sop-accent-500': string;
  '--sop-accent-600': string;
  '--sop-accent-700': string;
  '--sop-accent-800': string;
  '--sop-accent-900': string;
  '--sop-step-primary': string;
  '--sop-step-human': string;
  '--sop-step-compliance': string;
  '--sop-step-integration': string;
  '--sop-step-conditional': string;
  '--sop-sidebar-bg': string;
  '--sop-sidebar-border': string;
  '--sop-canvas-bg': string;
  '--sop-canvas-grid': string;
  '--sop-panel-bg': string;
  '--sop-panel-border': string;
  '--sop-text-primary': string;
  '--sop-text-secondary': string;
  '--sop-text-disabled': string;
  '--sop-text-inverse': string;
}

// Export Template Types
export interface SopExportTemplateConfig {
  name: string;
  description: string;
  format: 'html' | 'pdf' | 'docx' | 'json' | 'yaml';
  template: string;
  styles: string;
  options: {
    includeMetadata: boolean;
    includeValidation: boolean;
    includeDocumentation: boolean;
  };
}

// Asset Environment
export interface SopAssetEnvironment {
  isDevelopment: boolean;
  isProduction: boolean;
  publicPath: string;
  assetUrl: (path: string) => string;
  debugMode: boolean;
}
/**
 * TypeScript Definitions for Branding System
 * 
 * This file provides comprehensive type definitions for the branding system:
 * - Brand configuration interfaces
 * - Asset management types
 * - Color and typography definitions
 * - Runtime branding types
 * - Integration interfaces
 * 
 * Phase 2 GROUP E - Agent 2 of 2
 * Complete TypeScript support for branding system
 */

import { ThemeConfig } from '@/lib/theme-config';

// Base branding types
export type BrandId = string;
export type BrandMode = 'light' | 'dark' | 'auto';
export type AssetUrl = string;
export type ColorValue = string;

// Asset Management
export interface BrandLogoAssets {
  main: AssetUrl;
  icon: AssetUrl;
  iconSmall: AssetUrl;
  favicon?: AssetUrl;
  alternate?: AssetUrl[];
}

export interface BrandImageAssets {
  loginBackground?: AssetUrl;
  dashboardHeader?: AssetUrl;
  placeholderImages?: AssetUrl[];
  backgroundPatterns?: AssetUrl[];
  illustrations?: AssetUrl[];
}

export interface BrandIconAssets {
  stepIcons?: Record<string, AssetUrl>;
  customIcons?: Record<string, AssetUrl>;
  navigationIcons?: Record<string, AssetUrl>;
  actionIcons?: Record<string, AssetUrl>;
}

export interface BrandAssets {
  logo: BrandLogoAssets;
  images: BrandImageAssets;
  icons: BrandIconAssets;
  
  // Asset metadata
  baseUrl?: string;
  version?: string;
  lastUpdated?: string;
}

// Typography System
export interface BrandFontFamily {
  primary: string;
  secondary?: string;
  monospace: string;
  display?: string;
}

export interface BrandFontSizes {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl'?: string;
  '6xl'?: string;
}

export interface BrandFontWeights {
  thin?: number;
  light?: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold?: number;
  black?: number;
}

export interface BrandLineHeights {
  none?: string;
  tight: string;
  snug?: string;
  normal: string;
  relaxed?: string;
  loose: string;
}

export interface BrandLetterSpacing {
  tighter?: string;
  tight?: string;
  normal?: string;
  wide?: string;
  wider?: string;
  widest?: string;
}

export interface BrandTypography {
  fontFamily: BrandFontFamily;
  fontSizes: BrandFontSizes;
  fontWeights: BrandFontWeights;
  lineHeights: BrandLineHeights;
  letterSpacing?: BrandLetterSpacing;
  
  // Typography presets
  headings?: {
    h1?: Partial<BrandTypography>;
    h2?: Partial<BrandTypography>;
    h3?: Partial<BrandTypography>;
    h4?: Partial<BrandTypography>;
    h5?: Partial<BrandTypography>;
    h6?: Partial<BrandTypography>;
  };
  
  body?: {
    default?: Partial<BrandTypography>;
    small?: Partial<BrandTypography>;
    large?: Partial<BrandTypography>;
  };
}

// Color System Extensions
export interface BrandSemanticColors {
  success: ColorValue;
  warning: ColorValue;
  error: ColorValue;
  info: ColorValue;
  neutral?: ColorValue;
}

export interface BrandCustomColors {
  brand1?: ColorValue;
  brand2?: ColorValue;
  brand3?: ColorValue;
  brand4?: ColorValue;
  brand5?: ColorValue;
  [key: string]: ColorValue | undefined;
}

export interface BrandStateColors {
  hover?: ColorValue;
  active?: ColorValue;
  focus?: ColorValue;
  disabled?: ColorValue;
  selected?: ColorValue;
}

export interface BrandColors extends ThemeConfig {
  semantic: BrandSemanticColors;
  custom: BrandCustomColors;
  states?: BrandStateColors;
  
  // Color utilities
  opacity?: Record<string, number>;
  gradients?: Record<string, string>;
  shadows?: Record<string, string>;
}

// Theme Integration
export interface BrandThemeIntegration {
  themeId: string;
  supportsLightMode: boolean;
  supportsDarkMode: boolean;
  preferredMode: BrandMode;
  
  // CSS integration
  cssVariablePrefix?: string;
  cssClassPrefix?: string;
  customCssProperties?: Record<string, string>;
  
  // Component integration
  componentOverrides?: Record<string, any>;
  styleOverrides?: Record<string, React.CSSProperties>;
}

// Brand Metadata
export interface BrandMetadata {
  created: string;
  lastModified: string;
  version: string;
  author?: string;
  license?: string;
  tags?: string[];
  category?: string;
  
  // Validation
  isValid?: boolean;
  validationErrors?: string[];
  validationWarnings?: string[];
}

// Main Brand Configuration
export interface BrandConfiguration {
  // Identity
  id: BrandId;
  name: string;
  displayName: string;
  description: string;
  version: string;
  
  // Application branding
  appTitle: string;
  appDescription: string;
  companyName: string;
  companyUrl?: string;
  
  // Visual identity
  assets: BrandAssets;
  colors: BrandColors;
  typography: BrandTypography;
  
  // Configuration
  isActive: boolean;
  isCustomizable: boolean;
  isBuiltIn?: boolean;
  
  // Integration
  themeIntegration: BrandThemeIntegration;
  metadata: BrandMetadata;
  
  // Extensibility
  custom?: Record<string, any>;
  plugins?: BrandPlugin[];
}

// Brand Plugin System
export interface BrandPlugin {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  config?: Record<string, any>;
  hooks?: BrandPluginHooks;
}

export interface BrandPluginHooks {
  onBrandActivate?: (brand: BrandConfiguration) => void;
  onBrandDeactivate?: (brand: BrandConfiguration) => void;
  onBrandUpdate?: (brand: BrandConfiguration) => void;
  onAssetLoad?: (assetUrl: string) => string | void;
  onColorApply?: (color: ColorValue) => ColorValue | void;
}

// Runtime Branding State
export interface BrandingState {
  activeBrand: BrandConfiguration;
  availableBrands: BrandConfiguration[];
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Runtime features
  previewMode: boolean;
  debugMode: boolean;
  performanceMetrics?: BrandingPerformanceMetrics;
}

export interface BrandingPerformanceMetrics {
  initializationTime: number;
  assetLoadTime: number;
  switchingTime: number;
  lastMeasurement: string;
}

// Brand Management
export interface BrandManagerConfig {
  autoInitialize: boolean;
  fallbackBrand: BrandId;
  preloadAssets: boolean;
  enableCaching: boolean;
  enablePerformanceMetrics: boolean;
  
  // Storage
  storageProvider: 'localStorage' | 'sessionStorage' | 'custom';
  customStorageProvider?: BrandStorageProvider;
  
  // Validation
  enableValidation: boolean;
  strictMode: boolean;
  
  // Development
  developmentMode?: boolean;
  debugLogging?: boolean;
}

export interface BrandStorageProvider {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

// Asset Management
export interface AssetLoadingState {
  url: AssetUrl;
  status: 'pending' | 'loading' | 'loaded' | 'error';
  error?: string;
  loadTime?: number;
}

export interface AssetManager {
  preloadAsset(url: AssetUrl): Promise<void>;
  preloadAssets(urls: AssetUrl[]): Promise<AssetLoadingState[]>;
  isAssetLoaded(url: AssetUrl): boolean;
  getAssetLoadingState(url: AssetUrl): AssetLoadingState | null;
  clearCache(): void;
  getCacheStats(): AssetCacheStats;
}

export interface AssetCacheStats {
  totalAssets: number;
  loadedAssets: number;
  failedAssets: number;
  cacheSize: number;
  cacheSizeFormatted: string;
}

// Brand Validation
export interface BrandValidationResult {
  isValid: boolean;
  errors: BrandValidationError[];
  warnings: BrandValidationWarning[];
  score: number; // 0-100
}

export interface BrandValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
  code: string;
}

export interface BrandValidationWarning extends BrandValidationError {
  suggestion?: string;
}

export interface BrandValidator {
  validateBrand(brand: BrandConfiguration): BrandValidationResult;
  validateAssets(assets: BrandAssets): BrandValidationResult;
  validateColors(colors: BrandColors): BrandValidationResult;
  validateTypography(typography: BrandTypography): BrandValidationResult;
}

// Export/Import
export interface BrandExportOptions {
  includeAssets: boolean;
  includeCustomProperties: boolean;
  format: 'json' | 'yaml' | 'css';
  minify: boolean;
}

export interface BrandImportOptions {
  validateBeforeImport: boolean;
  overwriteExisting: boolean;
  importAssets: boolean;
  generateId: boolean;
}

export interface BrandExportResult {
  data: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface BrandImportResult {
  success: boolean;
  brand?: BrandConfiguration;
  errors?: string[];
  warnings?: string[];
}

// Event System
export type BrandingEventType = 
  | 'brand:initialized'
  | 'brand:switched'
  | 'brand:updated'
  | 'brand:registered'
  | 'brand:removed'
  | 'assets:preloaded'
  | 'error:occurred';

export interface BrandingEvent<T = any> {
  type: BrandingEventType;
  payload: T;
  timestamp: number;
  brandId?: BrandId;
}

export interface BrandingEventListener<T = any> {
  (event: BrandingEvent<T>): void;
}

export interface BrandingEventEmitter {
  on<T>(event: BrandingEventType, listener: BrandingEventListener<T>): () => void;
  off<T>(event: BrandingEventType, listener: BrandingEventListener<T>): void;
  emit<T>(event: BrandingEventType, payload: T): void;
  once<T>(event: BrandingEventType, listener: BrandingEventListener<T>): () => void;
}

// React Integration Types
export interface BrandingContextType {
  state: BrandingState;
  actions: BrandingActions;
  utils: BrandingUtils;
}

export interface BrandingActions {
  switchBrand(brandId: BrandId): Promise<boolean>;
  updateBrand(brandId: BrandId, updates: Partial<BrandConfiguration>): Promise<boolean>;
  registerBrand(brand: BrandConfiguration): Promise<boolean>;
  removeBrand(brandId: BrandId): Promise<boolean>;
  preloadAssets(brandId?: BrandId): Promise<void>;
  refreshBrands(): void;
  resetBranding(): void;
}

export interface BrandingUtils {
  getBrand(brandId: BrandId): BrandConfiguration | null;
  getAsset(assetPath: string): AssetUrl;
  getColor(colorPath: string, mode?: BrandMode): ColorValue;
  getTypography(element: string): React.CSSProperties;
  validateBrand(brand: BrandConfiguration): BrandValidationResult;
  exportBrand(brandId: BrandId, options?: BrandExportOptions): BrandExportResult;
  importBrand(data: string, options?: BrandImportOptions): Promise<BrandImportResult>;
}

// Component Props Types
export interface WithBrandingProps {
  branding: BrandingContextType;
}

export interface BrandAwareComponentProps {
  brandId?: BrandId;
  fallback?: React.ReactNode;
  errorBoundary?: boolean;
}

export interface BrandConditionalProps {
  when: BrandId | BrandId[] | ((brand: BrandConfiguration) => boolean);
  not?: boolean;
  fallback?: React.ReactNode;
}

// CSS-in-JS Integration
export interface BrandStylesType {
  colors: Record<string, ColorValue>;
  typography: Record<string, React.CSSProperties>;
  spacing: Record<string, string>;
  shadows: Record<string, string>;
  borders: Record<string, string>;
  animations: Record<string, string>;
}

export interface BrandedComponentProps {
  variant?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  brand?: BrandId;
  theme?: BrandMode;
}

// Global Module Augmentation
declare global {
  interface Window {
    __BRANDING_SYSTEM__?: {
      version: string;
      brands: Record<BrandId, BrandConfiguration>;
      activeBrand: BrandId;
      debugMode: boolean;
    };
  }
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type BrandConfigurationPartial = DeepPartial<BrandConfiguration>;

export type RequiredBrandFields = Pick<
  BrandConfiguration, 
  'id' | 'name' | 'displayName' | 'appTitle' | 'assets' | 'colors' | 'typography'
>;

export type OptionalBrandFields = Omit<BrandConfiguration, keyof RequiredBrandFields>;

// Re-export for convenience
export type { ThemeConfig } from '@/lib/theme-config';
export type { BrandConfiguration as Brand };
export type { BrandingState as BrandState };
export type { BrandingActions as BrandActions };
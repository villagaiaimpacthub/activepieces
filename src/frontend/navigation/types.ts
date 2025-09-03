/**
 * SOP Navigation Type Definitions
 * Comprehensive TypeScript types for SOP navigation components
 */

import { ReactNode } from 'react';

// Base types
export type NavigationVariant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline';
export type NavigationSize = 'sm' | 'md' | 'lg';
export type NavigationOrientation = 'horizontal' | 'vertical';
export type ProcessStatus = 'active' | 'draft' | 'archived' | 'paused';

// Theme integration
export interface ThemeAwareProps {
  className?: string;
  variant?: NavigationVariant;
  size?: NavigationSize;
}

// Icon types
export type IconComponent = ReactNode | ((props: { className?: string }) => ReactNode);

// Permission types
export interface PermissionConfig {
  requiredPermissions?: string[];
  fallbackAction?: () => void;
  hideIfNoAccess?: boolean;
}

// Navigation item base
export interface BaseNavigationItem extends ThemeAwareProps, PermissionConfig {
  id: string;
  label: string;
  sopLabel?: string;
  icon?: IconComponent;
  tooltip?: string;
  disabled?: boolean;
  hidden?: boolean;
}

// Extended navigation item with routing
export interface RoutableNavigationItem extends BaseNavigationItem {
  path: string;
  isActive?: (pathname: string) => boolean;
  badge?: number | string;
  notification?: boolean;
  external?: boolean;
}

// Navigation group/collapsible
export interface NavigationGroup extends BaseNavigationItem {
  type: 'group';
  children: NavigationItem[];
  defaultOpen?: boolean;
  collapsible?: boolean;
  separatorBefore?: boolean;
  separatorAfter?: boolean;
}

// Action item (button-like)
export interface NavigationAction extends BaseNavigationItem {
  type: 'action';
  onClick: () => void;
  shortcut?: string;
  loading?: boolean;
}

// Link item
export interface NavigationLink extends RoutableNavigationItem {
  type: 'link';
  newWindow?: boolean;
}

// Navigation item union type
export type NavigationItem = NavigationLink | NavigationGroup | NavigationAction;

// Navigation state management
export interface NavigationHistory {
  entries: string[];
  currentIndex: number;
  maxLength: number;
}

export interface NavigationCache {
  breadcrumbs: Record<string, BreadcrumbItem[]>;
  processData: Record<string, ProcessData>;
  lastVisited: Record<string, number>;
}

export interface ProcessData {
  id: string;
  name: string;
  status: ProcessStatus;
  lastModified: string;
  version: number;
  permissions: string[];
}

// Event types
export interface NavigationEvent {
  type: 'navigate' | 'back' | 'forward' | 'action';
  payload: any;
  timestamp: number;
}

export type NavigationEventHandler = (event: NavigationEvent) => void;

// Advanced navigation props
export interface AdvancedNavigationProps extends ThemeAwareProps {
  items?: NavigationItem[];
  onNavigate?: NavigationEventHandler;
  enableHistory?: boolean;
  enableCache?: boolean;
  enableAnalytics?: boolean;
  keyboardShortcuts?: boolean;
}

// Breadcrumb types
export interface BreadcrumbItem {
  label: string;
  sopLabel?: string;
  path?: string;
  icon?: IconComponent;
  isActive?: boolean;
  clickable?: boolean;
}

export interface BreadcrumbsConfig {
  maxItems?: number;
  showHome?: boolean;
  showIcons?: boolean;
  separator?: ReactNode;
  autoGenerate?: boolean;
}

// Quick Actions types
export interface QuickActionShortcut {
  key: string;
  modifiers?: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  description?: string;
}

export interface QuickAction extends BaseNavigationItem {
  onClick: () => void;
  shortcut?: QuickActionShortcut;
  badge?: number;
  loading?: boolean;
  priority?: number; // For sorting
}

export interface QuickActionsConfig {
  maxVisible?: number;
  showLabels?: boolean;
  showShortcuts?: boolean;
  groupByPriority?: boolean;
  orientation?: NavigationOrientation;
}

// Process navigation types
export interface ProcessNavigationConfig {
  showBreadcrumbs?: boolean;
  showStatus?: boolean;
  showActions?: boolean;
  contextualActions?: boolean;
  enableVersioning?: boolean;
}

export interface ProcessAction extends BaseNavigationItem {
  onClick: () => void;
  confirmMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

// SOP-specific types
export interface SOPTerminologyMapping {
  [activepiecesterm: string]: string;
}

export interface SOPNavigationConfig {
  enableTerminologyMapping?: boolean;
  customTerminology?: SOPTerminologyMapping;
  showBadges?: boolean;
  showIcons?: boolean;
  collapsibleGroups?: boolean;
  persistState?: boolean;
}

// Context types
export interface NavigationContextState {
  currentPath: string;
  currentProcess?: string;
  currentView?: string;
  navigationHistory: NavigationHistory;
  breadcrumbs: BreadcrumbItem[];
  cache: NavigationCache;
  isLoading: boolean;
  error?: string;
}

export interface NavigationContextActions {
  // Basic navigation
  navigateTo: (path: string, options?: NavigationOptions) => void;
  goBack: () => void;
  goForward: () => void;
  
  // State management
  setCurrentProcess: (processId?: string) => void;
  setCurrentView: (view?: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  
  // Breadcrumbs
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void;
  clearBreadcrumbs: () => void;
  
  // Shortcuts
  registerShortcut: (shortcut: QuickActionShortcut, callback: () => void) => void;
  unregisterShortcut: (key: string) => void;
  
  // SOP-specific
  navigateToProcess: (processId: string, view?: string) => void;
  navigateToExecution: (processId: string, executionId?: string) => void;
  navigateToSettings: (section?: string) => void;
  
  // Cache
  getCachedProcessData: (processId: string) => ProcessData | undefined;
  setCachedProcessData: (processId: string, data: ProcessData) => void;
  clearCache: () => void;
  
  // Events
  addEventListener: (handler: NavigationEventHandler) => () => void;
  emit: (event: NavigationEvent) => void;
}

export interface NavigationOptions {
  replace?: boolean;
  state?: any;
  silent?: boolean; // Don't emit navigation event
  updateHistory?: boolean;
  updateBreadcrumbs?: boolean;
}

// Provider types
export interface NavigationProviderConfig {
  enableHistory?: boolean;
  enableCache?: boolean;
  enableShortcuts?: boolean;
  enableBreadcrumbs?: boolean;
  enableAnalytics?: boolean;
  maxHistoryLength?: number;
  cacheExpiration?: number;
  defaultBreadcrumbsConfig?: BreadcrumbsConfig;
  sopTerminology?: SOPTerminologyMapping;
}

export interface NavigationProviderProps extends NavigationProviderConfig {
  children: ReactNode;
}

// Utility types
export type NavigationComponent = React.ComponentType<any>;
export type NavigationHook = () => any;

export interface NavigationModule {
  components: Record<string, NavigationComponent>;
  hooks: Record<string, NavigationHook>;
  utils: Record<string, Function>;
  types: Record<string, any>;
}

// Integration types for theme and terminology services
export interface ThemeIntegration {
  useTheme: () => { theme: string; setTheme: (theme: string) => void };
  themeClasses: Record<string, string>;
  cssVariables: Record<string, string>;
}

export interface TerminologyIntegration {
  getSOPTerm: (activepiecesTerm: string) => string;
  getAllMappings: () => SOPTerminologyMapping;
  updateMapping: (mapping: Partial<SOPTerminologyMapping>) => void;
  resetToDefault: () => void;
}

// Analytics and monitoring types
export interface NavigationAnalytics {
  trackNavigation: (from: string, to: string, method: string) => void;
  trackAction: (actionId: string, context?: any) => void;
  getNavigationStats: () => NavigationStats;
}

export interface NavigationStats {
  totalNavigations: number;
  mostVisitedPages: Array<{ path: string; visits: number }>;
  averageSessionTime: number;
  commonNavigationPaths: string[];
  actionUsage: Record<string, number>;
}

// Error handling
export interface NavigationError extends Error {
  code: 'NAVIGATION_ERROR' | 'PERMISSION_DENIED' | 'ROUTE_NOT_FOUND' | 'INVALID_ACTION';
  context?: any;
  recoverable?: boolean;
}

export type NavigationErrorHandler = (error: NavigationError) => void;
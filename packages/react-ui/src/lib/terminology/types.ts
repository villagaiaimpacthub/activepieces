/**
 * SOP Terminology Service - Type Definitions
 * 
 * Defines TypeScript interfaces for terminology mapping and configuration
 */

// Terminology Set Types
export type TerminologySetType = 'default' | 'sop' | 'custom';

// Context Types for Different UI Areas
export type TerminologyContext = 
  | 'general'      // General UI elements
  | 'flow-builder' // Flow builder interface
  | 'dashboard'    // Dashboard and main navigation
  | 'settings'     // Settings and configuration
  | 'auth'         // Authentication pages
  | 'admin'        // Platform admin interface
  | 'help'         // Help and documentation
  | 'forms'        // Form labels and validation
  | 'buttons'      // Button text and actions
  | 'status'       // Status messages and indicators
  | 'errors';      // Error messages and alerts

// Translation Priority Levels
export type TranslationPriority = 'low' | 'medium' | 'high' | 'critical';

// Core Terminology Mapping Interface
export interface TerminologyMapping {
  /** Original Activepieces term */
  original: string;
  
  /** SOP-specific replacement term */
  sop: string;
  
  /** Context where this mapping applies */
  context: TerminologyContext[];
  
  /** Priority for applying this translation */
  priority: TranslationPriority;
  
  /** Optional description for documentation */
  description?: string;
  
  /** Alternative terms that might also be replaced */
  aliases?: string[];
  
  /** Whether this mapping should be case-sensitive */
  caseSensitive?: boolean;
  
  /** Whether this should apply to whole words only */
  wholeWordsOnly?: boolean;
  
  /** Custom validation function */
  validator?: (text: string, context: TerminologyContext) => boolean;
}

// Terminology Configuration Interface
export interface TerminologyConfig {
  /** Active terminology set */
  activeSet: TerminologySetType;
  
  /** Whether terminology service is enabled */
  enabled: boolean;
  
  /** Specific contexts to enable/disable */
  enabledContexts: TerminologyContext[];
  
  /** Cache timeout in milliseconds */
  cacheTimeout: number;
  
  /** Whether to fallback to original terms if translation fails */
  fallbackToOriginal: boolean;
  
  /** Debug mode for development */
  debugMode: boolean;
  
  /** Custom terminology mappings */
  customMappings: TerminologyMapping[];
  
  /** Excluded patterns that should never be translated */
  excludePatterns: string[];
}

// Terminology Set Definition
export interface TerminologySet {
  /** Unique identifier */
  id: TerminologySetType;
  
  /** Display name */
  name: string;
  
  /** Description of this terminology set */
  description: string;
  
  /** Version for cache invalidation */
  version: string;
  
  /** All mappings in this set */
  mappings: TerminologyMapping[];
  
  /** Metadata about the set */
  metadata: {
    author?: string;
    lastUpdated: string;
    isDefault: boolean;
    tags: string[];
  };
}

// Translation Result Interface
export interface TranslationResult {
  /** Whether translation was applied */
  translated: boolean;
  
  /** Original text */
  originalText: string;
  
  /** Translated text (same as original if no translation) */
  translatedText: string;
  
  /** Applied mappings */
  appliedMappings: TerminologyMapping[];
  
  /** Context used for translation */
  context: TerminologyContext;
  
  /** Cache hit indicator */
  fromCache: boolean;
  
  /** Performance timing in milliseconds */
  duration: number;
}

// Service Events
export interface TerminologyServiceEvents {
  'config-changed': (config: TerminologyConfig) => void;
  'set-changed': (set: TerminologySet) => void;
  'translation-applied': (result: TranslationResult) => void;
  'cache-cleared': () => void;
  'error': (error: Error) => void;
}

// Hook Return Types
export interface UseTerminologyReturn {
  /** Translate text using current terminology set */
  translate: (text: string, context?: TerminologyContext) => string;
  
  /** Translate with detailed result information */
  translateWithDetails: (text: string, context?: TerminologyContext) => TranslationResult;
  
  /** Current configuration */
  config: TerminologyConfig;
  
  /** Update configuration */
  updateConfig: (updates: Partial<TerminologyConfig>) => void;
  
  /** Current terminology set */
  currentSet: TerminologySet;
  
  /** Switch terminology set */
  switchSet: (setType: TerminologySetType) => void;
  
  /** Check if service is ready */
  isReady: boolean;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Last error */
  error: Error | null;
}

// Terminology Provider Props
export interface TerminologyProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<TerminologyConfig>;
  initialSet?: TerminologySetType;
}

// Built-in React Component Props
export interface TerminologyTextProps {
  children: string;
  context?: TerminologyContext;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  fallback?: string;
}

export interface TerminologyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: string;
  context?: TerminologyContext;
  terminologyFallback?: string;
}

export interface TerminologyLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: string;
  context?: TerminologyContext;
  terminologyFallback?: string;
}

// Statistics and Analytics
export interface TerminologyStats {
  /** Total translations performed */
  totalTranslations: number;
  
  /** Cache hit ratio */
  cacheHitRatio: number;
  
  /** Average translation time */
  averageTranslationTime: number;
  
  /** Most frequently translated terms */
  topTerms: Array<{
    original: string;
    sop: string;
    count: number;
    contexts: TerminologyContext[];
  }>;
  
  /** Performance by context */
  contextPerformance: Record<TerminologyContext, {
    count: number;
    averageTime: number;
  }>;
  
  /** Error rate */
  errorRate: number;
  
  /** Last reset time */
  lastReset: Date;
}

// Export utility type helpers
export type PartialTerminologyMapping = Partial<TerminologyMapping> & Pick<TerminologyMapping, 'original' | 'sop'>;
export type ContextEnabledConfig = Pick<TerminologyConfig, 'enabledContexts'>;
export type TerminologyEventType = keyof TerminologyServiceEvents;
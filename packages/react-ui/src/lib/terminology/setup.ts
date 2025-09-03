/**
 * SOP Terminology Service - Application Setup
 * 
 * Setup and initialization utilities for integrating terminology service into the main application
 */

import { terminologyService } from './service';
import { createDefaultConfig } from './utils';
import { initializeI18nWithTerminology } from './i18n-integration';
import { TerminologyConfig, TerminologySetType } from './types';

/**
 * Initialize terminology service for the application
 */
export async function initializeTerminologyService(options?: {
  config?: Partial<TerminologyConfig>;
  initialSet?: TerminologySetType;
  integrateI18n?: boolean;
  enableDevMode?: boolean;
}): Promise<void> {
  const {
    config = {},
    initialSet = 'sop',
    integrateI18n = true,
    enableDevMode = process.env.NODE_ENV === 'development'
  } = options || {};

  // Create configuration with defaults
  const fullConfig = {
    ...createDefaultConfig(),
    debugMode: enableDevMode,
    ...config
  };

  try {
    // Initialize the service
    await terminologyService.initialize(fullConfig);

    // Switch to the desired terminology set
    if (initialSet !== terminologyService.getCurrentSet().id) {
      await terminologyService.switchSet(initialSet);
    }

    // Integrate with i18n if requested
    if (integrateI18n) {
      initializeI18nWithTerminology();
    }

    // Set up development helpers
    if (enableDevMode) {
      setupDevelopmentHelpers();
    }

    console.log('✅ SOP Terminology Service initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize SOP Terminology Service:', error);
    throw error;
  }
}

/**
 * Setup development helpers and debugging tools
 */
function setupDevelopmentHelpers(): void {
  if (typeof window === 'undefined') return;

  // Add global access to terminology service
  (window as any).sopTerminology = {
    service: terminologyService,
    translate: (text: string, context?: string) => terminologyService.translate(text, context as any),
    stats: () => terminologyService.getStats(),
    config: () => terminologyService.getConfig(),
    currentSet: () => terminologyService.getCurrentSet(),
    clearCache: () => terminologyService.clearCache()
  };

  // Add console commands
  console.log(`
🏷️ SOP Terminology Service Development Mode

Available commands:
- sopTerminology.translate('Flow', 'flow-builder') - Test translation
- sopTerminology.stats() - View statistics
- sopTerminology.config() - View configuration
- sopTerminology.currentSet() - View current terminology set
- sopTerminology.clearCache() - Clear translation cache

Example usage:
sopTerminology.translate('Create a new Flow', 'flow-builder')
// Returns: "Create a new Standard Operating Procedure"
  `);
}

/**
 * Recommended configuration for production
 */
export function getProductionConfig(): Partial<TerminologyConfig> {
  return {
    enabled: true,
    activeSet: 'sop',
    enabledContexts: [
      'general',
      'flow-builder',
      'dashboard',
      'settings',
      'forms',
      'buttons',
      'status'
    ],
    cacheTimeout: 10 * 60 * 1000, // 10 minutes
    fallbackToOriginal: true,
    debugMode: false,
    customMappings: [],
    excludePatterns: [
      // Technical terms
      'JSON', 'HTTP', 'HTTPS', 'API', 'UUID', 'CSS', 'HTML',
      // Code patterns
      '\\{\\{.*?\\}\\}', '\\$\\{.*?\\}', '`.*?`',
      // URLs and emails
      'https?:\\/\\/[^\\s]+',
      '[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}'
    ]
  };
}

/**
 * Recommended configuration for development
 */
export function getDevelopmentConfig(): Partial<TerminologyConfig> {
  return {
    ...getProductionConfig(),
    debugMode: true,
    cacheTimeout: 2 * 60 * 1000 // 2 minutes for faster testing
  };
}

/**
 * Configuration for testing environment
 */
export function getTestingConfig(): Partial<TerminologyConfig> {
  return {
    enabled: true,
    activeSet: 'sop',
    enabledContexts: ['general', 'flow-builder'],
    cacheTimeout: 1000, // 1 second
    fallbackToOriginal: true,
    debugMode: true,
    customMappings: [],
    excludePatterns: []
  };
}

/**
 * Quick setup for different environments
 */
export const setupPresets = {
  /**
   * Standard SOP setup for production
   */
  async production() {
    await initializeTerminologyService({
      config: getProductionConfig(),
      initialSet: 'sop',
      integrateI18n: true,
      enableDevMode: false
    });
  },

  /**
   * Development setup with debugging enabled
   */
  async development() {
    await initializeTerminologyService({
      config: getDevelopmentConfig(),
      initialSet: 'sop',
      integrateI18n: true,
      enableDevMode: true
    });
  },

  /**
   * Testing setup with minimal configuration
   */
  async testing() {
    await initializeTerminologyService({
      config: getTestingConfig(),
      initialSet: 'sop',
      integrateI18n: false,
      enableDevMode: false
    });
  },

  /**
   * Disable terminology (use original Activepieces terms)
   */
  async disabled() {
    await initializeTerminologyService({
      config: { enabled: false },
      initialSet: 'default',
      integrateI18n: false,
      enableDevMode: false
    });
  }
};

/**
 * Validate that the terminology service is working correctly
 */
export async function validateTerminologySetup(): Promise<{
  isValid: boolean;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  try {
    // Check if service is initialized
    if (!terminologyService.isReady()) {
      issues.push('Terminology service is not initialized');
      return { isValid: false, issues, recommendations };
    }

    // Test basic translation
    const testResult = terminologyService.translateWithDetails('Flow', 'general');
    if (!testResult.translated && terminologyService.getConfig().enabled) {
      issues.push('Translation not working - expected "Flow" to be translated');
    }

    // Check configuration
    const config = terminologyService.getConfig();
    if (config.enabledContexts.length === 0) {
      issues.push('No contexts are enabled for terminology translation');
    }

    if (config.cacheTimeout < 60000) {
      recommendations.push('Consider increasing cache timeout for better performance');
    }

    // Check current set
    const currentSet = terminologyService.getCurrentSet();
    if (currentSet.mappings.length === 0 && config.enabled) {
      issues.push('No terminology mappings available in current set');
    }

    // Performance check
    const stats = terminologyService.getStats();
    if (stats.totalTranslations > 1000 && stats.averageTranslationTime > 10) {
      recommendations.push('Consider optimizing mappings for better performance');
    }

  } catch (error) {
    issues.push(`Validation failed: ${error}`);
  }

  return {
    isValid: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Health check utility for monitoring
 */
export function createTerminologyHealthCheck() {
  return {
    async check(): Promise<{
      status: 'healthy' | 'warning' | 'error';
      details: {
        initialized: boolean;
        enabled: boolean;
        currentSet: string;
        totalTranslations: number;
        cacheHitRatio: number;
        averageResponseTime: number;
      };
    }> {
      try {
        const isInitialized = terminologyService.isReady();
        const config = terminologyService.getConfig();
        const currentSet = terminologyService.getCurrentSet();
        const stats = terminologyService.getStats();

        const details = {
          initialized: isInitialized,
          enabled: config.enabled,
          currentSet: currentSet.name,
          totalTranslations: stats.totalTranslations,
          cacheHitRatio: stats.cacheHitRatio,
          averageResponseTime: stats.averageTranslationTime
        };

        // Determine status
        let status: 'healthy' | 'warning' | 'error' = 'healthy';
        
        if (!isInitialized) {
          status = 'error';
        } else if (stats.averageTranslationTime > 20 || stats.cacheHitRatio < 0.5) {
          status = 'warning';
        }

        return { status, details };
      } catch (error) {
        return {
          status: 'error',
          details: {
            initialized: false,
            enabled: false,
            currentSet: 'unknown',
            totalTranslations: 0,
            cacheHitRatio: 0,
            averageResponseTime: 0
          }
        };
      }
    }
  };
}

/**
 * Export setup utilities
 */
export const terminologySetup = {
  initialize: initializeTerminologyService,
  presets: setupPresets,
  validate: validateTerminologySetup,
  healthCheck: createTerminologyHealthCheck(),
  configs: {
    production: getProductionConfig,
    development: getDevelopmentConfig,
    testing: getTestingConfig
  }
};

// Auto-setup for development if in browser and not production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Delay initialization to allow app to load
  setTimeout(async () => {
    try {
      await setupPresets.development();
    } catch (error) {
      console.warn('Failed to auto-initialize terminology service:', error);
    }
  }, 1000);
}
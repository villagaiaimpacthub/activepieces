/**
 * SOP Terminology Service - i18n Integration
 * 
 * Integration layer between terminology service and react-i18next
 */

import i18n from 'i18next';
import { terminologyService } from './service';
import { TerminologyContext } from './types';

/**
 * Enhanced t function that applies terminology translation
 */
export function createTerminologyT() {
  const originalT = i18n.t.bind(i18n);

  return function t(
    key: string | string[],
    options?: {
      terminologyContext?: TerminologyContext;
      skipTerminology?: boolean;
      [key: string]: any;
    }
  ): string {
    // Get the original translation from i18n
    const originalText = originalT(key, options);

    // Skip terminology translation if requested
    if (options?.skipTerminology) {
      return originalText;
    }

    // Apply terminology translation
    const context = options?.terminologyContext || 'general';
    return terminologyService.translate(originalText, context);
  };
}

/**
 * Enhanced useTranslation hook that includes terminology
 */
export function createTerminologyUseTranslation() {
  return function useTerminologyTranslation(ns?: string) {
    // Get the original hook result
    const { t: originalT, i18n: i18nInstance, ready } = require('react-i18next').useTranslation(ns);

    // Create enhanced t function
    const t = (
      key: string | string[],
      options?: {
        terminologyContext?: TerminologyContext;
        skipTerminology?: boolean;
        [key: string]: any;
      }
    ): string => {
      const originalText = originalT(key, options);

      if (options?.skipTerminology) {
        return originalText;
      }

      const context = options?.terminologyContext || 'general';
      return terminologyService.translate(originalText, context);
    };

    return {
      t,
      i18n: i18nInstance,
      ready
    };
  };
}

/**
 * i18n backend that includes terminology translation
 */
export class TerminologyI18nBackend {
  static type = 'backend';
  
  init(services: any, backendOptions: any, i18nextOptions: any) {
    // Initialize with existing backend if available
    this.services = services;
    this.options = backendOptions;
  }

  read(language: string, namespace: string, callback: (err: any, data?: any) => void) {
    // Use the default HTTP backend to load translations
    const httpBackend = require('i18next-http-backend');
    const backend = new httpBackend.default();
    
    backend.init(this.services, this.options, {});
    backend.read(language, namespace, (err: any, data: any) => {
      if (err) {
        callback(err);
        return;
      }

      // Apply terminology transformations to loaded data
      const transformedData = this.applyTerminologyToTranslations(data);
      callback(null, transformedData);
    });
  }

  private applyTerminologyToTranslations(translations: Record<string, any>): Record<string, any> {
    const transformed: Record<string, any> = {};

    for (const [key, value] of Object.entries(translations)) {
      if (typeof value === 'string') {
        // Apply terminology translation to string values
        transformed[key] = terminologyService.translate(value);
      } else if (typeof value === 'object' && value !== null) {
        // Recursively handle nested objects
        transformed[key] = this.applyTerminologyToTranslations(value);
      } else {
        transformed[key] = value;
      }
    }

    return transformed;
  }

  private services: any;
  private options: any;
}

/**
 * Plugin to integrate terminology service with i18next
 */
export const terminologyI18nPlugin = {
  type: 'postProcessor',
  name: 'terminology',

  process(value: string, key: string, options: any, translator: any) {
    if (options.skipTerminology) {
      return value;
    }

    const context = options.terminologyContext || 'general';
    return terminologyService.translate(value, context);
  }
};

/**
 * Initialize i18n with terminology integration
 */
export function initializeI18nWithTerminology() {
  // Add terminology plugin to i18n
  i18n.use(terminologyI18nPlugin);

  // Update i18n configuration to support terminology
  const currentOptions = i18n.options;
  i18n.init({
    ...currentOptions,
    postProcess: ['terminology'],
    postProcessPassResolved: true
  });

  return {
    t: createTerminologyT(),
    useTranslation: createTerminologyUseTranslation()
  };
}

/**
 * Utility to batch translate i18n keys with terminology
 */
export function batchTranslateKeys(
  keys: string[],
  context: TerminologyContext = 'general',
  options?: { [key: string]: any }
): Record<string, string> {
  const results: Record<string, string> = {};

  keys.forEach(key => {
    const originalText = i18n.t(key, options);
    results[key] = terminologyService.translate(originalText, context);
  });

  return results;
}

/**
 * Utility to check which translations contain terminology that could be replaced
 */
export function analyzeTranslationsForTerminology(
  namespace: string = 'translation'
): {
  totalKeys: number;
  keysWithTerminology: Array<{
    key: string;
    original: string;
    translated: string;
    appliedMappings: number;
  }>;
  coveragePercentage: number;
} {
  const store = i18n.getResourceBundle(i18n.language, namespace) || {};
  const allKeys = Object.keys(store);
  const keysWithTerminology: Array<{
    key: string;
    original: string;
    translated: string;
    appliedMappings: number;
  }> = [];

  function analyzeValue(key: string, value: string) {
    const result = terminologyService.translateWithDetails(value);
    if (result.translated) {
      keysWithTerminology.push({
        key,
        original: result.originalText,
        translated: result.translatedText,
        appliedMappings: result.appliedMappings.length
      });
    }
  }

  function processNestedObject(obj: any, prefix: string = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'string') {
        analyzeValue(fullKey, value);
      } else if (typeof value === 'object' && value !== null) {
        processNestedObject(value, fullKey);
      }
    }
  }

  processNestedObject(store);

  return {
    totalKeys: allKeys.length,
    keysWithTerminology,
    coveragePercentage: (keysWithTerminology.length / allKeys.length) * 100
  };
}

/**
 * Generate a report of terminology usage in translations
 */
export function generateTerminologyUsageReport(): string {
  const analysis = analyzeTranslationsForTerminology();
  
  let report = `# Terminology Usage in Translations

## Summary
- **Total Translation Keys**: ${analysis.totalKeys}
- **Keys with Terminology**: ${analysis.keysWithTerminology.length}
- **Coverage**: ${analysis.coveragePercentage.toFixed(2)}%

## Detailed Analysis
`;

  if (analysis.keysWithTerminology.length > 0) {
    report += `
### Keys with Applied Terminology

| Key | Original Text | Translated Text | Mappings Applied |
|-----|---------------|-----------------|------------------|
`;
    
    analysis.keysWithTerminology.forEach(item => {
      report += `| \`${item.key}\` | ${item.original} | ${item.translated} | ${item.appliedMappings} |\n`;
    });
  } else {
    report += '\nNo terminology mappings were applied to the current translations.\n';
  }

  report += `
## Recommendations

${analysis.coveragePercentage < 20 ? 
  '⚠️ **Low Coverage**: Consider reviewing terminology mappings to ensure they match your translation content.' :
  analysis.coveragePercentage > 80 ?
  '✅ **High Coverage**: Good terminology integration with translations.' :
  '💡 **Moderate Coverage**: Consider expanding terminology mappings for better integration.'
}

---
Generated at: ${new Date().toISOString()}
`;

  return report;
}

/**
 * Middleware for updating translations when terminology changes
 */
export function createTerminologyTranslationMiddleware() {
  let lastSetId: string | null = null;

  return {
    onSetChanged: (setId: string) => {
      if (lastSetId !== setId) {
        lastSetId = setId;
        // Reload all translations to apply new terminology
        i18n.reloadResources().then(() => {
          console.log('🔄 Translations reloaded with new terminology');
        });
      }
    },

    onConfigChanged: () => {
      // Optionally reload translations when config changes
      if (i18n.isInitialized) {
        i18n.reloadResources();
      }
    }
  };
}

// Auto-initialize integration if i18n is already initialized
if (i18n.isInitialized) {
  initializeI18nWithTerminology();
  
  // Set up middleware
  const middleware = createTerminologyTranslationMiddleware();
  terminologyService.on('set-changed', (set) => middleware.onSetChanged(set.id));
  terminologyService.on('config-changed', middleware.onConfigChanged);
}
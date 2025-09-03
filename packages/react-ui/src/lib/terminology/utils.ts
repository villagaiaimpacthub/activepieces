/**
 * SOP Terminology Service - Utilities
 * 
 * Helper functions and utilities for terminology management
 */

import { 
  TerminologyConfig, 
  TerminologySet, 
  TerminologyMapping,
  TerminologyContext,
  TerminologySetType
} from './types';
import { EXCLUDE_PATTERNS } from './mappings';

/**
 * Create default configuration
 */
export function createDefaultConfig(): TerminologyConfig {
  return {
    activeSet: 'sop',
    enabled: true,
    enabledContexts: [
      'general', 'flow-builder', 'dashboard', 'settings', 
      'forms', 'buttons', 'status', 'help'
    ],
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    fallbackToOriginal: true,
    debugMode: false,
    customMappings: [],
    excludePatterns: [...EXCLUDE_PATTERNS]
  };
}

/**
 * Validate terminology configuration
 */
export function validateConfig(config: Partial<TerminologyConfig>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate activeSet
  if (config.activeSet && !['default', 'sop', 'custom'].includes(config.activeSet)) {
    errors.push(`Invalid activeSet: ${config.activeSet}`);
  }

  // Validate enabledContexts
  if (config.enabledContexts) {
    const validContexts: TerminologyContext[] = [
      'general', 'flow-builder', 'dashboard', 'settings', 
      'auth', 'admin', 'help', 'forms', 'buttons', 'status', 'errors'
    ];
    
    const invalidContexts = config.enabledContexts.filter(
      context => !validContexts.includes(context)
    );
    
    if (invalidContexts.length > 0) {
      errors.push(`Invalid contexts: ${invalidContexts.join(', ')}`);
    }
  }

  // Validate cacheTimeout
  if (config.cacheTimeout !== undefined) {
    if (typeof config.cacheTimeout !== 'number' || config.cacheTimeout < 0) {
      errors.push('cacheTimeout must be a non-negative number');
    }
    
    if (config.cacheTimeout < 60000) { // Less than 1 minute
      warnings.push('cacheTimeout is very low, may impact performance');
    }
    
    if (config.cacheTimeout > 24 * 60 * 60 * 1000) { // More than 24 hours
      warnings.push('cacheTimeout is very high, translations may become stale');
    }
  }

  // Validate customMappings
  if (config.customMappings) {
    config.customMappings.forEach((mapping, index) => {
      const mappingErrors = validateMapping(mapping);
      if (mappingErrors.length > 0) {
        errors.push(`Custom mapping ${index}: ${mappingErrors.join(', ')}`);
      }
    });
  }

  // Validate excludePatterns
  if (config.excludePatterns) {
    config.excludePatterns.forEach((pattern, index) => {
      try {
        new RegExp(pattern);
      } catch (error) {
        errors.push(`Invalid regex pattern at index ${index}: ${pattern}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate a single terminology mapping
 */
export function validateMapping(mapping: TerminologyMapping): string[] {
  const errors: string[] = [];

  if (!mapping.original || typeof mapping.original !== 'string') {
    errors.push('original is required and must be a string');
  }

  if (!mapping.sop || typeof mapping.sop !== 'string') {
    errors.push('sop is required and must be a string');
  }

  if (!mapping.context || !Array.isArray(mapping.context) || mapping.context.length === 0) {
    errors.push('context is required and must be a non-empty array');
  }

  if (!mapping.priority || !['low', 'medium', 'high', 'critical'].includes(mapping.priority)) {
    errors.push('priority must be one of: low, medium, high, critical');
  }

  if (mapping.aliases && (!Array.isArray(mapping.aliases) || mapping.aliases.some(alias => typeof alias !== 'string'))) {
    errors.push('aliases must be an array of strings');
  }

  if (mapping.validator && typeof mapping.validator !== 'function') {
    errors.push('validator must be a function');
  }

  return errors;
}

/**
 * Migrate configuration from older versions
 */
export function migrateConfig(oldConfig: any, fromVersion: string, toVersion: string): TerminologyConfig {
  let config = { ...oldConfig };

  // Add migration logic for different versions
  if (fromVersion === '0.9.0' && toVersion === '1.0.0') {
    // Example migration: rename old field names
    if (config.enabledAreas) {
      config.enabledContexts = config.enabledAreas;
      delete config.enabledAreas;
    }
  }

  // Ensure all required fields exist
  const defaultConfig = createDefaultConfig();
  return { ...defaultConfig, ...config };
}

/**
 * Export configuration for backup/sharing
 */
export function exportConfig(config: TerminologyConfig): {
  version: string;
  timestamp: string;
  config: TerminologyConfig;
} {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    config: JSON.parse(JSON.stringify(config)) // Deep clone
  };
}

/**
 * Import configuration from backup/sharing
 */
export function importConfig(exportedData: {
  version: string;
  timestamp: string;
  config: TerminologyConfig;
}): {
  success: boolean;
  config?: TerminologyConfig;
  error?: string;
} {
  try {
    const { config, version } = exportedData;
    
    // Validate the imported configuration
    const validation = validateConfig(config);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Invalid configuration: ${validation.errors.join(', ')}`
      };
    }

    // Migrate if necessary
    let migratedConfig = config;
    if (version !== '1.0.0') {
      migratedConfig = migrateConfig(config, version, '1.0.0');
    }

    return {
      success: true,
      config: migratedConfig
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to import configuration: ${error}`
    };
  }
}

/**
 * Create a terminology set from mappings
 */
export function createTerminologySet(
  id: TerminologySetType,
  name: string,
  description: string,
  mappings: TerminologyMapping[],
  metadata?: Partial<TerminologySet['metadata']>
): TerminologySet {
  return {
    id,
    name,
    description,
    version: '1.0.0',
    mappings,
    metadata: {
      author: 'User',
      lastUpdated: new Date().toISOString(),
      isDefault: false,
      tags: [],
      ...metadata
    }
  };
}

/**
 * Merge terminology sets
 */
export function mergeTerminologySets(
  baseSet: TerminologySet,
  overrideSet: TerminologySet
): TerminologySet {
  const mergedMappings = [...baseSet.mappings];
  
  // Add or override mappings from override set
  overrideSet.mappings.forEach(overrideMapping => {
    const existingIndex = mergedMappings.findIndex(
      mapping => mapping.original === overrideMapping.original
    );
    
    if (existingIndex >= 0) {
      mergedMappings[existingIndex] = overrideMapping;
    } else {
      mergedMappings.push(overrideMapping);
    }
  });

  return {
    id: overrideSet.id,
    name: `${baseSet.name} + ${overrideSet.name}`,
    description: `Merged set: ${baseSet.description} with overrides from ${overrideSet.description}`,
    version: overrideSet.version,
    mappings: mergedMappings,
    metadata: {
      ...baseSet.metadata,
      ...overrideSet.metadata,
      lastUpdated: new Date().toISOString()
    }
  };
}

/**
 * Filter mappings by context
 */
export function filterMappingsByContext(
  mappings: TerminologyMapping[],
  contexts: TerminologyContext[]
): TerminologyMapping[] {
  return mappings.filter(mapping =>
    mapping.context.some(context => contexts.includes(context))
  );
}

/**
 * Search mappings by text
 */
export function searchMappings(
  mappings: TerminologyMapping[],
  searchTerm: string,
  searchIn: ('original' | 'sop' | 'description')[] = ['original', 'sop']
): TerminologyMapping[] {
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return mappings.filter(mapping => {
    return searchIn.some(field => {
      const value = mapping[field];
      return value && value.toLowerCase().includes(lowerSearchTerm);
    });
  });
}

/**
 * Generate usage statistics for mappings
 */
export function generateMappingStats(mappings: TerminologyMapping[]): {
  totalMappings: number;
  byPriority: Record<string, number>;
  byContext: Record<string, number>;
  averageAliases: number;
} {
  const stats = {
    totalMappings: mappings.length,
    byPriority: {} as Record<string, number>,
    byContext: {} as Record<string, number>,
    averageAliases: 0
  };

  mappings.forEach(mapping => {
    // Count by priority
    stats.byPriority[mapping.priority] = (stats.byPriority[mapping.priority] || 0) + 1;
    
    // Count by context
    mapping.context.forEach(context => {
      stats.byContext[context] = (stats.byContext[context] || 0) + 1;
    });
  });

  // Calculate average aliases
  const totalAliases = mappings.reduce((sum, mapping) => 
    sum + (mapping.aliases?.length || 0), 0
  );
  stats.averageAliases = totalAliases / mappings.length;

  return stats;
}

/**
 * Optimize mappings for performance
 */
export function optimizeMappings(mappings: TerminologyMapping[]): TerminologyMapping[] {
  // Sort by priority and frequency of use
  return mappings
    .sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Secondary sort by original term length (shorter terms first for performance)
      return a.original.length - b.original.length;
    });
}

/**
 * Generate TypeScript definitions from mappings
 */
export function generateTypescriptDefinitions(mappings: TerminologyMapping[]): string {
  const originalTerms = mappings.map(m => m.original);
  const sopTerms = mappings.map(m => m.sop);
  
  return `
// Auto-generated terminology types
export type OriginalTerm = ${originalTerms.map(t => `'${t}'`).join(' | ')};
export type SOPTerm = ${sopTerms.map(t => `'${t}'`).join(' | ')};

export interface TerminologyMap {
${mappings.map(m => `  '${m.original}': '${m.sop}';`).join('\n')}
}
  `.trim();
}

/**
 * Validate terminology against a reference text
 */
export function validateAgainstReference(
  mappings: TerminologyMapping[],
  referenceText: string
): {
  foundTerms: Array<{
    original: string;
    sop: string;
    positions: number[];
  }>;
  unusedMappings: TerminologyMapping[];
} {
  const foundTerms: Array<{
    original: string;
    sop: string;
    positions: number[];
  }> = [];
  
  const usedMappings = new Set<string>();

  mappings.forEach(mapping => {
    const regex = new RegExp(`\\b${mapping.original}\\b`, 'gi');
    const matches = Array.from(referenceText.matchAll(regex));
    
    if (matches.length > 0) {
      foundTerms.push({
        original: mapping.original,
        sop: mapping.sop,
        positions: matches.map(match => match.index || 0)
      });
      usedMappings.add(mapping.original);
    }
  });

  const unusedMappings = mappings.filter(mapping => 
    !usedMappings.has(mapping.original)
  );

  return { foundTerms, unusedMappings };
}

/**
 * Create mapping from CSV data
 */
export function createMappingsFromCSV(csvData: string): {
  success: boolean;
  mappings: TerminologyMapping[];
  errors: string[];
} {
  const errors: string[] = [];
  const mappings: TerminologyMapping[] = [];
  
  try {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Validate headers
    const requiredHeaders = ['original', 'sop', 'context', 'priority'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
      return { success: false, mappings: [], errors };
    }
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      const rowData: any = {};
      
      headers.forEach((header, index) => {
        rowData[header] = values[index] || '';
      });
      
      // Create mapping
      const mapping: TerminologyMapping = {
        original: rowData.original,
        sop: rowData.sop,
        context: rowData.context.split(';').map((c: string) => c.trim()) as TerminologyContext[],
        priority: rowData.priority as any,
        description: rowData.description || undefined,
        aliases: rowData.aliases ? rowData.aliases.split(';').map((a: string) => a.trim()) : undefined,
        caseSensitive: rowData.caseSensitive === 'true',
        wholeWordsOnly: rowData.wholeWordsOnly !== 'false' // Default to true
      };
      
      // Validate mapping
      const mappingErrors = validateMapping(mapping);
      if (mappingErrors.length > 0) {
        errors.push(`Row ${i + 1}: ${mappingErrors.join(', ')}`);
      } else {
        mappings.push(mapping);
      }
    }
  } catch (error) {
    errors.push(`Failed to parse CSV: ${error}`);
  }
  
  return {
    success: errors.length === 0,
    mappings,
    errors
  };
}
/**
 * SOP Terminology Service - Test Utilities
 * 
 * Testing utilities for terminology service development and testing
 */

import { 
  TerminologyMapping, 
  TerminologySet, 
  TerminologyConfig,
  TerminologyContext,
  TranslationResult
} from './types';
import { TerminologyService } from './service';

/**
 * Create a test mapping for testing purposes
 */
export function createTestMapping(
  original: string,
  sop: string,
  context: TerminologyContext[] = ['general'],
  options: Partial<TerminologyMapping> = {}
): TerminologyMapping {
  return {
    original,
    sop,
    context,
    priority: 'medium',
    description: `Test mapping: ${original} -> ${sop}`,
    caseSensitive: false,
    wholeWordsOnly: true,
    ...options
  };
}

/**
 * Create a test terminology set
 */
export function createTestSet(
  id: string,
  mappings: TerminologyMapping[],
  options: Partial<TerminologySet> = {}
): TerminologySet {
  return {
    id: id as any,
    name: `Test Set ${id}`,
    description: `Test terminology set for ${id}`,
    version: '1.0.0-test',
    mappings,
    metadata: {
      author: 'Test Suite',
      lastUpdated: new Date().toISOString(),
      isDefault: false,
      tags: ['test', 'development']
    },
    ...options
  };
}

/**
 * Create a test configuration
 */
export function createTestConfig(
  overrides: Partial<TerminologyConfig> = {}
): TerminologyConfig {
  return {
    activeSet: 'sop',
    enabled: true,
    enabledContexts: ['general', 'flow-builder'],
    cacheTimeout: 1000, // Short timeout for testing
    fallbackToOriginal: true,
    debugMode: true,
    customMappings: [],
    excludePatterns: [],
    ...overrides
  };
}

/**
 * Mock terminology service for testing
 */
export class MockTerminologyService {
  private config: TerminologyConfig;
  private currentSet: TerminologySet;
  private translations = new Map<string, string>();
  private callLog: Array<{ method: string; args: any[]; timestamp: number }> = [];

  constructor(
    config: TerminologyConfig = createTestConfig(),
    set: TerminologySet = createTestSet('test', [])
  ) {
    this.config = config;
    this.currentSet = set;
  }

  // Mock the translate method
  translate(text: string, context?: TerminologyContext): string {
    this.logCall('translate', [text, context]);
    
    if (this.translations.has(text)) {
      return this.translations.get(text)!;
    }
    
    // Apply actual mappings if available
    for (const mapping of this.currentSet.mappings) {
      if (mapping.original === text && 
          (!context || mapping.context.includes(context))) {
        return mapping.sop;
      }
    }
    
    return text;
  }

  // Mock the translateWithDetails method
  translateWithDetails(text: string, context?: TerminologyContext): TranslationResult {
    this.logCall('translateWithDetails', [text, context]);
    
    const translatedText = this.translate(text, context);
    const appliedMappings = this.currentSet.mappings.filter(
      mapping => mapping.original === text && 
        (!context || mapping.context.includes(context))
    );

    return {
      translated: text !== translatedText,
      originalText: text,
      translatedText,
      appliedMappings,
      context: context || 'general',
      fromCache: false,
      duration: 1
    };
  }

  // Set custom translations for testing
  setTranslation(original: string, translated: string): void {
    this.translations.set(original, translated);
  }

  // Clear custom translations
  clearTranslations(): void {
    this.translations.clear();
  }

  // Get call log for testing
  getCallLog(): Array<{ method: string; args: any[]; timestamp: number }> {
    return [...this.callLog];
  }

  // Clear call log
  clearCallLog(): void {
    this.callLog = [];
  }

  // Mock other methods
  updateConfig(updates: Partial<TerminologyConfig>): void {
    this.logCall('updateConfig', [updates]);
    this.config = { ...this.config, ...updates };
  }

  getConfig(): TerminologyConfig {
    this.logCall('getConfig', []);
    return { ...this.config };
  }

  getCurrentSet(): TerminologySet {
    this.logCall('getCurrentSet', []);
    return { ...this.currentSet };
  }

  isReady(): boolean {
    this.logCall('isReady', []);
    return true;
  }

  async switchSet(setType: string): Promise<void> {
    this.logCall('switchSet', [setType]);
    // Mock implementation
  }

  private logCall(method: string, args: any[]): void {
    this.callLog.push({
      method,
      args: JSON.parse(JSON.stringify(args)), // Deep clone
      timestamp: Date.now()
    });
  }
}

/**
 * Test utilities collection
 */
export const terminologyTestUtils = {
  // Common test mappings
  COMMON_MAPPINGS: [
    createTestMapping('Flow', 'Standard Operating Procedure', ['general', 'flow-builder'], { priority: 'critical' }),
    createTestMapping('Action', 'Task', ['flow-builder'], { priority: 'high' }),
    createTestMapping('Trigger', 'Initiator', ['flow-builder'], { priority: 'high' }),
    createTestMapping('Connection', 'System Integration', ['general', 'settings'], { priority: 'medium' }),
    createTestMapping('Piece', 'Component', ['flow-builder'], { priority: 'medium' })
  ],

  // Test contexts
  TEST_CONTEXTS: [
    'general',
    'flow-builder',
    'dashboard',
    'settings'
  ] as TerminologyContext[],

  // Test text samples
  TEST_TEXTS: {
    simple: 'Create a new Flow',
    complex: 'This Flow contains multiple Actions and a Trigger that connects to external systems',
    mixed: 'Flow Builder: Create Actions, set up Triggers, and manage Connections',
    noTranslation: 'This text has no terminology to translate',
    withExclusions: 'JSON API call with HTTP headers',
    caseVariations: 'flow, Flow, FLOW, flows, Flows, FLOWS'
  },

  // Expected translations
  EXPECTED_TRANSLATIONS: {
    'Create a new Flow': 'Create a new Standard Operating Procedure',
    'Flow contains Actions': 'Standard Operating Procedure contains Tasks',
    'Trigger event': 'Initiator event',
    'Connection setup': 'System Integration setup',
    'Piece configuration': 'Component configuration'
  },

  // Performance test data
  PERFORMANCE_TEST_DATA: Array.from({ length: 1000 }, (_, i) => `Test Flow ${i} with Action ${i}`),

  // Create a mock service instance
  createMockService(config?: Partial<TerminologyConfig>): MockTerminologyService {
    return new MockTerminologyService(
      createTestConfig(config),
      createTestSet('test', this.COMMON_MAPPINGS)
    );
  },

  // Test translation accuracy
  testTranslationAccuracy(
    service: TerminologyService | MockTerminologyService,
    testCases: Array<{ input: string; expected: string; context?: TerminologyContext }>
  ): {
    passed: number;
    failed: number;
    failures: Array<{ input: string; expected: string; actual: string }>;
  } {
    let passed = 0;
    let failed = 0;
    const failures: Array<{ input: string; expected: string; actual: string }> = [];

    testCases.forEach(({ input, expected, context }) => {
      const actual = service.translate(input, context);
      if (actual === expected) {
        passed++;
      } else {
        failed++;
        failures.push({ input, expected, actual });
      }
    });

    return { passed, failed, failures };
  },

  // Test performance
  async testPerformance(
    service: TerminologyService | MockTerminologyService,
    testTexts: string[],
    iterations: number = 100
  ): Promise<{
    averageTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
    throughput: number;
  }> {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      for (const text of testTexts) {
        service.translate(text);
      }
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    }

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const throughput = (testTexts.length * iterations) / (totalTime / 1000); // translations per second

    return {
      averageTime,
      minTime,
      maxTime,
      totalTime,
      throughput
    };
  },

  // Generate test report
  generateTestReport(
    accuracyResults: ReturnType<typeof terminologyTestUtils.testTranslationAccuracy>,
    performanceResults: Awaited<ReturnType<typeof terminologyTestUtils.testPerformance>>,
    additionalInfo?: Record<string, any>
  ): string {
    return `
# Terminology Service Test Report

## Accuracy Test Results
- **Passed**: ${accuracyResults.passed}
- **Failed**: ${accuracyResults.failed}
- **Success Rate**: ${((accuracyResults.passed / (accuracyResults.passed + accuracyResults.failed)) * 100).toFixed(2)}%

${accuracyResults.failures.length > 0 ? `
### Failures
${accuracyResults.failures.map(f => `- Input: "${f.input}"\n  Expected: "${f.expected}"\n  Actual: "${f.actual}"`).join('\n')}
` : ''}

## Performance Test Results
- **Average Time**: ${performanceResults.averageTime.toFixed(2)}ms
- **Min Time**: ${performanceResults.minTime.toFixed(2)}ms
- **Max Time**: ${performanceResults.maxTime.toFixed(2)}ms
- **Total Time**: ${performanceResults.totalTime.toFixed(2)}ms
- **Throughput**: ${performanceResults.throughput.toFixed(0)} translations/second

## Additional Information
${additionalInfo ? Object.entries(additionalInfo).map(([key, value]) => `- **${key}**: ${value}`).join('\n') : 'None'}

---
Generated at: ${new Date().toISOString()}
    `.trim();
  },

  // Validate test environment
  validateTestEnvironment(): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check performance API
    if (typeof performance === 'undefined' || !performance.now) {
      issues.push('Performance API not available - timing tests may be inaccurate');
    }

    // Check JSON support
    try {
      JSON.parse('{"test": true}');
    } catch {
      issues.push('JSON support not available - config serialization may fail');
    }

    // Check localStorage (if in browser)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('__test__', 'test');
        localStorage.removeItem('__test__');
      } catch {
        issues.push('LocalStorage not available - config persistence may fail');
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
};

// Export a pre-configured mock for common use cases
export const mockTerminologyService = terminologyTestUtils.createMockService();
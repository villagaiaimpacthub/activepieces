/**
 * SOP Terminology Service
 * 
 * Core service for dynamic terminology replacement throughout the application
 */

import { EventEmitter } from 'events';
import { 
  TerminologyConfig, 
  TerminologySet, 
  TerminologyMapping, 
  TerminologyContext,
  TerminologySetType,
  TranslationResult,
  TerminologyServiceEvents,
  TerminologyStats
} from './types';
import { 
  TERMINOLOGY_SETS, 
  SOP_TERMINOLOGY_SET, 
  DEFAULT_TERMINOLOGY_SET, 
  EXCLUDE_PATTERNS 
} from './mappings';

// Default configuration
const DEFAULT_CONFIG: TerminologyConfig = {
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
  excludePatterns: EXCLUDE_PATTERNS
};

// Translation cache interface
interface CacheEntry {
  result: TranslationResult;
  timestamp: number;
  hits: number;
}

/**
 * Core Terminology Service Class
 */
export class TerminologyService extends EventEmitter {
  private config: TerminologyConfig = { ...DEFAULT_CONFIG };
  private currentSet: TerminologySet = SOP_TERMINOLOGY_SET;
  private translationCache = new Map<string, CacheEntry>();
  private stats: TerminologyStats;
  private isInitialized = false;

  constructor() {
    super();
    this.stats = this.initializeStats();
    this.setupPerformanceMonitoring();
  }

  /**
   * Initialize the service
   */
  async initialize(config?: Partial<TerminologyConfig>): Promise<void> {
    if (config) {
      this.updateConfig(config);
    }

    // Load saved configuration from localStorage
    this.loadConfigFromStorage();

    // Set initial terminology set
    await this.switchSet(this.config.activeSet);

    this.isInitialized = true;
    this.emit('initialized');

    if (this.config.debugMode) {
      console.log('🏷️ Terminology Service initialized', {
        config: this.config,
        currentSet: this.currentSet.name
      });
    }
  }

  /**
   * Update service configuration
   */
  updateConfig(updates: Partial<TerminologyConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...updates };
    
    // Save to localStorage
    this.saveConfigToStorage();
    
    // Clear cache if significant changes
    if (oldConfig.activeSet !== this.config.activeSet || 
        oldConfig.enabled !== this.config.enabled) {
      this.clearCache();
    }

    this.emit('config-changed', this.config);
  }

  /**
   * Switch terminology set
   */
  async switchSet(setType: TerminologySetType): Promise<void> {
    const newSet = TERMINOLOGY_SETS[setType];
    if (!newSet) {
      throw new Error(`Unknown terminology set: ${setType}`);
    }

    this.currentSet = newSet;
    this.config.activeSet = setType;
    this.clearCache();
    this.saveConfigToStorage();

    this.emit('set-changed', this.currentSet);
  }

  /**
   * Main translation method
   */
  translate(
    text: string, 
    context: TerminologyContext = 'general'
  ): string {
    const result = this.translateWithDetails(text, context);
    return result.translatedText;
  }

  /**
   * Translation with detailed result information
   */
  translateWithDetails(
    text: string, 
    context: TerminologyContext = 'general'
  ): TranslationResult {
    const startTime = performance.now();
    
    // Quick return if service is disabled
    if (!this.config.enabled) {
      return this.createTranslationResult(text, text, [], context, false, 0);
    }

    // Check cache first
    const cacheKey = `${text}:${context}:${this.currentSet.id}`;
    const cached = this.translationCache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      cached.hits++;
      this.stats.totalTranslations++;
      return {
        ...cached.result,
        fromCache: true,
        duration: performance.now() - startTime
      };
    }

    // Perform translation
    let translatedText = text;
    const appliedMappings: TerminologyMapping[] = [];

    // Skip translation if context is not enabled
    if (!this.config.enabledContexts.includes(context)) {
      const result = this.createTranslationResult(text, text, [], context, false, performance.now() - startTime);
      return result;
    }

    // Skip if text matches exclude patterns
    if (this.shouldExclude(text)) {
      const result = this.createTranslationResult(text, text, [], context, false, performance.now() - startTime);
      return result;
    }

    // Apply mappings in priority order
    const relevantMappings = this.getRelevantMappings(context);
    const sortedMappings = this.sortMappingsByPriority(relevantMappings);

    for (const mapping of sortedMappings) {
      const beforeTranslation = translatedText;
      translatedText = this.applyMapping(translatedText, mapping);
      
      if (beforeTranslation !== translatedText) {
        appliedMappings.push(mapping);
      }
    }

    // Create result
    const duration = performance.now() - startTime;
    const result = this.createTranslationResult(
      text, 
      translatedText, 
      appliedMappings, 
      context, 
      false, 
      duration
    );

    // Cache result
    this.translationCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      hits: 1
    });

    // Update stats
    this.updateStats(result);

    // Emit event
    this.emit('translation-applied', result);

    return result;
  }

  /**
   * Get relevant mappings for a context
   */
  private getRelevantMappings(context: TerminologyContext): TerminologyMapping[] {
    const setMappings = this.currentSet.mappings;
    const customMappings = this.config.customMappings;
    
    const allMappings = [...setMappings, ...customMappings];
    
    return allMappings.filter(mapping => 
      mapping.context.includes(context) &&
      (!mapping.validator || mapping.validator('', context))
    );
  }

  /**
   * Sort mappings by priority
   */
  private sortMappingsByPriority(mappings: TerminologyMapping[]): TerminologyMapping[] {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    
    return mappings.sort((a, b) => {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Apply a single mapping to text
   */
  private applyMapping(text: string, mapping: TerminologyMapping): string {
    const { original, sop, caseSensitive = false, wholeWordsOnly = true, aliases = [] } = mapping;
    
    const terms = [original, ...aliases];
    let result = text;
    
    for (const term of terms) {
      const flags = caseSensitive ? 'g' : 'gi';
      const pattern = wholeWordsOnly ? `\\b${this.escapeRegExp(term)}\\b` : this.escapeRegExp(term);
      const regex = new RegExp(pattern, flags);
      
      result = result.replace(regex, sop);
    }
    
    return result;
  }

  /**
   * Check if text should be excluded from translation
   */
  private shouldExclude(text: string): boolean {
    return this.config.excludePatterns.some(pattern => {
      const regex = new RegExp(pattern, 'i');
      return regex.test(text);
    });
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.config.cacheTimeout;
  }

  /**
   * Create translation result object
   */
  private createTranslationResult(
    originalText: string,
    translatedText: string,
    appliedMappings: TerminologyMapping[],
    context: TerminologyContext,
    fromCache: boolean,
    duration: number
  ): TranslationResult {
    return {
      translated: originalText !== translatedText,
      originalText,
      translatedText,
      appliedMappings,
      context,
      fromCache,
      duration
    };
  }

  /**
   * Update statistics
   */
  private updateStats(result: TranslationResult): void {
    this.stats.totalTranslations++;
    
    // Update cache hit ratio
    const cacheHits = Array.from(this.translationCache.values())
      .reduce((sum, entry) => sum + entry.hits, 0);
    this.stats.cacheHitRatio = cacheHits / this.stats.totalTranslations;
    
    // Update average translation time
    const currentAvg = this.stats.averageTranslationTime;
    const count = this.stats.totalTranslations;
    this.stats.averageTranslationTime = (currentAvg * (count - 1) + result.duration) / count;
    
    // Update context performance
    if (!this.stats.contextPerformance[result.context]) {
      this.stats.contextPerformance[result.context] = { count: 0, averageTime: 0 };
    }
    
    const contextStats = this.stats.contextPerformance[result.context];
    contextStats.count++;
    contextStats.averageTime = (contextStats.averageTime * (contextStats.count - 1) + result.duration) / contextStats.count;
    
    // Update top terms
    if (result.translated && result.appliedMappings.length > 0) {
      result.appliedMappings.forEach(mapping => {
        const existing = this.stats.topTerms.find(term => term.original === mapping.original);
        if (existing) {
          existing.count++;
          if (!existing.contexts.includes(result.context)) {
            existing.contexts.push(result.context);
          }
        } else {
          this.stats.topTerms.push({
            original: mapping.original,
            sop: mapping.sop,
            count: 1,
            contexts: [result.context]
          });
        }
      });
      
      // Sort and keep top 20
      this.stats.topTerms.sort((a, b) => b.count - a.count);
      this.stats.topTerms = this.stats.topTerms.slice(0, 20);
    }
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.translationCache.clear();
    this.emit('cache-cleared');
  }

  /**
   * Get current statistics
   */
  getStats(): TerminologyStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = this.initializeStats();
  }

  /**
   * Get current configuration
   */
  getConfig(): TerminologyConfig {
    return { ...this.config };
  }

  /**
   * Get current terminology set
   */
  getCurrentSet(): TerminologySet {
    return { ...this.currentSet };
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Add custom mapping
   */
  addCustomMapping(mapping: TerminologyMapping): void {
    this.config.customMappings.push(mapping);
    this.clearCache();
    this.saveConfigToStorage();
  }

  /**
   * Remove custom mapping
   */
  removeCustomMapping(original: string): void {
    this.config.customMappings = this.config.customMappings.filter(
      mapping => mapping.original !== original
    );
    this.clearCache();
    this.saveConfigToStorage();
  }

  // Private utility methods
  private initializeStats(): TerminologyStats {
    return {
      totalTranslations: 0,
      cacheHitRatio: 0,
      averageTranslationTime: 0,
      topTerms: [],
      contextPerformance: {} as any,
      errorRate: 0,
      lastReset: new Date()
    };
  }

  private setupPerformanceMonitoring(): void {
    if (typeof window !== 'undefined') {
      // Clean up cache periodically
      setInterval(() => {
        this.cleanupCache();
      }, 60000); // Every minute
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.translationCache.entries()) {
      if (!this.isCacheValid(entry)) {
        this.translationCache.delete(key);
      }
    }
  }

  private saveConfigToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sop-terminology-config', JSON.stringify(this.config));
      } catch (error) {
        console.warn('Failed to save terminology config to localStorage:', error);
      }
    }
  }

  private loadConfigFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sop-terminology-config');
        if (saved) {
          const savedConfig = JSON.parse(saved);
          this.config = { ...DEFAULT_CONFIG, ...savedConfig };
        }
      } catch (error) {
        console.warn('Failed to load terminology config from localStorage:', error);
      }
    }
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Singleton instance
export const terminologyService = new TerminologyService();

// Development helpers
if (process.env.NODE_ENV === 'development') {
  (window as any).terminologyService = terminologyService;
}
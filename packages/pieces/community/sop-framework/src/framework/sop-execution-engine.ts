/**
 * SOP Execution Engine - Handles execution of SOP workflow components
 * 
 * This class provides the execution framework for SOP pieces, including
 * lifecycle management, error handling, and integration with workflow context.
 */

import { SOPExecutionContext, SOPExecutionState, SOPValidationResult } from '../types/sop-types';
import { SOPWorkflowContext } from './sop-workflow-context';
import { SOPValidationFramework } from './sop-validation-framework';
import { nanoid } from 'nanoid';

/**
 * Execution Options Interface
 */
export interface SOPExecutionOptions {
    skipValidation?: boolean;
    skipPreHooks?: boolean;
    skipPostHooks?: boolean;
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
    enableDebugLogging?: boolean;
    customContext?: Record<string, any>;
}

/**
 * Execution Result Interface
 */
export interface SOPExecutionResult {
    success: boolean;
    result?: any;
    error?: Error;
    executionTime: number;
    validationResult?: SOPValidationResult;
    context: SOPExecutionContext;
    logs: SOPExecutionLog[];
    metrics: SOPExecutionMetrics;
}

/**
 * Execution Log Interface
 */
export interface SOPExecutionLog {
    id: string;
    timestamp: string;
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    category: string;
    data?: any;
    duration?: number;
}

/**
 * Execution Metrics Interface
 */
export interface SOPExecutionMetrics {
    startTime: string;
    endTime: string;
    totalDuration: number;
    validationTime: number;
    executionTime: number;
    postProcessingTime: number;
    memoryUsage?: {
        heapUsed: number;
        heapTotal: number;
        external: number;
    };
    retryCount: number;
    failureCount: number;
}

/**
 * Execution Hook Interface
 */
export interface SOPExecutionHook {
    name: string;
    phase: 'pre' | 'post' | 'error';
    priority: number;
    execute: (context: SOPExecutionContext, data: any) => Promise<void>;
}

/**
 * SOP Execution Engine
 */
export class SOPExecutionEngine {
    private hooks: Map<string, SOPExecutionHook[]> = new Map();
    private activeExecutions: Map<string, SOPExecutionResult> = new Map();
    private executionHistory: SOPExecutionResult[] = [];
    private validationFramework: SOPValidationFramework;
    private debugMode: boolean = false;

    constructor() {
        this.validationFramework = new SOPValidationFramework();
        this.initializeDefaultHooks();
    }

    /**
     * Initialize default execution hooks
     */
    private initializeDefaultHooks(): void {
        // Default audit trail hook
        this.registerHook({
            name: 'audit_trail',
            phase: 'pre',
            priority: 100,
            execute: async (context: SOPExecutionContext, data: any) => {
                context.auditTrail.push({
                    timestamp: new Date().toISOString(),
                    action: 'execution_started',
                    userId: context.executedBy,
                    details: {
                        sopId: context.sopMetadata.sopId,
                        executionId: context.executionId
                    }
                });
            }
        });

        // Default completion hook
        this.registerHook({
            name: 'completion_audit',
            phase: 'post',
            priority: 100,
            execute: async (context: SOPExecutionContext, result: any) => {
                context.auditTrail.push({
                    timestamp: new Date().toISOString(),
                    action: 'execution_completed',
                    userId: context.executedBy,
                    details: {
                        sopId: context.sopMetadata.sopId,
                        executionId: context.executionId,
                        success: true,
                        resultType: typeof result
                    }
                });
            }
        });

        // Default error handling hook
        this.registerHook({
            name: 'error_audit',
            phase: 'error',
            priority: 100,
            execute: async (context: SOPExecutionContext, error: Error) => {
                context.auditTrail.push({
                    timestamp: new Date().toISOString(),
                    action: 'execution_failed',
                    userId: context.executedBy,
                    details: {
                        sopId: context.sopMetadata.sopId,
                        executionId: context.executionId,
                        error: error.message,
                        stack: error.stack
                    }
                });
            }
        });
    }

    /**
     * Execute a SOP piece with full lifecycle management
     */
    public async execute(
        executeFn: (context: SOPExecutionContext) => Promise<any>,
        context: SOPExecutionContext,
        options: SOPExecutionOptions = {}
    ): Promise<SOPExecutionResult> {
        const executionId = context.executionId;
        const logs: SOPExecutionLog[] = [];
        const startTime = Date.now();
        const metrics: SOPExecutionMetrics = {
            startTime: new Date().toISOString(),
            endTime: '',
            totalDuration: 0,
            validationTime: 0,
            executionTime: 0,
            postProcessingTime: 0,
            retryCount: 0,
            failureCount: 0
        };

        // Create execution result
        const executionResult: SOPExecutionResult = {
            success: false,
            executionTime: 0,
            context,
            logs,
            metrics
        };

        // Register active execution
        this.activeExecutions.set(executionId, executionResult);

        try {
            this.log(logs, 'info', 'execution', 'Starting SOP execution', {
                sopId: context.sopMetadata.sopId,
                executionId
            });

            // Update execution state
            context.currentState = SOPExecutionState.IN_PROGRESS;

            // Phase 1: Validation
            if (!options.skipValidation) {
                const validationStart = Date.now();
                this.log(logs, 'debug', 'validation', 'Starting validation phase');
                
                const validationResult = await this.validateExecution(context);
                metrics.validationTime = Date.now() - validationStart;
                
                executionResult.validationResult = validationResult;
                
                if (!validationResult.isValid) {
                    throw new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
                }
                
                this.log(logs, 'info', 'validation', 'Validation completed successfully');
            }

            // Phase 2: Pre-execution hooks
            if (!options.skipPreHooks) {
                this.log(logs, 'debug', 'hooks', 'Executing pre-execution hooks');
                await this.executeHooks('pre', context, null);
            }

            // Phase 3: Main execution with retry logic
            const executionStart = Date.now();
            let lastError: Error | null = null;
            const maxRetries = options.retryAttempts || 0;
            
            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    if (attempt > 0) {
                        metrics.retryCount++;
                        const delay = options.retryDelay || 1000;
                        this.log(logs, 'warn', 'execution', `Retrying execution (attempt ${attempt + 1}/${maxRetries + 1}) after ${delay}ms delay`);
                        await this.sleep(delay);
                    }

                    this.log(logs, 'info', 'execution', `Executing SOP piece (attempt ${attempt + 1})`);
                    
                    // Execute with timeout if specified
                    const result = options.timeout 
                        ? await this.executeWithTimeout(executeFn, context, options.timeout)
                        : await executeFn(context);
                    
                    executionResult.result = result;
                    executionResult.success = true;
                    metrics.executionTime = Date.now() - executionStart;
                    
                    this.log(logs, 'info', 'execution', 'Execution completed successfully', {
                        resultType: typeof result,
                        attempt: attempt + 1
                    });
                    
                    break; // Success, exit retry loop
                    
                } catch (error) {
                    lastError = error as Error;
                    metrics.failureCount++;
                    
                    this.log(logs, 'error', 'execution', `Execution failed (attempt ${attempt + 1})`, {
                        error: error.message,
                        attempt: attempt + 1
                    });
                    
                    if (attempt === maxRetries) {
                        // Final attempt failed
                        throw lastError;
                    }
                }
            }

            // Phase 4: Post-execution hooks
            if (!options.skipPostHooks) {
                const postStart = Date.now();
                this.log(logs, 'debug', 'hooks', 'Executing post-execution hooks');
                await this.executeHooks('post', context, executionResult.result);
                metrics.postProcessingTime = Date.now() - postStart;
            }

            // Update execution state
            context.currentState = SOPExecutionState.COMPLETED;
            
        } catch (error) {
            const execError = error as Error;
            executionResult.error = execError;
            executionResult.success = false;
            context.currentState = SOPExecutionState.FAILED;
            
            this.log(logs, 'error', 'execution', 'SOP execution failed', {
                error: execError.message,
                sopId: context.sopMetadata.sopId
            });
            
            // Execute error hooks
            try {
                await this.executeHooks('error', context, execError);
            } catch (hookError) {
                this.log(logs, 'error', 'hooks', 'Error hook execution failed', {
                    hookError: hookError.message
                });
            }
        } finally {
            // Finalize metrics
            const endTime = Date.now();
            metrics.endTime = new Date().toISOString();
            metrics.totalDuration = endTime - startTime;
            executionResult.executionTime = metrics.totalDuration;
            
            // Add memory usage if available
            if (typeof process !== 'undefined' && process.memoryUsage) {
                metrics.memoryUsage = process.memoryUsage();
            }
            
            // Remove from active executions
            this.activeExecutions.delete(executionId);
            
            // Add to history
            this.executionHistory.push({ ...executionResult });
            
            // Limit history size
            if (this.executionHistory.length > 1000) {
                this.executionHistory = this.executionHistory.slice(-1000);
            }
            
            this.log(logs, 'info', 'execution', 'SOP execution completed', {
                success: executionResult.success,
                duration: metrics.totalDuration,
                sopId: context.sopMetadata.sopId
            });
        }

        return executionResult;
    }

    /**
     * Validate execution context
     */
    private async validateExecution(context: SOPExecutionContext): Promise<SOPValidationResult> {
        return await this.validationFramework.validateExecution(context);
    }

    /**
     * Execute function with timeout
     */
    private async executeWithTimeout<T>(
        fn: (context: SOPExecutionContext) => Promise<T>,
        context: SOPExecutionContext,
        timeout: number
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Execution timeout after ${timeout}ms`));
            }, timeout);
            
            fn(context)
                .then(resolve)
                .catch(reject)
                .finally(() => clearTimeout(timer));
        });
    }

    /**
     * Execute hooks for a specific phase
     */
    private async executeHooks(phase: 'pre' | 'post' | 'error', context: SOPExecutionContext, data: any): Promise<void> {
        const hooks = this.hooks.get(phase) || [];
        const sortedHooks = hooks.sort((a, b) => b.priority - a.priority);
        
        for (const hook of sortedHooks) {
            try {
                await hook.execute(context, data);
            } catch (error) {
                console.error(`Hook '${hook.name}' failed in ${phase} phase:`, error);
                // Continue with other hooks even if one fails
            }
        }
    }

    /**
     * Register execution hook
     */
    public registerHook(hook: SOPExecutionHook): void {
        if (!this.hooks.has(hook.phase)) {
            this.hooks.set(hook.phase, []);
        }
        this.hooks.get(hook.phase)!.push(hook);
    }

    /**
     * Unregister execution hook
     */
    public unregisterHook(phase: 'pre' | 'post' | 'error', name: string): boolean {
        const hooks = this.hooks.get(phase);
        if (hooks) {
            const index = hooks.findIndex(h => h.name === name);
            if (index !== -1) {
                hooks.splice(index, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * Get active executions
     */
    public getActiveExecutions(): Map<string, SOPExecutionResult> {
        return new Map(this.activeExecutions);
    }

    /**
     * Get execution history
     */
    public getExecutionHistory(limit?: number): SOPExecutionResult[] {
        const history = [...this.executionHistory].reverse();
        return limit ? history.slice(0, limit) : history;
    }

    /**
     * Get execution statistics
     */
    public getExecutionStatistics(): {
        totalExecutions: number;
        successfulExecutions: number;
        failedExecutions: number;
        averageExecutionTime: number;
        activeExecutions: number;
        totalRetries: number;
    } {
        const total = this.executionHistory.length;
        const successful = this.executionHistory.filter(e => e.success).length;
        const failed = total - successful;
        const avgTime = total > 0 
            ? this.executionHistory.reduce((sum, e) => sum + e.executionTime, 0) / total
            : 0;
        const totalRetries = this.executionHistory.reduce((sum, e) => sum + e.metrics.retryCount, 0);
        
        return {
            totalExecutions: total,
            successfulExecutions: successful,
            failedExecutions: failed,
            averageExecutionTime: Math.round(avgTime),
            activeExecutions: this.activeExecutions.size,
            totalRetries
        };
    }

    /**
     * Cancel active execution
     */
    public cancelExecution(executionId: string): boolean {
        const execution = this.activeExecutions.get(executionId);
        if (execution) {
            execution.context.currentState = SOPExecutionState.CANCELLED;
            execution.success = false;
            execution.error = new Error('Execution cancelled');
            this.activeExecutions.delete(executionId);
            return true;
        }
        return false;
    }

    /**
     * Set debug mode
     */
    public setDebugMode(enabled: boolean): void {
        this.debugMode = enabled;
    }

    /**
     * Clear execution history
     */
    public clearHistory(): void {
        this.executionHistory = [];
    }

    /**
     * Log execution event
     */
    private log(
        logs: SOPExecutionLog[],
        level: 'debug' | 'info' | 'warn' | 'error',
        category: string,
        message: string,
        data?: any,
        duration?: number
    ): void {
        const logEntry: SOPExecutionLog = {
            id: nanoid(),
            timestamp: new Date().toISOString(),
            level,
            message,
            category,
            data,
            duration
        };
        
        logs.push(logEntry);
        
        if (this.debugMode || level !== 'debug') {
            console.log(`[SOP-${level.toUpperCase()}] ${category}: ${message}`, data || '');
        }
    }

    /**
     * Sleep utility for retry delays
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
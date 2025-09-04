/**
 * Decision Engine Utilities - Helper functions for decision point evaluation
 * 
 * This module provides utility functions for evaluating conditions, processing
 * decision logic, and managing decision outcomes within SOP workflows.
 */

import {
    SOPCondition,
    SOPDecisionLogic,
    SOPDecisionOption,
    DecisionOperator,
    LogicOperator,
    ConditionEvaluationResult,
    DecisionContext,
    DecisionEvaluationMetrics
} from '../types/sop-decision-types';

/**
 * Decision Engine Utilities class
 */
export class DecisionEngineUtils {
    
    /**
     * Evaluate a single condition against context data
     */
    static async evaluateCondition(
        condition: SOPCondition,
        context: DecisionContext
    ): Promise<ConditionEvaluationResult> {
        const startTime = Date.now();
        
        try {
            const actualValue = this.extractValueFromContext(condition.field, context);
            const expectedValue = condition.value;
            
            const result = await this.applyOperator(
                condition.operator,
                actualValue,
                expectedValue,
                condition.customFunction
            );

            return {
                conditionId: condition.id,
                field: condition.field,
                operator: condition.operator,
                expectedValue,
                actualValue,
                result,
                evaluationTime: Date.now() - startTime,
                weight: condition.weight,
                metadata: condition.metadata
            };

        } catch (error) {
            return {
                conditionId: condition.id,
                field: condition.field,
                operator: condition.operator,
                expectedValue: condition.value,
                actualValue: undefined,
                result: false,
                evaluationTime: Date.now() - startTime,
                error: error.message,
                weight: condition.weight,
                metadata: condition.metadata
            };
        }
    }

    /**
     * Evaluate multiple conditions using logic operators
     */
    static evaluateConditionsWithLogic(
        conditionResults: ConditionEvaluationResult[],
        logicOperator: LogicOperator,
        customLogic?: string
    ): boolean {
        if (conditionResults.length === 0) {
            return false;
        }

        switch (logicOperator) {
            case LogicOperator.AND:
                return conditionResults.every(result => result.result);
            
            case LogicOperator.OR:
                return conditionResults.some(result => result.result);
            
            case LogicOperator.NOT:
                // NOT operator applies to the first condition
                return !conditionResults[0]?.result;
            
            case LogicOperator.XOR:
                // XOR - exactly one condition should be true
                const trueCount = conditionResults.filter(result => result.result).length;
                return trueCount === 1;
            
            case LogicOperator.CUSTOM:
                if (!customLogic) {
                    throw new Error('Custom logic is required for CUSTOM operator');
                }
                return this.evaluateCustomLogic(customLogic, conditionResults);
            
            default:
                throw new Error(`Unsupported logic operator: ${logicOperator}`);
        }
    }

    /**
     * Calculate weighted decision result
     */
    static calculateWeightedResult(conditionResults: ConditionEvaluationResult[]): {
        result: boolean;
        score: number;
        totalWeight: number;
    } {
        let totalWeight = 0;
        let weightedScore = 0;

        for (const conditionResult of conditionResults) {
            const weight = conditionResult.weight || 1;
            totalWeight += weight;
            
            if (conditionResult.result) {
                weightedScore += weight;
            }
        }

        const score = totalWeight > 0 ? (weightedScore / totalWeight) : 0;
        const result = score >= 0.5; // Majority threshold

        return {
            result,
            score: Math.round(score * 100), // Convert to percentage
            totalWeight
        };
    }

    /**
     * Find best matching decision option
     */
    static findBestMatchingOption(
        options: SOPDecisionOption[],
        conditionResults: ConditionEvaluationResult[],
        context: DecisionContext
    ): SOPDecisionOption | null {
        const scoredOptions: Array<{
            option: SOPDecisionOption;
            score: number;
            matchedConditions: number;
        }> = [];

        for (const option of options) {
            if (!option.conditions || option.conditions.length === 0) {
                // Default option without conditions
                scoredOptions.push({
                    option,
                    score: 0, // Lowest score for default options
                    matchedConditions: 0
                });
                continue;
            }

            let matchedConditions = 0;
            let totalScore = 0;

            for (const optionCondition of option.conditions) {
                const conditionResult = conditionResults.find(
                    result => result.conditionId === optionCondition.id
                );

                if (conditionResult && conditionResult.result) {
                    matchedConditions++;
                    totalScore += conditionResult.weight || 1;
                }
            }

            const score = option.conditions.length > 0 
                ? (matchedConditions / option.conditions.length) * 100 * totalScore
                : 0;

            scoredOptions.push({
                option,
                score,
                matchedConditions
            });
        }

        // Sort by score (descending) and then by priority (descending)
        scoredOptions.sort((a, b) => {
            if (a.score !== b.score) {
                return b.score - a.score;
            }
            return b.option.priority - a.option.priority;
        });

        // Return the highest scoring option, or null if no options match
        const bestOption = scoredOptions[0];
        return bestOption && (bestOption.matchedConditions > 0 || bestOption.score === 0) 
            ? bestOption.option 
            : null;
    }

    /**
     * Generate decision metrics
     */
    static generateDecisionMetrics(
        conditionResults: ConditionEvaluationResult[],
        evaluationStartTime: number,
        customLogicExecuted: boolean = false
    ): DecisionEvaluationMetrics {
        const conditionsPassed = conditionResults.filter(r => r.result).length;
        const conditionsFailed = conditionResults.length - conditionsPassed;

        return {
            evaluationTime: Date.now() - evaluationStartTime,
            conditionsEvaluated: conditionResults.length,
            conditionsPassed,
            conditionsFailed,
            customLogicExecuted,
            retryCount: 0 // This would be tracked during execution
        };
    }

    /**
     * Validate decision configuration
     */
    static validateDecisionConfiguration(decisionLogic: SOPDecisionLogic): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validate conditions
        if (!decisionLogic.conditions || decisionLogic.conditions.length === 0) {
            errors.push('At least one condition is required');
        } else {
            for (const condition of decisionLogic.conditions) {
                if (!condition.field) {
                    errors.push(`Condition ${condition.id}: field is required`);
                }
                
                if (!condition.operator) {
                    errors.push(`Condition ${condition.id}: operator is required`);
                }
                
                if (condition.value === undefined || condition.value === null) {
                    warnings.push(`Condition ${condition.id}: value is null or undefined`);
                }
                
                if (condition.operator === DecisionOperator.CUSTOM && !condition.customFunction) {
                    errors.push(`Condition ${condition.id}: custom function is required for CUSTOM operator`);
                }
            }
        }

        // Validate logic operator
        if (decisionLogic.operatorLogic === LogicOperator.CUSTOM && !decisionLogic.customLogic) {
            errors.push('Custom logic is required for CUSTOM operator');
        }

        // Validate timeout
        if (decisionLogic.timeoutMinutes !== undefined && decisionLogic.timeoutMinutes <= 0) {
            errors.push('Timeout must be greater than 0');
        }

        // Validate retry attempts
        if (decisionLogic.retryAttempts !== undefined && decisionLogic.retryAttempts < 0) {
            errors.push('Retry attempts cannot be negative');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Extract value from decision context using field path
     */
    private static extractValueFromContext(fieldPath: string, context: DecisionContext): any {
        const parts = fieldPath.split('.');
        let value: any = context;

        for (const part of parts) {
            if (value === null || value === undefined) {
                return undefined;
            }
            
            // Handle special context paths
            if (part === 'input') {
                value = context.inputData;
            } else if (part === 'variables') {
                value = context.variables;
            } else if (part === 'workflow') {
                value = context.workflowState;
            } else if (part === 'metadata') {
                value = context.metadata;
            } else {
                value = value[part];
            }
        }

        return value;
    }

    /**
     * Apply operator to compare actual and expected values
     */
    private static async applyOperator(
        operator: DecisionOperator,
        actualValue: any,
        expectedValue: any,
        customFunction?: string
    ): Promise<boolean> {
        switch (operator) {
            case DecisionOperator.EQUALS:
                return this.strictEquals(actualValue, expectedValue);
            
            case DecisionOperator.NOT_EQUALS:
                return !this.strictEquals(actualValue, expectedValue);
            
            case DecisionOperator.GREATER_THAN:
                return Number(actualValue) > Number(expectedValue);
            
            case DecisionOperator.LESS_THAN:
                return Number(actualValue) < Number(expectedValue);
            
            case DecisionOperator.GREATER_EQUAL:
                return Number(actualValue) >= Number(expectedValue);
            
            case DecisionOperator.LESS_EQUAL:
                return Number(actualValue) <= Number(expectedValue);
            
            case DecisionOperator.CONTAINS:
                return String(actualValue).toLowerCase().includes(String(expectedValue).toLowerCase());
            
            case DecisionOperator.NOT_CONTAINS:
                return !String(actualValue).toLowerCase().includes(String(expectedValue).toLowerCase());
            
            case DecisionOperator.STARTS_WITH:
                return String(actualValue).toLowerCase().startsWith(String(expectedValue).toLowerCase());
            
            case DecisionOperator.ENDS_WITH:
                return String(actualValue).toLowerCase().endsWith(String(expectedValue).toLowerCase());
            
            case DecisionOperator.REGEX:
                return new RegExp(String(expectedValue)).test(String(actualValue));
            
            case DecisionOperator.EXISTS:
                return actualValue !== undefined && actualValue !== null;
            
            case DecisionOperator.NOT_EXISTS:
                return actualValue === undefined || actualValue === null;
            
            case DecisionOperator.IN_LIST:
                return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
            
            case DecisionOperator.NOT_IN_LIST:
                return !Array.isArray(expectedValue) || !expectedValue.includes(actualValue);
            
            case DecisionOperator.CUSTOM:
                if (!customFunction) {
                    throw new Error('Custom function is required for CUSTOM operator');
                }
                return this.evaluateCustomFunction(customFunction, actualValue, expectedValue);
            
            default:
                throw new Error(`Unsupported operator: ${operator}`);
        }
    }

    /**
     * Strict equality comparison with type checking
     */
    private static strictEquals(value1: any, value2: any): boolean {
        if (value1 === value2) {
            return true;
        }

        // Handle number comparison with string numbers
        if (typeof value1 === 'string' && typeof value2 === 'number') {
            return Number(value1) === value2;
        }
        if (typeof value1 === 'number' && typeof value2 === 'string') {
            return value1 === Number(value2);
        }

        // Handle array comparison
        if (Array.isArray(value1) && Array.isArray(value2)) {
            if (value1.length !== value2.length) {
                return false;
            }
            return value1.every((item, index) => this.strictEquals(item, value2[index]));
        }

        // Handle object comparison
        if (typeof value1 === 'object' && typeof value2 === 'object' && value1 !== null && value2 !== null) {
            const keys1 = Object.keys(value1);
            const keys2 = Object.keys(value2);
            
            if (keys1.length !== keys2.length) {
                return false;
            }
            
            return keys1.every(key => this.strictEquals(value1[key], value2[key]));
        }

        return false;
    }

    /**
     * Evaluate custom logic function safely
     */
    private static evaluateCustomLogic(
        customLogic: string,
        conditionResults: ConditionEvaluationResult[]
    ): boolean {
        try {
            // Create a safe evaluation context
            const evalContext = {
                conditions: conditionResults.reduce((acc, result) => {
                    acc[result.conditionId] = result.result;
                    return acc;
                }, {} as Record<string, boolean>),
                results: conditionResults,
                // Helper functions
                all: (ids: string[]) => ids.every(id => evalContext.conditions[id] === true),
                any: (ids: string[]) => ids.some(id => evalContext.conditions[id] === true),
                count: (value: boolean) => conditionResults.filter(r => r.result === value).length,
                weight: (ids: string[]) => {
                    return conditionResults
                        .filter(r => ids.includes(r.conditionId) && r.result)
                        .reduce((sum, r) => sum + (r.weight || 1), 0);
                }
            };

            // Evaluate the custom logic in a restricted context
            const result = new Function('ctx', `
                with(ctx) {
                    return ${customLogic};
                }
            `)(evalContext);

            return Boolean(result);

        } catch (error) {
            throw new Error(`Custom logic evaluation failed: ${error.message}`);
        }
    }

    /**
     * Evaluate custom function safely
     */
    private static evaluateCustomFunction(
        customFunction: string,
        actualValue: any,
        expectedValue: any
    ): boolean {
        try {
            // Create safe evaluation context
            const evalContext = {
                actual: actualValue,
                expected: expectedValue,
                // Helper functions
                isNumber: (val: any) => typeof val === 'number' && !isNaN(val),
                isString: (val: any) => typeof val === 'string',
                isArray: (val: any) => Array.isArray(val),
                isObject: (val: any) => typeof val === 'object' && val !== null && !Array.isArray(val),
                isEmpty: (val: any) => {
                    if (val === null || val === undefined) return true;
                    if (typeof val === 'string' || Array.isArray(val)) return val.length === 0;
                    if (typeof val === 'object') return Object.keys(val).length === 0;
                    return false;
                },
                toNumber: (val: any) => Number(val),
                toString: (val: any) => String(val),
                Math: Math,
                Date: Date,
                JSON: JSON
            };

            const result = new Function('ctx', `
                with(ctx) {
                    return ${customFunction};
                }
            `)(evalContext);

            return Boolean(result);

        } catch (error) {
            throw new Error(`Custom function evaluation failed: ${error.message}`);
        }
    }

    /**
     * Generate decision path description for audit trail
     */
    static generateDecisionPath(
        conditionResults: ConditionEvaluationResult[],
        selectedOption?: SOPDecisionOption,
        logicOperator?: LogicOperator
    ): string[] {
        const path: string[] = [];

        // Add condition evaluations
        for (const result of conditionResults) {
            const status = result.result ? 'PASS' : 'FAIL';
            const weight = result.weight ? ` (weight: ${result.weight})` : '';
            path.push(`${result.field} ${result.operator} "${result.expectedValue}" => ${status}${weight}`);
        }

        // Add logic operation
        if (logicOperator && conditionResults.length > 1) {
            const passCount = conditionResults.filter(r => r.result).length;
            path.push(`Logic: ${logicOperator} => ${passCount}/${conditionResults.length} conditions passed`);
        }

        // Add selected option
        if (selectedOption) {
            path.push(`Selected: "${selectedOption.name}" (priority: ${selectedOption.priority})`);
        } else {
            path.push('No matching option found');
        }

        return path;
    }

    /**
     * Calculate confidence score for decision
     */
    static calculateConfidenceScore(
        conditionResults: ConditionEvaluationResult[],
        selectedOption?: SOPDecisionOption
    ): number {
        if (conditionResults.length === 0) {
            return 0;
        }

        const totalWeight = conditionResults.reduce((sum, result) => sum + (result.weight || 1), 0);
        const passedWeight = conditionResults
            .filter(result => result.result)
            .reduce((sum, result) => sum + (result.weight || 1), 0);

        let baseScore = totalWeight > 0 ? (passedWeight / totalWeight) * 100 : 0;

        // Adjust score based on errors
        const errorCount = conditionResults.filter(r => r.error).length;
        const errorPenalty = (errorCount / conditionResults.length) * 20;
        baseScore -= errorPenalty;

        // Boost score if a specific option was selected (vs default)
        if (selectedOption && selectedOption.conditions && selectedOption.conditions.length > 0) {
            baseScore += 10; // Bonus for specific match
        }

        return Math.max(0, Math.min(100, Math.round(baseScore)));
    }

    /**
     * Format decision reason for human readability
     */
    static formatDecisionReason(
        conditionResults: ConditionEvaluationResult[],
        selectedOption?: SOPDecisionOption,
        logicOperator?: LogicOperator
    ): string {
        if (conditionResults.length === 0) {
            return 'No conditions evaluated';
        }

        const passedCount = conditionResults.filter(r => r.result).length;
        const totalCount = conditionResults.length;
        const errorCount = conditionResults.filter(r => r.error).length;

        let reason = `Evaluated ${totalCount} condition(s): ${passedCount} passed`;
        
        if (totalCount - passedCount > 0) {
            reason += `, ${totalCount - passedCount} failed`;
        }
        
        if (errorCount > 0) {
            reason += `, ${errorCount} error(s)`;
        }

        if (logicOperator && totalCount > 1) {
            reason += `. Logic: ${logicOperator}`;
        }

        if (selectedOption) {
            reason += `. Selected: "${selectedOption.name}"`;
        } else {
            reason += '. No matching option found';
        }

        return reason;
    }
}

// Export utility functions as standalone functions for convenience
export const evaluateCondition = DecisionEngineUtils.evaluateCondition.bind(DecisionEngineUtils);
export const evaluateConditionsWithLogic = DecisionEngineUtils.evaluateConditionsWithLogic.bind(DecisionEngineUtils);
export const findBestMatchingOption = DecisionEngineUtils.findBestMatchingOption.bind(DecisionEngineUtils);
export const validateDecisionConfiguration = DecisionEngineUtils.validateDecisionConfiguration.bind(DecisionEngineUtils);
export const generateDecisionMetrics = DecisionEngineUtils.generateDecisionMetrics.bind(DecisionEngineUtils);
export const calculateWeightedResult = DecisionEngineUtils.calculateWeightedResult.bind(DecisionEngineUtils);
export const generateDecisionPath = DecisionEngineUtils.generateDecisionPath.bind(DecisionEngineUtils);
export const calculateConfidenceScore = DecisionEngineUtils.calculateConfidenceScore.bind(DecisionEngineUtils);
export const formatDecisionReason = DecisionEngineUtils.formatDecisionReason.bind(DecisionEngineUtils);
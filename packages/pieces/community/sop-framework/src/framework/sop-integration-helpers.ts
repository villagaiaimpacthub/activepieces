/**
 * SOP Integration Helpers - Utility functions for integrating with Activepieces core system
 * 
 * This class provides helper functions and utilities for seamless integration between
 * SOP pieces and the Activepieces platform, including property handling, connection management,
 * and data transformation.
 */

import { createAction, createTrigger, Property, PieceAuth } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import {
    SOPPieceType,
    SOPPieceCategory,
    SOPMetadata,
    SOPExecutionContext,
    SOPPriority,
    SOPExecutionState,
    SOPComplianceStatus,
    SOPIntegrationPoint
} from '../types/sop-types';
import { BaseSoPiece } from './base-sop-piece';

/**
 * Property Builder Configuration
 */
export interface SOPPropertyConfig {
    displayName: string;
    description: string;
    required?: boolean;
    defaultValue?: any;
    placeholder?: string;
    validators?: SOPPropertyValidator[];
    dependencies?: string[];
    conditionalDisplay?: {
        field: string;
        value: any;
    };
}

/**
 * Property Validator Interface
 */
export interface SOPPropertyValidator {
    type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
    value?: any;
    message?: string;
    validate?: (value: any) => boolean;
}

/**
 * Connection Configuration
 */
export interface SOPConnectionConfig {
    displayName: string;
    description: string;
    type: 'oauth2' | 'apiKey' | 'basic' | 'custom';
    authUrl?: string;
    tokenUrl?: string;
    scope?: string[];
    required?: boolean;
    testConnection?: (auth: any) => Promise<boolean>;
}

/**
 * Data Transformation Configuration
 */
export interface SOPDataTransform {
    source: string;
    target: string;
    transform?: (value: any) => any;
    defaultValue?: any;
    required?: boolean;
}

/**
 * SOP Integration Helpers
 */
export class SOPIntegrationHelpers {
    private static instance: SOPIntegrationHelpers;
    private propertyCache: Map<string, any> = new Map();
    private connectionCache: Map<string, any> = new Map();
    private transformationCache: Map<string, SOPDataTransform[]> = new Map();

    constructor() {}

    /**
     * Get singleton instance
     */
    public static getInstance(): SOPIntegrationHelpers {
        if (!SOPIntegrationHelpers.instance) {
            SOPIntegrationHelpers.instance = new SOPIntegrationHelpers();
        }
        return SOPIntegrationHelpers.instance;
    }

    /**
     * Create SOP-specific Activepieces action
     */
    public createSOPAction(piece: BaseSoPiece, config: {
        name: string;
        displayName: string;
        description: string;
        props: Record<string, any>;
        run: (context: any) => Promise<any>;
        auth?: PieceAuth;
        sampleData?: any;
    }) {
        const sopProps = piece['getCommonSOPProperties']();
        const specificProps = piece['getSOPSpecificProperties']();
        
        return createAction({
            auth: config.auth,
            name: config.name,
            displayName: config.displayName,
            description: config.description,
            props: {
                ...sopProps,
                ...specificProps,
                ...config.props
            },
            run: async (context) => {
                try {
                    // Create execution context
                    const executionContext = piece['createExecutionContext'](
                        context.propsValue,
                        context.auth?.userId || 'unknown'
                    );

                    // Execute pre-run hooks
                    await piece['executePreRunHooks'](executionContext, context.propsValue);

                    // Execute main logic
                    const result = await config.run({
                        ...context,
                        sopContext: executionContext,
                        sopHelpers: this
                    });

                    // Execute post-run hooks
                    await piece['executePostRunHooks'](executionContext, result);

                    return {
                        success: true,
                        result,
                        sopMetadata: {
                            executionId: executionContext.executionId,
                            sopId: executionContext.sopMetadata.sopId,
                            state: executionContext.currentState,
                            completedAt: executionContext.completedAt
                        }
                    };
                } catch (error) {
                    console.error('SOP Action execution failed:', error);
                    throw error;
                }
            },
            sampleData: config.sampleData
        });
    }

    /**
     * Create SOP-specific Activepieces trigger
     */
    public createSOPTrigger(piece: BaseSoPiece, config: {
        name: string;
        displayName: string;
        description: string;
        props: Record<string, any>;
        type: 'WEBHOOK' | 'POLLING';
        onEnable?: (context: any) => Promise<void>;
        onDisable?: (context: any) => Promise<void>;
        run: (context: any) => Promise<any[]>;
        auth?: PieceAuth;
        sampleData?: any;
    }) {
        const sopProps = piece['getCommonSOPProperties']();
        
        return createTrigger({
            auth: config.auth,
            name: config.name,
            displayName: config.displayName,
            description: config.description,
            props: {
                ...sopProps,
                ...config.props
            },
            type: config.type as any,
            onEnable: config.onEnable,
            onDisable: config.onDisable,
            run: async (context) => {
                try {
                    const events = await config.run({
                        ...context,
                        sopHelpers: this
                    });

                    // Enrich events with SOP metadata
                    return events.map(event => ({
                        ...event,
                        sopMetadata: {
                            sopId: piece['metadata'].sopId,
                            pieceType: piece['metadata'].pieceType,
                            timestamp: new Date().toISOString()
                        }
                    }));
                } catch (error) {
                    console.error('SOP Trigger execution failed:', error);
                    return [];
                }
            },
            sampleData: config.sampleData
        });
    }

    /**
     * Create enhanced property with SOP-specific features
     */
    public createSOPProperty(type: string, config: SOPPropertyConfig): any {
        const cacheKey = `${type}_${JSON.stringify(config)}`;
        
        if (this.propertyCache.has(cacheKey)) {
            return this.propertyCache.get(cacheKey);
        }

        let property: any;

        switch (type) {
            case 'shortText':
                property = Property.ShortText({
                    displayName: config.displayName,
                    description: config.description,
                    required: config.required || false,
                    defaultValue: config.defaultValue,
                    placeholder: config.placeholder
                });
                break;

            case 'longText':
                property = Property.LongText({
                    displayName: config.displayName,
                    description: config.description,
                    required: config.required || false,
                    defaultValue: config.defaultValue,
                    placeholder: config.placeholder
                });
                break;

            case 'number':
                property = Property.Number({
                    displayName: config.displayName,
                    description: config.description,
                    required: config.required || false,
                    defaultValue: config.defaultValue
                });
                break;

            case 'checkbox':
                property = Property.Checkbox({
                    displayName: config.displayName,
                    description: config.description,
                    required: config.required || false,
                    defaultValue: config.defaultValue || false
                });
                break;

            case 'dropdown':
                property = Property.StaticDropdown({
                    displayName: config.displayName,
                    description: config.description,
                    required: config.required || false,
                    defaultValue: config.defaultValue,
                    options: {
                        options: config.defaultValue || []
                    }
                });
                break;

            case 'multiSelect':
                property = Property.StaticMultiSelectDropdown({
                    displayName: config.displayName,
                    description: config.description,
                    required: config.required || false,
                    defaultValue: config.defaultValue,
                    options: {
                        options: config.defaultValue || []
                    }
                });
                break;

            case 'dateTime':
                property = Property.DateTime({
                    displayName: config.displayName,
                    description: config.description,
                    required: config.required || false,
                    defaultValue: config.defaultValue
                });
                break;

            case 'json':
                property = Property.Json({
                    displayName: config.displayName,
                    description: config.description,
                    required: config.required || false,
                    defaultValue: config.defaultValue
                });
                break;

            case 'array':
                property = Property.Array({
                    displayName: config.displayName,
                    description: config.description,
                    required: config.required || false
                });
                break;

            default:
                property = Property.ShortText({
                    displayName: config.displayName,
                    description: config.description,
                    required: config.required || false
                });
        }

        this.propertyCache.set(cacheKey, property);
        return property;
    }

    /**
     * Create SOP-specific authentication
     */
    public createSOPAuth(config: SOPConnectionConfig): PieceAuth {
        const cacheKey = JSON.stringify(config);
        
        if (this.connectionCache.has(cacheKey)) {
            return this.connectionCache.get(cacheKey);
        }

        let auth: PieceAuth;

        switch (config.type) {
            case 'oauth2':
                auth = PieceAuth.OAuth2({
                    displayName: config.displayName,
                    description: config.description,
                    authUrl: config.authUrl!,
                    tokenUrl: config.tokenUrl!,
                    required: config.required !== false,
                    scope: config.scope || []
                });
                break;

            case 'apiKey':
                auth = PieceAuth.SecretText({
                    displayName: config.displayName,
                    description: config.description,
                    required: config.required !== false
                });
                break;

            case 'basic':
                auth = PieceAuth.BasicAuth({
                    displayName: config.displayName,
                    description: config.description,
                    required: config.required !== false
                });
                break;

            case 'custom':
                auth = PieceAuth.CustomAuth({
                    displayName: config.displayName,
                    description: config.description,
                    required: config.required !== false,
                    props: {}
                });
                break;

            default:
                auth = PieceAuth.None();
        }

        this.connectionCache.set(cacheKey, auth);
        return auth;
    }

    /**
     * Transform data between SOP format and external system format
     */
    public transformData(data: any, transformations: SOPDataTransform[], direction: 'input' | 'output' = 'input'): any {
        if (!data || !transformations.length) {
            return data;
        }

        const result: any = {};

        transformations.forEach(transform => {
            const sourceField = direction === 'input' ? transform.source : transform.target;
            const targetField = direction === 'input' ? transform.target : transform.source;
            
            let value = this.getNestedValue(data, sourceField);
            
            // Apply default value if source value is missing
            if ((value === undefined || value === null) && transform.defaultValue !== undefined) {
                value = transform.defaultValue;
            }
            
            // Apply transformation function if provided
            if (value !== undefined && transform.transform) {
                try {
                    value = transform.transform(value);
                } catch (error) {
                    console.error(`Transformation error for field ${sourceField}:`, error);
                    if (transform.required) {
                        throw new Error(`Required transformation failed for field ${sourceField}`);
                    }
                }
            }
            
            // Set value in result if it exists or is required
            if (value !== undefined || transform.required) {
                this.setNestedValue(result, targetField, value);
            }
        });

        return result;
    }

    /**
     * Validate property values against SOP-specific rules
     */
    public validatePropertyValue(value: any, validators: SOPPropertyValidator[]): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        for (const validator of validators) {
            let isValid = true;
            let message = validator.message || 'Validation failed';

            switch (validator.type) {
                case 'required':
                    isValid = value !== undefined && value !== null && value !== '';
                    message = validator.message || 'This field is required';
                    break;

                case 'minLength':
                    if (typeof value === 'string' && value.length < validator.value) {
                        isValid = false;
                        message = validator.message || `Minimum length is ${validator.value}`;
                    }
                    break;

                case 'maxLength':
                    if (typeof value === 'string' && value.length > validator.value) {
                        isValid = false;
                        message = validator.message || `Maximum length is ${validator.value}`;
                    }
                    break;

                case 'pattern':
                    if (typeof value === 'string' && !new RegExp(validator.value).test(value)) {
                        isValid = false;
                        message = validator.message || 'Value does not match required pattern';
                    }
                    break;

                case 'custom':
                    if (validator.validate && !validator.validate(value)) {
                        isValid = false;
                    }
                    break;
            }

            if (!isValid) {
                errors.push(message);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Create integration point mapping
     */
    public createIntegrationMapping(points: SOPIntegrationPoint[]): Record<string, any> {
        const mapping: Record<string, any> = {};

        points.forEach(point => {
            mapping[point.name] = {
                type: point.type,
                description: point.description,
                required: point.required,
                schema: point.dataSchema,
                validationRules: point.validationRules || []
            };
        });

        return mapping;
    }

    /**
     * Format SOP metadata for display
     */
    public formatSOPMetadata(metadata: SOPMetadata): {
        displayInfo: Record<string, any>;
        statusInfo: Record<string, any>;
        auditInfo: Record<string, any>;
    } {
        return {
            displayInfo: {
                title: metadata.title,
                description: metadata.description,
                version: metadata.version,
                category: this.formatCategory(metadata.category),
                pieceType: this.formatPieceType(metadata.pieceType),
                priority: this.formatPriority(metadata.priority),
                department: metadata.department,
                tags: metadata.tags.join(', ')
            },
            statusInfo: {
                complianceRequired: metadata.complianceRequired ? 'Yes' : 'No',
                auditTrailRequired: metadata.auditTrailRequired ? 'Yes' : 'No',
                approversRequired: metadata.approvers && metadata.approvers.length > 0 ? 'Yes' : 'No',
                approverCount: metadata.approvers?.length || 0
            },
            auditInfo: {
                createdAt: this.formatDate(metadata.createdAt),
                updatedAt: this.formatDate(metadata.updatedAt),
                createdBy: metadata.createdBy
            }
        };
    }

    /**
     * Format category for display
     */
    private formatCategory(category: SOPPieceCategory): string {
        return category.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }

    /**
     * Format piece type for display
     */
    private formatPieceType(type: SOPPieceType): string {
        return type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }

    /**
     * Format priority for display
     */
    private formatPriority(priority: SOPPriority): string {
        const priorityColors = {
            [SOPPriority.LOW]: '🟢 Low',
            [SOPPriority.NORMAL]: '🔵 Normal',
            [SOPPriority.HIGH]: '🟡 High',
            [SOPPriority.URGENT]: '🟠 Urgent',
            [SOPPriority.CRITICAL]: '🔴 Critical'
        };
        return priorityColors[priority] || priority;
    }

    /**
     * Format date for display
     */
    private formatDate(dateString: string): string {
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return dateString;
        }
    }

    /**
     * Get nested value from object
     */
    private getNestedValue(obj: any, path: string): any {
        if (!obj || !path) return undefined;
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Set nested value in object
     */
    private setNestedValue(obj: any, path: string, value: any): void {
        if (!obj || !path) return;
        
        const keys = path.split('.');
        const lastKey = keys.pop()!;
        
        const target = keys.reduce((current, key) => {
            if (current[key] === undefined) {
                current[key] = {};
            }
            return current[key];
        }, obj);
        
        target[lastKey] = value;
    }

    /**
     * Clear caches
     */
    public clearCaches(): void {
        this.propertyCache.clear();
        this.connectionCache.clear();
        this.transformationCache.clear();
    }
}
/**
 * Notification Validator
 * 
 * Comprehensive validation system for notification configurations, templates,
 * recipients, compliance requirements, and delivery settings within SOP workflows.
 */

import {
    NotificationChannel,
    NotificationPriority,
    NotificationConfiguration,
    NotificationTemplate,
    NotificationRecipient,
    TemplateVariable,
    ComplianceFramework,
    NotificationError,
    NotificationErrorType,
    NotificationProcessingContext,
    EscalationRule
} from '../common/notification-types';
import { SOPComplianceStatus } from '../../../../types/sop-types';

/**
 * Validation Context for Notifications
 */
export interface NotificationValidationContext {
    configId: string;
    configVersion: string;
    userId: string;
    timestamp: string;
    allVariables: Record<string, any>;
    complianceFrameworks?: ComplianceFramework[];
    validationMode: 'strict' | 'lenient' | 'compliance-only';
    channelSettings: Record<string, any>;
}

/**
 * Validation Result for Notifications
 */
export interface NotificationValidationResult {
    isValid: boolean;
    errors: NotificationError[];
    warnings: NotificationError[];
    complianceChecks: Array<{
        framework: ComplianceFramework;
        status: SOPComplianceStatus;
        details?: string;
    }>;
    templateValidation?: {
        variablesResolved: number;
        missingVariables: string[];
        invalidSyntax: string[];
    };
    recipientValidation?: {
        validRecipients: number;
        invalidRecipients: number;
        consentIssues: number;
        optOutIssues: number;
    };
    deliveryValidation?: {
        supportedChannels: NotificationChannel[];
        unsupportedChannels: NotificationChannel[];
        configurationIssues: string[];
    };
}

/**
 * Main Notification Validator Class
 */
export class NotificationValidator {
    private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    private readonly phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    private readonly urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/;
    private readonly variableRegex = /\{\{([^}]+)\}\}/g;
    
    /**
     * Validate complete notification configuration
     */
    async validateNotification(
        config: NotificationConfiguration,
        context: NotificationValidationContext
    ): Promise<NotificationValidationResult> {
        const result: NotificationValidationResult = {
            isValid: true,
            errors: [],
            warnings: [],
            complianceChecks: []
        };

        try {
            // Validate basic configuration
            await this.validateBasicConfiguration(config, result);
            
            // Validate template
            const templateValidation = await this.validateTemplate(config.template, context);
            result.templateValidation = templateValidation;
            
            // Validate recipients
            const recipientValidation = await this.validateRecipients(config.recipients, context);
            result.recipientValidation = recipientValidation;
            
            // Validate delivery settings
            const deliveryValidation = await this.validateDeliverySettings(config, context);
            result.deliveryValidation = deliveryValidation;
            
            // Validate compliance requirements
            if (context.complianceFrameworks && context.complianceFrameworks.length > 0) {
                await this.validateCompliance(config, context, result);
            }
            
            // Validate escalation rules
            if (config.escalation && config.escalation.length > 0) {
                await this.validateEscalationRules(config.escalation, result);
            }
            
            // Set overall validation status
            result.isValid = result.errors.length === 0;
            
        } catch (error: any) {
            result.errors.push({
                type: NotificationErrorType.VALIDATION_ERROR,
                code: 'VALIDATOR_EXCEPTION',
                message: `Validation failed: ${error.message}`,
                retryable: false,
                timestamp: new Date().toISOString()
            });
            result.isValid = false;
        }

        return result;
    }
    
    /**
     * Validate basic notification configuration
     */
    private async validateBasicConfiguration(
        config: NotificationConfiguration,
        result: NotificationValidationResult
    ): Promise<void> {
        // Validate required fields
        if (!config.id) {
            result.errors.push(this.createValidationError(
                NotificationErrorType.CONFIGURATION_ERROR,
                'MISSING_ID',
                'Notification configuration ID is required',
                'id'
            ));
        }
        
        if (!config.name) {
            result.errors.push(this.createValidationError(
                NotificationErrorType.CONFIGURATION_ERROR,
                'MISSING_NAME',
                'Notification configuration name is required',
                'name'
            ));
        }
        
        if (!config.channels || config.channels.length === 0) {
            result.errors.push(this.createValidationError(
                NotificationErrorType.CONFIGURATION_ERROR,
                'NO_CHANNELS',
                'At least one notification channel must be configured',
                'channels'
            ));
        }
        
        if (!config.template) {
            result.errors.push(this.createValidationError(
                NotificationErrorType.CONFIGURATION_ERROR,
                'MISSING_TEMPLATE',
                'Notification template is required',
                'template'
            ));
        }
        
        if (!config.recipients || config.recipients.length === 0) {
            result.errors.push(this.createValidationError(
                NotificationErrorType.CONFIGURATION_ERROR,
                'NO_RECIPIENTS',
                'At least one recipient must be configured',
                'recipients'
            ));
        }
        
        // Validate channel consistency
        if (config.template && config.channels) {
            const templateChannel = config.template.channel;
            if (!config.channels.includes(templateChannel)) {
                result.errors.push(this.createValidationError(
                    NotificationErrorType.CONFIGURATION_ERROR,
                    'CHANNEL_MISMATCH',
                    `Template channel ${templateChannel} not included in notification channels`,
                    'channels'
                ));
            }
        }
        
        // Validate retry configuration
        if (config.retryConfig) {
            if (config.retryConfig.maxAttempts < 0 || config.retryConfig.maxAttempts > 10) {
                result.errors.push(this.createValidationError(
                    NotificationErrorType.CONFIGURATION_ERROR,
                    'INVALID_RETRY_ATTEMPTS',
                    'Retry attempts must be between 0 and 10',
                    'retryConfig.maxAttempts'
                ));
            }
            
            if (config.retryConfig.retryDelay < 0) {
                result.errors.push(this.createValidationError(
                    NotificationErrorType.CONFIGURATION_ERROR,
                    'INVALID_RETRY_DELAY',
                    'Retry delay must be non-negative',
                    'retryConfig.retryDelay'
                ));
            }
        }
    }
    
    /**
     * Validate notification template
     */
    private async validateTemplate(
        template: NotificationTemplate,
        context: NotificationValidationContext
    ): Promise<NotificationValidationResult['templateValidation']> {
        const validation = {
            variablesResolved: 0,
            missingVariables: [] as string[],
            invalidSyntax: [] as string[]
        };
        
        // Extract variables from template content
        const contentVariables = this.extractVariables(template.content);
        const htmlVariables = template.htmlContent ? this.extractVariables(template.htmlContent) : [];
        const subjectVariables = template.subject ? this.extractVariables(template.subject) : [];
        
        const allTemplateVariables = new Set([
            ...contentVariables,
            ...htmlVariables,
            ...subjectVariables
        ]);
        
        // Check if all variables are defined
        for (const variable of allTemplateVariables) {
            const isDefined = template.variables.some(v => v.name === variable) || 
                             context.allVariables.hasOwnProperty(variable);
            
            if (isDefined) {
                validation.variablesResolved++;
            } else {
                validation.missingVariables.push(variable);
            }
        }
        
        // Validate template syntax
        try {
            this.validateTemplateSyntax(template.content);
            if (template.htmlContent) {
                this.validateTemplateSyntax(template.htmlContent);
            }
            if (template.subject) {
                this.validateTemplateSyntax(template.subject);
            }
        } catch (error: any) {
            validation.invalidSyntax.push(error.message);
        }
        
        // Validate template variables
        for (const variable of template.variables) {
            if (!variable.name) {
                validation.invalidSyntax.push('Variable name is required');
            }
            
            if (variable.required && variable.value === undefined && !context.allVariables.hasOwnProperty(variable.name)) {
                validation.missingVariables.push(variable.name);
            }
        }
        
        return validation;
    }
    
    /**
     * Validate notification recipients
     */
    private async validateRecipients(
        recipients: NotificationRecipient[],
        context: NotificationValidationContext
    ): Promise<NotificationValidationResult['recipientValidation']> {
        const validation = {
            validRecipients: 0,
            invalidRecipients: 0,
            consentIssues: 0,
            optOutIssues: 0
        };
        
        for (const recipient of recipients) {
            let isValid = true;
            
            // Validate required identifier
            if (!recipient.email && !recipient.phone && !recipient.userId) {
                isValid = false;
            }
            
            // Validate email format
            if (recipient.email && !this.emailRegex.test(recipient.email)) {
                isValid = false;
            }
            
            // Validate phone format
            if (recipient.phone && !this.phoneRegex.test(recipient.phone)) {
                isValid = false;
            }
            
            // Check opt-out status
            if (recipient.optOut) {
                validation.optOutIssues++;
                isValid = false;
            }
            
            // Check consent for compliance frameworks requiring it
            if (context.complianceFrameworks?.includes(ComplianceFramework.GDPR) && !recipient.consentGiven) {
                validation.consentIssues++;
                if (context.validationMode === 'strict') {
                    isValid = false;
                }
            }
            
            if (isValid) {
                validation.validRecipients++;
            } else {
                validation.invalidRecipients++;
            }
        }
        
        return validation;
    }
    
    /**
     * Validate delivery settings
     */
    private async validateDeliverySettings(
        config: NotificationConfiguration,
        context: NotificationValidationContext
    ): Promise<NotificationValidationResult['deliveryValidation']> {
        const validation = {
            supportedChannels: [] as NotificationChannel[],
            unsupportedChannels: [] as NotificationChannel[],
            configurationIssues: [] as string[]
        };
        
        // Check channel support
        for (const channel of config.channels) {
            if (this.isChannelSupported(channel, context)) {
                validation.supportedChannels.push(channel);
            } else {
                validation.unsupportedChannels.push(channel);
            }
        }
        
        // Validate scheduling configuration
        if (config.scheduling) {
            if (config.scheduling.sendAt) {
                const sendTime = new Date(config.scheduling.sendAt);
                if (sendTime <= new Date()) {
                    validation.configurationIssues.push('Scheduled send time must be in the future');
                }
            }
            
            if (config.scheduling.recurring && !config.scheduling.recurringPattern) {
                validation.configurationIssues.push('Recurring pattern is required for recurring notifications');
            }
            
            if (config.scheduling.quietHours?.enabled) {
                if (!config.scheduling.quietHours.startTime || !config.scheduling.quietHours.endTime) {
                    validation.configurationIssues.push('Quiet hours start and end times are required when enabled');
                }
            }
        }
        
        // Validate batch configuration
        if (config.batch) {
            if (config.batch.batchSize <= 0 || config.batch.batchSize > 1000) {
                validation.configurationIssues.push('Batch size must be between 1 and 1000');
            }
            
            if (config.batch.batchInterval < 0) {
                validation.configurationIssues.push('Batch interval must be non-negative');
            }
            
            if (config.batch.maxConcurrent <= 0) {
                validation.configurationIssues.push('Maximum concurrent batches must be positive');
            }
        }
        
        return validation;
    }
    
    /**
     * Validate compliance requirements
     */
    private async validateCompliance(
        config: NotificationConfiguration,
        context: NotificationValidationContext,
        result: NotificationValidationResult
    ): Promise<void> {
        for (const framework of context.complianceFrameworks || []) {
            let status = SOPComplianceStatus.COMPLIANT;
            let details = '';
            
            switch (framework) {
                case ComplianceFramework.GDPR:
                    const gdprResult = this.validateGDPRCompliance(config, context);
                    status = gdprResult.status;
                    details = gdprResult.details;
                    break;
                    
                case ComplianceFramework.CCPA:
                    const ccpaResult = this.validateCCPACompliance(config, context);
                    status = ccpaResult.status;
                    details = ccpaResult.details;
                    break;
                    
                case ComplianceFramework.HIPAA:
                    const hipaaResult = this.validateHIPAACompliance(config, context);
                    status = hipaaResult.status;
                    details = hipaaResult.details;
                    break;
                    
                case ComplianceFramework.CAN_SPAM:
                    const canSpamResult = this.validateCANSPAMCompliance(config, context);
                    status = canSpamResult.status;
                    details = canSpamResult.details;
                    break;
                    
                default:
                    status = SOPComplianceStatus.EXEMPT;
                    details = `Framework ${framework} not implemented`;
            }
            
            result.complianceChecks.push({
                framework,
                status,
                details
            });
            
            if (status === SOPComplianceStatus.NON_COMPLIANT && context.validationMode === 'strict') {
                result.errors.push(this.createValidationError(
                    NotificationErrorType.COMPLIANCE_ERROR,
                    `${framework}_VIOLATION`,
                    details,
                    'complianceSettings'
                ));
            }
        }
    }
    
    /**
     * Validate escalation rules
     */
    private async validateEscalationRules(
        rules: EscalationRule[],
        result: NotificationValidationResult
    ): Promise<void> {
        for (const rule of rules) {
            if (!rule.id) {
                result.errors.push(this.createValidationError(
                    NotificationErrorType.CONFIGURATION_ERROR,
                    'MISSING_ESCALATION_ID',
                    'Escalation rule ID is required',
                    'escalation'
                ));
            }
            
            if (!rule.escalateTo || rule.escalateTo.length === 0) {
                result.errors.push(this.createValidationError(
                    NotificationErrorType.CONFIGURATION_ERROR,
                    'MISSING_ESCALATION_TARGET',
                    'Escalation target is required',
                    'escalation'
                ));
            }
            
            if (rule.timeoutMinutes && rule.timeoutMinutes <= 0) {
                result.errors.push(this.createValidationError(
                    NotificationErrorType.CONFIGURATION_ERROR,
                    'INVALID_ESCALATION_TIMEOUT',
                    'Escalation timeout must be positive',
                    'escalation'
                ));
            }
            
            if (rule.maxAttempts && rule.maxAttempts <= 0) {
                result.errors.push(this.createValidationError(
                    NotificationErrorType.CONFIGURATION_ERROR,
                    'INVALID_ESCALATION_ATTEMPTS',
                    'Escalation max attempts must be positive',
                    'escalation'
                ));
            }
        }
    }
    
    /**
     * Extract variables from template content
     */
    private extractVariables(content: string): string[] {
        const matches = content.match(this.variableRegex);
        if (!matches) return [];
        
        return matches.map(match => match.replace(/\{\{|\}\}/g, '').trim());
    }
    
    /**
     * Validate template syntax
     */
    private validateTemplateSyntax(content: string): void {
        const variables = content.match(this.variableRegex);
        if (!variables) return;
        
        for (const variable of variables) {
            const varName = variable.replace(/\{\{|\}\}/g, '').trim();
            if (!varName) {
                throw new Error('Empty variable placeholder found');
            }
            
            if (varName.includes('{{') || varName.includes('}}')) {
                throw new Error('Nested variable placeholders not allowed');
            }
        }
    }
    
    /**
     * Check if channel is supported
     */
    private isChannelSupported(channel: NotificationChannel, context: NotificationValidationContext): boolean {
        const channelConfig = context.channelSettings[channel.toLowerCase()];
        
        switch (channel) {
            case NotificationChannel.EMAIL:
                return !!(channelConfig?.fromAddress);
            case NotificationChannel.SMS:
                return !!(channelConfig?.apiKey && channelConfig?.fromNumber);
            case NotificationChannel.SLACK:
                return !!(channelConfig?.botToken);
            case NotificationChannel.TEAMS:
                return !!(channelConfig?.webhookUrl || channelConfig?.botId);
            case NotificationChannel.WEBHOOK:
                return !!(channelConfig?.url);
            case NotificationChannel.PUSH:
                return !!(channelConfig?.apiKey);
            default:
                return false;
        }
    }
    
    /**
     * Validate GDPR compliance
     */
    private validateGDPRCompliance(
        config: NotificationConfiguration,
        context: NotificationValidationContext
    ): { status: SOPComplianceStatus; details: string } {
        const issues = [];
        
        // Check consent requirements
        const recipientsWithoutConsent = config.recipients.filter(r => !r.consentGiven);
        if (recipientsWithoutConsent.length > 0) {
            issues.push(`${recipientsWithoutConsent.length} recipients without valid consent`);
        }
        
        // Check data retention settings
        if (!config.complianceSettings.dataRetentionDays) {
            issues.push('Data retention period not specified');
        }
        
        // Check encryption requirements
        if (!config.complianceSettings.encryptInTransit) {
            issues.push('Encryption in transit not enabled');
        }
        
        // Check audit trail
        if (!config.complianceSettings.auditTrailRequired) {
            issues.push('Audit trail not required');
        }
        
        return {
            status: issues.length === 0 ? SOPComplianceStatus.COMPLIANT : SOPComplianceStatus.NON_COMPLIANT,
            details: issues.length === 0 ? 'All GDPR requirements met' : issues.join('; ')
        };
    }
    
    /**
     * Validate CCPA compliance
     */
    private validateCCPACompliance(
        config: NotificationConfiguration,
        context: NotificationValidationContext
    ): { status: SOPComplianceStatus; details: string } {
        const issues = [];
        
        // Check opt-out mechanism
        const recipientsOptedOut = config.recipients.filter(r => r.optOut);
        if (recipientsOptedOut.length > 0) {
            issues.push(`${recipientsOptedOut.length} recipients have opted out`);
        }
        
        // Check data purpose specification
        if (!context.allVariables.dataPurpose) {
            issues.push('Data processing purpose not specified');
        }
        
        return {
            status: issues.length === 0 ? SOPComplianceStatus.COMPLIANT : SOPComplianceStatus.NON_COMPLIANT,
            details: issues.length === 0 ? 'All CCPA requirements met' : issues.join('; ')
        };
    }
    
    /**
     * Validate HIPAA compliance
     */
    private validateHIPAACompliance(
        config: NotificationConfiguration,
        context: NotificationValidationContext
    ): { status: SOPComplianceStatus; details: string } {
        const issues = [];
        
        // Check encryption requirements
        if (!config.complianceSettings.encryptAtRest || !config.complianceSettings.encryptInTransit) {
            issues.push('End-to-end encryption required for HIPAA');
        }
        
        // Check audit trail
        if (!config.complianceSettings.auditTrailRequired) {
            issues.push('Comprehensive audit trail required for HIPAA');
        }
        
        // Check for sensitive data handling
        const hasSensitiveData = config.template.variables.some(v => v.sensitive);
        if (hasSensitiveData && !config.complianceSettings.anonymizeAfterDelivery) {
            issues.push('Sensitive data anonymization not configured');
        }
        
        return {
            status: issues.length === 0 ? SOPComplianceStatus.COMPLIANT : SOPComplianceStatus.NON_COMPLIANT,
            details: issues.length === 0 ? 'All HIPAA requirements met' : issues.join('; ')
        };
    }
    
    /**
     * Validate CAN-SPAM compliance
     */
    private validateCANSPAMCompliance(
        config: NotificationConfiguration,
        context: NotificationValidationContext
    ): { status: SOPComplianceStatus; details: string } {
        const issues = [];
        
        // Check for email channel
        if (!config.channels.includes(NotificationChannel.EMAIL)) {
            return {
                status: SOPComplianceStatus.EXEMPT,
                details: 'CAN-SPAM only applies to email notifications'
            };
        }
        
        // Check subject line requirements
        if (!config.template.subject) {
            issues.push('Subject line is required for email notifications');
        }
        
        // Check sender information
        const channelConfig = context.channelSettings.email;
        if (!channelConfig?.fromAddress || !channelConfig?.fromName) {
            issues.push('Sender information must be clearly identified');
        }
        
        // Check unsubscribe mechanism
        const hasUnsubscribeLink = config.template.content.includes('{{unsubscribeUrl}}') || 
                                  config.template.htmlContent?.includes('{{unsubscribeUrl}}');
        if (!hasUnsubscribeLink) {
            issues.push('Unsubscribe mechanism not found in template');
        }
        
        return {
            status: issues.length === 0 ? SOPComplianceStatus.COMPLIANT : SOPComplianceStatus.NON_COMPLIANT,
            details: issues.length === 0 ? 'All CAN-SPAM requirements met' : issues.join('; ')
        };
    }
    
    /**
     * Create a validation error
     */
    private createValidationError(
        type: NotificationErrorType,
        code: string,
        message: string,
        field?: string
    ): NotificationError {
        return {
            type,
            code,
            message,
            field,
            retryable: false,
            timestamp: new Date().toISOString()
        };
    }
}
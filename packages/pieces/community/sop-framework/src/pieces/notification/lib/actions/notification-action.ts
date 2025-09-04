/**
 * Notification Action
 * 
 * Core action for handling multi-channel notification delivery, template processing,
 * compliance tracking, escalation management, and analytics within SOP workflows.
 */

import { createAction, Property, Validators } from '@activepieces/pieces-framework';
import { BaseSoPiece, BaseSoPieceConfig } from '../../../../framework/base-sop-piece';
import { 
    SOPPieceType, 
    SOPPieceCategory, 
    SOPPriority, 
    SOPExecutionState,
    SOPComplianceStatus,
    SOPExecutionContext
} from '../../../../types/sop-types';
import {
    sopPriorityProp,
    assignedToProp,
    dueDateProp,
    enableComplianceCheckProp,
    enableAuditTrailProp,
    customVariablesProp,
    tagsProp,
    notesProp,
    timeoutProp,
    retryAttemptsProp,
    notificationSettingsProp,
    escalationSettingsProp,
    errorHandlingProp,
    stepDescriptionProp
} from '../../../../common/sop-props';
import {
    NotificationChannel,
    NotificationPriority,
    NotificationProcessingMode,
    NotificationConfiguration,
    NotificationResult,
    NotificationDeliveryStatus,
    DeliveryAttempt,
    NotificationError,
    NotificationErrorType,
    ComplianceFramework,
    EscalationTrigger,
    TemplateProcessingMode
} from '../common/notification-types';
import { NotificationValidator } from '../validation/notification-validator';
import { NotificationHelpers } from '../utils/notification-helpers';
import { nanoid } from 'nanoid';

/**
 * Notification Piece Configuration Interface
 */
interface NotificationPieceConfig extends BaseSoPieceConfig {
    supportedChannels?: NotificationChannel[];
    maxRecipientsPerBatch?: number;
    enableAnalytics?: boolean;
    enableDeliveryTracking?: boolean;
    enableEscalation?: boolean;
    defaultRetryAttempts?: number;
}

/**
 * Notification Properties Interface
 */
interface NotificationProps {
    sopMetadata: any;
    priority: SOPPriority;
    assignedTo?: string;
    dueDate?: string;
    enableComplianceCheck: boolean;
    enableAuditTrail: boolean;
    customVariables: Record<string, any>;
    tags: string[];
    notes?: string;
    
    // Notification specific properties
    processingMode: NotificationProcessingMode;
    notificationConfiguration: NotificationConfiguration;
    variables: Record<string, any>;
    scheduleFor?: string;
    testMode: boolean;
    batchSize?: number;
    enableAnalytics: boolean;
    enableEscalation: boolean;
    complianceFrameworks?: ComplianceFramework[];
    channelConfigurations: Record<string, any>;
    templateProcessingMode: TemplateProcessingMode;
    deliveryTimeout: number;
    retryConfiguration?: {
        maxAttempts: number;
        retryDelay: number;
        exponentialBackoff: boolean;
        retryChannels?: NotificationChannel[];
    };
}

/**
 * Notification Piece Implementation
 */
class NotificationPiece extends BaseSoPiece {
    private validator: NotificationValidator;
    private helpers: typeof NotificationHelpers;
    
    constructor(config: NotificationPieceConfig) {
        super({
            ...config,
            sopPieceType: SOPPieceType.NOTIFICATION,
            sopCategory: SOPPieceCategory.ESCALATION,
            complianceRequired: true,
            auditTrailRequired: true
        });
        
        this.validator = new NotificationValidator();
        this.helpers = NotificationHelpers;
    }

    /**
     * Get Notification specific properties
     */
    protected getSOPSpecificProperties() {
        return {
            // Core Processing Configuration
            processingMode: Property.StaticDropdown({
                displayName: 'Processing Mode',
                description: 'How the notification should be processed',
                required: true,
                defaultValue: NotificationProcessingMode.SEND,
                options: {
                    options: [
                        { label: 'Send Notification', value: NotificationProcessingMode.SEND },
                        { label: 'Schedule Notification', value: NotificationProcessingMode.SCHEDULE },
                        { label: 'Batch Process', value: NotificationProcessingMode.BATCH },
                        { label: 'Process Template', value: NotificationProcessingMode.TEMPLATE },
                        { label: 'Validate Configuration', value: NotificationProcessingMode.VALIDATE },
                        { label: 'Track Delivery', value: NotificationProcessingMode.TRACK },
                        { label: 'Generate Analytics', value: NotificationProcessingMode.ANALYTICS }
                    ]
                }
            }),
            
            notificationConfiguration: Property.Json({
                displayName: 'Notification Configuration',
                description: 'Complete notification configuration including channels, template, recipients, and settings',
                required: true,
                validators: [Validators.object]
            }),
            
            variables: Property.Object({
                displayName: 'Template Variables',
                description: 'Variables to be substituted in the notification template',
                required: false,
                defaultValue: {}
            }),
            
            scheduleFor: Property.DateTime({
                displayName: 'Schedule For',
                description: 'When to send the notification (for scheduled mode)',
                required: false
            }),
            
            testMode: Property.Checkbox({
                displayName: 'Test Mode',
                description: 'Enable test mode to validate configuration without sending',
                required: false,
                defaultValue: false
            }),
            
            batchSize: Property.Number({
                displayName: 'Batch Size',
                description: 'Number of notifications to process per batch',
                required: false,
                validators: [Validators.minValue(1), Validators.maxValue(1000)]
            }),
            
            enableAnalytics: Property.Checkbox({
                displayName: 'Enable Analytics',
                description: 'Generate analytics and reporting data for notifications',
                required: false,
                defaultValue: true
            }),
            
            enableEscalation: Property.Checkbox({
                displayName: 'Enable Escalation',
                description: 'Enable automatic escalation based on delivery failures or timeouts',
                required: false,
                defaultValue: false
            }),
            
            complianceFrameworks: Property.MultiSelectDropdown({
                displayName: 'Compliance Frameworks',
                description: 'Compliance frameworks to validate against',
                required: false,
                options: {
                    options: [
                        { label: 'GDPR', value: ComplianceFramework.GDPR },
                        { label: 'CCPA', value: ComplianceFramework.CCPA },
                        { label: 'HIPAA', value: ComplianceFramework.HIPAA },
                        { label: 'SOX', value: ComplianceFramework.SOX },
                        { label: 'PCI DSS', value: ComplianceFramework.PCI_DSS },
                        { label: 'ISO 27001', value: ComplianceFramework.ISO27001 },
                        { label: 'CAN-SPAM', value: ComplianceFramework.CAN_SPAM },
                        { label: 'TCPA', value: ComplianceFramework.TCPA }
                    ]
                }
            }),
            
            channelConfigurations: Property.Object({
                displayName: 'Channel Configurations',
                description: 'Configuration settings for each notification channel',
                required: false,
                defaultValue: {
                    email: {
                        fromAddress: 'notifications@company.com',
                        fromName: 'Company Notifications',
                        trackOpens: true,
                        trackClicks: true
                    },
                    sms: {
                        provider: 'twilio',
                        fromNumber: '+1234567890'
                    },
                    slack: {
                        botToken: ''
                    },
                    teams: {
                        webhookUrl: ''
                    },
                    webhook: {
                        url: '',
                        method: 'POST',
                        headers: {}
                    },
                    push: {
                        provider: 'fcm',
                        apiKey: ''
                    }
                }
            }),
            
            templateProcessingMode: Property.StaticDropdown({
                displayName: 'Template Processing Mode',
                description: 'How to process template variables and content',
                required: false,
                defaultValue: TemplateProcessingMode.ADVANCED,
                options: {
                    options: [
                        { label: 'Simple - Basic variable substitution', value: TemplateProcessingMode.SIMPLE },
                        { label: 'Advanced - Full template engine', value: TemplateProcessingMode.ADVANCED },
                        { label: 'Conditional - Logic and conditions', value: TemplateProcessingMode.CONDITIONAL },
                        { label: 'Dynamic - Runtime evaluation', value: TemplateProcessingMode.DYNAMIC },
                        { label: 'Localized - Multi-language support', value: TemplateProcessingMode.LOCALIZED }
                    ]
                }
            }),
            
            deliveryTimeout: Property.Number({
                displayName: 'Delivery Timeout (seconds)',
                description: 'Maximum time to wait for delivery confirmation',
                required: false,
                defaultValue: 300,
                validators: [Validators.minValue(30), Validators.maxValue(3600)]
            }),
            
            retryConfiguration: Property.Object({
                displayName: 'Retry Configuration',
                description: 'Configuration for retry attempts on delivery failures',
                required: false,
                defaultValue: {
                    maxAttempts: 3,
                    retryDelay: 300,
                    exponentialBackoff: true,
                    retryChannels: []
                }
            }),
            
            // Advanced Configuration
            escalationConfiguration: Property.Object({
                displayName: 'Escalation Configuration',
                description: 'Advanced escalation rules and settings',
                required: false,
                defaultValue: {
                    enabled: false,
                    rules: [],
                    escalationChain: [],
                    timeoutMinutes: 60,
                    priorityThreshold: NotificationPriority.HIGH
                }
            }),
            
            rateLimitConfiguration: Property.Object({
                displayName: 'Rate Limit Configuration',
                description: 'Rate limiting settings for notification delivery',
                required: false,
                defaultValue: {
                    enabled: true,
                    maxPerMinute: 60,
                    maxPerHour: 1000,
                    maxPerDay: 10000,
                    burstAllowed: true,
                    burstLimit: 10
                }
            }),
            
            deliveryWindowConfiguration: Property.Object({
                displayName: 'Delivery Window Configuration',
                description: 'Time windows and quiet hours for notification delivery',
                required: false,
                defaultValue: {
                    respectTimezone: true,
                    quietHours: {
                        enabled: false,
                        startTime: '22:00',
                        endTime: '08:00',
                        timezone: 'UTC'
                    },
                    businessHoursOnly: false,
                    weekendsAllowed: true
                }
            }),
            
            securityConfiguration: Property.Object({
                displayName: 'Security Configuration',
                description: 'Security settings for notification processing',
                required: false,
                defaultValue: {
                    encryptInTransit: true,
                    encryptAtRest: false,
                    sanitizeContent: true,
                    validateUrls: true,
                    maxAttachmentSize: 10485760, // 10MB
                    allowedMimeTypes: ['image/*', 'application/pdf', 'text/*']
                }
            }),
            
            // Monitoring and Observability
            monitoringConfiguration: Property.Object({
                displayName: 'Monitoring Configuration',
                description: 'Monitoring and alerting configuration',
                required: false,
                defaultValue: {
                    enableMetrics: true,
                    enableTracing: false,
                    alertOnFailures: true,
                    alertThreshold: 10,
                    metricsRetention: 30,
                    detailedLogging: false
                }
            })
        };
    }

    /**
     * Main execution method
     */
    async execute(propsValue: NotificationProps, executedBy: string): Promise<NotificationResult> {
        const startTime = Date.now();
        const executionStartTime = new Date();
        
        try {
            // Create execution context
            const context = this.createExecutionContext(propsValue, executedBy);
            
            // Execute pre-run hooks
            await this.executePreRunHooks(context, propsValue);
            
            // Validate notification configuration
            await this.validateNotificationConfiguration(propsValue.notificationConfiguration, propsValue);
            
            // Update state to IN_PROGRESS
            context.currentState = SOPExecutionState.IN_PROGRESS;
            context.auditTrail.push({
                timestamp: new Date().toISOString(),
                action: 'notification_processing_started',
                userId: executedBy,
                details: {
                    notificationId: propsValue.notificationConfiguration.id,
                    processingMode: propsValue.processingMode,
                    templateProcessingMode: propsValue.templateProcessingMode,
                    recipientsCount: propsValue.notificationConfiguration.recipients.length,
                    channelsCount: propsValue.notificationConfiguration.channels.length,
                    testMode: propsValue.testMode
                }
            });
            
            // Process based on mode
            let result: NotificationResult;
            
            switch (propsValue.processingMode) {
                case NotificationProcessingMode.SEND:
                    result = await this.handleNotificationSend(context, propsValue, executionStartTime);
                    break;
                    
                case NotificationProcessingMode.SCHEDULE:
                    result = await this.handleNotificationSchedule(context, propsValue);
                    break;
                    
                case NotificationProcessingMode.BATCH:
                    result = await this.handleBatchProcessing(context, propsValue, executionStartTime);
                    break;
                    
                case NotificationProcessingMode.TEMPLATE:
                    result = await this.handleTemplateProcessing(context, propsValue);
                    break;
                    
                case NotificationProcessingMode.VALIDATE:
                    result = await this.handleConfigurationValidation(context, propsValue);
                    break;
                    
                case NotificationProcessingMode.TRACK:
                    result = await this.handleDeliveryTracking(context, propsValue);
                    break;
                    
                case NotificationProcessingMode.ANALYTICS:
                    result = await this.handleAnalyticsGeneration(context, propsValue);
                    break;
                    
                default:
                    throw new Error(`Unknown processing mode: ${propsValue.processingMode}`);
            }
            
            // Calculate execution time
            result.executionTime = Date.now() - startTime;
            
            // Execute post-run hooks
            await this.executePostRunHooks(context, result);
            
            return result;
            
        } catch (error: any) {
            // Create error context if not already created
            const context = this.createExecutionContext(propsValue, executedBy);
            await this.handleExecutionError(context, error);
            
            return {
                success: false,
                executionId: context.executionId,
                sopId: context.sopMetadata.sopId,
                notificationId: propsValue.notificationConfiguration.id,
                executionTime: Date.now() - startTime,
                notificationsProcessed: 0,
                notificationsSent: 0,
                notificationsFailed: 0,
                deliveryResults: [],
                templateProcessed: false,
                variablesResolved: 0,
                complianceStatus: SOPComplianceStatus.NON_COMPLIANT,
                auditTrail: context.auditTrail,
                error: error.message,
                metadata: {
                    executedBy,
                    completedAt: new Date().toISOString(),
                    priority: propsValue.priority || SOPPriority.NORMAL,
                    tags: propsValue.tags || [],
                    configVersion: propsValue.notificationConfiguration.version,
                    processingMode: propsValue.processingMode
                }
            };
        }
    }

    /**
     * Handle notification send mode
     */
    private async handleNotificationSend(
        context: SOPExecutionContext,
        props: NotificationProps,
        startTime: Date
    ): Promise<NotificationResult> {
        const config = props.notificationConfiguration;
        const deliveryResults = [];
        let notificationsSent = 0;
        let notificationsFailed = 0;
        
        // Process template
        const templateResult = await this.helpers.processTemplate(
            config.template,
            { ...props.variables, ...props.customVariables },
            'en-US'
        );
        
        // Log template processing
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'template_processed',
            userId: context.executedBy,
            details: {
                templateId: config.template.id,
                variablesResolved: templateResult.variablesResolved,
                missingVariables: templateResult.missingVariables,
                processingTime: templateResult.processingTime
            }
        });
        
        // Send to each recipient on each channel
        for (const recipient of config.recipients) {
            for (const channel of config.channels) {
                const deliveryResult = {
                    recipientId: recipient.id,
                    channel,
                    status: NotificationDeliveryStatus.PENDING,
                    deliveryTime: undefined as number | undefined,
                    errorMessage: undefined as string | undefined,
                    attempts: [] as DeliveryAttempt[]
                };
                
                try {
                    // Validate recipient for channel
                    const validation = this.helpers.validateRecipientForChannel(recipient, channel);
                    if (!validation.isValid) {
                        throw new Error(validation.reason);
                    }
                    
                    // Simulate delivery (in real implementation, integrate with actual providers)
                    const deliveryAttempt = await this.simulateDelivery(
                        recipient,
                        channel,
                        templateResult,
                        config,
                        props.testMode
                    );
                    
                    deliveryResult.attempts.push(deliveryAttempt);
                    deliveryResult.status = deliveryAttempt.status;
                    deliveryResult.deliveryTime = deliveryAttempt.responseTime;
                    
                    if (deliveryAttempt.status === NotificationDeliveryStatus.DELIVERED) {
                        notificationsSent++;
                    } else {
                        notificationsFailed++;
                        deliveryResult.errorMessage = deliveryAttempt.errorMessage;
                    }
                    
                } catch (error: any) {
                    const failedAttempt: DeliveryAttempt = {
                        attemptNumber: 1,
                        timestamp: new Date().toISOString(),
                        status: NotificationDeliveryStatus.FAILED,
                        channel,
                        errorCode: 'DELIVERY_ERROR',
                        errorMessage: error.message,
                        responseTime: 0
                    };
                    
                    deliveryResult.attempts.push(failedAttempt);
                    deliveryResult.status = NotificationDeliveryStatus.FAILED;
                    deliveryResult.errorMessage = error.message;
                    notificationsFailed++;
                }
                
                deliveryResults.push(deliveryResult);
            }
        }
        
        // Check for escalation if enabled
        let escalationResults = [];
        if (props.enableEscalation) {
            escalationResults = this.helpers.checkEscalationTriggers(config, deliveryResults, startTime);
            
            for (const escalation of escalationResults) {
                if (escalation.shouldEscalate) {
                    context.auditTrail.push({
                        timestamp: new Date().toISOString(),
                        action: 'escalation_triggered',
                        userId: context.executedBy,
                        details: {
                            trigger: escalation.trigger,
                            reason: escalation.reason,
                            escalateTo: escalation.escalateTo,
                            newPriority: escalation.newPriority
                        }
                    });
                }
            }
        }
        
        // Generate analytics if enabled
        let analytics = undefined;
        if (props.enableAnalytics) {
            analytics = this.helpers.generateAnalytics(
                config.id,
                config,
                deliveryResults,
                startTime,
                new Date()
            );
        }
        
        // Determine compliance status
        const complianceStatus = props.enableComplianceCheck && notificationsFailed === 0 ? 
            SOPComplianceStatus.COMPLIANT : 
            props.enableComplianceCheck ? SOPComplianceStatus.NON_COMPLIANT : SOPComplianceStatus.EXEMPT;
        
        return {
            success: notificationsFailed < notificationsSent || (!notificationsSent && notificationsFailed === 0),
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            notificationId: config.id,
            executionTime: 0, // Will be calculated later
            notificationsProcessed: deliveryResults.length,
            notificationsSent,
            notificationsFailed,
            deliveryResults,
            templateProcessed: true,
            variablesResolved: templateResult.variablesResolved,
            complianceStatus,
            auditTrail: context.auditTrail,
            analytics,
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                priority: props.priority || SOPPriority.NORMAL,
                tags: props.tags || [],
                configVersion: config.version,
                processingMode: props.processingMode,
                totalCost: analytics?.costPerNotification ? 
                    analytics.costPerNotification * deliveryResults.length : undefined,
                estimatedDeliveryTime: this.helpers.estimateDeliveryTime(config)
            }
        };
    }

    /**
     * Handle notification schedule mode
     */
    private async handleNotificationSchedule(
        context: SOPExecutionContext,
        props: NotificationProps
    ): Promise<NotificationResult> {
        const config = props.notificationConfiguration;
        
        if (!props.scheduleFor && !config.scheduling?.sendAt) {
            throw new Error('Schedule time is required for scheduled notifications');
        }
        
        const scheduledTime = new Date(props.scheduleFor || config.scheduling!.sendAt!);
        const scheduledId = this.helpers.generateNotificationId('scheduled');
        
        // Log scheduling
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'notification_scheduled',
            userId: context.executedBy,
            details: {
                scheduledId,
                scheduledFor: scheduledTime.toISOString(),
                recipientsCount: config.recipients.length,
                channelsCount: config.channels.length
            }
        });
        
        return {
            success: true,
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            notificationId: config.id,
            executionTime: 0,
            notificationsProcessed: 0,
            notificationsSent: 0,
            notificationsFailed: 0,
            deliveryResults: [],
            templateProcessed: false,
            variablesResolved: 0,
            complianceStatus: SOPComplianceStatus.EXEMPT,
            auditTrail: context.auditTrail,
            scheduledNotifications: [{
                scheduledId,
                sendAt: scheduledTime.toISOString(),
                status: 'SCHEDULED'
            }],
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                priority: props.priority || SOPPriority.NORMAL,
                tags: props.tags || [],
                configVersion: config.version,
                processingMode: props.processingMode,
                nextScheduledRun: scheduledTime.toISOString()
            }
        };
    }

    /**
     * Handle batch processing mode
     */
    private async handleBatchProcessing(
        context: SOPExecutionContext,
        props: NotificationProps,
        startTime: Date
    ): Promise<NotificationResult> {
        const config = props.notificationConfiguration;
        const batchSize = props.batchSize || config.batch?.batchSize || 100;
        const recipients = config.recipients;
        const totalBatches = Math.ceil(recipients.length / batchSize);
        
        let totalSent = 0;
        let totalFailed = 0;
        const allDeliveryResults = [];
        
        // Process template once for all batches
        const templateResult = await this.helpers.processTemplate(
            config.template,
            { ...props.variables, ...props.customVariables }
        );
        
        // Process in batches
        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            const batchStart = batchIndex * batchSize;
            const batchEnd = Math.min(batchStart + batchSize, recipients.length);
            const batchRecipients = recipients.slice(batchStart, batchEnd);
            
            context.auditTrail.push({
                timestamp: new Date().toISOString(),
                action: 'batch_processing_started',
                userId: context.executedBy,
                details: {
                    batchIndex: batchIndex + 1,
                    totalBatches,
                    batchSize: batchRecipients.length,
                    recipientRange: `${batchStart + 1}-${batchEnd}`
                }
            });
            
            // Process batch recipients
            for (const recipient of batchRecipients) {
                for (const channel of config.channels) {
                    try {
                        const validation = this.helpers.validateRecipientForChannel(recipient, channel);
                        if (!validation.isValid) {
                            throw new Error(validation.reason);
                        }
                        
                        const deliveryAttempt = await this.simulateDelivery(
                            recipient,
                            channel,
                            templateResult,
                            config,
                            props.testMode
                        );
                        
                        const deliveryResult = {
                            recipientId: recipient.id,
                            channel,
                            status: deliveryAttempt.status,
                            deliveryTime: deliveryAttempt.responseTime,
                            errorMessage: deliveryAttempt.errorMessage,
                            attempts: [deliveryAttempt]
                        };
                        
                        allDeliveryResults.push(deliveryResult);
                        
                        if (deliveryAttempt.status === NotificationDeliveryStatus.DELIVERED) {
                            totalSent++;
                        } else {
                            totalFailed++;
                        }
                        
                    } catch (error: any) {
                        const failedResult = {
                            recipientId: recipient.id,
                            channel,
                            status: NotificationDeliveryStatus.FAILED,
                            deliveryTime: undefined,
                            errorMessage: error.message,
                            attempts: [{
                                attemptNumber: 1,
                                timestamp: new Date().toISOString(),
                                status: NotificationDeliveryStatus.FAILED,
                                channel,
                                errorMessage: error.message,
                                responseTime: 0
                            } as DeliveryAttempt]
                        };
                        
                        allDeliveryResults.push(failedResult);
                        totalFailed++;
                    }
                }
            }
            
            // Add delay between batches if configured
            if (config.batch?.batchInterval && batchIndex < totalBatches - 1) {
                await new Promise(resolve => setTimeout(resolve, config.batch!.batchInterval * 1000));
            }
        }
        
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'batch_processing_completed',
            userId: context.executedBy,
            details: {
                totalBatches,
                totalProcessed: allDeliveryResults.length,
                totalSent,
                totalFailed,
                successRate: allDeliveryResults.length > 0 ? (totalSent / allDeliveryResults.length) * 100 : 0
            }
        });
        
        return {
            success: totalSent > totalFailed || (totalSent === 0 && totalFailed === 0),
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            notificationId: config.id,
            executionTime: 0,
            notificationsProcessed: allDeliveryResults.length,
            notificationsSent: totalSent,
            notificationsFailed: totalFailed,
            deliveryResults: allDeliveryResults,
            templateProcessed: true,
            variablesResolved: templateResult.variablesResolved,
            complianceStatus: props.enableComplianceCheck && totalFailed === 0 ? 
                SOPComplianceStatus.COMPLIANT : 
                props.enableComplianceCheck ? SOPComplianceStatus.NON_COMPLIANT : SOPComplianceStatus.EXEMPT,
            auditTrail: context.auditTrail,
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                priority: props.priority || SOPPriority.NORMAL,
                tags: props.tags || [],
                configVersion: config.version,
                processingMode: props.processingMode
            }
        };
    }

    /**
     * Handle template processing mode
     */
    private async handleTemplateProcessing(
        context: SOPExecutionContext,
        props: NotificationProps
    ): Promise<NotificationResult> {
        const config = props.notificationConfiguration;
        
        // Process template with provided variables
        const templateResult = await this.helpers.processTemplate(
            config.template,
            { ...props.variables, ...props.customVariables }
        );
        
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'template_processed',
            userId: context.executedBy,
            details: {
                templateId: config.template.id,
                variablesResolved: templateResult.variablesResolved,
                missingVariables: templateResult.missingVariables,
                processingTime: templateResult.processingTime,
                contentLength: templateResult.content.length,
                hasHtmlContent: !!templateResult.htmlContent
            }
        });
        
        return {
            success: true,
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            notificationId: config.id,
            executionTime: 0,
            notificationsProcessed: 0,
            notificationsSent: 0,
            notificationsFailed: 0,
            deliveryResults: [],
            templateProcessed: true,
            variablesResolved: templateResult.variablesResolved,
            complianceStatus: SOPComplianceStatus.EXEMPT,
            auditTrail: context.auditTrail,
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                priority: props.priority || SOPPriority.NORMAL,
                tags: props.tags || [],
                configVersion: config.version,
                processingMode: props.processingMode,
                templateProcessingResult: {
                    subject: templateResult.subject,
                    contentLength: templateResult.content.length,
                    htmlContentLength: templateResult.htmlContent?.length || 0,
                    missingVariables: templateResult.missingVariables
                }
            }
        };
    }

    /**
     * Handle configuration validation mode
     */
    private async handleConfigurationValidation(
        context: SOPExecutionContext,
        props: NotificationProps
    ): Promise<NotificationResult> {
        const config = props.notificationConfiguration;
        
        // Create validation context
        const validationContext = {
            configId: config.id,
            configVersion: config.version,
            userId: context.executedBy,
            timestamp: new Date().toISOString(),
            allVariables: { ...props.variables, ...props.customVariables },
            complianceFrameworks: props.complianceFrameworks,
            validationMode: 'strict' as const,
            channelSettings: props.channelConfigurations
        };
        
        // Perform comprehensive validation
        const validationResult = await this.validator.validateNotification(config, validationContext);
        
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'configuration_validated',
            userId: context.executedBy,
            details: {
                isValid: validationResult.isValid,
                errorCount: validationResult.errors.length,
                warningCount: validationResult.warnings.length,
                complianceChecks: validationResult.complianceChecks.length,
                templateValidation: validationResult.templateValidation,
                recipientValidation: validationResult.recipientValidation,
                deliveryValidation: validationResult.deliveryValidation
            }
        });
        
        return {
            success: validationResult.isValid,
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            notificationId: config.id,
            executionTime: 0,
            notificationsProcessed: 0,
            notificationsSent: 0,
            notificationsFailed: validationResult.errors.length,
            deliveryResults: [],
            templateProcessed: !!validationResult.templateValidation,
            variablesResolved: validationResult.templateValidation?.variablesResolved || 0,
            complianceStatus: validationResult.complianceChecks.length > 0 ?
                (validationResult.complianceChecks.every(c => c.status === SOPComplianceStatus.COMPLIANT) ?
                    SOPComplianceStatus.COMPLIANT : SOPComplianceStatus.NON_COMPLIANT) :
                SOPComplianceStatus.EXEMPT,
            complianceResults: validationResult.complianceChecks.map(c => ({
                framework: c.framework,
                status: c.status,
                details: c.details
            })),
            auditTrail: context.auditTrail,
            error: validationResult.errors.length > 0 ? 
                validationResult.errors.map(e => e.message).join('; ') : undefined,
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                priority: props.priority || SOPPriority.NORMAL,
                tags: props.tags || [],
                configVersion: config.version,
                processingMode: props.processingMode,
                validationResults: {
                    errors: validationResult.errors,
                    warnings: validationResult.warnings,
                    templateValidation: validationResult.templateValidation,
                    recipientValidation: validationResult.recipientValidation,
                    deliveryValidation: validationResult.deliveryValidation
                }
            }
        };
    }

    /**
     * Handle delivery tracking mode
     */
    private async handleDeliveryTracking(
        context: SOPExecutionContext,
        props: NotificationProps
    ): Promise<NotificationResult> {
        // This would integrate with actual delivery tracking systems
        // For now, we'll simulate tracking data
        
        const config = props.notificationConfiguration;
        const mockDeliveryResults = [];
        
        // Simulate some delivery tracking data
        for (const recipient of config.recipients) {
            for (const channel of config.channels) {
                mockDeliveryResults.push({
                    recipientId: recipient.id,
                    channel,
                    status: Math.random() > 0.1 ? NotificationDeliveryStatus.DELIVERED : NotificationDeliveryStatus.FAILED,
                    deliveryTime: Math.floor(Math.random() * 5000) + 1000, // 1-6 seconds
                    errorMessage: Math.random() > 0.9 ? 'Simulated error' : undefined,
                    attempts: [{
                        attemptNumber: 1,
                        timestamp: new Date().toISOString(),
                        status: Math.random() > 0.1 ? NotificationDeliveryStatus.DELIVERED : NotificationDeliveryStatus.FAILED,
                        channel,
                        responseTime: Math.floor(Math.random() * 5000) + 1000
                    } as DeliveryAttempt]
                });
            }
        }
        
        const analytics = this.helpers.generateAnalytics(
            config.id,
            config,
            mockDeliveryResults,
            new Date(Date.now() - 3600000), // 1 hour ago
            new Date()
        );
        
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'delivery_tracking_completed',
            userId: context.executedBy,
            details: {
                totalTracked: mockDeliveryResults.length,
                deliveryRate: analytics.deliveryRate,
                averageDeliveryTime: analytics.averageDeliveryTime
            }
        });
        
        return {
            success: true,
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            notificationId: config.id,
            executionTime: 0,
            notificationsProcessed: mockDeliveryResults.length,
            notificationsSent: analytics.totalDelivered,
            notificationsFailed: analytics.totalFailed,
            deliveryResults: mockDeliveryResults,
            templateProcessed: false,
            variablesResolved: 0,
            complianceStatus: SOPComplianceStatus.EXEMPT,
            auditTrail: context.auditTrail,
            analytics,
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                priority: props.priority || SOPPriority.NORMAL,
                tags: props.tags || [],
                configVersion: config.version,
                processingMode: props.processingMode
            }
        };
    }

    /**
     * Handle analytics generation mode
     */
    private async handleAnalyticsGeneration(
        context: SOPExecutionContext,
        props: NotificationProps
    ): Promise<NotificationResult> {
        const config = props.notificationConfiguration;
        
        // Generate mock analytics data (in real implementation, would query actual data)
        const mockDeliveryResults = [];
        let totalSent = 0;
        let totalDelivered = 0;
        
        for (const recipient of config.recipients) {
            for (const channel of config.channels) {
                const wasDelivered = Math.random() > 0.1;
                totalSent++;
                if (wasDelivered) totalDelivered++;
                
                mockDeliveryResults.push({
                    recipientId: recipient.id,
                    channel,
                    status: wasDelivered ? NotificationDeliveryStatus.DELIVERED : NotificationDeliveryStatus.FAILED,
                    deliveryTime: wasDelivered ? Math.floor(Math.random() * 5000) + 1000 : undefined,
                    attempts: [{
                        attemptNumber: 1,
                        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
                        status: wasDelivered ? NotificationDeliveryStatus.DELIVERED : NotificationDeliveryStatus.FAILED,
                        channel,
                        responseTime: Math.floor(Math.random() * 5000) + 1000,
                        cost: Math.floor(Math.random() * 10) + 1 // 1-10 cents
                    } as DeliveryAttempt]
                });
            }
        }
        
        const analytics = this.helpers.generateAnalytics(
            config.id,
            config,
            mockDeliveryResults,
            new Date(Date.now() - 86400000), // 24 hours ago
            new Date()
        );
        
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'analytics_generated',
            userId: context.executedBy,
            details: {
                notificationId: config.id,
                totalAnalyzed: mockDeliveryResults.length,
                deliveryRate: analytics.deliveryRate,
                openRate: analytics.openRate,
                clickRate: analytics.clickRate,
                conversionRate: analytics.conversionRate,
                totalCost: analytics.costPerNotification * analytics.totalSent
            }
        });
        
        return {
            success: true,
            executionId: context.executionId,
            sopId: context.sopMetadata.sopId,
            notificationId: config.id,
            executionTime: 0,
            notificationsProcessed: mockDeliveryResults.length,
            notificationsSent: totalDelivered,
            notificationsFailed: totalSent - totalDelivered,
            deliveryResults: mockDeliveryResults,
            templateProcessed: false,
            variablesResolved: 0,
            complianceStatus: SOPComplianceStatus.EXEMPT,
            auditTrail: context.auditTrail,
            analytics,
            metadata: {
                executedBy: context.executedBy,
                completedAt: new Date().toISOString(),
                priority: props.priority || SOPPriority.NORMAL,
                tags: props.tags || [],
                configVersion: config.version,
                processingMode: props.processingMode,
                totalCost: analytics.costPerNotification * analytics.totalSent
            }
        };
    }

    /**
     * Simulate delivery for testing purposes
     */
    private async simulateDelivery(
        recipient: any,
        channel: NotificationChannel,
        templateResult: any,
        config: NotificationConfiguration,
        testMode: boolean
    ): Promise<DeliveryAttempt> {
        const startTime = Date.now();
        
        // Simulate delivery delay
        const delay = Math.floor(Math.random() * 2000) + 500; // 0.5-2.5 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Simulate success/failure
        const success = testMode || Math.random() > 0.1; // 90% success rate
        
        const attempt: DeliveryAttempt = {
            attemptNumber: 1,
            timestamp: new Date().toISOString(),
            status: success ? NotificationDeliveryStatus.DELIVERED : NotificationDeliveryStatus.FAILED,
            channel,
            errorCode: success ? undefined : 'SIMULATED_ERROR',
            errorMessage: success ? undefined : 'Simulated delivery failure',
            responseTime: Date.now() - startTime,
            providerId: `sim_${nanoid(8)}`,
            cost: Math.floor(Math.random() * 10) + 1 // 1-10 cents
        };
        
        return attempt;
    }

    /**
     * Validate notification configuration
     */
    private async validateNotificationConfiguration(
        config: NotificationConfiguration,
        props: NotificationProps
    ): Promise<void> {
        if (!config.id || !config.name) {
            throw new Error('Notification configuration must have id and name');
        }
        
        if (!config.channels || config.channels.length === 0) {
            throw new Error('At least one notification channel must be configured');
        }
        
        if (!config.template) {
            throw new Error('Notification template is required');
        }
        
        if (!config.recipients || config.recipients.length === 0) {
            throw new Error('At least one recipient must be configured');
        }
        
        // Validate template has required fields
        if (!config.template.id || !config.template.content) {
            throw new Error('Template must have id and content');
        }
        
        // Validate recipients have required contact information
        for (const recipient of config.recipients) {
            if (!recipient.id) {
                throw new Error('All recipients must have an ID');
            }
            
            if (!recipient.email && !recipient.phone && !recipient.userId) {
                throw new Error(`Recipient ${recipient.id} must have at least one contact method`);
            }
        }
    }

    /**
     * Get piece configuration for Activepieces
     */
    public getPieceConfiguration(): any {
        const baseProps = this.getCommonSOPProperties();
        const specificProps = this.getSOPSpecificProperties();
        
        return {
            displayName: 'Notification',
            description: 'Handle multi-channel notification delivery, template processing, compliance tracking, and analytics',
            props: {
                ...baseProps,
                ...specificProps,
                // Additional common props
                priority: sopPriorityProp,
                assignedTo: assignedToProp,
                dueDate: dueDateProp,
                enableComplianceCheck: enableComplianceCheckProp,
                enableAuditTrail: enableAuditTrailProp,
                customVariables: customVariablesProp,
                tags: tagsProp,
                notes: notesProp,
                timeout: timeoutProp,
                retryAttempts: retryAttemptsProp,
                notificationSettings: notificationSettingsProp,
                escalationSettings: escalationSettingsProp,
                errorHandling: errorHandlingProp,
                stepDescription: stepDescriptionProp
            }
        };
    }

    /**
     * Custom pre-run hook for notifications
     */
    protected async onPreRun(context: SOPExecutionContext, propsValue: NotificationProps): Promise<void> {
        // Validate configuration early
        await this.validateNotificationConfiguration(propsValue.notificationConfiguration, propsValue);
        
        // Log notification initialization
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'notification_initialized',
            userId: context.executedBy,
            details: {
                notificationId: propsValue.notificationConfiguration.id,
                processingMode: propsValue.processingMode,
                templateProcessingMode: propsValue.templateProcessingMode,
                recipientsCount: propsValue.notificationConfiguration.recipients.length,
                channelsCount: propsValue.notificationConfiguration.channels.length,
                complianceFrameworks: propsValue.complianceFrameworks || [],
                testMode: propsValue.testMode
            }
        });
    }

    /**
     * Custom post-run hook for notifications
     */
    protected async onPostRun(context: SOPExecutionContext, result: NotificationResult): Promise<void> {
        // Log completion
        context.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: 'notification_completed',
            userId: context.executedBy,
            details: {
                success: result.success,
                notificationId: result.notificationId,
                executionTime: result.executionTime,
                notificationsSent: result.notificationsSent,
                notificationsFailed: result.notificationsFailed,
                complianceStatus: result.complianceStatus,
                templateProcessed: result.templateProcessed,
                variablesResolved: result.variablesResolved
            }
        });
    }
}

/**
 * Create the Notification action
 */
export const notificationAction = createAction({
    name: 'sop_notification',
    displayName: 'Process Notification',
    description: 'Handle multi-channel notification delivery, template processing, compliance tracking, escalation management, and analytics within SOP workflows',
    
    props: {
        // Core Processing Configuration
        processingMode: Property.StaticDropdown({
            displayName: 'Processing Mode',
            description: 'How the notification should be processed',
            required: true,
            defaultValue: NotificationProcessingMode.SEND,
            options: {
                options: [
                    { label: 'Send Notification', value: NotificationProcessingMode.SEND },
                    { label: 'Schedule Notification', value: NotificationProcessingMode.SCHEDULE },
                    { label: 'Batch Process', value: NotificationProcessingMode.BATCH },
                    { label: 'Process Template', value: NotificationProcessingMode.TEMPLATE },
                    { label: 'Validate Configuration', value: NotificationProcessingMode.VALIDATE },
                    { label: 'Track Delivery', value: NotificationProcessingMode.TRACK },
                    { label: 'Generate Analytics', value: NotificationProcessingMode.ANALYTICS }
                ]
            }
        }),
        
        notificationConfiguration: Property.Json({
            displayName: 'Notification Configuration',
            description: 'Complete notification configuration including channels, template, recipients, and settings',
            required: true,
            validators: [Validators.object]
        }),
        
        variables: Property.Object({
            displayName: 'Template Variables',
            description: 'Variables to be substituted in the notification template',
            required: false,
            defaultValue: {}
        }),
        
        testMode: Property.Checkbox({
            displayName: 'Test Mode',
            description: 'Enable test mode to validate configuration without sending',
            required: false,
            defaultValue: false
        }),
        
        enableAnalytics: Property.Checkbox({
            displayName: 'Enable Analytics',
            description: 'Generate analytics and reporting data',
            required: false,
            defaultValue: true
        }),
        
        enableEscalation: Property.Checkbox({
            displayName: 'Enable Escalation',
            description: 'Enable automatic escalation based on delivery failures',
            required: false,
            defaultValue: false
        }),
        
        complianceFrameworks: Property.MultiSelectDropdown({
            displayName: 'Compliance Frameworks',
            description: 'Compliance frameworks to validate against',
            required: false,
            options: {
                options: [
                    { label: 'GDPR', value: ComplianceFramework.GDPR },
                    { label: 'CCPA', value: ComplianceFramework.CCPA },
                    { label: 'HIPAA', value: ComplianceFramework.HIPAA },
                    { label: 'CAN-SPAM', value: ComplianceFramework.CAN_SPAM },
                    { label: 'TCPA', value: ComplianceFramework.TCPA }
                ]
            }
        }),
        
        channelConfigurations: Property.Object({
            displayName: 'Channel Configurations',
            description: 'Configuration settings for notification channels',
            required: false,
            defaultValue: {}
        }),
        
        // SOP Common Properties
        priority: sopPriorityProp,
        assignedTo: assignedToProp,
        dueDate: dueDateProp,
        enableComplianceCheck: enableComplianceCheckProp,
        enableAuditTrail: enableAuditTrailProp,
        customVariables: customVariablesProp,
        tags: tagsProp,
        notes: notesProp,
        timeout: timeoutProp,
        retryAttempts: retryAttemptsProp,
        notificationSettings: notificationSettingsProp,
        escalationSettings: escalationSettingsProp,
        errorHandling: errorHandlingProp,
        stepDescription: stepDescriptionProp
    },
    
    async run(context) {
        const { propsValue, run: { id: executionId } } = context;
        
        // Create Notification piece instance
        const notificationPiece = new NotificationPiece({
            displayName: 'Notification',
            description: propsValue.stepDescription || 'SOP Notification processing',
            sopPieceType: SOPPieceType.NOTIFICATION,
            sopCategory: SOPPieceCategory.ESCALATION,
            priority: propsValue.priority,
            complianceRequired: propsValue.enableComplianceCheck,
            auditTrailRequired: propsValue.enableAuditTrail,
            tags: propsValue.tags || [],
            supportedChannels: Object.values(NotificationChannel),
            maxRecipientsPerBatch: 1000,
            enableAnalytics: propsValue.enableAnalytics,
            enableDeliveryTracking: true,
            enableEscalation: propsValue.enableEscalation,
            defaultRetryAttempts: propsValue.retryAttempts || 3
        });
        
        // Execute the notification processing
        const result = await notificationPiece.execute(propsValue, 'system_user'); // In real implementation, get actual user ID
        
        return result;
    }
});
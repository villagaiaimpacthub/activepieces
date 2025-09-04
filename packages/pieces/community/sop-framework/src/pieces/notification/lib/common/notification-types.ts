/**
 * Notification Types - Specific types and interfaces for Notification pieces
 * 
 * This file defines the comprehensive type system for multi-channel notification 
 * delivery, template management, compliance tracking, and analytics within SOP workflows.
 */

import { Static, Type } from '@sinclair/typebox';
import { 
    SOPExecutionState, 
    SOPComplianceStatus, 
    SOPPriority,
    SOPExecutionContext 
} from '../../../../types/sop-types';

/**
 * Notification Channel Types
 */
export enum NotificationChannel {
    EMAIL = 'EMAIL',
    SMS = 'SMS',
    SLACK = 'SLACK',
    TEAMS = 'TEAMS',
    WEBHOOK = 'WEBHOOK',
    PUSH = 'PUSH',
    IN_APP = 'IN_APP',
    DESKTOP = 'DESKTOP',
    VOICE = 'VOICE',
    FAX = 'FAX'
}

/**
 * Notification Priority Levels
 */
export enum NotificationPriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
    CRITICAL = 'CRITICAL'
}

/**
 * Notification Delivery Status
 */
export enum NotificationDeliveryStatus {
    PENDING = 'PENDING',
    QUEUED = 'QUEUED',
    SENDING = 'SENDING',
    DELIVERED = 'DELIVERED',
    FAILED = 'FAILED',
    BOUNCED = 'BOUNCED',
    SPAM = 'SPAM',
    BLOCKED = 'BLOCKED',
    CANCELLED = 'CANCELLED',
    READ = 'READ',
    CLICKED = 'CLICKED',
    CONVERTED = 'CONVERTED'
}

/**
 * Template Processing Mode
 */
export enum TemplateProcessingMode {
    SIMPLE = 'SIMPLE',
    ADVANCED = 'ADVANCED',
    CONDITIONAL = 'CONDITIONAL',
    DYNAMIC = 'DYNAMIC',
    LOCALIZED = 'LOCALIZED'
}

/**
 * Notification Processing Mode
 */
export enum NotificationProcessingMode {
    SEND = 'SEND',
    SCHEDULE = 'SCHEDULE',
    BATCH = 'BATCH',
    TEMPLATE = 'TEMPLATE',
    VALIDATE = 'VALIDATE',
    TRACK = 'TRACK',
    ANALYTICS = 'ANALYTICS'
}

/**
 * Escalation Trigger Types
 */
export enum EscalationTrigger {
    NO_RESPONSE = 'NO_RESPONSE',
    DELIVERY_FAILED = 'DELIVERY_FAILED',
    TIME_ELAPSED = 'TIME_ELAPSED',
    PRIORITY_INCREASED = 'PRIORITY_INCREASED',
    MANUAL = 'MANUAL'
}

/**
 * Compliance Framework Types
 */
export enum ComplianceFramework {
    GDPR = 'GDPR',
    CCPA = 'CCPA',
    HIPAA = 'HIPAA',
    SOX = 'SOX',
    PCI_DSS = 'PCI_DSS',
    ISO27001 = 'ISO27001',
    CAN_SPAM = 'CAN_SPAM',
    TCPA = 'TCPA'
}

/**
 * Notification Attachment
 */
export const NotificationAttachment = Type.Object({
    id: Type.String({ description: 'Unique attachment identifier' }),
    name: Type.String({ description: 'Attachment filename' }),
    type: Type.String({ description: 'MIME type of the attachment' }),
    size: Type.Number({ description: 'File size in bytes' }),
    url: Type.Optional(Type.String({ description: 'URL to the attachment file' })),
    base64Content: Type.Optional(Type.String({ description: 'Base64 encoded file content' })),
    inline: Type.Boolean({ default: false, description: 'Whether attachment should be inline' }),
    contentId: Type.Optional(Type.String({ description: 'Content ID for inline attachments' }))
});

export type NotificationAttachment = Static<typeof NotificationAttachment>;

/**
 * Template Variable
 */
export const TemplateVariable = Type.Object({
    name: Type.String({ description: 'Variable name' }),
    value: Type.Union([Type.String(), Type.Number(), Type.Boolean(), Type.Object({})], { description: 'Variable value' }),
    format: Type.Optional(Type.String({ description: 'Format specification (date, currency, etc.)' })),
    defaultValue: Type.Optional(Type.Union([Type.String(), Type.Number(), Type.Boolean()]), { description: 'Default value if variable is undefined' }),
    required: Type.Boolean({ default: false, description: 'Whether variable is required' }),
    sensitive: Type.Boolean({ default: false, description: 'Whether variable contains sensitive data' })
});

export type TemplateVariable = Static<typeof TemplateVariable>;

/**
 * Notification Template
 */
export const NotificationTemplate = Type.Object({
    id: Type.String({ description: 'Unique template identifier' }),
    name: Type.String({ description: 'Template name' }),
    description: Type.Optional(Type.String({ description: 'Template description' })),
    channel: Type.Enum(NotificationChannel, { description: 'Target notification channel' }),
    subject: Type.Optional(Type.String({ description: 'Message subject (for email, etc.)' })),
    content: Type.String({ description: 'Template content with variables' }),
    htmlContent: Type.Optional(Type.String({ description: 'HTML version of content' })),
    variables: Type.Array(TemplateVariable, { description: 'Template variables' }),
    locale: Type.String({ default: 'en-US', description: 'Template locale' }),
    version: Type.String({ default: '1.0.0', description: 'Template version' }),
    isActive: Type.Boolean({ default: true, description: 'Whether template is active' }),
    complianceRequired: Type.Boolean({ default: false, description: 'Whether compliance tracking is required' }),
    createdAt: Type.String({ format: 'date-time', description: 'Template creation date' }),
    updatedAt: Type.String({ format: 'date-time', description: 'Template last update date' })
});

export type NotificationTemplate = Static<typeof NotificationTemplate>;

/**
 * Notification Recipient
 */
export const NotificationRecipient = Type.Object({
    id: Type.String({ description: 'Unique recipient identifier' }),
    email: Type.Optional(Type.String({ format: 'email', description: 'Email address' })),
    phone: Type.Optional(Type.String({ description: 'Phone number' })),
    userId: Type.Optional(Type.String({ description: 'User ID in the system' })),
    name: Type.Optional(Type.String({ description: 'Recipient name' })),
    preferredChannel: Type.Optional(Type.Enum(NotificationChannel), { description: 'Preferred notification channel' }),
    timezone: Type.Optional(Type.String({ description: 'Recipient timezone' })),
    locale: Type.Optional(Type.String({ description: 'Recipient locale' })),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown()), { description: 'Additional recipient metadata' }),
    optOut: Type.Boolean({ default: false, description: 'Whether recipient has opted out' }),
    consentGiven: Type.Boolean({ default: false, description: 'Whether recipient has given consent' }),
    consentDate: Type.Optional(Type.String({ format: 'date-time', description: 'Date consent was given' }))
});

export type NotificationRecipient = Static<typeof NotificationRecipient>;

/**
 * Delivery Attempt
 */
export const DeliveryAttempt = Type.Object({
    attemptNumber: Type.Number({ description: 'Attempt number (1-based)' }),
    timestamp: Type.String({ format: 'date-time', description: 'Attempt timestamp' }),
    status: Type.Enum(NotificationDeliveryStatus, { description: 'Delivery status' }),
    channel: Type.Enum(NotificationChannel, { description: 'Channel used for delivery' }),
    errorCode: Type.Optional(Type.String({ description: 'Error code if delivery failed' })),
    errorMessage: Type.Optional(Type.String({ description: 'Error message if delivery failed' })),
    responseTime: Type.Optional(Type.Number({ description: 'Response time in milliseconds' })),
    providerId: Type.Optional(Type.String({ description: 'External provider ID' })),
    cost: Type.Optional(Type.Number({ description: 'Delivery cost in cents' }))
});

export type DeliveryAttempt = Static<typeof DeliveryAttempt>;

/**
 * Escalation Rule
 */
export const EscalationRule = Type.Object({
    id: Type.String({ description: 'Unique escalation rule ID' }),
    trigger: Type.Enum(EscalationTrigger, { description: 'What triggers escalation' }),
    timeoutMinutes: Type.Optional(Type.Number({ description: 'Time before escalation in minutes' })),
    maxAttempts: Type.Optional(Type.Number({ description: 'Max attempts before escalation' })),
    escalateTo: Type.Array(Type.String(), { description: 'User IDs to escalate to' }),
    newPriority: Type.Optional(Type.Enum(NotificationPriority), { description: 'Priority after escalation' }),
    escalationTemplate: Type.Optional(Type.String({ description: 'Template ID for escalation notification' })),
    isActive: Type.Boolean({ default: true, description: 'Whether rule is active' })
});

export type EscalationRule = Static<typeof EscalationRule>;

/**
 * Batch Configuration
 */
export const BatchConfiguration = Type.Object({
    batchSize: Type.Number({ default: 100, description: 'Number of notifications per batch' }),
    batchInterval: Type.Number({ default: 60, description: 'Interval between batches in seconds' }),
    maxConcurrent: Type.Number({ default: 10, description: 'Maximum concurrent batch processes' }),
    priority: Type.Enum(NotificationPriority, { default: NotificationPriority.NORMAL, description: 'Batch priority' }),
    retryFailedInBatch: Type.Boolean({ default: true, description: 'Whether to retry failed notifications in batch' })
});

export type BatchConfiguration = Static<typeof BatchConfiguration>;

/**
 * Scheduling Configuration
 */
export const SchedulingConfiguration = Type.Object({
    sendAt: Type.Optional(Type.String({ format: 'date-time', description: 'Specific time to send' })),
    timezone: Type.String({ default: 'UTC', description: 'Timezone for scheduling' }),
    recurring: Type.Boolean({ default: false, description: 'Whether notification is recurring' }),
    recurringPattern: Type.Optional(Type.Object({
        frequency: Type.Union([Type.Literal('daily'), Type.Literal('weekly'), Type.Literal('monthly'), Type.Literal('yearly')]),
        interval: Type.Number({ default: 1, description: 'Interval between recurrences' }),
        daysOfWeek: Type.Optional(Type.Array(Type.Number({ minimum: 0, maximum: 6 })), { description: 'Days of week (0=Sunday)' }),
        daysOfMonth: Type.Optional(Type.Array(Type.Number({ minimum: 1, maximum: 31 })), { description: 'Days of month' }),
        endDate: Type.Optional(Type.String({ format: 'date-time', description: 'When recurring ends' })),
        maxOccurrences: Type.Optional(Type.Number({ description: 'Maximum number of occurrences' }))
    }), { description: 'Recurring pattern configuration' }),
    respectTimezone: Type.Boolean({ default: true, description: 'Whether to respect recipient timezone' }),
    quietHours: Type.Optional(Type.Object({
        enabled: Type.Boolean({ default: false }),
        startTime: Type.String({ description: 'Quiet hours start time (HH:mm)' }),
        endTime: Type.String({ description: 'Quiet hours end time (HH:mm)' }),
        timezone: Type.String({ default: 'UTC', description: 'Timezone for quiet hours' })
    }), { description: 'Quiet hours configuration' })
});

export type SchedulingConfiguration = Static<typeof SchedulingConfiguration>;

/**
 * Analytics Data
 */
export const NotificationAnalytics = Type.Object({
    notificationId: Type.String({ description: 'Notification ID' }),
    totalSent: Type.Number({ description: 'Total notifications sent' }),
    totalDelivered: Type.Number({ description: 'Total notifications delivered' }),
    totalFailed: Type.Number({ description: 'Total notifications failed' }),
    totalBounced: Type.Number({ description: 'Total notifications bounced' }),
    totalOpened: Type.Number({ description: 'Total notifications opened/read' }),
    totalClicked: Type.Number({ description: 'Total notifications clicked' }),
    totalConverted: Type.Number({ description: 'Total notifications converted' }),
    deliveryRate: Type.Number({ description: 'Delivery rate percentage' }),
    openRate: Type.Number({ description: 'Open rate percentage' }),
    clickRate: Type.Number({ description: 'Click rate percentage' }),
    conversionRate: Type.Number({ description: 'Conversion rate percentage' }),
    averageDeliveryTime: Type.Number({ description: 'Average delivery time in seconds' }),
    costPerNotification: Type.Number({ description: 'Average cost per notification in cents' }),
    channelBreakdown: Type.Record(Type.String(), Type.Object({
        sent: Type.Number(),
        delivered: Type.Number(),
        failed: Type.Number(),
        cost: Type.Number()
    }), { description: 'Breakdown by channel' }),
    timeSeriesData: Type.Array(Type.Object({
        timestamp: Type.String({ format: 'date-time' }),
        sent: Type.Number(),
        delivered: Type.Number(),
        failed: Type.Number()
    }), { description: 'Time series data' })
});

export type NotificationAnalytics = Static<typeof NotificationAnalytics>;

/**
 * Compliance Audit Log Entry
 */
export const ComplianceAuditLogEntry = Type.Object({
    id: Type.String({ description: 'Unique audit log entry ID' }),
    notificationId: Type.String({ description: 'Related notification ID' }),
    timestamp: Type.String({ format: 'date-time', description: 'Audit log timestamp' }),
    action: Type.String({ description: 'Action performed' }),
    framework: Type.Enum(ComplianceFramework, { description: 'Compliance framework' }),
    userId: Type.Optional(Type.String({ description: 'User who performed action' })),
    ipAddress: Type.Optional(Type.String({ description: 'IP address of action' })),
    userAgent: Type.Optional(Type.String({ description: 'User agent string' })),
    consentStatus: Type.Optional(Type.Boolean({ description: 'Consent status at time of action' })),
    dataProcessingPurpose: Type.Optional(Type.String({ description: 'Purpose of data processing' })),
    retentionPeriod: Type.Optional(Type.Number({ description: 'Data retention period in days' })),
    sensitiveDataIncluded: Type.Boolean({ default: false, description: 'Whether sensitive data was included' }),
    encryptionUsed: Type.Boolean({ default: false, description: 'Whether encryption was used' }),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown()), { description: 'Additional audit metadata' })
});

export type ComplianceAuditLogEntry = Static<typeof ComplianceAuditLogEntry>;

/**
 * Notification Configuration
 */
export const NotificationConfiguration = Type.Object({
    id: Type.String({ description: 'Unique notification configuration ID' }),
    name: Type.String({ description: 'Configuration name' }),
    description: Type.Optional(Type.String({ description: 'Configuration description' })),
    channels: Type.Array(Type.Enum(NotificationChannel), { description: 'Enabled notification channels' }),
    template: NotificationTemplate,
    recipients: Type.Array(NotificationRecipient, { description: 'Notification recipients' }),
    priority: Type.Enum(NotificationPriority, { default: NotificationPriority.NORMAL, description: 'Notification priority' }),
    variables: Type.Array(TemplateVariable, { description: 'Template variables with values' }),
    attachments: Type.Optional(Type.Array(NotificationAttachment), { description: 'File attachments' }),
    scheduling: Type.Optional(SchedulingConfiguration, { description: 'Scheduling configuration' }),
    batch: Type.Optional(BatchConfiguration, { description: 'Batch processing configuration' }),
    escalation: Type.Optional(Type.Array(EscalationRule), { description: 'Escalation rules' }),
    retryConfig: Type.Object({
        maxAttempts: Type.Number({ default: 3, description: 'Maximum retry attempts' }),
        retryDelay: Type.Number({ default: 300, description: 'Delay between retries in seconds' }),
        exponentialBackoff: Type.Boolean({ default: true, description: 'Use exponential backoff' }),
        retryChannels: Type.Optional(Type.Array(Type.Enum(NotificationChannel)), { description: 'Channels to retry on' })
    }, { description: 'Retry configuration' }),
    complianceSettings: Type.Object({
        frameworks: Type.Array(Type.Enum(ComplianceFramework), { description: 'Required compliance frameworks' }),
        auditTrailRequired: Type.Boolean({ default: true, description: 'Whether audit trail is required' }),
        consentRequired: Type.Boolean({ default: false, description: 'Whether explicit consent is required' }),
        dataRetentionDays: Type.Optional(Type.Number({ description: 'Data retention period in days' })),
        anonymizeAfterDelivery: Type.Boolean({ default: false, description: 'Anonymize data after delivery' }),
        encryptInTransit: Type.Boolean({ default: true, description: 'Encrypt data in transit' }),
        encryptAtRest: Type.Boolean({ default: false, description: 'Encrypt data at rest' })
    }, { description: 'Compliance settings' }),
    isActive: Type.Boolean({ default: true, description: 'Whether configuration is active' }),
    version: Type.String({ default: '1.0.0', description: 'Configuration version' }),
    createdAt: Type.String({ format: 'date-time', description: 'Creation timestamp' }),
    updatedAt: Type.String({ format: 'date-time', description: 'Last update timestamp' })
});

export type NotificationConfiguration = Static<typeof NotificationConfiguration>;

/**
 * Notification Result
 */
export const NotificationResult = Type.Object({
    success: Type.Boolean({ description: 'Whether notification processing was successful' }),
    executionId: Type.String({ description: 'Unique execution ID' }),
    sopId: Type.String({ description: 'SOP ID' }),
    notificationId: Type.String({ description: 'Notification ID' }),
    executionTime: Type.Number({ description: 'Execution time in milliseconds' }),
    notificationsProcessed: Type.Number({ description: 'Total notifications processed' }),
    notificationsSent: Type.Number({ description: 'Total notifications sent successfully' }),
    notificationsFailed: Type.Number({ description: 'Total notifications failed' }),
    deliveryResults: Type.Array(Type.Object({
        recipientId: Type.String(),
        channel: Type.Enum(NotificationChannel),
        status: Type.Enum(NotificationDeliveryStatus),
        deliveryTime: Type.Optional(Type.Number()),
        errorMessage: Type.Optional(Type.String()),
        attempts: Type.Array(DeliveryAttempt)
    }), { description: 'Individual delivery results' }),
    templateProcessed: Type.Boolean({ description: 'Whether template was processed' }),
    variablesResolved: Type.Number({ description: 'Number of variables successfully resolved' }),
    complianceStatus: Type.Enum(SOPComplianceStatus, { description: 'Overall compliance status' }),
    complianceResults: Type.Optional(Type.Array(Type.Object({
        framework: Type.Enum(ComplianceFramework),
        status: Type.Enum(SOPComplianceStatus),
        details: Type.Optional(Type.String())
    })), { description: 'Compliance check results' }),
    auditTrail: Type.Array(Type.Object({
        timestamp: Type.String({ format: 'date-time' }),
        action: Type.String(),
        userId: Type.String(),
        details: Type.Record(Type.String(), Type.Unknown())
    }), { description: 'Audit trail entries' }),
    analytics: Type.Optional(NotificationAnalytics, { description: 'Analytics data if requested' }),
    scheduledNotifications: Type.Optional(Type.Array(Type.Object({
        scheduledId: Type.String(),
        sendAt: Type.String({ format: 'date-time' }),
        status: Type.String()
    })), { description: 'Scheduled notifications if applicable' }),
    error: Type.Optional(Type.String({ description: 'Error message if failed' })),
    metadata: Type.Object({
        executedBy: Type.String(),
        completedAt: Type.String({ format: 'date-time' }),
        priority: Type.Enum(NotificationPriority),
        tags: Type.Array(Type.String()),
        configVersion: Type.String(),
        processingMode: Type.Enum(NotificationProcessingMode),
        totalCost: Type.Optional(Type.Number()),
        estimatedDeliveryTime: Type.Optional(Type.Number()),
        nextScheduledRun: Type.Optional(Type.String({ format: 'date-time' }))
    }, { description: 'Execution metadata' })
});

export type NotificationResult = Static<typeof NotificationResult>;

/**
 * Notification Error Types
 */
export enum NotificationErrorType {
    CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
    TEMPLATE_ERROR = 'TEMPLATE_ERROR',
    RECIPIENT_ERROR = 'RECIPIENT_ERROR',
    DELIVERY_ERROR = 'DELIVERY_ERROR',
    COMPLIANCE_ERROR = 'COMPLIANCE_ERROR',
    RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    QUOTA_EXCEEDED_ERROR = 'QUOTA_EXCEEDED_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR'
}

/**
 * Notification Error
 */
export const NotificationError = Type.Object({
    type: Type.Enum(NotificationErrorType, { description: 'Error type' }),
    code: Type.String({ description: 'Error code' }),
    message: Type.String({ description: 'Error message' }),
    field: Type.Optional(Type.String({ description: 'Related field if applicable' })),
    recipientId: Type.Optional(Type.String({ description: 'Related recipient ID if applicable' })),
    channel: Type.Optional(Type.Enum(NotificationChannel), { description: 'Related channel if applicable' }),
    retryable: Type.Boolean({ default: false, description: 'Whether error is retryable' }),
    timestamp: Type.String({ format: 'date-time', description: 'Error timestamp' }),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Unknown()), { description: 'Additional error metadata' })
});

export type NotificationError = Static<typeof NotificationError>;

/**
 * Notification Channel Configuration
 */
export interface NotificationChannelConfig {
    email: {
        smtpHost?: string;
        smtpPort?: number;
        smtpUsername?: string;
        smtpPassword?: string;
        fromAddress: string;
        fromName?: string;
        replyToAddress?: string;
        trackOpens?: boolean;
        trackClicks?: boolean;
    };
    sms: {
        provider: 'twilio' | 'aws-sns' | 'nexmo' | 'custom';
        apiKey: string;
        apiSecret?: string;
        fromNumber: string;
    };
    slack: {
        botToken: string;
        signingSecret?: string;
    };
    teams: {
        webhookUrl?: string;
        botId?: string;
        botPassword?: string;
    };
    webhook: {
        url: string;
        method: 'POST' | 'PUT' | 'PATCH';
        headers?: Record<string, string>;
        authentication?: {
            type: 'bearer' | 'basic' | 'api-key';
            token?: string;
            username?: string;
            password?: string;
            apiKey?: string;
            apiKeyHeader?: string;
        };
    };
    push: {
        provider: 'fcm' | 'apns' | 'web-push';
        apiKey: string;
        projectId?: string;
        keyId?: string;
        teamId?: string;
        bundleId?: string;
        vapidPublicKey?: string;
        vapidPrivateKey?: string;
    };
}

/**
 * Notification Processing Context
 */
export interface NotificationProcessingContext {
    notificationId: string;
    configId: string;
    executionId: string;
    userId: string;
    timestamp: string;
    variables: Record<string, any>;
    complianceFrameworks?: ComplianceFramework[];
    processingMode: NotificationProcessingMode;
    channelConfigs: Partial<NotificationChannelConfig>;
}
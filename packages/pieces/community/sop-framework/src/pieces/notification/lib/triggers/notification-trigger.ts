/**
 * Notification Triggers
 * 
 * Comprehensive set of triggers for notification events, delivery status changes,
 * escalations, compliance violations, and analytics milestones within SOP workflows.
 */

import { createTrigger, Property } from '@activepieces/pieces-framework';
import { TriggerStrategy } from '@activepieces/shared';
import {
    NotificationChannel,
    NotificationDeliveryStatus,
    NotificationPriority,
    EscalationTrigger,
    ComplianceFramework,
    NotificationProcessingMode
} from '../common/notification-types';
import { SOPComplianceStatus, SOPPriority } from '../../../../types/sop-types';

/**
 * Notification Sent Trigger
 * Fires when a notification is successfully sent
 */
export const notificationSentTrigger = createTrigger({
    name: 'notification_sent',
    displayName: 'Notification Sent',
    description: 'Triggered when a notification is successfully sent through any channel',
    type: TriggerStrategy.WEBHOOK,
    
    props: {
        notificationId: Property.ShortText({
            displayName: 'Notification ID',
            description: 'Filter by specific notification ID (optional)',
            required: false
        }),
        
        channels: Property.MultiSelectDropdown({
            displayName: 'Channels',
            description: 'Filter by notification channels',
            required: false,
            options: {
                options: [
                    { label: 'Email', value: NotificationChannel.EMAIL },
                    { label: 'SMS', value: NotificationChannel.SMS },
                    { label: 'Slack', value: NotificationChannel.SLACK },
                    { label: 'Teams', value: NotificationChannel.TEAMS },
                    { label: 'Webhook', value: NotificationChannel.WEBHOOK },
                    { label: 'Push', value: NotificationChannel.PUSH },
                    { label: 'In-App', value: NotificationChannel.IN_APP },
                    { label: 'Desktop', value: NotificationChannel.DESKTOP },
                    { label: 'Voice', value: NotificationChannel.VOICE },
                    { label: 'Fax', value: NotificationChannel.FAX }
                ]
            }
        }),
        
        minPriority: Property.StaticDropdown({
            displayName: 'Minimum Priority',
            description: 'Only trigger for notifications at or above this priority level',
            required: false,
            options: {
                options: [
                    { label: 'Low', value: NotificationPriority.LOW },
                    { label: 'Normal', value: NotificationPriority.NORMAL },
                    { label: 'High', value: NotificationPriority.HIGH },
                    { label: 'Urgent', value: NotificationPriority.URGENT },
                    { label: 'Critical', value: NotificationPriority.CRITICAL }
                ]
            }
        }),
        
        recipientPattern: Property.ShortText({
            displayName: 'Recipient Pattern',
            description: 'Filter by recipient email or phone pattern (regex supported)',
            required: false
        }),
        
        templateId: Property.ShortText({
            displayName: 'Template ID',
            description: 'Filter by specific template ID',
            required: false
        })
    },
    
    async run(context) {
        const { propsValue } = context;
        
        // This would be implemented to listen for actual notification sent events
        // For now, return a sample webhook configuration
        return {
            webhookUrl: context.webhookUrl,
            filters: {
                eventType: 'notification.sent',
                notificationId: propsValue.notificationId,
                channels: propsValue.channels,
                minPriority: propsValue.minPriority,
                recipientPattern: propsValue.recipientPattern,
                templateId: propsValue.templateId
            }
        };
    },
    
    async onEnable(context) {
        // Register webhook for notification sent events
        return {
            enabled: true,
            webhookUrl: context.webhookUrl
        };
    },
    
    async onDisable(context) {
        // Cleanup webhook registration
        return {
            enabled: false
        };
    },
    
    sampleData: {
        eventType: 'notification.sent',
        timestamp: '2024-01-15T10:30:00.000Z',
        notificationId: 'notif_1705318200_abc123',
        executionId: 'exec_1705318200_def456',
        sopId: 'sop_workflow_001',
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.NORMAL,
        recipient: {
            id: 'user_001',
            email: 'user@example.com',
            name: 'John Doe'
        },
        template: {
            id: 'template_001',
            name: 'Welcome Email'
        },
        deliveryTime: 2500,
        deliveryStatus: NotificationDeliveryStatus.DELIVERED,
        metadata: {
            executedBy: 'system_user',
            tags: ['welcome', 'onboarding'],
            cost: 5
        }
    }
});

/**
 * Notification Failed Trigger
 * Fires when a notification delivery fails
 */
export const notificationFailedTrigger = createTrigger({
    name: 'notification_failed',
    displayName: 'Notification Failed',
    description: 'Triggered when a notification delivery fails',
    type: TriggerStrategy.WEBHOOK,
    
    props: {
        failureTypes: Property.MultiSelectDropdown({
            displayName: 'Failure Types',
            description: 'Types of failures to trigger on',
            required: false,
            options: {
                options: [
                    { label: 'Delivery Failed', value: NotificationDeliveryStatus.FAILED },
                    { label: 'Bounced', value: NotificationDeliveryStatus.BOUNCED },
                    { label: 'Marked as Spam', value: NotificationDeliveryStatus.SPAM },
                    { label: 'Blocked', value: NotificationDeliveryStatus.BLOCKED }
                ]
            }
        }),
        
        channels: Property.MultiSelectDropdown({
            displayName: 'Channels',
            description: 'Filter by notification channels',
            required: false,
            options: {
                options: [
                    { label: 'Email', value: NotificationChannel.EMAIL },
                    { label: 'SMS', value: NotificationChannel.SMS },
                    { label: 'Slack', value: NotificationChannel.SLACK },
                    { label: 'Teams', value: NotificationChannel.TEAMS },
                    { label: 'Webhook', value: NotificationChannel.WEBHOOK },
                    { label: 'Push', value: NotificationChannel.PUSH }
                ]
            }
        }),
        
        maxRetryAttempts: Property.Number({
            displayName: 'Max Retry Attempts',
            description: 'Only trigger after this many retry attempts',
            required: false,
            defaultValue: 3
        }),
        
        minPriority: Property.StaticDropdown({
            displayName: 'Minimum Priority',
            description: 'Only trigger for notifications at or above this priority level',
            required: false,
            options: {
                options: [
                    { label: 'Low', value: NotificationPriority.LOW },
                    { label: 'Normal', value: NotificationPriority.NORMAL },
                    { label: 'High', value: NotificationPriority.HIGH },
                    { label: 'Urgent', value: NotificationPriority.URGENT },
                    { label: 'Critical', value: NotificationPriority.CRITICAL }
                ]
            }
        })
    },
    
    async run(context) {
        return {
            webhookUrl: context.webhookUrl,
            filters: {
                eventType: 'notification.failed',
                failureTypes: context.propsValue.failureTypes,
                channels: context.propsValue.channels,
                maxRetryAttempts: context.propsValue.maxRetryAttempts,
                minPriority: context.propsValue.minPriority
            }
        };
    },
    
    async onEnable(context) {
        return { enabled: true, webhookUrl: context.webhookUrl };
    },
    
    async onDisable(context) {
        return { enabled: false };
    },
    
    sampleData: {
        eventType: 'notification.failed',
        timestamp: '2024-01-15T10:30:00.000Z',
        notificationId: 'notif_1705318200_abc123',
        executionId: 'exec_1705318200_def456',
        sopId: 'sop_workflow_001',
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.HIGH,
        recipient: {
            id: 'user_001',
            email: 'invalid@example.com',
            name: 'John Doe'
        },
        failure: {
            status: NotificationDeliveryStatus.BOUNCED,
            errorCode: 'INVALID_EMAIL',
            errorMessage: 'Email address does not exist',
            retryAttempt: 3,
            finalFailure: true
        },
        metadata: {
            executedBy: 'system_user',
            totalAttempts: 3,
            tags: ['urgent', 'alert']
        }
    }
});

/**
 * Escalation Triggered Trigger
 * Fires when an escalation rule is triggered
 */
export const escalationTriggeredTrigger = createTrigger({
    name: 'escalation_triggered',
    displayName: 'Escalation Triggered',
    description: 'Triggered when a notification escalation rule is activated',
    type: TriggerStrategy.WEBHOOK,
    
    props: {
        escalationTriggers: Property.MultiSelectDropdown({
            displayName: 'Escalation Triggers',
            description: 'Types of escalations to trigger on',
            required: false,
            options: {
                options: [
                    { label: 'No Response', value: EscalationTrigger.NO_RESPONSE },
                    { label: 'Delivery Failed', value: EscalationTrigger.DELIVERY_FAILED },
                    { label: 'Time Elapsed', value: EscalationTrigger.TIME_ELAPSED },
                    { label: 'Priority Increased', value: EscalationTrigger.PRIORITY_INCREASED },
                    { label: 'Manual', value: EscalationTrigger.MANUAL }
                ]
            }
        }),
        
        minOriginalPriority: Property.StaticDropdown({
            displayName: 'Minimum Original Priority',
            description: 'Only trigger for notifications that started at or above this priority',
            required: false,
            options: {
                options: [
                    { label: 'Low', value: NotificationPriority.LOW },
                    { label: 'Normal', value: NotificationPriority.NORMAL },
                    { label: 'High', value: NotificationPriority.HIGH },
                    { label: 'Urgent', value: NotificationPriority.URGENT },
                    { label: 'Critical', value: NotificationPriority.CRITICAL }
                ]
            }
        }),
        
        escalationLevel: Property.Number({
            displayName: 'Escalation Level',
            description: 'Filter by escalation level (1, 2, 3, etc.)',
            required: false
        }),
        
        departments: Property.Array({
            displayName: 'Departments',
            description: 'Filter by departments involved in escalation',
            required: false
        })
    },
    
    async run(context) {
        return {
            webhookUrl: context.webhookUrl,
            filters: {
                eventType: 'escalation.triggered',
                escalationTriggers: context.propsValue.escalationTriggers,
                minOriginalPriority: context.propsValue.minOriginalPriority,
                escalationLevel: context.propsValue.escalationLevel,
                departments: context.propsValue.departments
            }
        };
    },
    
    async onEnable(context) {
        return { enabled: true, webhookUrl: context.webhookUrl };
    },
    
    async onDisable(context) {
        return { enabled: false };
    },
    
    sampleData: {
        eventType: 'escalation.triggered',
        timestamp: '2024-01-15T11:00:00.000Z',
        notificationId: 'notif_1705318200_abc123',
        executionId: 'exec_1705318200_def456',
        sopId: 'sop_workflow_001',
        escalation: {
            trigger: EscalationTrigger.TIME_ELAPSED,
            level: 1,
            reason: 'No response received after 60 minutes',
            originalPriority: NotificationPriority.HIGH,
            newPriority: NotificationPriority.URGENT,
            escalatedTo: ['manager@example.com', 'director@example.com'],
            escalatedBy: 'system_auto',
            ruleId: 'escalation_rule_001'
        },
        originalNotification: {
            sentAt: '2024-01-15T10:00:00.000Z',
            recipient: 'user@example.com',
            channel: NotificationChannel.EMAIL,
            templateId: 'critical_alert'
        },
        metadata: {
            department: 'IT',
            tags: ['critical', 'incident'],
            elapsedMinutes: 60
        }
    }
});

/**
 * Compliance Violation Trigger
 * Fires when a compliance violation is detected
 */
export const complianceViolationTrigger = createTrigger({
    name: 'compliance_violation',
    displayName: 'Compliance Violation',
    description: 'Triggered when a notification compliance violation is detected',
    type: TriggerStrategy.WEBHOOK,
    
    props: {
        frameworks: Property.MultiSelectDropdown({
            displayName: 'Compliance Frameworks',
            description: 'Frameworks to monitor for violations',
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
        
        violationSeverity: Property.StaticDropdown({
            displayName: 'Violation Severity',
            description: 'Minimum severity level to trigger on',
            required: false,
            defaultValue: 'high',
            options: {
                options: [
                    { label: 'Low', value: 'low' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'High', value: 'high' },
                    { label: 'Critical', value: 'critical' }
                ]
            }
        }),
        
        autoRemediation: Property.Checkbox({
            displayName: 'Auto Remediation',
            description: 'Only trigger for violations that support auto-remediation',
            required: false,
            defaultValue: false
        })
    },
    
    async run(context) {
        return {
            webhookUrl: context.webhookUrl,
            filters: {
                eventType: 'compliance.violation',
                frameworks: context.propsValue.frameworks,
                violationSeverity: context.propsValue.violationSeverity,
                autoRemediation: context.propsValue.autoRemediation
            }
        };
    },
    
    async onEnable(context) {
        return { enabled: true, webhookUrl: context.webhookUrl };
    },
    
    async onDisable(context) {
        return { enabled: false };
    },
    
    sampleData: {
        eventType: 'compliance.violation',
        timestamp: '2024-01-15T10:30:00.000Z',
        notificationId: 'notif_1705318200_abc123',
        executionId: 'exec_1705318200_def456',
        sopId: 'sop_workflow_001',
        violation: {
            framework: ComplianceFramework.GDPR,
            ruleCode: 'GDPR_CONSENT_001',
            severity: 'high',
            description: 'Notification sent without valid consent',
            recipient: 'user@example.com',
            violationDetails: {
                consentRequired: true,
                consentProvided: false,
                consentDate: null,
                dataProcessingPurpose: 'marketing'
            },
            remediation: {
                available: true,
                action: 'opt_out_recipient',
                automated: true
            }
        },
        metadata: {
            detectedBy: 'compliance_monitor',
            auditTrailId: 'audit_001',
            riskScore: 85
        }
    }
});

/**
 * Delivery Status Changed Trigger
 * Fires when notification delivery status changes
 */
export const deliveryStatusChangedTrigger = createTrigger({
    name: 'delivery_status_changed',
    displayName: 'Delivery Status Changed',
    description: 'Triggered when a notification delivery status changes (opened, clicked, etc.)',
    type: TriggerStrategy.WEBHOOK,
    
    props: {
        statusChanges: Property.MultiSelectDropdown({
            displayName: 'Status Changes',
            description: 'Which status changes to trigger on',
            required: false,
            options: {
                options: [
                    { label: 'Delivered', value: NotificationDeliveryStatus.DELIVERED },
                    { label: 'Read/Opened', value: NotificationDeliveryStatus.READ },
                    { label: 'Clicked', value: NotificationDeliveryStatus.CLICKED },
                    { label: 'Converted', value: NotificationDeliveryStatus.CONVERTED },
                    { label: 'Failed', value: NotificationDeliveryStatus.FAILED },
                    { label: 'Bounced', value: NotificationDeliveryStatus.BOUNCED }
                ]
            }
        }),
        
        channels: Property.MultiSelectDropdown({
            displayName: 'Channels',
            description: 'Filter by notification channels',
            required: false,
            options: {
                options: [
                    { label: 'Email', value: NotificationChannel.EMAIL },
                    { label: 'SMS', value: NotificationChannel.SMS },
                    { label: 'Push', value: NotificationChannel.PUSH },
                    { label: 'In-App', value: NotificationChannel.IN_APP }
                ]
            }
        }),
        
        trackEngagement: Property.Checkbox({
            displayName: 'Track Engagement',
            description: 'Include engagement metrics in trigger data',
            required: false,
            defaultValue: true
        })
    },
    
    async run(context) {
        return {
            webhookUrl: context.webhookUrl,
            filters: {
                eventType: 'delivery.status_changed',
                statusChanges: context.propsValue.statusChanges,
                channels: context.propsValue.channels,
                trackEngagement: context.propsValue.trackEngagement
            }
        };
    },
    
    async onEnable(context) {
        return { enabled: true, webhookUrl: context.webhookUrl };
    },
    
    async onDisable(context) {
        return { enabled: false };
    },
    
    sampleData: {
        eventType: 'delivery.status_changed',
        timestamp: '2024-01-15T10:35:00.000Z',
        notificationId: 'notif_1705318200_abc123',
        executionId: 'exec_1705318200_def456',
        sopId: 'sop_workflow_001',
        statusChange: {
            from: NotificationDeliveryStatus.DELIVERED,
            to: NotificationDeliveryStatus.READ,
            timestamp: '2024-01-15T10:35:00.000Z',
            channel: NotificationChannel.EMAIL,
            recipient: {
                id: 'user_001',
                email: 'user@example.com'
            }
        },
        engagement: {
            readTime: 15, // seconds
            clickCount: 0,
            deviceType: 'desktop',
            location: {
                country: 'US',
                region: 'CA',
                city: 'San Francisco'
            },
            userAgent: 'Mozilla/5.0...'
        },
        metadata: {
            templateId: 'welcome_email',
            campaignId: 'onboarding_001',
            tags: ['welcome', 'user_activation']
        }
    }
});

/**
 * Batch Processing Completed Trigger
 * Fires when a batch of notifications completes processing
 */
export const batchProcessingCompletedTrigger = createTrigger({
    name: 'batch_processing_completed',
    displayName: 'Batch Processing Completed',
    description: 'Triggered when a batch of notifications completes processing',
    type: TriggerStrategy.WEBHOOK,
    
    props: {
        minBatchSize: Property.Number({
            displayName: 'Minimum Batch Size',
            description: 'Only trigger for batches with at least this many notifications',
            required: false,
            defaultValue: 10
        }),
        
        successThreshold: Property.Number({
            displayName: 'Success Threshold (%)',
            description: 'Only trigger if success rate is above this percentage',
            required: false,
            defaultValue: 80
        }),
        
        processingModes: Property.MultiSelectDropdown({
            displayName: 'Processing Modes',
            description: 'Filter by batch processing modes',
            required: false,
            options: {
                options: [
                    { label: 'Send', value: NotificationProcessingMode.SEND },
                    { label: 'Batch', value: NotificationProcessingMode.BATCH },
                    { label: 'Schedule', value: NotificationProcessingMode.SCHEDULE }
                ]
            }
        })
    },
    
    async run(context) {
        return {
            webhookUrl: context.webhookUrl,
            filters: {
                eventType: 'batch.processing_completed',
                minBatchSize: context.propsValue.minBatchSize,
                successThreshold: context.propsValue.successThreshold,
                processingModes: context.propsValue.processingModes
            }
        };
    },
    
    async onEnable(context) {
        return { enabled: true, webhookUrl: context.webhookUrl };
    },
    
    async onDisable(context) {
        return { enabled: false };
    },
    
    sampleData: {
        eventType: 'batch.processing_completed',
        timestamp: '2024-01-15T11:15:00.000Z',
        batchId: 'batch_1705318200_xyz789',
        notificationId: 'notif_1705318200_abc123',
        executionId: 'exec_1705318200_def456',
        sopId: 'sop_workflow_001',
        batch: {
            size: 150,
            processed: 150,
            successful: 142,
            failed: 8,
            successRate: 94.7,
            processingTime: 45000, // 45 seconds
            startTime: '2024-01-15T11:14:15.000Z',
            endTime: '2024-01-15T11:15:00.000Z'
        },
        results: {
            channelBreakdown: {
                [NotificationChannel.EMAIL]: { sent: 100, delivered: 95, failed: 5 },
                [NotificationChannel.SMS]: { sent: 50, delivered: 47, failed: 3 }
            },
            failureReasons: {
                'INVALID_EMAIL': 3,
                'PHONE_BLOCKED': 2,
                'RATE_LIMITED': 3
            }
        },
        metadata: {
            templateId: 'newsletter_001',
            campaignId: 'monthly_newsletter',
            cost: 75.50, // total cost in cents
            tags: ['newsletter', 'marketing']
        }
    }
});

/**
 * Analytics Threshold Reached Trigger
 * Fires when notification analytics reach specified thresholds
 */
export const analyticsThresholdReachedTrigger = createTrigger({
    name: 'analytics_threshold_reached',
    displayName: 'Analytics Threshold Reached',
    description: 'Triggered when notification analytics reach specified thresholds',
    type: TriggerStrategy.WEBHOOK,
    
    props: {
        metric: Property.StaticDropdown({
            displayName: 'Metric',
            description: 'Which metric to monitor',
            required: true,
            options: {
                options: [
                    { label: 'Delivery Rate', value: 'delivery_rate' },
                    { label: 'Open Rate', value: 'open_rate' },
                    { label: 'Click Rate', value: 'click_rate' },
                    { label: 'Conversion Rate', value: 'conversion_rate' },
                    { label: 'Total Sent', value: 'total_sent' },
                    { label: 'Total Cost', value: 'total_cost' },
                    { label: 'Failure Rate', value: 'failure_rate' }
                ]
            }
        }),
        
        threshold: Property.Number({
            displayName: 'Threshold Value',
            description: 'Threshold value to trigger on',
            required: true
        }),
        
        comparison: Property.StaticDropdown({
            displayName: 'Comparison',
            description: 'How to compare the metric to the threshold',
            required: true,
            defaultValue: 'greater_than',
            options: {
                options: [
                    { label: 'Greater Than', value: 'greater_than' },
                    { label: 'Less Than', value: 'less_than' },
                    { label: 'Equal To', value: 'equal_to' },
                    { label: 'Greater Than or Equal', value: 'greater_than_equal' },
                    { label: 'Less Than or Equal', value: 'less_than_equal' }
                ]
            }
        }),
        
        timeWindow: Property.StaticDropdown({
            displayName: 'Time Window',
            description: 'Time window for metric calculation',
            required: false,
            defaultValue: '1h',
            options: {
                options: [
                    { label: '15 Minutes', value: '15m' },
                    { label: '1 Hour', value: '1h' },
                    { label: '24 Hours', value: '24h' },
                    { label: '7 Days', value: '7d' },
                    { label: '30 Days', value: '30d' }
                ]
            }
        })
    },
    
    async run(context) {
        return {
            webhookUrl: context.webhookUrl,
            filters: {
                eventType: 'analytics.threshold_reached',
                metric: context.propsValue.metric,
                threshold: context.propsValue.threshold,
                comparison: context.propsValue.comparison,
                timeWindow: context.propsValue.timeWindow
            }
        };
    },
    
    async onEnable(context) {
        return { enabled: true, webhookUrl: context.webhookUrl };
    },
    
    async onDisable(context) {
        return { enabled: false };
    },
    
    sampleData: {
        eventType: 'analytics.threshold_reached',
        timestamp: '2024-01-15T12:00:00.000Z',
        threshold: {
            metric: 'delivery_rate',
            value: 85.0,
            comparison: 'less_than',
            timeWindow: '1h',
            triggered: true
        },
        analytics: {
            totalSent: 1000,
            totalDelivered: 820,
            totalFailed: 180,
            deliveryRate: 82.0,
            timeRange: {
                start: '2024-01-15T11:00:00.000Z',
                end: '2024-01-15T12:00:00.000Z'
            },
            channelBreakdown: {
                [NotificationChannel.EMAIL]: {
                    sent: 600,
                    delivered: 510,
                    failed: 90,
                    rate: 85.0
                },
                [NotificationChannel.SMS]: {
                    sent: 400,
                    delivered: 310,
                    failed: 90,
                    rate: 77.5
                }
            }
        },
        metadata: {
            alertLevel: 'warning',
            previousHourRate: 92.5,
            trend: 'decreasing',
            affectedCampaigns: ['newsletter_001', 'alert_002']
        }
    }
});

/**
 * Export all triggers
 */
export {
    notificationSentTrigger,
    notificationFailedTrigger,
    escalationTriggeredTrigger,
    complianceViolationTrigger,
    deliveryStatusChangedTrigger,
    batchProcessingCompletedTrigger,
    analyticsThresholdReachedTrigger
};
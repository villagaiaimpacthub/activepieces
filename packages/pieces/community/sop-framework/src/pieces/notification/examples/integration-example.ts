/**
 * Notification Integration Examples
 * 
 * Comprehensive examples demonstrating how to integrate and use the Notification piece
 * in various SOP workflow scenarios, including multi-channel delivery, escalation,
 * compliance tracking, and analytics.
 */

import {
    NotificationChannel,
    NotificationPriority,
    NotificationProcessingMode,
    NotificationConfiguration,
    NotificationTemplate,
    NotificationRecipient,
    TemplateVariable,
    ComplianceFramework,
    EscalationTrigger,
    TemplateProcessingMode,
    NotificationDeliveryStatus
} from '../lib/common/notification-types';
import { SOPPriority } from '../../../types/sop-types';

/**
 * Example 1: Basic Email Notification
 * Simple email notification for order confirmation
 */
export const basicEmailNotificationExample = {
    name: 'Basic Email Notification',
    description: 'Send order confirmation email to customer',
    
    configuration: {
        processingMode: NotificationProcessingMode.SEND,
        notificationConfiguration: {
            id: 'order_confirmation_001',
            name: 'Order Confirmation',
            description: 'Notification sent when order is confirmed',
            channels: [NotificationChannel.EMAIL],
            template: {
                id: 'order_confirmation_template',
                name: 'Order Confirmation Email',
                channel: NotificationChannel.EMAIL,
                subject: 'Order Confirmation #{{orderNumber}}',
                content: `
Dear {{customerName}},

Thank you for your order! We're pleased to confirm that your order #{{orderNumber}} has been received and is being processed.

Order Details:
- Order Number: {{orderNumber}}
- Order Date: {{orderDate}}
- Total Amount: {{orderTotal}}
- Estimated Delivery: {{estimatedDelivery}}

You can track your order status at: {{trackingUrl}}

If you have any questions, please contact our support team at support@company.com.

Best regards,
The Company Team
                `.trim(),
                htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <title>Order Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .order-details { background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .footer { background-color: #333; color: white; padding: 20px; text-align: center; }
        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Order Confirmation</h1>
    </div>
    <div class="content">
        <p>Dear {{customerName}},</p>
        <p>Thank you for your order! We're pleased to confirm that your order #{{orderNumber}} has been received and is being processed.</p>
        
        <div class="order-details">
            <h3>Order Details</h3>
            <ul>
                <li><strong>Order Number:</strong> {{orderNumber}}</li>
                <li><strong>Order Date:</strong> {{orderDate}}</li>
                <li><strong>Total Amount:</strong> {{orderTotal}}</li>
                <li><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</li>
            </ul>
        </div>
        
        <p>You can track your order status by clicking the button below:</p>
        <p><a href="{{trackingUrl}}" class="button">Track Your Order</a></p>
        
        <p>If you have any questions, please contact our support team at support@company.com.</p>
        
        <p>Best regards,<br>The Company Team</p>
    </div>
    <div class="footer">
        <p>&copy; 2024 Company Name. All rights reserved.</p>
        <p><a href="{{unsubscribeUrl}}" style="color: white;">Unsubscribe</a></p>
    </div>
</body>
</html>
                `.trim(),
                variables: [
                    { name: 'customerName', value: undefined, required: true, sensitive: false },
                    { name: 'orderNumber', value: undefined, required: true, sensitive: false },
                    { name: 'orderDate', value: undefined, required: true, sensitive: false },
                    { name: 'orderTotal', value: undefined, required: true, sensitive: false },
                    { name: 'estimatedDelivery', value: undefined, required: true, sensitive: false },
                    { name: 'trackingUrl', value: undefined, required: true, sensitive: false },
                    { name: 'unsubscribeUrl', value: undefined, required: true, sensitive: false }
                ],
                locale: 'en-US',
                version: '1.0.0',
                isActive: true,
                complianceRequired: false,
                createdAt: '2024-01-15T10:00:00.000Z',
                updatedAt: '2024-01-15T10:00:00.000Z'
            } as NotificationTemplate,
            recipients: [
                {
                    id: 'customer_001',
                    email: 'customer@example.com',
                    name: 'John Customer',
                    preferredChannel: NotificationChannel.EMAIL,
                    timezone: 'America/New_York',
                    locale: 'en-US',
                    metadata: { customerId: 'CUST_001', segment: 'premium' },
                    optOut: false,
                    consentGiven: true,
                    consentDate: '2024-01-01T00:00:00.000Z'
                } as NotificationRecipient
            ],
            priority: NotificationPriority.NORMAL,
            variables: [],
            retryConfig: {
                maxAttempts: 3,
                retryDelay: 300,
                exponentialBackoff: true
            },
            complianceSettings: {
                frameworks: [ComplianceFramework.CAN_SPAM],
                auditTrailRequired: true,
                consentRequired: false,
                encryptInTransit: true,
                encryptAtRest: false
            },
            isActive: true,
            version: '1.0.0',
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-01-15T10:00:00.000Z'
        } as NotificationConfiguration,
        variables: {
            customerName: 'John Customer',
            orderNumber: 'ORD-2024-001',
            orderDate: '2024-01-15',
            orderTotal: '$99.99',
            estimatedDelivery: '2024-01-20',
            trackingUrl: 'https://company.com/track/ORD-2024-001',
            unsubscribeUrl: 'https://company.com/unsubscribe?token=xyz'
        },
        testMode: false,
        enableAnalytics: true,
        channelConfigurations: {
            email: {
                fromAddress: 'orders@company.com',
                fromName: 'Company Orders',
                trackOpens: true,
                trackClicks: true
            }
        },
        priority: SOPPriority.NORMAL,
        enableComplianceCheck: true,
        enableAuditTrail: true,
        tags: ['order', 'confirmation', 'customer']
    }
};

/**
 * Example 2: Multi-Channel Urgent Alert
 * Critical system alert sent via multiple channels with escalation
 */
export const multiChannelUrgentAlertExample = {
    name: 'Multi-Channel Urgent Alert',
    description: 'Critical system alert with multi-channel delivery and escalation',
    
    configuration: {
        processingMode: NotificationProcessingMode.SEND,
        notificationConfiguration: {
            id: 'system_alert_critical',
            name: 'Critical System Alert',
            description: 'Alert for critical system issues requiring immediate attention',
            channels: [NotificationChannel.EMAIL, NotificationChannel.SMS, NotificationChannel.SLACK],
            template: {
                id: 'critical_alert_template',
                name: 'Critical Alert Template',
                channel: NotificationChannel.EMAIL, // Primary channel
                subject: '🚨 CRITICAL ALERT: {{alertType}} - {{systemName}}',
                content: `
CRITICAL SYSTEM ALERT

Alert Type: {{alertType}}
System: {{systemName}}
Severity: {{severity}}
Time: {{alertTime}}

Description: {{description}}

Impact: {{impact}}

Action Required: {{actionRequired}}

Please respond immediately by:
1. Acknowledging this alert
2. Taking corrective action
3. Updating the incident ticket: {{incidentUrl}}

This is alert #{{alertId}} - Priority: {{priority}}
                `.trim(),
                variables: [
                    { name: 'alertType', value: undefined, required: true, sensitive: false },
                    { name: 'systemName', value: undefined, required: true, sensitive: false },
                    { name: 'severity', value: undefined, required: true, sensitive: false },
                    { name: 'alertTime', value: undefined, required: true, sensitive: false },
                    { name: 'description', value: undefined, required: true, sensitive: false },
                    { name: 'impact', value: undefined, required: true, sensitive: false },
                    { name: 'actionRequired', value: undefined, required: true, sensitive: false },
                    { name: 'incidentUrl', value: undefined, required: true, sensitive: false },
                    { name: 'alertId', value: undefined, required: true, sensitive: false },
                    { name: 'priority', value: undefined, required: true, sensitive: false }
                ],
                locale: 'en-US',
                version: '1.0.0',
                isActive: true,
                complianceRequired: true,
                createdAt: '2024-01-15T10:00:00.000Z',
                updatedAt: '2024-01-15T10:00:00.000Z'
            } as NotificationTemplate,
            recipients: [
                {
                    id: 'oncall_primary',
                    email: 'oncall-primary@company.com',
                    phone: '+1234567890',
                    userId: 'user_oncall_1',
                    name: 'Primary On-Call Engineer',
                    preferredChannel: NotificationChannel.SMS,
                    timezone: 'America/New_York',
                    locale: 'en-US',
                    metadata: { role: 'primary_oncall', team: 'platform' },
                    optOut: false,
                    consentGiven: true,
                    consentDate: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 'oncall_backup',
                    email: 'oncall-backup@company.com',
                    phone: '+1234567891',
                    userId: 'user_oncall_2',
                    name: 'Backup On-Call Engineer',
                    preferredChannel: NotificationChannel.EMAIL,
                    timezone: 'America/Los_Angeles',
                    locale: 'en-US',
                    metadata: { role: 'backup_oncall', team: 'platform' },
                    optOut: false,
                    consentGiven: true,
                    consentDate: '2024-01-01T00:00:00.000Z'
                }
            ] as NotificationRecipient[],
            priority: NotificationPriority.CRITICAL,
            variables: [],
            escalation: [
                {
                    id: 'no_response_escalation',
                    trigger: EscalationTrigger.NO_RESPONSE,
                    timeoutMinutes: 5,
                    escalateTo: ['team-lead@company.com', 'director@company.com'],
                    newPriority: NotificationPriority.CRITICAL,
                    isActive: true
                },
                {
                    id: 'delivery_failure_escalation',
                    trigger: EscalationTrigger.DELIVERY_FAILED,
                    maxAttempts: 2,
                    escalateTo: ['ops-manager@company.com'],
                    newPriority: NotificationPriority.CRITICAL,
                    isActive: true
                }
            ],
            retryConfig: {
                maxAttempts: 5,
                retryDelay: 60, // 1 minute
                exponentialBackoff: true,
                retryChannels: [NotificationChannel.EMAIL, NotificationChannel.SMS]
            },
            complianceSettings: {
                frameworks: [],
                auditTrailRequired: true,
                consentRequired: false,
                encryptInTransit: true,
                encryptAtRest: true // Critical data should be encrypted at rest
            },
            isActive: true,
            version: '1.0.0',
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-01-15T10:00:00.000Z'
        } as NotificationConfiguration,
        variables: {
            alertType: 'Database Connection Failure',
            systemName: 'Production Database Cluster',
            severity: 'CRITICAL',
            alertTime: '2024-01-15T14:30:00.000Z',
            description: 'Primary database connection pool exhausted, application unable to serve requests',
            impact: 'Complete service outage affecting all users',
            actionRequired: 'Restart database connection pool and investigate connection leaks',
            incidentUrl: 'https://company.com/incidents/INC-2024-001',
            alertId: 'ALT-2024-001',
            priority: 'P0 - CRITICAL'
        },
        testMode: false,
        enableAnalytics: true,
        enableEscalation: true,
        channelConfigurations: {
            email: {
                fromAddress: 'alerts@company.com',
                fromName: 'System Alerts',
                trackOpens: true,
                trackClicks: false
            },
            sms: {
                provider: 'twilio',
                fromNumber: '+1234567890'
            },
            slack: {
                botToken: 'xoxb-slack-bot-token',
                channel: '#critical-alerts'
            }
        },
        priority: SOPPriority.CRITICAL,
        enableComplianceCheck: false,
        enableAuditTrail: true,
        tags: ['alert', 'critical', 'system', 'oncall']
    }
};

/**
 * Example 3: GDPR Compliant Marketing Campaign
 * Marketing email campaign with strict GDPR compliance
 */
export const gdprMarketingCampaignExample = {
    name: 'GDPR Compliant Marketing Campaign',
    description: 'Newsletter campaign with full GDPR compliance and consent tracking',
    
    configuration: {
        processingMode: NotificationProcessingMode.BATCH,
        notificationConfiguration: {
            id: 'newsletter_monthly_001',
            name: 'Monthly Newsletter',
            description: 'Monthly newsletter campaign with product updates and offers',
            channels: [NotificationChannel.EMAIL],
            template: {
                id: 'newsletter_template',
                name: 'Monthly Newsletter Template',
                channel: NotificationChannel.EMAIL,
                subject: '{{companyName}} Newsletter - {{monthYear}}',
                content: `
Hello {{firstName}},

Welcome to your {{monthYear}} newsletter from {{companyName}}!

This month's highlights:
{{#each highlights}}
- {{this}}
{{/each}}

Special offers for you:
{{#if hasOffers}}
{{#each offers}}
- {{title}}: {{description}} - Valid until {{expiryDate}}
{{/each}}
{{/if}}

{{#if hasProducts}}
New products you might like:
{{#each recommendedProducts}}
- {{name}}: {{description}} - {{price}}
{{/each}}
{{/if}}

Best regards,
The {{companyName}} Team

---
You're receiving this email because you subscribed to our newsletter on {{subscriptionDate}}.
You can update your preferences or unsubscribe at any time: {{preferencesUrl}}
                `.trim(),
                htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <title>Monthly Newsletter</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .highlight { background: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #007bff; }
        .offer { border: 2px solid #28a745; border-radius: 8px; padding: 20px; margin: 20px 0; background: #f8fff9; }
        .product { display: flex; align-items: center; padding: 15px; margin: 10px 0; border: 1px solid #dee2e6; border-radius: 5px; }
        .footer { background: #f8f9fa; padding: 30px; font-size: 0.9em; color: #666; border-top: 1px solid #dee2e6; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .unsubscribe { font-size: 0.8em; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{companyName}} Newsletter</h1>
            <p>{{monthYear}}</p>
        </div>
        
        <div class="content">
            <p>Hello {{firstName}},</p>
            <p>Welcome to your {{monthYear}} newsletter from {{companyName}}!</p>
            
            <div class="highlight">
                <h3>This Month's Highlights</h3>
                <ul>
                    {{#each highlights}}
                    <li>{{this}}</li>
                    {{/each}}
                </ul>
            </div>
            
            {{#if hasOffers}}
            <h3>Special Offers for You</h3>
            {{#each offers}}
            <div class="offer">
                <h4>{{title}}</h4>
                <p>{{description}}</p>
                <p><strong>Valid until:</strong> {{expiryDate}}</p>
                <a href="{{url}}" class="button">Claim Offer</a>
            </div>
            {{/each}}
            {{/if}}
            
            {{#if hasProducts}}
            <h3>Products You Might Like</h3>
            {{#each recommendedProducts}}
            <div class="product">
                <div>
                    <h4>{{name}}</h4>
                    <p>{{description}}</p>
                    <p><strong>{{price}}</strong></p>
                    <a href="{{url}}" class="button">Learn More</a>
                </div>
            </div>
            {{/each}}
            {{/if}}
            
            <p>Best regards,<br>The {{companyName}} Team</p>
        </div>
        
        <div class="footer">
            <div class="unsubscribe">
                <p>You're receiving this email because you subscribed to our newsletter on {{subscriptionDate}}.</p>
                <p>You can <a href="{{preferencesUrl}}">update your preferences</a> or <a href="{{unsubscribeUrl}}">unsubscribe</a> at any time.</p>
                <p>{{companyName}}, {{companyAddress}}</p>
                <p>This email was sent in compliance with GDPR regulations.</p>
            </div>
        </div>
    </div>
</body>
</html>
                `.trim(),
                variables: [
                    { name: 'firstName', value: undefined, required: true, sensitive: true },
                    { name: 'companyName', value: 'Your Company', required: false, sensitive: false },
                    { name: 'monthYear', value: undefined, required: true, sensitive: false },
                    { name: 'highlights', value: undefined, required: false, sensitive: false },
                    { name: 'hasOffers', value: false, required: false, sensitive: false },
                    { name: 'offers', value: undefined, required: false, sensitive: false },
                    { name: 'hasProducts', value: false, required: false, sensitive: false },
                    { name: 'recommendedProducts', value: undefined, required: false, sensitive: false },
                    { name: 'subscriptionDate', value: undefined, required: true, sensitive: false },
                    { name: 'preferencesUrl', value: undefined, required: true, sensitive: false },
                    { name: 'unsubscribeUrl', value: undefined, required: true, sensitive: false },
                    { name: 'companyAddress', value: undefined, required: true, sensitive: false }
                ],
                locale: 'en-US',
                version: '1.0.0',
                isActive: true,
                complianceRequired: true,
                createdAt: '2024-01-15T10:00:00.000Z',
                updatedAt: '2024-01-15T10:00:00.000Z'
            } as NotificationTemplate,
            recipients: [
                // This would typically be loaded from a database with proper consent tracking
                {
                    id: 'subscriber_001',
                    email: 'subscriber1@example.com',
                    name: 'Alice Johnson',
                    preferredChannel: NotificationChannel.EMAIL,
                    timezone: 'Europe/London',
                    locale: 'en-GB',
                    metadata: { 
                        segment: 'premium', 
                        interests: ['technology', 'offers'],
                        subscriptionSource: 'website',
                        gdprConsentVersion: '2.0'
                    },
                    optOut: false,
                    consentGiven: true,
                    consentDate: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 'subscriber_002',
                    email: 'subscriber2@example.com',
                    name: 'Bob Smith',
                    preferredChannel: NotificationChannel.EMAIL,
                    timezone: 'Europe/Berlin',
                    locale: 'de-DE',
                    metadata: { 
                        segment: 'standard', 
                        interests: ['products'],
                        subscriptionSource: 'mobile_app',
                        gdprConsentVersion: '2.0'
                    },
                    optOut: false,
                    consentGiven: true,
                    consentDate: '2024-01-05T00:00:00.000Z'
                }
            ] as NotificationRecipient[],
            priority: NotificationPriority.LOW,
            variables: [],
            batch: {
                batchSize: 500,
                batchInterval: 30,
                maxConcurrent: 3,
                priority: NotificationPriority.LOW,
                retryFailedInBatch: true
            },
            retryConfig: {
                maxAttempts: 2,
                retryDelay: 300,
                exponentialBackoff: false
            },
            complianceSettings: {
                frameworks: [ComplianceFramework.GDPR, ComplianceFramework.CAN_SPAM],
                auditTrailRequired: true,
                consentRequired: true,
                dataRetentionDays: 730, // 2 years
                anonymizeAfterDelivery: false,
                encryptInTransit: true,
                encryptAtRest: true
            },
            isActive: true,
            version: '1.0.0',
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-01-15T10:00:00.000Z'
        } as NotificationConfiguration,
        variables: {
            companyName: 'TechCorp',
            monthYear: 'January 2024',
            highlights: [
                'New mobile app released with enhanced features',
                '50% increase in customer satisfaction scores',
                'Expanded to 5 new international markets'
            ],
            hasOffers: true,
            offers: [
                {
                    title: 'Premium Upgrade',
                    description: 'Upgrade to Premium for 3 months free',
                    expiryDate: '2024-02-15',
                    url: 'https://company.com/premium-upgrade'
                }
            ],
            hasProducts: true,
            recommendedProducts: [
                {
                    name: 'Smart Device Pro',
                    description: 'Our latest IoT device with AI capabilities',
                    price: '$299.99',
                    url: 'https://company.com/products/smart-device-pro'
                }
            ],
            companyAddress: '123 Tech Street, Innovation City, TC 12345'
        },
        batchSize: 500,
        testMode: false,
        enableAnalytics: true,
        complianceFrameworks: [ComplianceFramework.GDPR, ComplianceFramework.CAN_SPAM],
        channelConfigurations: {
            email: {
                fromAddress: 'newsletter@techcorp.com',
                fromName: 'TechCorp Newsletter',
                replyToAddress: 'no-reply@techcorp.com',
                trackOpens: true,
                trackClicks: true
            }
        },
        templateProcessingMode: TemplateProcessingMode.ADVANCED,
        priority: SOPPriority.LOW,
        enableComplianceCheck: true,
        enableAuditTrail: true,
        tags: ['newsletter', 'marketing', 'gdpr', 'batch']
    }
};

/**
 * Example 4: Scheduled Maintenance Notification
 * Scheduled notification for planned system maintenance
 */
export const scheduledMaintenanceNotificationExample = {
    name: 'Scheduled Maintenance Notification',
    description: 'Notify users about planned system maintenance with multiple reminders',
    
    configuration: {
        processingMode: NotificationProcessingMode.SCHEDULE,
        notificationConfiguration: {
            id: 'maintenance_notification',
            name: 'System Maintenance Notification',
            description: 'Notification about planned system maintenance',
            channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
            template: {
                id: 'maintenance_template',
                name: 'Maintenance Notification Template',
                channel: NotificationChannel.EMAIL,
                subject: 'Scheduled Maintenance: {{systemName}} - {{maintenanceDate}}',
                content: `
Dear {{userName}},

We're writing to inform you about scheduled maintenance for {{systemName}}.

Maintenance Details:
- Date: {{maintenanceDate}}
- Time: {{maintenanceTime}} ({{timezone}})
- Duration: {{estimatedDuration}}
- Type: {{maintenanceType}}

During this maintenance window:
{{#each affectedServices}}
- {{name}}: {{impact}}
{{/each}}

What to expect:
- {{expectedImpact}}
- All data will be preserved
- Service will be restored automatically

Preparation steps:
{{#each preparationSteps}}
- {{this}}
{{/each}}

We apologize for any inconvenience and appreciate your patience.

For updates during maintenance, please visit: {{statusPageUrl}}

If you have any questions, contact support at {{supportContact}}.

Best regards,
{{teamName}}
                `.trim(),
                variables: [
                    { name: 'userName', value: undefined, required: true, sensitive: false },
                    { name: 'systemName', value: undefined, required: true, sensitive: false },
                    { name: 'maintenanceDate', value: undefined, required: true, sensitive: false },
                    { name: 'maintenanceTime', value: undefined, required: true, sensitive: false },
                    { name: 'timezone', value: undefined, required: true, sensitive: false },
                    { name: 'estimatedDuration', value: undefined, required: true, sensitive: false },
                    { name: 'maintenanceType', value: undefined, required: true, sensitive: false },
                    { name: 'affectedServices', value: undefined, required: true, sensitive: false },
                    { name: 'expectedImpact', value: undefined, required: true, sensitive: false },
                    { name: 'preparationSteps', value: undefined, required: false, sensitive: false },
                    { name: 'statusPageUrl', value: undefined, required: true, sensitive: false },
                    { name: 'supportContact', value: undefined, required: true, sensitive: false },
                    { name: 'teamName', value: undefined, required: true, sensitive: false }
                ],
                locale: 'en-US',
                version: '1.0.0',
                isActive: true,
                complianceRequired: false,
                createdAt: '2024-01-15T10:00:00.000Z',
                updatedAt: '2024-01-15T10:00:00.000Z'
            } as NotificationTemplate,
            recipients: [
                {
                    id: 'all_users',
                    email: 'all-users@company.com', // This would be expanded to actual user list
                    name: 'All Users',
                    preferredChannel: NotificationChannel.EMAIL,
                    timezone: 'UTC',
                    locale: 'en-US',
                    metadata: { group: 'all_users' },
                    optOut: false,
                    consentGiven: true,
                    consentDate: '2024-01-01T00:00:00.000Z'
                }
            ] as NotificationRecipient[],
            priority: NotificationPriority.HIGH,
            variables: [],
            scheduling: {
                sendAt: '2024-01-20T14:00:00.000Z', // 24 hours before maintenance
                timezone: 'UTC',
                recurring: false,
                respectTimezone: true,
                quietHours: {
                    enabled: true,
                    startTime: '23:00',
                    endTime: '07:00',
                    timezone: 'UTC'
                }
            },
            retryConfig: {
                maxAttempts: 2,
                retryDelay: 600,
                exponentialBackoff: false
            },
            complianceSettings: {
                frameworks: [],
                auditTrailRequired: true,
                consentRequired: false,
                encryptInTransit: true,
                encryptAtRest: false
            },
            isActive: true,
            version: '1.0.0',
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-01-15T10:00:00.000Z'
        } as NotificationConfiguration,
        scheduleFor: '2024-01-20T14:00:00.000Z',
        variables: {
            systemName: 'Customer Portal',
            maintenanceDate: 'January 21, 2024',
            maintenanceTime: '2:00 AM - 6:00 AM',
            timezone: 'EST',
            estimatedDuration: '4 hours',
            maintenanceType: 'Database upgrade and security patches',
            affectedServices: [
                { name: 'Customer Portal', impact: 'Temporary unavailability' },
                { name: 'Mobile App', impact: 'Limited functionality' },
                { name: 'API Services', impact: 'Reduced performance' }
            ],
            expectedImpact: 'Complete service unavailability for approximately 4 hours',
            preparationSteps: [
                'Save any work in progress before the maintenance window',
                'Download any reports you may need during the maintenance',
                'Plan alternative workflows if needed'
            ],
            statusPageUrl: 'https://status.company.com',
            supportContact: 'support@company.com',
            teamName: 'Platform Engineering Team'
        },
        testMode: false,
        enableAnalytics: true,
        channelConfigurations: {
            email: {
                fromAddress: 'maintenance@company.com',
                fromName: 'Platform Team',
                trackOpens: false,
                trackClicks: true
            }
        },
        priority: SOPPriority.HIGH,
        enableComplianceCheck: false,
        enableAuditTrail: true,
        tags: ['maintenance', 'scheduled', 'system']
    }
};

/**
 * Example 5: Template Processing and Validation
 * Example showing template processing and configuration validation
 */
export const templateValidationExample = {
    name: 'Template Processing and Validation',
    description: 'Validate notification configuration and process templates',
    
    configuration: {
        processingMode: NotificationProcessingMode.VALIDATE,
        notificationConfiguration: {
            // ... (same structure as other examples but focused on validation)
            id: 'validation_test',
            name: 'Validation Test',
            description: 'Configuration for testing validation features',
            channels: [NotificationChannel.EMAIL],
            template: {
                id: 'validation_template',
                name: 'Validation Test Template',
                channel: NotificationChannel.EMAIL,
                subject: 'Test: {{testVariable}}',
                content: 'Hello {{userName}}, this is a test with {{missingVariable}}.',
                variables: [
                    { name: 'testVariable', value: 'Test Value', required: true, sensitive: false },
                    { name: 'userName', value: undefined, required: true, sensitive: false }
                    // Note: missingVariable is not defined, should be caught by validation
                ],
                locale: 'en-US',
                version: '1.0.0',
                isActive: true,
                complianceRequired: true,
                createdAt: '2024-01-15T10:00:00.000Z',
                updatedAt: '2024-01-15T10:00:00.000Z'
            } as NotificationTemplate,
            recipients: [
                {
                    id: 'test_recipient',
                    email: 'invalid-email', // Invalid email format
                    name: 'Test User',
                    preferredChannel: NotificationChannel.EMAIL,
                    timezone: 'UTC',
                    locale: 'en-US',
                    metadata: {},
                    optOut: false,
                    consentGiven: false, // No consent for GDPR
                    consentDate: undefined
                }
            ] as NotificationRecipient[],
            priority: NotificationPriority.NORMAL,
            variables: [],
            retryConfig: {
                maxAttempts: 3,
                retryDelay: 300,
                exponentialBackoff: true
            },
            complianceSettings: {
                frameworks: [ComplianceFramework.GDPR],
                auditTrailRequired: true,
                consentRequired: true,
                encryptInTransit: true,
                encryptAtRest: false
            },
            isActive: true,
            version: '1.0.0',
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-01-15T10:00:00.000Z'
        } as NotificationConfiguration,
        variables: {
            testVariable: 'Actual Test Value',
            userName: 'Test User'
            // Note: missingVariable is not provided
        },
        testMode: true,
        enableAnalytics: false,
        complianceFrameworks: [ComplianceFramework.GDPR],
        channelConfigurations: {
            email: {
                fromAddress: 'test@company.com',
                fromName: 'Test System'
            }
        },
        priority: SOPPriority.NORMAL,
        enableComplianceCheck: true,
        enableAuditTrail: true,
        tags: ['test', 'validation']
    }
};

/**
 * Usage Examples Object
 */
export const notificationIntegrationExamples = {
    basicEmailNotification: basicEmailNotificationExample,
    multiChannelUrgentAlert: multiChannelUrgentAlertExample,
    gdprMarketingCampaign: gdprMarketingCampaignExample,
    scheduledMaintenanceNotification: scheduledMaintenanceNotificationExample,
    templateValidation: templateValidationExample
};

/**
 * Example of how to use the notification piece in a workflow
 */
export const workflowUsageExample = `
// Example workflow step using the notification piece
const notificationStep = {
    name: 'send_order_confirmation',
    piece: 'sop_notification',
    settings: {
        processingMode: 'SEND',
        notificationConfiguration: {
            id: 'order_confirmation_001',
            name: 'Order Confirmation',
            channels: ['EMAIL'],
            template: {
                id: 'order_template',
                subject: 'Order Confirmation #{{orderNumber}}',
                content: 'Thank you {{customerName}} for your order #{{orderNumber}}...',
                variables: [
                    { name: 'customerName', required: true },
                    { name: 'orderNumber', required: true }
                ]
            },
            recipients: [
                {
                    id: 'customer',
                    email: '{{customerEmail}}',
                    name: '{{customerName}}'
                }
            ]
        },
        variables: {
            customerName: '{{workflow.customer.name}}',
            customerEmail: '{{workflow.customer.email}}',
            orderNumber: '{{workflow.order.number}}'
        },
        enableAnalytics: true,
        enableAuditTrail: true,
        tags: ['order', 'confirmation']
    }
};
`;
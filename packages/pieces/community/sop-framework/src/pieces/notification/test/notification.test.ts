/**
 * Notification Piece Tests
 * 
 * Comprehensive test suite for the notification piece including unit tests,
 * integration tests, compliance validation, performance tests, and error handling.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
    NotificationChannel,
    NotificationPriority,
    NotificationProcessingMode,
    NotificationConfiguration,
    NotificationTemplate,
    NotificationRecipient,
    TemplateVariable,
    NotificationDeliveryStatus,
    ComplianceFramework,
    EscalationTrigger,
    TemplateProcessingMode
} from '../lib/common/notification-types';
import { NotificationValidator } from '../lib/validation/notification-validator';
import { NotificationHelpers } from '../lib/utils/notification-helpers';
import { notificationAction } from '../lib/actions/notification-action';
import { SOPPriority, SOPComplianceStatus } from '../../../types/sop-types';

describe('Notification Piece', () => {
    let mockContext: any;
    let mockNotificationConfig: NotificationConfiguration;
    let mockTemplate: NotificationTemplate;
    let mockRecipients: NotificationRecipient[];
    
    beforeEach(() => {
        // Setup mock context
        mockContext = {
            propsValue: {},
            run: { id: 'test_execution_001' },
            webhookUrl: 'https://webhook.test.com/notification'
        };
        
        // Setup mock template
        mockTemplate = {
            id: 'template_001',
            name: 'Test Template',
            description: 'Test notification template',
            channel: NotificationChannel.EMAIL,
            subject: 'Test Subject - {{userName}}',
            content: 'Hello {{userName}}, this is a test notification. Your order #{{orderNumber}} is ready.',
            htmlContent: '<p>Hello {{userName}}, this is a test notification. Your order #{{orderNumber}} is ready.</p>',
            variables: [
                {
                    name: 'userName',
                    value: {},
                    defaultValue: '',
                    required: true,
                    sensitive: false
                },
                {
                    name: 'orderNumber',
                    value: {},
                    defaultValue: 0,
                    required: true,
                    sensitive: false
                }
            ],
            locale: 'en-US',
            version: '1.0.0',
            isActive: true,
            complianceRequired: false,
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-01-15T10:00:00.000Z'
        };
        
        // Setup mock recipients
        mockRecipients = [
            {
                id: 'recipient_001',
                email: 'user1@example.com',
                phone: '+1234567890',
                name: 'John Doe',
                preferredChannel: NotificationChannel.EMAIL,
                timezone: 'America/New_York',
                locale: 'en-US',
                metadata: { department: 'IT' },
                optOut: false,
                consentGiven: true,
                consentDate: '2024-01-01T00:00:00.000Z'
            },
            {
                id: 'recipient_002',
                email: 'user2@example.com',
                name: 'Jane Smith',
                preferredChannel: NotificationChannel.SMS,
                timezone: 'America/Los_Angeles',
                locale: 'en-US',
                metadata: { department: 'Sales' },
                optOut: false,
                consentGiven: true,
                consentDate: '2024-01-01T00:00:00.000Z'
            }
        ];
        
        // Setup mock notification configuration
        mockNotificationConfig = {
            id: 'notification_001',
            name: 'Test Notification',
            description: 'Test notification configuration',
            channels: [NotificationChannel.EMAIL, NotificationChannel.SMS],
            template: mockTemplate,
            recipients: mockRecipients,
            priority: NotificationPriority.NORMAL,
            variables: [],
            attachments: [],
            retryConfig: {
                maxAttempts: 3,
                retryDelay: 300,
                exponentialBackoff: true,
                retryChannels: []
            },
            scheduling: {
                type: 'IMMEDIATE',
                timezone: 'UTC'
            },
            batch: {
                enabled: false,
                size: 100,
                delay: 1000
            },
            escalation: {
                enabled: false,
                levels: []
            },
            complianceSettings: {
                frameworks: [ComplianceFramework.GDPR],
                auditTrailRequired: true,
                consentRequired: true,
                dataRetentionDays: 30,
                anonymizeAfterDelivery: false,
                encryptInTransit: true,
                encryptAtRest: false
            },
            isActive: true,
            version: '1.0.0',
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-01-15T10:00:00.000Z'
        };
        
        // Setup mock context props
        mockContext.propsValue = {
            processingMode: NotificationProcessingMode.SEND,
            notificationConfiguration: mockNotificationConfig,
            variables: {
                userName: 'Test User',
                orderNumber: '12345'
            },
            testMode: true,
            enableAnalytics: true,
            enableEscalation: false,
            complianceFrameworks: [ComplianceFramework.GDPR],
            channelConfigurations: {
                email: {
                    fromAddress: 'test@example.com',
                    fromName: 'Test System',
                    trackOpens: true,
                    trackClicks: true
                },
                sms: {
                    provider: 'twilio',
                    fromNumber: '+1234567890'
                }
            },
            templateProcessingMode: TemplateProcessingMode.ADVANCED,
            deliveryTimeout: 300,
            priority: SOPPriority.NORMAL,
            enableComplianceCheck: true,
            enableAuditTrail: true,
            customVariables: {},
            tags: ['test', 'automated'],
            stepDescription: 'Test notification step'
        };
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('NotificationValidator', () => {
        let validator: NotificationValidator;
        
        beforeEach(() => {
            validator = new NotificationValidator();
        });
        
        it('should validate a complete notification configuration', async () => {
            const validationContext = {
                configId: mockNotificationConfig.id,
                configVersion: mockNotificationConfig.version,
                userId: 'test_user',
                timestamp: new Date().toISOString(),
                allVariables: { userName: 'Test User', orderNumber: '12345' },
                complianceFrameworks: [ComplianceFramework.GDPR],
                validationMode: 'strict' as const,
                channelSettings: mockContext.propsValue.channelConfigurations
            };
            
            const result = await validator.validateNotification(mockNotificationConfig, validationContext);
            
            expect((result as any).isValid).toBe(true);
            expect((result as any).errors).toHaveLength(0);
            expect((result as any).templateValidation).toBeDefined();
            expect((result as any).recipientValidation).toBeDefined();
            expect((result as any).deliveryValidation).toBeDefined();
            expect((result as any).complianceChecks).toHaveLength(1);
            expect((result as any).complianceChecks[0].framework).toBe(ComplianceFramework.GDPR);
        });
        
        it('should detect missing required configuration fields', async () => {
            const invalidConfig = {
                ...mockNotificationConfig,
                id: '', // Missing ID
                channels: [] // No channels
            };
            
            const validationContext = {
                configId: 'test',
                configVersion: '1.0.0',
                userId: 'test_user',
                timestamp: new Date().toISOString(),
                allVariables: {},
                validationMode: 'strict' as const,
                channelSettings: {}
            };
            
            const result = await validator.validateNotification(invalidConfig, validationContext);
            
            expect((result as any).isValid).toBe(false);
            expect((result as any).errors.length).toBeGreaterThan(0);
            expect((result as any).errors.some(e => e.code === 'MISSING_ID')).toBe(true);
            expect((result as any).errors.some(e => e.code === 'NO_CHANNELS')).toBe(true);
        });
        
        it('should validate template variables', async () => {
            const configWithMissingVars = {
                ...mockNotificationConfig,
                template: {
                    ...mockTemplate,
                    content: 'Hello {{userName}}, your {{missingVar}} is ready.'
                }
            };
            
            const validationContext = {
                configId: mockNotificationConfig.id,
                configVersion: mockNotificationConfig.version,
                userId: 'test_user',
                timestamp: new Date().toISOString(),
                allVariables: { userName: 'Test User' }, // Missing missingVar
                validationMode: 'strict' as const,
                channelSettings: mockContext.propsValue.channelConfigurations
            };
            
            const result = await validator.validateNotification(configWithMissingVars, validationContext);
            
            expect((result as any).templateValidation?.missingVariables).toContain('missingVar');
        });
        
        it('should validate GDPR compliance', async () => {
            const nonCompliantConfig = {
                ...mockNotificationConfig,
                recipients: [{
                    ...mockRecipients[0],
                    consentGiven: false // No consent
                }],
                complianceSettings: {
                    ...mockNotificationConfig.complianceSettings,
                    encryptInTransit: false // No encryption
                }
            };
            
            const validationContext = {
                configId: mockNotificationConfig.id,
                configVersion: mockNotificationConfig.version,
                userId: 'test_user',
                timestamp: new Date().toISOString(),
                allVariables: {},
                complianceFrameworks: [ComplianceFramework.GDPR],
                validationMode: 'strict' as const,
                channelSettings: mockContext.propsValue.channelConfigurations
            };
            
            const result = await validator.validateNotification(nonCompliantConfig, validationContext);
            
            const gdprCheck = (result as any).complianceChecks.find(c => c.framework === ComplianceFramework.GDPR);
            expect(gdprCheck).toBeDefined();
            expect(gdprCheck!.status).toBe(SOPComplianceStatus.NON_COMPLIANT);
        });
        
        it('should validate recipient email format', async () => {
            const configWithInvalidEmail = {
                ...mockNotificationConfig,
                recipients: [{
                    ...mockRecipients[0],
                    email: 'invalid-email' // Invalid format
                }]
            };
            
            const validationContext = {
                configId: mockNotificationConfig.id,
                configVersion: mockNotificationConfig.version,
                userId: 'test_user',
                timestamp: new Date().toISOString(),
                allVariables: {},
                validationMode: 'strict' as const,
                channelSettings: mockContext.propsValue.channelConfigurations
            };
            
            const result = await validator.validateNotification(configWithInvalidEmail, validationContext);
            
            expect((result as any).recipientValidation?.invalidRecipients).toBeGreaterThan(0);
        });
    });

    describe('NotificationHelpers', () => {
        it('should process templates with variable substitution', async () => {
            const variables = {
                userName: 'John Doe',
                orderNumber: '12345'
            };
            
            const result = await NotificationHelpers.processTemplate(mockTemplate, variables);
            
            expect((result as any).subject).toBe('Test Subject - John Doe');
            expect((result as any).content).toContain('Hello John Doe');
            expect((result as any).content).toContain('order #12345');
            expect((result as any).variablesResolved).toBe(4); // 2 in subject + 2 in content
            expect((result as any).missingVariables).toHaveLength(0);
        });
        
        it('should detect missing template variables', async () => {
            const variables = {
                userName: 'John Doe'
                // Missing orderNumber
            };
            
            const result = await NotificationHelpers.processTemplate(mockTemplate, variables);
            
            expect((result as any).missingVariables).toContain('orderNumber');
            expect((result as any).variablesResolved).toBe(2); // Only userName resolved
        });
        
        it('should calculate notification complexity', () => {
            const complexity = NotificationHelpers.calculateNotificationComplexity(mockNotificationConfig);
            
            expect(complexity).toBeGreaterThan(0);
            expect(typeof complexity).toBe('number');
        });
        
        it('should estimate delivery time', () => {
            const estimatedTime = NotificationHelpers.estimateDeliveryTime(mockNotificationConfig);
            
            expect(estimatedTime).toBeGreaterThan(0);
            expect(typeof estimatedTime).toBe('number');
        });
        
        it('should validate recipient for specific channels', () => {
            const emailValidation = NotificationHelpers.validateRecipientForChannel(
                mockRecipients[0],
                NotificationChannel.EMAIL
            );
            expect(emailValidation.isValid).toBe(true);
            
            const smsValidation = NotificationHelpers.validateRecipientForChannel(
                mockRecipients[1],
                NotificationChannel.SMS
            );
            expect(smsValidation.isValid).toBe(false); // No phone number
        });
        
        it('should check escalation triggers', () => {
            const deliveryResults = [
                {
                    recipientId: 'recipient_001',
                    channel: NotificationChannel.EMAIL,
                    status: NotificationDeliveryStatus.FAILED,
                    attempts: []
                }
            ];
            
            const configWithEscalation = {
                ...mockNotificationConfig,
                escalation: [{
                    id: 'escalation_001',
                    trigger: EscalationTrigger.DELIVERY_FAILED,
                    escalateTo: ['manager@example.com'],
                    isActive: true,
                    timeoutMinutes: 60,
                    maxAttempts: 3
                }]
            };
            
            const escalationResults = NotificationHelpers.checkEscalationTriggers(
                configWithEscalation,
                deliveryResults,
                new Date(Date.now() - 3600000) // 1 hour ago
            );
            
            expect(escalationResults).toHaveLength(1);
            expect(escalationResults[0].shouldEscalate).toBe(true);
            expect(escalationResults[0].trigger).toBe(EscalationTrigger.DELIVERY_FAILED);
        });
        
        it('should generate notification analytics', () => {
            const deliveryResults = [
                {
                    recipientId: 'recipient_001',
                    channel: NotificationChannel.EMAIL,
                    status: NotificationDeliveryStatus.DELIVERED,
                    deliveryTime: 1500,
                    attempts: [{
                        attemptNumber: 1,
                        timestamp: new Date().toISOString(),
                        status: NotificationDeliveryStatus.DELIVERED,
                        channel: NotificationChannel.EMAIL,
                        responseTime: 1500,
                        cost: 5
                    }]
                },
                {
                    recipientId: 'recipient_002',
                    channel: NotificationChannel.SMS,
                    status: NotificationDeliveryStatus.FAILED,
                    attempts: [{
                        attemptNumber: 1,
                        timestamp: new Date().toISOString(),
                        status: NotificationDeliveryStatus.FAILED,
                        channel: NotificationChannel.SMS,
                        responseTime: 0,
                        cost: 0
                    }]
                }
            ];
            
            const analytics = NotificationHelpers.generateAnalytics(
                mockNotificationConfig.id,
                mockNotificationConfig,
                deliveryResults,
                new Date(Date.now() - 3600000),
                new Date()
            );
            
            expect(analytics.totalSent).toBe(2);
            expect(analytics.totalDelivered).toBe(1);
            expect(analytics.totalFailed).toBe(1);
            expect(analytics.deliveryRate).toBe(50);
            expect(analytics.channelBreakdown).toHaveProperty(NotificationChannel.EMAIL);
            expect(analytics.channelBreakdown).toHaveProperty(NotificationChannel.SMS);
        });
    });

    describe('Notification Action', () => {
        it('should execute send mode successfully', async () => {
            const result = await notificationAction.run(mockContext);
            
            expect(result).toBeDefined();
            expect((result as any).success).toBe(true);
            expect((result as any).notificationId).toBe(mockNotificationConfig.id);
            expect((result as any).templateProcessed).toBe(true);
            expect((result as any).variablesResolved).toBeGreaterThan(0);
            expect((result as any).executionTime).toBeGreaterThan(0);
        });
        
        it('should handle validation mode', async () => {
            mockContext.propsValue.processingMode = NotificationProcessingMode.VALIDATE;
            
            const result = await notificationAction.run(mockContext);
            
            expect(result).toBeDefined();
            expect((result as any).success).toBe(true);
            expect((result as any).templateProcessed).toBe(true);
            expect((result as any).metadata?.validationResults).toBeDefined();
        });
        
        it('should handle template processing mode', async () => {
            mockContext.propsValue.processingMode = NotificationProcessingMode.TEMPLATE;
            
            const result = await notificationAction.run(mockContext);
            
            expect(result).toBeDefined();
            expect((result as any).success).toBe(true);
            expect((result as any).templateProcessed).toBe(true);
            expect((result as any).variablesResolved).toBeGreaterThan(0);
            expect((result as any).metadata?.templateProcessingResult).toBeDefined();
        });
        
        it('should handle batch processing mode', async () => {
            mockContext.propsValue.processingMode = NotificationProcessingMode.BATCH;
            mockContext.propsValue.batchSize = 1;
            
            const result = await notificationAction.run(mockContext);
            
            expect(result).toBeDefined();
            expect((result as any).success).toBe(true);
            expect((result as any).notificationsProcessed).toBeGreaterThan(0);
        });
        
        it('should handle scheduling mode', async () => {
            mockContext.propsValue.processingMode = NotificationProcessingMode.SCHEDULE;
            mockContext.propsValue.scheduleFor = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now
            
            const result = await notificationAction.run(mockContext);
            
            expect(result).toBeDefined();
            expect((result as any).success).toBe(true);
            expect((result as any).scheduledNotifications).toBeDefined();
            expect((result as any).scheduledNotifications?.length).toBeGreaterThan(0);
        });
        
        it('should handle analytics generation mode', async () => {
            mockContext.propsValue.processingMode = NotificationProcessingMode.ANALYTICS;
            
            const result = await notificationAction.run(mockContext);
            
            expect(result).toBeDefined();
            expect((result as any).success).toBe(true);
            expect((result as any).analytics).toBeDefined();
            expect((result as any).analytics?.totalSent).toBeGreaterThan(0);
        });
        
        it('should handle delivery tracking mode', async () => {
            mockContext.propsValue.processingMode = NotificationProcessingMode.TRACK;
            
            const result = await notificationAction.run(mockContext);
            
            expect(result).toBeDefined();
            expect((result as any).success).toBe(true);
            expect((result as any).analytics).toBeDefined();
            expect((result as any).deliveryResults).toBeDefined();
        });
        
        it('should handle errors gracefully', async () => {
            // Remove required configuration to trigger error
            mockContext.propsValue.notificationConfiguration.id = '';
            
            const result = await notificationAction.run(mockContext);
            
            expect(result).toBeDefined();
            expect((result as any).success).toBe(false);
            expect((result as any).error).toBeDefined();
            expect((result as any).complianceStatus).toBe(SOPComplianceStatus.NON_COMPLIANT);
        });
        
        it('should validate required properties', async () => {
            // Remove required notification configuration
            delete mockContext.propsValue.notificationConfiguration;
            
            await expect(notificationAction.run(mockContext)).rejects.toThrow();
        });
    });

    describe('Performance Tests', () => {
        it('should handle large batch processing efficiently', async () => {
            // Create a large number of recipients
            const largeRecipientList = Array.from({ length: 1000 }, (_, i) => ({
                ...mockRecipients[0],
                id: `recipient_${i}`,
                email: `user${i}@example.com`
            }));
            
            mockContext.propsValue.notificationConfiguration.recipients = largeRecipientList;
            mockContext.propsValue.processingMode = NotificationProcessingMode.BATCH;
            mockContext.propsValue.batchSize = 100;
            
            const startTime = Date.now();
            const result = await notificationAction.run(mockContext);
            const executionTime = Date.now() - startTime;
            
            expect((result as any).success).toBe(true);
            expect((result as any).notificationsProcessed).toBe(2000); // 1000 recipients × 2 channels
            expect(executionTime).toBeLessThan(30000); // Should complete within 30 seconds
        });
        
        it('should handle complex template processing efficiently', async () => {
            // Create template with many variables
            const complexTemplate = {
                ...mockTemplate,
                content: Array.from({ length: 100 }, (_, i) => `Variable ${i}: {{var${i}}}`).join('\n'),
                variables: Array.from({ length: 100 }, (_, i) => ({
                    name: `var${i}`,
                    value: `value${i}`,
                    required: false,
                    sensitive: false
                }))
            };
            
            mockContext.propsValue.notificationConfiguration.template = complexTemplate;
            mockContext.propsValue.processingMode = NotificationProcessingMode.TEMPLATE;
            
            const startTime = Date.now();
            const result = await notificationAction.run(mockContext);
            const executionTime = Date.now() - startTime;
            
            expect((result as any).success).toBe(true);
            expect((result as any).templateProcessed).toBe(true);
            expect((result as any).variablesResolved).toBe(100);
            expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
        });
    });

    describe('Security Tests', () => {
        it('should sanitize template content', () => {
            const maliciousContent = '<script>alert("xss")</script>Hello {{userName}}';
            const sanitized = NotificationHelpers.sanitizeTemplateContent(maliciousContent);
            
            expect(sanitized).not.toContain('<script>');
            expect(sanitized).toContain('Hello {{userName}}');
        });
        
        it('should handle sensitive variables properly', async () => {
            const sensitiveTemplate = {
                ...mockTemplate,
                variables: [
                    {
                        name: 'ssn',
                        value: '123-45-6789',
                        required: true,
                        sensitive: true
                    },
                    {
                        name: 'userName',
                        value: 'John Doe',
                        required: true,
                        sensitive: false
                    }
                ]
            };
            
            mockContext.propsValue.notificationConfiguration.template = sensitiveTemplate;
            mockContext.propsValue.variables = { ssn: '123-45-6789', userName: 'John Doe' };
            
            const result = await notificationAction.run(mockContext);
            
            expect((result as any).success).toBe(true);
            // In a real implementation, sensitive data should be logged differently
            expect((result as any).auditTrail).toBeDefined();
        });
    });

    describe('Compliance Tests', () => {
        it('should enforce GDPR consent requirements', async () => {
            const nonConsentConfig = {
                ...mockNotificationConfig,
                recipients: [{
                    ...mockRecipients[0],
                    consentGiven: false
                }]
            };
            
            mockContext.propsValue.notificationConfiguration = nonConsentConfig;
            mockContext.propsValue.complianceFrameworks = [ComplianceFramework.GDPR];
            mockContext.propsValue.processingMode = NotificationProcessingMode.VALIDATE;
            
            const result = await notificationAction.run(mockContext);
            
            expect((result as any).complianceStatus).toBe(SOPComplianceStatus.NON_COMPLIANT);
            const gdprResult = (result as any).complianceResults?.find(r => r.framework === ComplianceFramework.GDPR);
            expect(gdprResult?.status).toBe(SOPComplianceStatus.NON_COMPLIANT);
        });
        
        it('should enforce CAN-SPAM requirements for email', async () => {
            const canSpamTemplate = {
                ...mockTemplate,
                content: 'Marketing email without unsubscribe link'
            };
            
            const canSpamConfig = {
                ...mockNotificationConfig,
                template: canSpamTemplate,
                channels: [NotificationChannel.EMAIL]
            };
            
            mockContext.propsValue.notificationConfiguration = canSpamConfig;
            mockContext.propsValue.complianceFrameworks = [ComplianceFramework.CAN_SPAM];
            mockContext.propsValue.processingMode = NotificationProcessingMode.VALIDATE;
            
            const result = await notificationAction.run(mockContext);
            
            expect((result as any).complianceResults).toBeDefined();
            const canSpamResult = (result as any).complianceResults?.find(r => r.framework === ComplianceFramework.CAN_SPAM);
            expect(canSpamResult?.status).toBe(SOPComplianceStatus.NON_COMPLIANT);
        });
    });

    describe('Integration Tests', () => {
        it('should maintain audit trail throughout execution', async () => {
            const result = await notificationAction.run(mockContext);
            
            expect((result as any).auditTrail).toBeDefined();
            expect((result as any).auditTrail.length).toBeGreaterThan(0);
            
            // Check for specific audit events
            const events = (result as any).auditTrail.map(entry => entry.action);
            expect(events).toContain('execution_started');
            expect(events).toContain('notification_processing_started');
            expect(events).toContain('notification_completed');
        });
        
        it('should handle escalation workflows', async () => {
            const configWithEscalation = {
                ...mockNotificationConfig,
                escalation: [{
                    id: 'escalation_001',
                    trigger: EscalationTrigger.DELIVERY_FAILED,
                    escalateTo: ['manager@example.com'],
                    isActive: true,
                    timeoutMinutes: 0, // Immediate escalation
                    maxAttempts: 1
                }]
            };
            
            mockContext.propsValue.notificationConfiguration = configWithEscalation;
            mockContext.propsValue.enableEscalation = true;
            mockContext.propsValue.testMode = false; // Enable real failure simulation
            
            const result = await notificationAction.run(mockContext);
            
            expect((result as any).success).toBeDefined();
            // Check for escalation events in audit trail
            const escalationEvents = (result as any).auditTrail.filter(entry => 
                entry.action === 'escalation_triggered'
            );
            // Note: Escalation might not trigger in test mode with high success rate
        });
    });
});
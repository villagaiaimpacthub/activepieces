/**
 * Notification Helpers
 * 
 * Utility functions for notification processing, template rendering, delivery tracking,
 * analytics calculation, and compliance management within the SOP notification system.
 */

import {
    NotificationChannel,
    NotificationPriority,
    NotificationConfiguration,
    NotificationTemplate,
    NotificationRecipient,
    TemplateVariable,
    NotificationDeliveryStatus,
    DeliveryAttempt,
    NotificationAnalytics,
    EscalationTrigger,
    ComplianceFramework,
    NotificationAttachment,
    SchedulingConfiguration
} from '../common/notification-types';
import { nanoid } from 'nanoid';

/**
 * Template Processing Result
 */
export interface TemplateProcessingResult {
    subject?: string;
    content: string;
    htmlContent?: string;
    variablesResolved: number;
    missingVariables: string[];
    processingTime: number;
}

/**
 * Delivery Metrics
 */
export interface DeliveryMetrics {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    totalBounced: number;
    deliveryRate: number;
    averageDeliveryTime: number;
    channelBreakdown: Record<string, {
        sent: number;
        delivered: number;
        failed: number;
        averageTime: number;
    }>;
}

/**
 * Escalation Check Result
 */
export interface EscalationCheckResult {
    shouldEscalate: boolean;
    trigger: EscalationTrigger;
    reason: string;
    escalateTo: string[];
    newPriority?: NotificationPriority;
}

/**
 * Main Notification Helpers Class
 */
export class NotificationHelpers {
    private static readonly VARIABLE_REGEX = /\{\{([^}]+)\}\}/g;
    private static readonly DATE_FORMATS = {
        'date': (value: any) => new Date(value).toLocaleDateString(),
        'datetime': (value: any) => new Date(value).toLocaleString(),
        'time': (value: any) => new Date(value).toLocaleTimeString(),
        'currency': (value: any, currency = 'USD') => new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency
        }).format(value),
        'number': (value: any) => new Intl.NumberFormat().format(value),
        'percentage': (value: any) => `${(value * 100).toFixed(2)}%`
    };

    /**
     * Generate unique notification ID
     */
    static generateNotificationId(prefix?: string): string {
        const timestamp = Date.now().toString(36);
        const random = nanoid(8);
        return prefix ? `${prefix}_${timestamp}_${random}` : `notif_${timestamp}_${random}`;
    }

    /**
     * Generate unique submission ID
     */
    static generateSubmissionId(notificationId: string): string {
        const timestamp = Date.now().toString(36);
        const random = nanoid(6);
        return `${notificationId}_sub_${timestamp}_${random}`;
    }

    /**
     * Process notification template with variables
     */
    static async processTemplate(
        template: NotificationTemplate,
        variables: Record<string, any>,
        locale: string = 'en-US'
    ): Promise<TemplateProcessingResult> {
        const startTime = Date.now();
        const result: TemplateProcessingResult = {
            content: template.content,
            htmlContent: template.htmlContent,
            subject: template.subject,
            variablesResolved: 0,
            missingVariables: [],
            processingTime: 0
        };

        try {
            // Create variable context with template variables and runtime variables
            const variableContext = this.createVariableContext(template.variables, variables);

            // Process subject if present
            if (template.subject) {
                const subjectResult = this.processTemplateString(template.subject, variableContext);
                result.subject = subjectResult.processed;
                result.variablesResolved += subjectResult.resolved;
                result.missingVariables.push(...subjectResult.missing);
            }

            // Process content
            const contentResult = this.processTemplateString(template.content, variableContext);
            result.content = contentResult.processed;
            result.variablesResolved += contentResult.resolved;
            result.missingVariables.push(...contentResult.missing);

            // Process HTML content if present
            if (template.htmlContent) {
                const htmlResult = this.processTemplateString(template.htmlContent, variableContext);
                result.htmlContent = htmlResult.processed;
                result.variablesResolved += htmlResult.resolved;
                result.missingVariables.push(...htmlResult.missing);
            }

            // Remove duplicates from missing variables
            result.missingVariables = [...new Set(result.missingVariables)];

        } catch (error: any) {
            console.error('Template processing error:', error);
            throw new Error(`Template processing failed: ${error.message}`);
        }

        result.processingTime = Date.now() - startTime;
        return result;
    }

    /**
     * Create variable context for template processing
     */
    private static createVariableContext(
        templateVariables: TemplateVariable[],
        runtimeVariables: Record<string, any>
    ): Record<string, any> {
        const context: Record<string, any> = {};

        // Add template variables with their default values
        for (const variable of templateVariables) {
            if (runtimeVariables.hasOwnProperty(variable.name)) {
                context[variable.name] = runtimeVariables[variable.name];
            } else if (variable.value !== undefined) {
                context[variable.name] = variable.value;
            } else if (variable.defaultValue !== undefined) {
                context[variable.name] = variable.defaultValue;
            }
        }

        // Add runtime variables
        Object.assign(context, runtimeVariables);

        // Add system variables
        context.timestamp = new Date().toISOString();
        context.currentDate = new Date().toLocaleDateString();
        context.currentTime = new Date().toLocaleTimeString();
        context.year = new Date().getFullYear();
        context.month = new Date().getMonth() + 1;
        context.day = new Date().getDate();

        return context;
    }

    /**
     * Process template string with variable substitution
     */
    private static processTemplateString(
        template: string,
        variables: Record<string, any>
    ): { processed: string; resolved: number; missing: string[] } {
        let resolved = 0;
        const missing: string[] = [];

        const processed = template.replace(this.VARIABLE_REGEX, (match, variableName) => {
            const trimmedName = variableName.trim();
            
            // Handle formatted variables (e.g., {{date:myDate}}, {{currency:amount:USD}})
            const formatMatch = trimmedName.match(/^(\w+):(.+)$/);
            if (formatMatch) {
                const [, format, varName] = formatMatch;
                const parts = varName.split(':');
                const actualVarName = parts[0];
                const formatParam = parts[1];

                if (variables.hasOwnProperty(actualVarName)) {
                    const value = variables[actualVarName];
                    const formatter = this.DATE_FORMATS[format as keyof typeof this.DATE_FORMATS];
                    if (formatter) {
                        resolved++;
                        return formatter(value, formatParam);
                    }
                }
            }

            // Handle regular variables
            if (variables.hasOwnProperty(trimmedName)) {
                resolved++;
                const value = variables[trimmedName];
                return value !== null && value !== undefined ? String(value) : '';
            } else {
                missing.push(trimmedName);
                return match; // Keep placeholder if variable not found
            }
        });

        return { processed, resolved, missing };
    }

    /**
     * Calculate notification complexity score
     */
    static calculateNotificationComplexity(config: NotificationConfiguration): number {
        let complexity = 0;

        // Base complexity for channels
        complexity += config.channels.length * 10;

        // Template complexity
        complexity += config.template.variables.length * 5;
        complexity += (config.template.content.length / 100);
        if (config.template.htmlContent) {
            complexity += (config.template.htmlContent.length / 100);
        }

        // Recipients complexity
        complexity += config.recipients.length * 2;

        // Advanced features complexity
        if (config.scheduling?.recurring) complexity += 20;
        if (config.batch) complexity += 15;
        if (config.escalation && config.escalation.length > 0) complexity += config.escalation.length * 10;
        if (config.attachments && config.attachments.length > 0) complexity += config.attachments.length * 5;

        // Compliance complexity
        complexity += config.complianceSettings.frameworks.length * 10;

        return Math.round(complexity);
    }

    /**
     * Estimate delivery time based on configuration
     */
    static estimateDeliveryTime(config: NotificationConfiguration): number {
        let baseTime = 0;

        // Channel-specific base times (in seconds)
        const channelTimes = {
            [NotificationChannel.EMAIL]: 5,
            [NotificationChannel.SMS]: 3,
            [NotificationChannel.SLACK]: 2,
            [NotificationChannel.TEAMS]: 2,
            [NotificationChannel.WEBHOOK]: 1,
            [NotificationChannel.PUSH]: 1,
            [NotificationChannel.IN_APP]: 1,
            [NotificationChannel.DESKTOP]: 2,
            [NotificationChannel.VOICE]: 30,
            [NotificationChannel.FAX]: 60
        };

        // Calculate base time for all channels
        for (const channel of config.channels) {
            baseTime += channelTimes[channel] || 5;
        }

        // Factor in recipients
        const recipientFactor = Math.log10(config.recipients.length + 1);
        baseTime *= recipientFactor;

        // Factor in template complexity
        const templateFactor = 1 + (config.template.variables.length * 0.1);
        baseTime *= templateFactor;

        // Factor in batch processing
        if (config.batch) {
            const batchFactor = Math.ceil(config.recipients.length / config.batch.batchSize);
            baseTime += (batchFactor - 1) * config.batch.batchInterval;
        }

        // Factor in compliance processing
        if (config.complianceSettings.frameworks.length > 0) {
            baseTime *= (1 + config.complianceSettings.frameworks.length * 0.2);
        }

        return Math.round(baseTime);
    }

    /**
     * Calculate delivery metrics from attempts
     */
    static calculateDeliveryMetrics(
        deliveryResults: Array<{
            recipientId: string;
            channel: NotificationChannel;
            status: NotificationDeliveryStatus;
            deliveryTime?: number;
            attempts: DeliveryAttempt[];
        }>
    ): DeliveryMetrics {
        const metrics: DeliveryMetrics = {
            totalSent: deliveryResults.length,
            totalDelivered: 0,
            totalFailed: 0,
            totalBounced: 0,
            deliveryRate: 0,
            averageDeliveryTime: 0,
            channelBreakdown: {}
        };

        let totalDeliveryTime = 0;
        let deliveredCount = 0;

        for (const result of deliveryResults) {
            // Count by status
            switch (result.status) {
                case NotificationDeliveryStatus.DELIVERED:
                case NotificationDeliveryStatus.READ:
                case NotificationDeliveryStatus.CLICKED:
                case NotificationDeliveryStatus.CONVERTED:
                    metrics.totalDelivered++;
                    if (result.deliveryTime) {
                        totalDeliveryTime += result.deliveryTime;
                        deliveredCount++;
                    }
                    break;
                case NotificationDeliveryStatus.BOUNCED:
                    metrics.totalBounced++;
                    break;
                case NotificationDeliveryStatus.FAILED:
                case NotificationDeliveryStatus.SPAM:
                case NotificationDeliveryStatus.BLOCKED:
                    metrics.totalFailed++;
                    break;
            }

            // Channel breakdown
            const channelKey = result.channel;
            if (!metrics.channelBreakdown[channelKey]) {
                metrics.channelBreakdown[channelKey] = {
                    sent: 0,
                    delivered: 0,
                    failed: 0,
                    averageTime: 0
                };
            }

            metrics.channelBreakdown[channelKey].sent++;
            
            if (result.status === NotificationDeliveryStatus.DELIVERED) {
                metrics.channelBreakdown[channelKey].delivered++;
                if (result.deliveryTime) {
                    metrics.channelBreakdown[channelKey].averageTime += result.deliveryTime;
                }
            } else if ([
                NotificationDeliveryStatus.FAILED,
                NotificationDeliveryStatus.BOUNCED,
                NotificationDeliveryStatus.SPAM,
                NotificationDeliveryStatus.BLOCKED
            ].includes(result.status)) {
                metrics.channelBreakdown[channelKey].failed++;
            }
        }

        // Calculate rates and averages
        metrics.deliveryRate = metrics.totalSent > 0 ? 
            (metrics.totalDelivered / metrics.totalSent) * 100 : 0;
        
        metrics.averageDeliveryTime = deliveredCount > 0 ? 
            totalDeliveryTime / deliveredCount : 0;

        // Calculate channel averages
        for (const channel in metrics.channelBreakdown) {
            const channelData = metrics.channelBreakdown[channel];
            if (channelData.delivered > 0) {
                channelData.averageTime /= channelData.delivered;
            }
        }

        return metrics;
    }

    /**
     * Check if escalation should occur
     */
    static checkEscalationTriggers(
        config: NotificationConfiguration,
        deliveryResults: Array<{
            recipientId: string;
            channel: NotificationChannel;
            status: NotificationDeliveryStatus;
            attempts: DeliveryAttempt[];
        }>,
        startTime: Date
    ): EscalationCheckResult[] {
        const results: EscalationCheckResult[] = [];

        if (!config.escalation || config.escalation.length === 0) {
            return results;
        }

        const now = new Date();
        const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);

        for (const rule of config.escalation) {
            if (!rule.isActive) continue;

            let shouldEscalate = false;
            let reason = '';

            switch (rule.trigger) {
                case EscalationTrigger.TIME_ELAPSED:
                    if (rule.timeoutMinutes && elapsedMinutes >= rule.timeoutMinutes) {
                        shouldEscalate = true;
                        reason = `Time elapsed (${elapsedMinutes.toFixed(1)} minutes) exceeded threshold (${rule.timeoutMinutes} minutes)`;
                    }
                    break;

                case EscalationTrigger.DELIVERY_FAILED:
                    const failedCount = deliveryResults.filter(r => 
                        [NotificationDeliveryStatus.FAILED, NotificationDeliveryStatus.BOUNCED].includes(r.status)
                    ).length;
                    const failureRate = deliveryResults.length > 0 ? failedCount / deliveryResults.length : 0;
                    
                    if (failureRate > 0.5) { // More than 50% failed
                        shouldEscalate = true;
                        reason = `High failure rate (${(failureRate * 100).toFixed(1)}%)`;
                    }
                    break;

                case EscalationTrigger.NO_RESPONSE:
                    const responseCount = deliveryResults.filter(r =>
                        [NotificationDeliveryStatus.READ, NotificationDeliveryStatus.CLICKED].includes(r.status)
                    ).length;
                    
                    if (responseCount === 0 && deliveryResults.length > 0) {
                        shouldEscalate = true;
                        reason = 'No recipient responses detected';
                    }
                    break;

                case EscalationTrigger.PRIORITY_INCREASED:
                    if (config.priority === NotificationPriority.CRITICAL || config.priority === NotificationPriority.URGENT) {
                        shouldEscalate = true;
                        reason = `High priority notification (${config.priority})`;
                    }
                    break;
            }

            if (shouldEscalate) {
                results.push({
                    shouldEscalate: true,
                    trigger: rule.trigger,
                    reason,
                    escalateTo: rule.escalateTo,
                    newPriority: rule.newPriority
                });
            }
        }

        return results;
    }

    /**
     * Generate notification analytics
     */
    static generateAnalytics(
        notificationId: string,
        config: NotificationConfiguration,
        deliveryResults: Array<{
            recipientId: string;
            channel: NotificationChannel;
            status: NotificationDeliveryStatus;
            deliveryTime?: number;
            attempts: DeliveryAttempt[];
        }>,
        startTime: Date,
        endTime: Date
    ): NotificationAnalytics {
        const metrics = this.calculateDeliveryMetrics(deliveryResults);
        
        // Count engagement metrics
        const openedCount = deliveryResults.filter(r => 
            [NotificationDeliveryStatus.READ, NotificationDeliveryStatus.CLICKED, NotificationDeliveryStatus.CONVERTED].includes(r.status)
        ).length;
        
        const clickedCount = deliveryResults.filter(r => 
            [NotificationDeliveryStatus.CLICKED, NotificationDeliveryStatus.CONVERTED].includes(r.status)
        ).length;
        
        const convertedCount = deliveryResults.filter(r => 
            r.status === NotificationDeliveryStatus.CONVERTED
        ).length;

        // Calculate costs (simplified - would integrate with actual provider costs)
        let totalCost = 0;
        for (const result of deliveryResults) {
            for (const attempt of result.attempts) {
                totalCost += attempt.cost || 0;
            }
        }

        // Generate time series data (hourly breakdown)
        const timeSeriesData = this.generateTimeSeriesData(deliveryResults, startTime, endTime);

        return {
            notificationId,
            totalSent: metrics.totalSent,
            totalDelivered: metrics.totalDelivered,
            totalFailed: metrics.totalFailed,
            totalBounced: metrics.totalBounced,
            totalOpened: openedCount,
            totalClicked: clickedCount,
            totalConverted: convertedCount,
            deliveryRate: metrics.deliveryRate,
            openRate: metrics.totalDelivered > 0 ? (openedCount / metrics.totalDelivered) * 100 : 0,
            clickRate: openedCount > 0 ? (clickedCount / openedCount) * 100 : 0,
            conversionRate: clickedCount > 0 ? (convertedCount / clickedCount) * 100 : 0,
            averageDeliveryTime: metrics.averageDeliveryTime,
            costPerNotification: metrics.totalSent > 0 ? totalCost / metrics.totalSent : 0,
            channelBreakdown: Object.fromEntries(
                Object.entries(metrics.channelBreakdown).map(([channel, data]) => [
                    channel,
                    {
                        sent: data.sent,
                        delivered: data.delivered,
                        failed: data.failed,
                        cost: 0 // Would calculate from actual attempts
                    }
                ])
            ),
            timeSeriesData
        };
    }

    /**
     * Generate time series data for analytics
     */
    private static generateTimeSeriesData(
        deliveryResults: Array<{
            recipientId: string;
            channel: NotificationChannel;
            status: NotificationDeliveryStatus;
            attempts: DeliveryAttempt[];
        }>,
        startTime: Date,
        endTime: Date
    ): NotificationAnalytics['timeSeriesData'] {
        const timeSeriesData: NotificationAnalytics['timeSeriesData'] = [];
        const hourlyData: Record<string, { sent: number; delivered: number; failed: number }> = {};

        // Initialize hourly buckets
        const current = new Date(startTime);
        while (current <= endTime) {
            const hourKey = current.toISOString().substring(0, 13) + ':00:00.000Z';
            hourlyData[hourKey] = { sent: 0, delivered: 0, failed: 0 };
            current.setHours(current.getHours() + 1);
        }

        // Aggregate data by hour
        for (const result of deliveryResults) {
            for (const attempt of result.attempts) {
                const attemptTime = new Date(attempt.timestamp);
                const hourKey = attemptTime.toISOString().substring(0, 13) + ':00:00.000Z';
                
                if (hourlyData[hourKey]) {
                    hourlyData[hourKey].sent++;
                    
                    if (attempt.status === NotificationDeliveryStatus.DELIVERED) {
                        hourlyData[hourKey].delivered++;
                    } else if ([
                        NotificationDeliveryStatus.FAILED,
                        NotificationDeliveryStatus.BOUNCED,
                        NotificationDeliveryStatus.SPAM,
                        NotificationDeliveryStatus.BLOCKED
                    ].includes(attempt.status)) {
                        hourlyData[hourKey].failed++;
                    }
                }
            }
        }

        // Convert to array format
        for (const [timestamp, data] of Object.entries(hourlyData)) {
            timeSeriesData.push({
                timestamp,
                sent: data.sent,
                delivered: data.delivered,
                failed: data.failed
            });
        }

        return timeSeriesData;
    }

    /**
     * Validate recipient for specific channel
     */
    static validateRecipientForChannel(
        recipient: NotificationRecipient,
        channel: NotificationChannel
    ): { isValid: boolean; reason?: string } {
        switch (channel) {
            case NotificationChannel.EMAIL:
                if (!recipient.email) {
                    return { isValid: false, reason: 'Email address is required for email notifications' };
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email)) {
                    return { isValid: false, reason: 'Invalid email address format' };
                }
                break;

            case NotificationChannel.SMS:
                if (!recipient.phone) {
                    return { isValid: false, reason: 'Phone number is required for SMS notifications' };
                }
                if (!/^[\+]?[1-9][\d]{0,15}$/.test(recipient.phone)) {
                    return { isValid: false, reason: 'Invalid phone number format' };
                }
                break;

            case NotificationChannel.SLACK:
            case NotificationChannel.TEAMS:
            case NotificationChannel.IN_APP:
                if (!recipient.userId) {
                    return { isValid: false, reason: 'User ID is required for this channel' };
                }
                break;

            default:
                // For other channels, basic validation
                if (!recipient.email && !recipient.phone && !recipient.userId) {
                    return { isValid: false, reason: 'At least one contact method is required' };
                }
        }

        // Check opt-out status
        if (recipient.optOut) {
            return { isValid: false, reason: 'Recipient has opted out of notifications' };
        }

        return { isValid: true };
    }

    /**
     * Generate unsubscribe URL
     */
    static generateUnsubscribeUrl(
        recipientId: string,
        notificationId: string,
        baseUrl: string = 'https://notifications.example.com'
    ): string {
        const token = Buffer.from(`${recipientId}:${notificationId}:${Date.now()}`).toString('base64url');
        return `${baseUrl}/unsubscribe?token=${token}`;
    }

    /**
     * Calculate next scheduled send time for recurring notifications
     */
    static calculateNextScheduledTime(
        config: SchedulingConfiguration,
        lastSentTime?: Date
    ): Date | null {
        if (!config.recurring || !config.recurringPattern) {
            return null;
        }

        const baseTime = lastSentTime || new Date();
        const pattern = config.recurringPattern;
        const next = new Date(baseTime);

        switch (pattern.frequency) {
            case 'daily':
                next.setDate(next.getDate() + pattern.interval);
                break;
            case 'weekly':
                next.setDate(next.getDate() + (pattern.interval * 7));
                break;
            case 'monthly':
                next.setMonth(next.getMonth() + pattern.interval);
                break;
            case 'yearly':
                next.setFullYear(next.getFullYear() + pattern.interval);
                break;
        }

        // Check end conditions
        if (pattern.endDate && next > new Date(pattern.endDate)) {
            return null;
        }

        return next;
    }

    /**
     * Format file size for display
     */
    static formatFileSize(bytes: number): string {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Sanitize template content for security
     */
    static sanitizeTemplateContent(content: string): string {
        // Remove potential script tags and other dangerous HTML
        return content
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }

    /**
     * Get optimal send time for recipient timezone
     */
    static getOptimalSendTime(
        scheduledTime: Date,
        recipientTimezone: string,
        quietHours?: { startTime: string; endTime: string }
    ): Date {
        if (!quietHours) {
            return scheduledTime;
        }

        // Convert to recipient timezone
        const recipientTime = new Date(scheduledTime.toLocaleString('en-US', { timeZone: recipientTimezone }));
        const currentHour = recipientTime.getHours();
        const currentMinute = recipientTime.getMinutes();
        
        const [quietStartHour, quietStartMinute] = quietHours.startTime.split(':').map(Number);
        const [quietEndHour, quietEndMinute] = quietHours.endTime.split(':').map(Number);
        
        const currentTimeMinutes = currentHour * 60 + currentMinute;
        const quietStartMinutes = quietStartHour * 60 + quietStartMinute;
        const quietEndMinutes = quietEndHour * 60 + quietEndMinute;
        
        // Check if current time is in quiet hours
        const isInQuietHours = quietStartMinutes <= quietEndMinutes ?
            (currentTimeMinutes >= quietStartMinutes && currentTimeMinutes <= quietEndMinutes) :
            (currentTimeMinutes >= quietStartMinutes || currentTimeMinutes <= quietEndMinutes);
        
        if (isInQuietHours) {
            // Schedule for after quiet hours
            const newSendTime = new Date(recipientTime);
            newSendTime.setHours(quietEndHour, quietEndMinute, 0, 0);
            
            // If quiet hours end is before current time (next day scenario), add a day
            if (quietEndMinutes < currentTimeMinutes && quietStartMinutes > quietEndMinutes) {
                newSendTime.setDate(newSendTime.getDate() + 1);
            }
            
            return newSendTime;
        }
        
        return scheduledTime;
    }
}
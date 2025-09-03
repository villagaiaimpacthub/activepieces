/**
 * SOP Formatting Utilities
 */

import {
    SOPExecutionState,
    SOPPriority,
    SOPComplianceStatus,
    SOPPieceCategory,
    SOPPieceType,
    SOPMetadata,
    SOPExecutionContext
} from '../types/sop-types';
import { formatDuration, formatFileSize } from './sop-helpers';

/**
 * Format execution state for display
 */
export function formatExecutionState(state: SOPExecutionState): string {
    const stateMap: Record<SOPExecutionState, string> = {
        [SOPExecutionState.PENDING]: '🔄 Pending',
        [SOPExecutionState.IN_PROGRESS]: '▶️ In Progress',
        [SOPExecutionState.WAITING_APPROVAL]: '⏸️ Waiting for Approval',
        [SOPExecutionState.APPROVED]: '✅ Approved',
        [SOPExecutionState.REJECTED]: '❌ Rejected',
        [SOPExecutionState.ESCALATED]: '⚠️ Escalated',
        [SOPExecutionState.COMPLETED]: '✅ Completed',
        [SOPExecutionState.FAILED]: '❌ Failed',
        [SOPExecutionState.CANCELLED]: '⏹️ Cancelled',
        [SOPExecutionState.PAUSED]: '⏸️ Paused'
    };
    return stateMap[state] || state;
}

/**
 * Format priority for display
 */
export function formatPriority(priority: SOPPriority): string {
    const priorityMap: Record<SOPPriority, string> = {
        [SOPPriority.LOW]: '🟢 Low',
        [SOPPriority.NORMAL]: '🔵 Normal',
        [SOPPriority.HIGH]: '🟡 High',
        [SOPPriority.URGENT]: '🟠 Urgent',
        [SOPPriority.CRITICAL]: '🔴 Critical'
    };
    return priorityMap[priority] || priority;
}

/**
 * Format compliance status for display
 */
export function formatComplianceStatus(status: SOPComplianceStatus): string {
    const statusMap: Record<SOPComplianceStatus, string> = {
        [SOPComplianceStatus.COMPLIANT]: '✅ Compliant',
        [SOPComplianceStatus.NON_COMPLIANT]: '❌ Non-Compliant',
        [SOPComplianceStatus.PENDING_REVIEW]: '🔄 Pending Review',
        [SOPComplianceStatus.REQUIRES_ATTENTION]: '⚠️ Requires Attention',
        [SOPComplianceStatus.EXEMPT]: '🛡️ Exempt'
    };
    return statusMap[status] || status;
}

/**
 * Format piece category for display
 */
export function formatPieceCategory(category: SOPPieceCategory): string {
    const categoryMap: Record<SOPPieceCategory, string> = {
        [SOPPieceCategory.PROCESS_MANAGEMENT]: '📊 Process Management',
        [SOPPieceCategory.APPROVAL_WORKFLOWS]: '✅ Approval Workflows',
        [SOPPieceCategory.COMPLIANCE]: '📜 Compliance',
        [SOPPieceCategory.QUALITY_ASSURANCE]: '🔍 Quality Assurance',
        [SOPPieceCategory.DOCUMENTATION]: '📄 Documentation',
        [SOPPieceCategory.AUDIT_TRAIL]: '📅 Audit Trail',
        [SOPPieceCategory.DECISION_SUPPORT]: '🧠 Decision Support',
        [SOPPieceCategory.ESCALATION]: '⚠️ Escalation'
    };
    return categoryMap[category] || category;
}

/**
 * Format piece type for display
 */
export function formatPieceType(type: SOPPieceType): string {
    const typeMap: Record<SOPPieceType, string> = {
        [SOPPieceType.PROCESS_STEP]: '📖 Process Step',
        [SOPPieceType.DECISION_POINT]: '🧩 Decision Point',
        [SOPPieceType.APPROVAL_GATE]: '🚪 Approval Gate',
        [SOPPieceType.ESCALATION_TRIGGER]: '🚨 Escalation Trigger',
        [SOPPieceType.COMPLIANCE_CHECK]: '☑️ Compliance Check',
        [SOPPieceType.AUDIT_LOG]: '📅 Audit Log',
        [SOPPieceType.NOTIFICATION]: '🔔 Notification',
        [SOPPieceType.DATA_VALIDATION]: '✅ Data Validation',
        [SOPPieceType.DOCUMENT_GENERATOR]: '📄 Document Generator',
        [SOPPieceType.STATUS_TRACKER]: '📈 Status Tracker'
    };
    return typeMap[type] || type;
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string, options?: {
    includeTime?: boolean;
    includeSeconds?: boolean;
    timezone?: string;
    format?: 'short' | 'long' | 'iso';
}): string {
    const opts = {
        includeTime: true,
        includeSeconds: false,
        format: 'short' as const,
        ...options
    };

    try {
        const date = new Date(dateStr);
        
        if (opts.format === 'iso') {
            return date.toISOString();
        }
        
        const dateOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: opts.format === 'long' ? 'long' : 'short',
            day: 'numeric'
        };
        
        if (opts.includeTime) {
            dateOptions.hour = '2-digit';
            dateOptions.minute = '2-digit';
            
            if (opts.includeSeconds) {
                dateOptions.second = '2-digit';
            }
        }
        
        if (opts.timezone) {
            dateOptions.timeZone = opts.timezone;
        }
        
        return date.toLocaleDateString('en-US', dateOptions);
    } catch {
        return dateStr;
    }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        
        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
        
        if (years > 0) {
            return `${years} year${years > 1 ? 's' : ''} ago`;
        } else if (months > 0) {
            return `${months} month${months > 1 ? 's' : ''} ago`;
        } else if (weeks > 0) {
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (seconds > 0) {
            return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    } catch {
        return dateStr;
    }
}

/**
 * Format SOP metadata summary
 */
export function formatSOPMetadataSummary(metadata: SOPMetadata): string {
    const lines = [
        `🏷️ **${metadata.title}** (v${metadata.version})`,
        `🏢 ${formatPieceCategory(metadata.category)}`,
        `🔧 ${formatPieceType(metadata.pieceType)}`,
        `🔹 ${formatPriority(metadata.priority)}`
    ];
    
    if (metadata.description) {
        lines.push(`📄 ${metadata.description}`);
    }
    
    if (metadata.department) {
        lines.push(`🏢 Department: ${metadata.department}`);
    }
    
    if (metadata.tags.length > 0) {
        lines.push(`🏷️ Tags: ${metadata.tags.join(', ')}`);
    }
    
    lines.push(`📅 Created: ${formatDate(metadata.createdAt)} by ${metadata.createdBy}`);
    lines.push(`🔄 Updated: ${formatDate(metadata.updatedAt)}`);
    
    return lines.join('\n');
}

/**
 * Format execution context summary
 */
export function formatExecutionContextSummary(context: SOPExecutionContext): string {
    const lines = [
        `🏷️ **Execution Summary**`,
        `🆔 ID: ${context.executionId}`,
        `📖 SOP: ${context.sopMetadata.title}`,
        `📊 Status: ${formatExecutionState(context.currentState)}`,
        `👥 Executed by: ${context.executedBy}`
    ];
    
    if (context.assignedTo) {
        lines.push(`🎯 Assigned to: ${context.assignedTo}`);
    }
    
    lines.push(`▶️ Started: ${formatDate(context.startedAt)}`);
    
    if (context.completedAt) {
        const duration = new Date(context.completedAt).getTime() - new Date(context.startedAt).getTime();
        lines.push(`⏹️ Completed: ${formatDate(context.completedAt)}`);
        lines.push(`⏱️ Duration: ${formatDuration(duration)}`);
    }
    
    lines.push(`📈 Priority: ${formatPriority(context.sopMetadata.priority)}`);
    lines.push(`☑️ Compliance: ${formatComplianceStatus(context.complianceStatus)}`);
    
    if (context.escalationLevel > 0) {
        lines.push(`⚠️ Escalation Level: ${context.escalationLevel}`);
    }
    
    if (context.auditTrail.length > 0) {
        lines.push(`📅 Audit Entries: ${context.auditTrail.length}`);
    }
    
    return lines.join('\n');
}

/**
 * Format audit trail entry
 */
export function formatAuditTrailEntry(entry: {
    timestamp: string;
    action: string;
    userId: string;
    details: Record<string, unknown>;
}): string {
    const timestamp = formatDate(entry.timestamp, { includeSeconds: true });
    const action = entry.action.replace(/_/g, ' ').toUpperCase();
    
    let formatted = `[${timestamp}] ${action} by ${entry.userId}`;
    
    if (Object.keys(entry.details).length > 0) {
        const details = Object.entries(entry.details)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        formatted += ` (${details})`;
    }
    
    return formatted;
}

/**
 * Format validation errors
 */
export function formatValidationErrors(errors: Array<{
    field: string;
    message: string;
    code: string;
    severity: 'error' | 'warning' | 'info';
}>): string {
    const errorsByField = new Map<string, typeof errors>();
    
    // Group by field
    errors.forEach(error => {
        if (!errorsByField.has(error.field)) {
            errorsByField.set(error.field, []);
        }
        errorsByField.get(error.field)!.push(error);
    });
    
    const lines: string[] = [];
    
    for (const [field, fieldErrors] of errorsByField) {
        lines.push(`🔸 **${field}**:`);
        fieldErrors.forEach(error => {
            const icon = error.severity === 'error' ? '❌' : 
                        error.severity === 'warning' ? '⚠️' : 'ℹ️';
            lines.push(`  ${icon} ${error.message} (${error.code})`);
        });
    }
    
    return lines.join('\n');
}

/**
 * Format execution statistics
 */
export function formatExecutionStatistics(stats: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    activeExecutions: number;
    totalRetries: number;
}): string {
    const successRate = stats.totalExecutions > 0 
        ? Math.round((stats.successfulExecutions / stats.totalExecutions) * 100)
        : 0;
    
    return [
        `📊 **Execution Statistics**`,
        `🔢 Total: ${stats.totalExecutions}`,
        `✅ Successful: ${stats.successfulExecutions} (${successRate}%)`,
        `❌ Failed: ${stats.failedExecutions}`,
        `🏃 Active: ${stats.activeExecutions}`,
        `⏱️ Avg Time: ${formatDuration(stats.averageExecutionTime)}`,
        `🔄 Total Retries: ${stats.totalRetries}`
    ].join('\n');
}

/**
 * Format file attachment info
 */
export function formatAttachment(attachment: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
    uploadedBy: string;
}): string {
    return `📄 **${attachment.name}** (${attachment.type}) - ${formatFileSize(0)} - Uploaded ${formatRelativeTime(attachment.uploadedAt)} by ${attachment.uploadedBy}`;
}

/**
 * Format progress bar
 */
export function formatProgressBar(current: number, total: number, width: number = 20): string {
    if (total === 0) return '■'.repeat(width);
    
    const percentage = Math.min(current / total, 1);
    const filled = Math.round(percentage * width);
    const empty = width - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const percent = Math.round(percentage * 100);
    
    return `[${bar}] ${percent}% (${current}/${total})`;
}

/**
 * Format table from array of objects
 */
export function formatTable<T extends Record<string, any>>(data: T[], columns: Array<{
    key: keyof T;
    label: string;
    width?: number;
    align?: 'left' | 'center' | 'right';
    format?: (value: any) => string;
}>): string {
    if (data.length === 0) return 'No data available';
    
    // Calculate column widths
    const widths = columns.map(col => {
        if (col.width) return col.width;
        
        const maxContentWidth = Math.max(
            col.label.length,
            ...data.map(row => {
                const value = col.format ? col.format(row[col.key]) : String(row[col.key]);
                return value.length;
            })
        );
        
        return Math.min(maxContentWidth, 50); // Max width of 50 chars
    });
    
    // Helper function to pad text
    const pad = (text: string, width: number, align: 'left' | 'center' | 'right' = 'left'): string => {
        if (text.length >= width) return text.substring(0, width);
        
        const padding = width - text.length;
        
        switch (align) {
            case 'center':
                const leftPad = Math.floor(padding / 2);
                const rightPad = padding - leftPad;
                return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
            case 'right':
                return ' '.repeat(padding) + text;
            default:
                return text + ' '.repeat(padding);
        }
    };
    
    const lines: string[] = [];
    
    // Header
    const headerRow = columns.map((col, i) => pad(col.label, widths[i], col.align)).join(' | ');
    lines.push(headerRow);
    lines.push(columns.map((_, i) => '-'.repeat(widths[i])).join(' | '));
    
    // Data rows
    data.forEach(row => {
        const dataRow = columns.map((col, i) => {
            const value = col.format ? col.format(row[col.key]) : String(row[col.key]);
            return pad(value, widths[i], col.align);
        }).join(' | ');
        lines.push(dataRow);
    });
    
    return lines.join('\n');
}

/**
 * Format key-value pairs
 */
export function formatKeyValuePairs(obj: Record<string, any>, options?: {
    indent?: number;
    separator?: string;
    maxValueLength?: number;
}): string {
    const opts = {
        indent: 0,
        separator: ': ',
        maxValueLength: 100,
        ...options
    };
    
    const indentStr = ' '.repeat(opts.indent);
    const lines: string[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
        let valueStr = typeof value === 'object' && value !== null
            ? JSON.stringify(value)
            : String(value);
        
        if (valueStr.length > opts.maxValueLength) {
            valueStr = valueStr.substring(0, opts.maxValueLength - 3) + '...';
        }
        
        lines.push(`${indentStr}${key}${opts.separator}${valueStr}`);
    }
    
    return lines.join('\n');
}

/**
 * Format notification message
 */
export function formatNotification(notification: {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    sentAt: string;
    readAt?: string;
    actionRequired?: boolean;
}): string {
    const icons = {
        info: 'ℹ️',
        warning: '⚠️',
        error: '❌',
        success: '✅'
    };
    
    const icon = icons[notification.type];
    const status = notification.readAt ? '👁️ Read' : '🆕 Unread';
    const action = notification.actionRequired ? ' 📌 Action Required' : '';
    
    return [
        `${icon} **${notification.title}** ${status}${action}`,
        notification.message,
        `🕰️ ${formatRelativeTime(notification.sentAt)}`
    ].join('\n');
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Add line numbers to text
 */
export function addLineNumbers(text: string, startFrom: number = 1): string {
    const lines = text.split('\n');
    const maxLineNumber = startFrom + lines.length - 1;
    const padding = String(maxLineNumber).length;
    
    return lines
        .map((line, index) => {
            const lineNumber = (startFrom + index).toString().padStart(padding, ' ');
            return `${lineNumber} | ${line}`;
        })
        .join('\n');
}
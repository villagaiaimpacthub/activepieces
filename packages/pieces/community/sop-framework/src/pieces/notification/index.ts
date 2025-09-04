/**
 * SOP Notification Piece
 * 
 * The comprehensive multi-channel notification delivery piece for SOP workflows.
 * This piece provides advanced notification capabilities including template processing,
 * compliance tracking, escalation management, analytics, and multi-channel delivery.
 * 
 * Features:
 * - Multi-channel delivery (Email, SMS, Slack, Teams, Webhook, Push, In-App, Desktop, Voice, Fax)
 * - Advanced template system with variable substitution and internationalization
 * - Delivery status tracking with retry mechanisms and exponential backoff
 * - Priority-based routing and automatic escalation workflows
 * - Compliance framework support (GDPR, CCPA, HIPAA, CAN-SPAM, TCPA, etc.)
 * - Batch processing and scheduled delivery with timezone support
 * - Rich content support (HTML, attachments, embedded media)
 * - Comprehensive analytics and reporting with real-time tracking
 * - Security features (encryption, sanitization, rate limiting)
 * - Audit trails and compliance logging
 */

import { createPiece, PieceAuth } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { notificationAction } from './lib/actions/notification-action';
import {
    notificationSentTrigger,
    notificationFailedTrigger,
    escalationTriggeredTrigger,
    complianceViolationTrigger,
    deliveryStatusChangedTrigger,
    batchProcessingCompletedTrigger,
    analyticsThresholdReachedTrigger
} from './lib/triggers/notification-trigger';

export const sopNotification = createPiece({
    displayName: 'SOP Notification',
    description: 'Comprehensive multi-channel notification delivery for Standard Operating Procedures with advanced template processing, compliance tracking, escalation management, and analytics capabilities.',
    auth: PieceAuth.None(),
    categories: [
        PieceCategory.COMMUNICATION,
        PieceCategory.PRODUCTIVITY,
        PieceCategory.BUSINESS_INTELLIGENCE,
        PieceCategory.MARKETING
    ],
    minimumSupportedRelease: '0.52.0',
    logoUrl: 'https://cdn.activepieces.com/pieces/sop-notification.svg',
    authors: ['SPARC-AI-System'],
    
    // Actions for different notification processing modes
    actions: [
        notificationAction
    ],
    
    // Triggers for various notification events
    triggers: [
        notificationSentTrigger,
        notificationFailedTrigger,
        escalationTriggeredTrigger,
        complianceViolationTrigger,
        deliveryStatusChangedTrigger,
        batchProcessingCompletedTrigger,
        analyticsThresholdReachedTrigger
    ]
});

// Export all types and utilities for external use
export * from './lib/common/notification-types';
export * from './lib/validation/notification-validator';
export * from './lib/utils/notification-helpers';
export * from './lib/actions/notification-action';
export * from './lib/triggers/notification-trigger';

// Export examples for documentation and testing
export * from './examples/integration-example';
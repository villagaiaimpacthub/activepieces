/**
 * SOP Data Form Piece
 * 
 * The comprehensive data form management piece for SOP workflows.
 * This piece provides dynamic form creation, data collection, validation,
 * compliance checking, and audit capabilities for Standard Operating Procedures.
 * 
 * Features:
 * - Dynamic form generation with multiple field types
 * - Real-time data validation with custom rules
 * - Compliance framework integration (GDPR, HIPAA, PCI, etc.)
 * - File upload support with security scanning
 * - Approval workflow integration
 * - Comprehensive audit trails
 * - Analytics and reporting
 * - Multi-mode processing (collect, validate, display, generate, migrate)
 */

import { createPiece, PieceAuth } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { dataFormAction } from './lib/actions/data-form-action';
import {
    formSubmissionTrigger,
    validationFailureTrigger,
    complianceViolationTrigger,
    approvalWorkflowTrigger,
    fileUploadTrigger,
    formAnalyticsTrigger
} from './lib/triggers/data-form-trigger';

export const sopDataForm = createPiece({
    displayName: 'SOP Data Form',
    description: 'Comprehensive data form management for Standard Operating Procedures with dynamic form creation, validation, compliance checking, and audit capabilities.',
    auth: PieceAuth.None(),
    categories: [
        PieceCategory.PRODUCTIVITY,
        PieceCategory.BUSINESS_INTELLIGENCE,
        PieceCategory.CONTENT_AND_FILES
    ],
    minimumSupportedRelease: '0.52.0',
    logoUrl: 'https://cdn.activepieces.com/pieces/sop-data-form.svg',
    authors: ['SPARC-AI-System'],
    
    // Actions for different form processing modes
    actions: [
        dataFormAction
    ],
    
    // Triggers for various form events
    triggers: [
        formSubmissionTrigger,
        validationFailureTrigger,
        complianceViolationTrigger,
        approvalWorkflowTrigger,
        fileUploadTrigger,
        formAnalyticsTrigger
    ]
});

// Export all types and utilities for external use
export * from './lib/common/data-form-types';
export * from './lib/validation/data-form-validator';
export * from './lib/utils/data-form-helpers';
export * from './lib/actions/data-form-action';
export * from './lib/triggers/data-form-trigger';
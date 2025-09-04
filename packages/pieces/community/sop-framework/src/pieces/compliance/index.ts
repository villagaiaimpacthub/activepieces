/**
 * SOP Compliance Piece
 * 
 * The comprehensive compliance management piece for SOP workflows.
 * This piece provides multi-framework compliance checking, automated risk assessment,
 * gap analysis, evidence collection, remediation planning, real-time monitoring,
 * violation alerts, and regulatory reporting capabilities for Standard Operating Procedures.
 * 
 * Features:
 * - Multi-framework support (GDPR, HIPAA, SOX, PCI DSS, ISO 27001, CCPA, NIST, etc.)
 * - Automated compliance rule evaluation and checking
 * - Real-time risk assessment with scoring and prioritization
 * - Gap analysis with remediation recommendations
 * - Evidence collection and documentation management
 * - Compliance dashboard and real-time monitoring
 * - Violation detection and alerting
 * - Audit trail generation for regulatory reviews
 * - Certificate and attestation management
 * - Policy enforcement and control implementation
 * - Integration with SIEM, GRC, ITSM, and audit systems
 * - Comprehensive reporting (PDF, HTML, Excel, etc.)
 * - Executive dashboards and technical reports
 * - Regulatory submission support
 * - Continuous monitoring and assessment
 * - Automated remediation for low-risk findings
 * - Escalation workflows for critical violations
 * - Benchmarking against industry standards
 * - Multi-tenant support for enterprise deployments
 */

import { createPiece, PieceAuth } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { complianceAction } from './lib/actions/compliance-action';
import {
    complianceViolationTrigger,
    riskThresholdExceededTrigger,
    auditScheduleTrigger,
    remediationDeadlineTrigger,
    certificateExpirationTrigger,
    monitoringAlertTrigger,
    evidenceCollectionAlertTrigger,
    complianceScoreChangedTrigger
} from './lib/triggers/compliance-trigger';

export const sopCompliance = createPiece({
    displayName: 'SOP Compliance',
    description: 'Comprehensive multi-framework compliance management for Standard Operating Procedures with automated checking, risk assessment, gap analysis, evidence collection, remediation planning, real-time monitoring, violation alerts, and regulatory reporting capabilities.',
    auth: PieceAuth.None(),
    categories: [
        PieceCategory.BUSINESS_INTELLIGENCE,
        PieceCategory.PRODUCTIVITY,
        PieceCategory.CONTENT_AND_FILES,
        PieceCategory.COMMUNICATION
    ],
    minimumSupportedRelease: '0.52.0',
    logoUrl: 'https://cdn.activepieces.com/pieces/sop-compliance.svg',
    authors: ['SPARC-AI-System'],
    
    // Actions for different compliance processing modes
    actions: [
        complianceAction
    ],
    
    // Triggers for various compliance events
    triggers: [
        complianceViolationTrigger,
        riskThresholdExceededTrigger,
        auditScheduleTrigger,
        remediationDeadlineTrigger,
        certificateExpirationTrigger,
        monitoringAlertTrigger,
        evidenceCollectionAlertTrigger,
        complianceScoreChangedTrigger
    ]
});

// Export all types and utilities for external use
export * from './lib/common/compliance-types';
export * from './lib/validation/compliance-validator';
export * from './lib/utils/compliance-helpers';
export * from './lib/actions/compliance-action';
export * from './lib/triggers/compliance-trigger';

// Export examples for documentation and testing
export * from './examples/integration-example';
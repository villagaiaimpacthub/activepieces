import { createPiece, PieceAuth } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import {
  initiateApprovalGate,
  processApprovalResponse,
  escalateApproval,
  queryApprovalStatus,
  cancelApproval,
  bulkApprovalProcess,
  configureApprovalWorkflow
} from './lib/actions';
import {
  approvalRequestTrigger,
  approvalStatusChangeTrigger,
  escalationTrigger
} from './lib/triggers';

export const sopApprovalGate = createPiece({
  displayName: 'SOP Approval Gate',
  description: 'Comprehensive approval workflow management for SOP processes with multi-level approval support, escalation chains, and audit trails.',
  auth: PieceAuth.None(),
  categories: [PieceCategory.PRODUCTIVITY, PieceCategory.BUSINESS_INTELLIGENCE],
  minimumSupportedRelease: '0.68.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/sop-approval-gate.svg',
  authors: ['SOP Team'],
  actions: [
    initiateApprovalGate,
    processApprovalResponse,
    escalateApproval,
    queryApprovalStatus,
    cancelApproval,
    bulkApprovalProcess,
    configureApprovalWorkflow
  ],
  triggers: [
    approvalRequestTrigger,
    approvalStatusChangeTrigger,
    escalationTrigger
  ]
});

// Re-export core components for external usage
export * from './lib';
/**
 * SOP Process Step Piece
 * 
 * The foundational concrete implementation of a Process Step in SOP workflows.
 * This piece represents individual tasks/actions within Standard Operating Procedures,
 * providing complete execution tracking, compliance validation, and audit capabilities.
 */

import { createPiece, PieceAuth } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { processStepAction } from './lib/actions/process-step-action';
import { processStepTrigger } from './lib/triggers/process-step-trigger';

export const sopProcessStep = createPiece({
    displayName: 'SOP Process Step',
    description: 'Execute individual process steps within Standard Operating Procedure workflows with full compliance and audit tracking.',
    auth: PieceAuth.None(),
    categories: [PieceCategory.PRODUCTIVITY, PieceCategory.BUSINESS_INTELLIGENCE],
    minimumSupportedRelease: '0.52.0',
    logoUrl: 'https://cdn.activepieces.com/pieces/sop-process-step.svg',
    authors: ['SPARC-AI-System'],
    actions: [processStepAction],
    triggers: [processStepTrigger],
});
# SOP Framework for Activepieces

A comprehensive foundational framework for Standard Operating Procedure (SOP) workflow components in Activepieces.

## Overview

The SOP Framework provides the essential infrastructure and patterns for building SOP-specific workflow pieces in Activepieces. It includes:

- **Base SOP Piece**: Abstract foundation class for all SOP pieces
- **Workflow Context Management**: State tracking and cross-step communication
- **Piece Registry**: Registration and discovery system for SOP pieces
- **Execution Engine**: Robust execution framework with retry logic and error handling
- **Validation Framework**: Comprehensive validation including compliance checks
- **Integration Helpers**: Seamless integration with Activepieces core system

## Key Features

### 🏗️ Framework Components

- **BaseSoPiece**: Abstract base class with common SOP patterns
- **SOPWorkflowContext**: Context management for workflow execution
- **SOPPieceRegistry**: Centralized piece registration and discovery
- **SOPExecutionEngine**: Advanced execution engine with hooks and monitoring
- **SOPValidationFramework**: Multi-layer validation including compliance
- **SOPIntegrationHelpers**: Utility functions for Activepieces integration

### 🔧 Built-in Capabilities

- **Audit Trail**: Automatic audit logging for compliance
- **State Management**: Comprehensive execution state tracking
- **Priority Handling**: Built-in priority levels (Low to Critical)
- **Compliance Checks**: GDPR, SOX, HIPAA compliance validation
- **Error Handling**: Robust error handling with retry logic
- **Notifications**: Built-in notification and escalation system
- **Approval Workflows**: Integrated approval and rejection handling

### 📊 SOP-Specific Types

- **Process Steps**: Standard process execution components
- **Decision Points**: Branching logic for workflow decisions
- **Approval Gates**: Multi-level approval workflows
- **Compliance Checks**: Automated compliance validation
- **Escalation Triggers**: Automatic escalation handling
- **Audit Logs**: Comprehensive audit trail management

## Installation

```bash
npm install @activepieces/piece-sop-framework
```

## Quick Start

### Creating a Basic SOP Piece

```typescript
import { BaseSoPiece, SOPPieceType, SOPPieceCategory } from '@activepieces/piece-sop-framework';
import { createPiece } from '@activepieces/pieces-framework';

class MySOPPiece extends BaseSoPiece {
    constructor() {
        super({
            displayName: 'My SOP Step',
            description: 'A custom SOP workflow step',
            sopPieceType: SOPPieceType.PROCESS_STEP,
            sopCategory: SOPPieceCategory.PROCESS_MANAGEMENT,
            complianceRequired: true,
            auditTrailRequired: true
        });
    }

    public async execute(propsValue: any, executedBy: string): Promise<any> {
        // Your SOP logic here
        return {
            success: true,
            data: 'SOP step completed successfully'
        };
    }

    protected getSOPSpecificProperties(): Record<string, any> {
        return {
            customInput: Property.ShortText({
                displayName: 'Custom Input',
                required: true
            })
        };
    }

    public getPieceConfiguration(): any {
        return createPiece({
            displayName: this.config.displayName,
            description: this.config.description,
            minimumSupportedRelease: '0.68.1',
            logoUrl: 'https://your-logo-url.com/logo.png',
            categories: [this.getActivepiecesCategory()],
            actions: [
                this.integrationHelpers.createSOPAction(this, {
                    name: 'execute',
                    displayName: 'Execute SOP Step',
                    description: 'Execute this SOP workflow step',
                    props: this.getSOPSpecificProperties(),
                    run: async (context) => {
                        return await this.execute(context.propsValue, context.auth?.userId || 'unknown');
                    }
                })
            ]
        });
    }
}

// Register the piece
const mySOPPiece = new MySOPPiece();
const registry = SOPPieceRegistry.getInstance();
registry.register(mySOPPiece, {
    name: 'my-sop-piece',
    registeredBy: 'system'
});

export const mySOPPiece = mySOPPiece.getPieceConfiguration();
```

### Using Workflow Context

```typescript
import { SOPWorkflowContext } from '@activepieces/piece-sop-framework';

const context = new SOPWorkflowContext();

// Set global variables
context.setGlobalVariable('processId', '12345');
context.setGlobalVariable('priority', 'HIGH');

// Add notifications
context.addNotification({
    type: 'info',
    title: 'Process Started',
    message: 'Your SOP process has been initiated',
    recipient: 'user@company.com'
});

// Add approval request
context.addApprovalRequest({
    stepId: 'approval-step-1',
    approver: 'manager@company.com'
});
```

### Validation Example

```typescript
import { SOPValidationFramework } from '@activepieces/piece-sop-framework';

const validator = new SOPValidationFramework();

// Register custom validation rule
validator.registerRule({
    id: 'custom-business-rule',
    name: 'Business Rule Validation',
    description: 'Custom business logic validation',
    category: 'business',
    severity: 'error',
    enabled: true,
    validate: async (context, data) => {
        // Custom validation logic
        if (data.amount > 10000 && !data.managerApproval) {
            return {
                isValid: false,
                message: 'Amounts over $10,000 require manager approval',
                code: 'APPROVAL_REQUIRED'
            };
        }
        return { isValid: true };
    }
});
```

## Architecture

### Framework Structure

```
src/
├── framework/
│   ├── base-sop-piece.ts          # Abstract base class
│   ├── sop-workflow-context.ts    # Context management
│   ├── sop-piece-registry.ts      # Piece registry
│   ├── sop-execution-engine.ts    # Execution engine
│   ├── sop-validation-framework.ts # Validation system
│   └── sop-integration-helpers.ts # Integration utilities
├── types/
│   ├── sop-types.ts                # Core SOP types
│   ├── sop-workflow-types.ts       # Workflow-specific types
│   └── sop-execution-types.ts      # Execution-specific types
├── utils/
│   ├── sop-helpers.ts              # Utility functions
│   ├── sop-validators.ts           # Validation utilities
│   └── sop-formatters.ts           # Formatting utilities
├── constants/
│   └── sop-constants.ts            # Framework constants
└── common/
    ├── sop-props.ts                # Reusable properties
    └── sop-auth.ts                 # Authentication configs
```

### SOP Piece Lifecycle

1. **Registration**: Pieces register with the SOPPieceRegistry
2. **Initialization**: BaseSoPiece sets up common infrastructure
3. **Validation**: SOPValidationFramework validates execution context
4. **Execution**: SOPExecutionEngine manages execution with hooks
5. **Context Management**: SOPWorkflowContext tracks state and data
6. **Integration**: SOPIntegrationHelpers handle Activepieces integration

## SOP Categories and Types

### Categories
- `PROCESS_MANAGEMENT` - General process workflows
- `APPROVAL_WORKFLOWS` - Approval and review processes
- `COMPLIANCE` - Compliance and regulatory processes
- `QUALITY_ASSURANCE` - QA and testing workflows
- `DOCUMENTATION` - Documentation generation
- `AUDIT_TRAIL` - Audit and logging processes
- `DECISION_SUPPORT` - Decision-making workflows
- `ESCALATION` - Escalation and notification processes

### Piece Types
- `PROCESS_STEP` - Standard process execution
- `DECISION_POINT` - Branching decision logic
- `APPROVAL_GATE` - Approval checkpoints
- `ESCALATION_TRIGGER` - Automatic escalations
- `COMPLIANCE_CHECK` - Compliance validation
- `AUDIT_LOG` - Audit trail logging
- `NOTIFICATION` - Notifications and alerts
- `DATA_VALIDATION` - Data validation steps
- `DOCUMENT_GENERATOR` - Document creation
- `STATUS_TRACKER` - Status monitoring

## Configuration

### Environment Variables

```env
SOP_FRAMEWORK_LOG_LEVEL=info
SOP_FRAMEWORK_AUDIT_ENABLED=true
SOP_FRAMEWORK_COMPLIANCE_ENABLED=true
SOP_FRAMEWORK_MAX_RETRY_ATTEMPTS=3
SOP_FRAMEWORK_DEFAULT_TIMEOUT=60000
```

### Default Settings

```typescript
import { SOP_DEFAULTS } from '@activepieces/piece-sop-framework';

console.log(SOP_DEFAULTS);
// {
//   PRIORITY: 'NORMAL',
//   AUDIT_TRAIL_ENABLED: true,
//   COMPLIANCE_CHECK_ENABLED: false,
//   TIMEOUT_MINUTES: 60,
//   RETRY_ATTEMPTS: 3,
//   ...
// }
```

## Compliance Support

Built-in compliance frameworks:

- **GDPR**: Data processing compliance
- **SOX**: Financial controls compliance
- **HIPAA**: Healthcare data compliance
- **PCI DSS**: Payment card industry compliance
- **ISO 27001**: Information security compliance

## API Reference

### Core Classes

#### BaseSoPiece
Abstract base class for all SOP pieces.

#### SOPWorkflowContext
Manages workflow state and cross-step communication.

#### SOPPieceRegistry
Centralized registry for SOP piece discovery and management.

#### SOPExecutionEngine
Advanced execution engine with hooks, retries, and monitoring.

#### SOPValidationFramework
Comprehensive validation including compliance checks.

#### SOPIntegrationHelpers
Utility functions for Activepieces integration.

### Utilities

See the full API documentation for detailed information about utility functions, validators, formatters, and helpers.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:
- GitHub Issues: [Report issues](https://github.com/activepieces/activepieces/issues)
- Documentation: [SOP Framework Docs](https://docs.activepieces.com/pieces/sop-framework)
- Community: [Activepieces Discord](https://discord.gg/activepieces)

---

**SOP Framework v0.1.0** - Built with ❤️ for the Activepieces community
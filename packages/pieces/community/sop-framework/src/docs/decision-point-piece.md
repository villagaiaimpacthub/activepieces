# SOP Decision Point Piece Documentation

## Overview

The SOP Decision Point Piece is a comprehensive solution for handling conditional logic and branching within Standard Operating Procedure (SOP) workflows. It enables automated and manual decision-making capabilities with full audit trails, escalation handling, and compliance tracking.

## Features

### Core Decision Capabilities
- **Automated Decision Logic**: Rule-based decision making using configurable conditions
- **Manual Decision Points**: Human-in-the-loop decision capabilities with justification requirements
- **Hybrid Decisions**: Combination of automated logic with manual override capabilities
- **Complex Decision Trees**: Support for multiple branching paths and nested conditions

### Decision Types Supported
1. **Simple Binary**: Yes/No, True/False decisions
2. **Multi-branch**: Multiple outcome paths based on conditions
3. **Value-based**: Decisions based on data values and thresholds
4. **Rule-based**: Complex business rule evaluation
5. **Manual Decision**: Human input required for decision
6. **Automated**: System-driven decisions based on criteria

### Advanced Features
- **Weighted Conditions**: Different conditions can have different importance weights
- **Custom Logic**: Support for custom JavaScript logic evaluation
- **Timeout Handling**: Configurable behavior for decision timeouts
- **Escalation Rules**: Automatic escalation when decisions cannot be resolved
- **Audit Logging**: Comprehensive decision rationale and outcome tracking
- **Compliance Integration**: Built-in compliance checking and validation

## Configuration

### Basic Decision Point Configuration

```typescript
const decisionPointConfig: DecisionPointConfig = {
  displayName: 'Purchase Approval Decision',
  description: 'Determines approval workflow based on purchase amount and department',
  sopPieceType: SOPPieceType.DECISION_POINT,
  sopCategory: SOPPieceCategory.DECISION_SUPPORT,
  priority: SOPPriority.HIGH,
  complianceRequired: true,
  auditTrailRequired: true,
  decisionType: 'automated',
  timeoutMinutes: 60,
  escalationEnabled: true,
  escalationTimeoutMinutes: 240
};
```

### Decision Logic Configuration

```typescript
const decisionLogic: SOPDecisionLogic = {
  type: DecisionPointType.AUTOMATED,
  conditions: [
    {
      id: 'amount-check',
      name: 'Amount Threshold',
      field: 'input.amount',
      operator: DecisionOperator.GREATER_THAN,
      value: 5000,
      weight: 3,
      required: true
    },
    {
      id: 'department-check',
      name: 'Department Validation',
      field: 'input.department',
      operator: DecisionOperator.IN_LIST,
      value: ['finance', 'procurement', 'executive'],
      weight: 2
    },
    {
      id: 'urgency-check',
      name: 'Urgency Level',
      field: 'input.priority',
      operator: DecisionOperator.EQUALS,
      value: 'urgent',
      weight: 1
    }
  ],
  evaluationOrder: 'sequential',
  operatorLogic: LogicOperator.AND,
  timeoutMinutes: 30,
  failureHandling: 'escalate'
};
```

### Decision Options Configuration

```typescript
const decisionOptions: SOPDecisionOption[] = [
  {
    id: 'executive-approval',
    name: 'Executive Approval Required',
    sopName: 'Executive Approval Process',
    description: 'Route to executive approval for high-value purchases',
    nextStepId: 'executive-approval-step',
    priority: 10,
    conditions: [
      { id: 'amount-check', field: 'input.amount', operator: DecisionOperator.GREATER_THAN, value: 10000 }
    ]
  },
  {
    id: 'manager-approval',
    name: 'Manager Approval Required',
    sopName: 'Manager Approval Process',
    description: 'Route to manager approval for medium-value purchases',
    nextStepId: 'manager-approval-step',
    priority: 8,
    conditions: [
      { id: 'amount-check', field: 'input.amount', operator: DecisionOperator.GREATER_THAN, value: 1000 }
    ]
  },
  {
    id: 'auto-approve',
    name: 'Automatic Approval',
    sopName: 'Automatic Approval',
    description: 'Automatically approve low-value purchases',
    nextStepId: 'completion-step',
    priority: 5
  }
];
```

## Usage Examples

### 1. Basic Automated Decision

```typescript
import { SOPDecisionPointPiece } from '@activepieces/piece-sop-framework';

const decisionPiece = new SOPDecisionPointPiece({
  displayName: 'Budget Approval Decision',
  description: 'Automated budget approval based on amount and department',
  decisionType: 'automated',
  timeoutMinutes: 30
});

const props: DecisionPointProps = {
  decisionConfiguration: {
    id: 'budget-decision',
    name: 'Budget Decision Point',
    sopName: 'Budget Decision Point',
    stepId: 'step-001',
    decisionLogic: {
      type: DecisionPointType.AUTOMATED,
      conditions: [
        {
          id: 'amount-condition',
          field: 'input.requestAmount',
          operator: DecisionOperator.LESS_THAN,
          value: 5000
        }
      ],
      operatorLogic: LogicOperator.AND,
      evaluationOrder: 'sequential'
    },
    options: [
      {
        id: 'approve',
        name: 'Auto Approve',
        sopName: 'Auto Approve',
        priority: 10,
        conditions: [{ id: 'amount-condition', field: 'input.requestAmount', operator: DecisionOperator.LESS_THAN, value: 5000 }]
      },
      {
        id: 'review',
        name: 'Manual Review',
        sopName: 'Manual Review',
        priority: 5
      }
    ],
    defaultOption: 'review',
    timeoutBehavior: DecisionTimeoutBehavior.DEFAULT,
    requiresJustification: false,
    auditRequired: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  contextData: {
    input: {
      requestAmount: 3000,
      department: 'marketing',
      requestor: 'john.doe@company.com'
    }
  },
  enableAuditTrail: true,
  enableComplianceCheck: true
};

const result = await decisionPiece.execute(props, 'system');
console.log(`Decision: ${result.selectedOptionName}`);
console.log(`Confidence: ${result.confidenceScore}%`);
```

### 2. Manual Decision with Justification

```typescript
const manualDecisionPiece = new SOPDecisionPointPiece({
  displayName: 'Special Approval Decision',
  description: 'Manual decision for special circumstances',
  decisionType: 'manual',
  requiresJustification: true,
  timeoutMinutes: 120
});

const manualProps: DecisionPointProps = {
  // ... decision configuration
  manualDecisionRequired: true,
  manualDecisionJustification: 'Special circumstances require manual review due to vendor relationships and strategic importance.',
  reviewRequired: true
};

const result = await manualDecisionPiece.execute(manualProps, 'approval-manager');
```

### 3. Weighted Conditions Decision

```typescript
const weightedConditions = [
  {
    id: 'budget-impact',
    field: 'input.budgetImpact',
    operator: DecisionOperator.GREATER_THAN,
    value: 0.1, // 10% of budget
    weight: 5 // High importance
  },
  {
    id: 'timeline-impact',
    field: 'input.timelineRisk',
    operator: DecisionOperator.EQUALS,
    value: 'high',
    weight: 3 // Medium importance
  },
  {
    id: 'stakeholder-approval',
    field: 'input.stakeholderApproved',
    operator: DecisionOperator.EQUALS,
    value: true,
    weight: 2 // Lower importance
  }
];

// The decision engine will calculate weighted scores to determine the best option
```

### 4. Custom Logic Decision

```typescript
const customLogicDecision: SOPDecisionLogic = {
  type: DecisionPointType.AUTOMATED,
  conditions: [
    { id: 'revenue-impact', field: 'input.revenueImpact', operator: DecisionOperator.GREATER_THAN, value: 100000 },
    { id: 'risk-level', field: 'input.riskLevel', operator: DecisionOperator.EQUALS, value: 'low' },
    { id: 'team-capacity', field: 'input.teamCapacity', operator: DecisionOperator.GREATER_THAN, value: 0.8 }
  ],
  operatorLogic: LogicOperator.CUSTOM,
  customLogic: `
    // Custom logic for complex decision making
    const revenueCondition = conditions['revenue-impact'];
    const riskCondition = conditions['risk-level'];
    const capacityCondition = conditions['team-capacity'];
    
    // High revenue projects can proceed even with medium risk if we have capacity
    if (revenueCondition && capacityCondition) {
      return true;
    }
    
    // Low risk projects can proceed regardless of revenue if we have capacity
    if (riskCondition && capacityCondition) {
      return true;
    }
    
    // All conditions must be met otherwise
    return revenueCondition && riskCondition && capacityCondition;
  `,
  evaluationOrder: 'parallel'
};
```

## Condition Operators

### Comparison Operators
- `EQUALS`: Exact equality comparison
- `NOT_EQUALS`: Inequality comparison
- `GREATER_THAN`: Numeric greater than
- `LESS_THAN`: Numeric less than
- `GREATER_EQUAL`: Greater than or equal
- `LESS_EQUAL`: Less than or equal

### String Operators
- `CONTAINS`: Case-insensitive string contains
- `NOT_CONTAINS`: Case-insensitive string does not contain
- `STARTS_WITH`: String starts with
- `ENDS_WITH`: String ends with
- `REGEX`: Regular expression match

### Existence Operators
- `EXISTS`: Field exists and is not null
- `NOT_EXISTS`: Field does not exist or is null

### List Operators
- `IN_LIST`: Value exists in provided array
- `NOT_IN_LIST`: Value does not exist in provided array

### Custom Operators
- `CUSTOM`: Custom JavaScript function evaluation

## Logic Operators

- `AND`: All conditions must be true
- `OR`: At least one condition must be true
- `NOT`: Negates the first condition
- `XOR`: Exactly one condition must be true
- `CUSTOM`: Custom JavaScript logic evaluation

## Timeout Behaviors

- `DEFAULT`: Use the default option when timeout occurs
- `FAIL`: Mark the decision as failed
- `ESCALATE`: Escalate to the next level
- `SKIP`: Skip this decision point
- `RETRY`: Retry the decision evaluation

## Escalation Rules

```typescript
const escalationRules: EscalationRule[] = [
  {
    id: 'timeout-escalation',
    name: 'Timeout Escalation',
    triggerCondition: 'timeout',
    action: 'escalate',
    escalateTo: ['manager@company.com', 'director@company.com'],
    maxEscalations: 3,
    cooldownMinutes: 60,
    isActive: true
  },
  {
    id: 'no-decision-escalation',
    name: 'No Decision Escalation',
    triggerCondition: 'no_decision',
    action: 'notify',
    escalateTo: ['admin@company.com'],
    maxEscalations: 1,
    isActive: true
  }
];
```

## Audit Trail

The Decision Point Piece automatically generates comprehensive audit trails including:

- **Decision Evaluation**: All condition evaluations and results
- **Logic Processing**: How conditions were combined using logic operators
- **Option Selection**: Why a specific option was selected
- **Confidence Scores**: Calculated confidence in the decision
- **Timing Information**: How long each evaluation step took
- **User Context**: Who made the decision and when
- **Justification**: Manual justifications when required

### Audit Entry Example

```typescript
{
  timestamp: '2024-01-15T10:30:00Z',
  action: 'decision_made',
  userId: 'john.doe@company.com',
  details: {
    decisionPointId: 'purchase-approval-001',
    selectedOption: 'Executive Approval Required',
    automated: true,
    confidenceScore: 95,
    evaluationTime: 45,
    conditionsEvaluated: 3,
    conditionsPassed: 3,
    decisionPath: [
      'input.amount greater_than 5000 => PASS (weight: 3)',
      'input.department equals finance => PASS (weight: 2)',
      'input.priority equals urgent => PASS (weight: 1)',
      'Logic: AND => 3/3 conditions passed',
      'Selected: "Executive Approval Required" (priority: 10)'
    ],
    contextData: {
      input: {
        amount: 15000,
        department: 'finance',
        priority: 'urgent'
      }
    }
  }
}
```

## Integration with Activepieces

### Action Configuration

```typescript
const decisionAction = createAction({
  name: 'evaluateDecision',
  displayName: 'Evaluate Decision Point',
  description: 'Evaluate decision logic and determine workflow branching',
  props: {
    decisionConfiguration: Property.Json({
      displayName: 'Decision Configuration',
      description: 'Complete decision point configuration',
      required: true
    }),
    contextData: Property.Object({
      displayName: 'Context Data',
      description: 'Data for decision evaluation',
      required: true
    }),
    manualDecisionRequired: Property.Checkbox({
      displayName: 'Manual Decision Required',
      required: false,
      defaultValue: false
    }),
    timeoutBehavior: Property.StaticDropdown({
      displayName: 'Timeout Behavior',
      defaultValue: 'default',
      options: {
        options: [
          { label: 'Use Default Option', value: 'default' },
          { label: 'Fail', value: 'fail' },
          { label: 'Escalate', value: 'escalate' }
        ]
      }
    })
  },
  async run(context) {
    const piece = new SOPDecisionPointPiece();
    return await piece.execute(context.propsValue, context.executedBy);
  }
});
```

## Error Handling

The Decision Point Piece includes comprehensive error handling:

1. **Validation Errors**: Configuration validation with detailed error messages
2. **Condition Evaluation Errors**: Graceful handling of field access errors
3. **Custom Logic Errors**: Safe evaluation of custom JavaScript with error containment
4. **Timeout Handling**: Configurable timeout behavior
5. **Escalation**: Automatic escalation when decisions cannot be resolved

## Performance Considerations

- **Parallel Evaluation**: Conditions can be evaluated in parallel for better performance
- **Caching**: Decision results can be cached to avoid re-evaluation
- **Optimization**: Weighted conditions allow for early termination
- **Resource Monitoring**: Built-in performance metrics collection

## Security Features

- **Input Validation**: All input data is validated before evaluation
- **Safe Evaluation**: Custom logic runs in a restricted context
- **Audit Logging**: All decision actions are logged for security review
- **Access Control**: Integration with SOP framework security model

## Best Practices

1. **Clear Naming**: Use descriptive names for conditions and options
2. **Weight Assignment**: Assign appropriate weights to reflect business importance
3. **Error Handling**: Always configure appropriate failure handling
4. **Audit Requirements**: Enable audit trails for compliance-critical decisions
5. **Testing**: Thoroughly test all decision paths and edge cases
6. **Documentation**: Document decision logic for future maintenance

## Troubleshooting

### Common Issues

1. **No Matching Option**: Ensure default option is configured
2. **Condition Evaluation Errors**: Check field paths and data types
3. **Custom Logic Failures**: Validate JavaScript syntax and variable references
4. **Timeout Issues**: Adjust timeout values based on complexity
5. **Escalation Problems**: Verify escalation rules and recipient configuration

### Debug Mode

Enable debug logging to troubleshoot decision evaluation:

```typescript
const debugProps = {
  ...props,
  customVariables: {
    ...props.customVariables,
    debugMode: true,
    logLevel: 'debug'
  }
};
```

This comprehensive Decision Point Piece provides robust decision-making capabilities for SOP workflows with full auditability, compliance support, and flexible configuration options.
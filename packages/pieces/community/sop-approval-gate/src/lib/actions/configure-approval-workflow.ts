/**
 * Configure Approval Workflow Action
 * 
 * Creates and configures approval workflow templates and rules that can be
 * reused across multiple approval processes. Enables standardization and
 * compliance with organizational approval policies.
 */

import { createAction, Property } from '@activepieces/pieces-framework';

export const configureApprovalWorkflow = createAction({
  name: 'configure-approval-workflow',
  displayName: 'Configure Approval Workflow',
  description: 'Create and configure reusable approval workflow templates and rules',
  
  props: {
    // Workflow identification
    workflowId: Property.ShortText({
      displayName: 'Workflow ID',
      description: 'Unique identifier for this approval workflow template',
      required: false // Will be auto-generated if not provided
    }),

    workflowName: Property.ShortText({
      displayName: 'Workflow Name',
      description: 'Descriptive name for the approval workflow',
      required: true
    }),

    description: Property.LongText({
      displayName: 'Workflow Description',
      description: 'Detailed description of the workflow purpose and use cases',
      required: true
    }),

    category: Property.ShortText({
      displayName: 'Workflow Category',
      description: 'Category or type of approvals this workflow handles',
      required: true
    }),

    version: Property.ShortText({
      displayName: 'Version',
      description: 'Version number for this workflow configuration',
      required: false,
      defaultValue: '1.0.0'
    }),

    // Workflow structure
    workflowType: Property.StaticDropdown({
      displayName: 'Workflow Type',
      description: 'Type of approval workflow structure',
      required: true,
      options: {
        options: [
          { label: 'Single Stage', value: 'single_stage' },
          { label: 'Multi-Stage Sequential', value: 'multi_stage_sequential' },
          { label: 'Multi-Stage Parallel', value: 'multi_stage_parallel' },
          { label: 'Hierarchical', value: 'hierarchical' },
          { label: 'Matrix Approval', value: 'matrix' },
          { label: 'Conditional Routing', value: 'conditional' },
          { label: 'Hybrid', value: 'hybrid' }
        ]
      }
    }),

    // Approval stages configuration
    stages: Property.Array({
      displayName: 'Approval Stages',
      description: 'Configuration for each stage in the workflow',
      required: true
    }),

    // Default approvers and roles
    defaultApprovers: Property.Array({
      displayName: 'Default Approvers',
      description: 'Default approver configurations that can be overridden per request',
      required: false
    }),

    approverRoles: Property.Array({
      displayName: 'Approver Roles',
      description: 'Role-based approver definitions',
      required: false
    }),

    // Routing and decision rules
    routingRules: Property.Array({
      displayName: 'Routing Rules',
      description: 'Rules for conditional routing between stages',
      required: false
    }),

    escalationRules: Property.Array({
      displayName: 'Escalation Rules',
      description: 'Rules for escalating approvals within this workflow',
      required: false
    }),

    // Timing configuration
    defaultTimeouts: Property.Object({
      displayName: 'Default Timeouts',
      description: 'Default timeout configurations for different stages',
      required: false
    }),

    businessHours: Property.Object({
      displayName: 'Business Hours',
      description: 'Business hours configuration for SLA calculations',
      required: false
    }),

    holidays: Property.Array({
      displayName: 'Holiday Calendar',
      description: 'Holiday dates to exclude from SLA calculations',
      required: false
    }),

    // Notification configuration
    notificationTemplates: Property.Array({
      displayName: 'Notification Templates',
      description: 'Email and message templates for different workflow events',
      required: false
    }),

    defaultNotificationChannels: Property.MultiSelectDropdown({
      displayName: 'Default Notification Channels',
      description: 'Default channels for notifications in this workflow',
      required: false,
      options: {
        options: [
          { label: 'Email', value: 'email' },
          { label: 'SMS', value: 'sms' },
          { label: 'Slack', value: 'slack' },
          { label: 'Microsoft Teams', value: 'teams' },
          { label: 'Push Notification', value: 'push' },
          { label: 'Webhook', value: 'webhook' },
          { label: 'In-App', value: 'in_app' }
        ]
      }
    }),

    // Validation and compliance
    validationRules: Property.Array({
      displayName: 'Validation Rules',
      description: 'Rules for validating approval requests in this workflow',
      required: false
    }),

    complianceRequirements: Property.Array({
      displayName: 'Compliance Requirements',
      description: 'Compliance rules and requirements for this workflow type',
      required: false
    }),

    auditLevel: Property.StaticDropdown({
      displayName: 'Default Audit Level',
      description: 'Default level of audit detail for requests using this workflow',
      required: false,
      defaultValue: 'standard',
      options: {
        options: [
          { label: 'Basic', value: 'basic' },
          { label: 'Standard', value: 'standard' },
          { label: 'Detailed', value: 'detailed' },
          { label: 'Comprehensive', value: 'comprehensive' }
        ]
      }
    }),

    // Integration settings
    integrationSettings: Property.Object({
      displayName: 'Integration Settings',
      description: 'Settings for external system integrations',
      required: false
    }),

    webhookEndpoints: Property.Array({
      displayName: 'Webhook Endpoints',
      description: 'Default webhook endpoints for workflow events',
      required: false
    }),

    // Conditional logic
    conditions: Property.Array({
      displayName: 'Workflow Conditions',
      description: 'Conditions for when this workflow should be used',
      required: false
    }),

    triggers: Property.Array({
      displayName: 'Auto-Trigger Conditions',
      description: 'Conditions that automatically trigger this workflow',
      required: false
    }),

    // Advanced configuration
    customProperties: Property.Object({
      displayName: 'Custom Properties',
      description: 'Custom properties specific to this workflow type',
      required: false
    }),

    scripts: Property.Object({
      displayName: 'Custom Scripts',
      description: 'Custom JavaScript for advanced workflow logic',
      required: false
    }),

    // Deployment and management
    deploymentTarget: Property.StaticDropdown({
      displayName: 'Deployment Target',
      description: 'Target environment for this workflow configuration',
      required: false,
      defaultValue: 'production',
      options: {
        options: [
          { label: 'Development', value: 'development' },
          { label: 'Testing', value: 'testing' },
          { label: 'Staging', value: 'staging' },
          { label: 'Production', value: 'production' }
        ]
      }
    }),

    isActive: Property.Checkbox({
      displayName: 'Activate Workflow',
      description: 'Make this workflow template active and available for use',
      required: false,
      defaultValue: true
    }),

    isDefault: Property.Checkbox({
      displayName: 'Set as Default',
      description: 'Make this the default workflow for its category',
      required: false,
      defaultValue: false
    }),

    // Permissions and access
    permissions: Property.Array({
      displayName: 'Workflow Permissions',
      description: 'User and role permissions for this workflow',
      required: false
    }),

    allowOverrides: Property.Checkbox({
      displayName: 'Allow Configuration Overrides',
      description: 'Allow individual requests to override workflow settings',
      required: false,
      defaultValue: true
    }),

    // Monitoring and analytics
    enableAnalytics: Property.Checkbox({
      displayName: 'Enable Analytics',
      description: 'Enable performance and usage analytics for this workflow',
      required: false,
      defaultValue: true
    }),

    performanceThresholds: Property.Object({
      displayName: 'Performance Thresholds',
      description: 'Performance thresholds for monitoring and alerting',
      required: false
    })
  },

  async run({ propsValue }) {
    try {
      // Generate workflow ID if not provided
      const workflowId = propsValue.workflowId || `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Validate workflow configuration
      const validationResult = validateWorkflowConfiguration(propsValue);
      if (!validationResult.isValid) {
        throw new Error(`Workflow configuration validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Process and normalize the configuration
      const normalizedConfig = await processWorkflowConfiguration({
        workflowId,
        name: propsValue.workflowName,
        description: propsValue.description,
        category: propsValue.category,
        version: propsValue.version || '1.0.0',
        type: propsValue.workflowType,
        stages: propsValue.stages || [],
        defaultApprovers: propsValue.defaultApprovers || [],
        approverRoles: propsValue.approverRoles || [],
        routingRules: propsValue.routingRules || [],
        escalationRules: propsValue.escalationRules || [],
        timeouts: propsValue.defaultTimeouts,
        businessHours: propsValue.businessHours,
        holidays: propsValue.holidays || [],
        notifications: {
          templates: propsValue.notificationTemplates || [],
          defaultChannels: propsValue.defaultNotificationChannels || ['email']
        },
        validation: {
          rules: propsValue.validationRules || [],
          complianceRequirements: propsValue.complianceRequirements || [],
          auditLevel: propsValue.auditLevel || 'standard'
        },
        integration: {
          settings: propsValue.integrationSettings,
          webhooks: propsValue.webhookEndpoints || []
        },
        conditions: {
          usageConditions: propsValue.conditions || [],
          triggers: propsValue.triggers || []
        },
        advanced: {
          customProperties: propsValue.customProperties,
          scripts: propsValue.scripts
        },
        deployment: {
          target: propsValue.deploymentTarget || 'production',
          isActive: propsValue.isActive !== false,
          isDefault: propsValue.isDefault || false
        },
        permissions: propsValue.permissions || [],
        allowOverrides: propsValue.allowOverrides !== false,
        analytics: {
          enabled: propsValue.enableAnalytics !== false,
          thresholds: propsValue.performanceThresholds
        }
      });

      // Save/deploy the workflow configuration
      const deploymentResult = await deployWorkflowConfiguration(normalizedConfig);

      return {
        success: true,
        workflow: {
          workflowId,
          name: propsValue.workflowName,
          category: propsValue.category,
          version: propsValue.version || '1.0.0',
          type: propsValue.workflowType,
          status: propsValue.isActive !== false ? 'active' : 'inactive',
          isDefault: propsValue.isDefault || false,
          createdAt: new Date().toISOString()
        },
        configuration: {
          stagesConfigured: (propsValue.stages || []).length,
          defaultApprovers: (propsValue.defaultApprovers || []).length,
          routingRules: (propsValue.routingRules || []).length,
          escalationRules: (propsValue.escalationRules || []).length,
          validationRules: (propsValue.validationRules || []).length,
          complianceRequirements: (propsValue.complianceRequirements || []).length,
          notificationTemplates: (propsValue.notificationTemplates || []).length
        },
        deployment: {
          deploymentId: deploymentResult.deploymentId,
          target: propsValue.deploymentTarget || 'production',
          deployedAt: deploymentResult.deployedAt,
          status: deploymentResult.status,
          validationsPassed: validationResult.isValid
        },
        capabilities: {
          supportsEscalation: (propsValue.escalationRules || []).length > 0,
          supportsConditionalRouting: (propsValue.routingRules || []).length > 0,
          supportsCustomValidation: (propsValue.validationRules || []).length > 0,
          supportsComplianceChecking: (propsValue.complianceRequirements || []).length > 0,
          supportsAnalytics: propsValue.enableAnalytics !== false,
          allowsOverrides: propsValue.allowOverrides !== false
        },
        integration: {
          webhookEndpoints: (propsValue.webhookEndpoints || []).length,
          notificationChannels: (propsValue.defaultNotificationChannels || ['email']).length,
          customIntegrations: !!propsValue.integrationSettings,
          hasCustomScripts: !!propsValue.scripts
        },
        metadata: {
          workflowConfigurationVersion: '1.0.0',
          configurationComplexity: calculateComplexityScore(propsValue),
          estimatedPerformance: estimateWorkflowPerformance(propsValue),
          complianceLevel: getComplianceLevel(propsValue.complianceRequirements || [])
        }
      };

    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown workflow configuration error',
          type: 'WorkflowConfigurationError',
          timestamp: new Date().toISOString(),
          context: {
            workflowName: propsValue.workflowName,
            workflowType: propsValue.workflowType,
            category: propsValue.category,
            hasStages: Array.isArray(propsValue.stages) && propsValue.stages.length > 0,
            deploymentTarget: propsValue.deploymentTarget
          }
        }
      };
    }
  }
});

/**
 * Validate workflow configuration
 */
function validateWorkflowConfiguration(config: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.workflowName || config.workflowName.trim() === '') {
    errors.push('Workflow name is required');
  }

  if (!config.description || config.description.trim() === '') {
    errors.push('Workflow description is required');
  }

  if (!config.category || config.category.trim() === '') {
    errors.push('Workflow category is required');
  }

  if (!config.workflowType) {
    errors.push('Workflow type is required');
  }

  if (!config.stages || !Array.isArray(config.stages) || config.stages.length === 0) {
    errors.push('At least one workflow stage must be configured');
  }

  // Validate stages
  if (config.stages && Array.isArray(config.stages)) {
    config.stages.forEach((stage: any, index: number) => {
      if (!stage.name) {
        errors.push(`Stage ${index + 1} requires a name`);
      }
      if (stage.approvers && Array.isArray(stage.approvers) && stage.approvers.length === 0) {
        errors.push(`Stage ${index + 1} requires at least one approver`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Process and normalize workflow configuration
 */
async function processWorkflowConfiguration(config: any): Promise<any> {
  // In real implementation, this would normalize and validate the configuration
  // against schemas, resolve role references, validate integrations, etc.
  
  const processedConfig = {
    ...config,
    processedAt: new Date().toISOString(),
    configurationHash: generateConfigHash(config),
    normalizedStages: normalizeStages(config.stages),
    resolvedApprovers: await resolveApprovers(config.defaultApprovers),
    compiledRules: compileRules(config.routingRules, config.escalationRules),
    validatedIntegrations: validateIntegrations(config.integration)
  };

  return processedConfig;
}

/**
 * Deploy workflow configuration
 */
async function deployWorkflowConfiguration(config: any): Promise<{
  deploymentId: string;
  deployedAt: string;
  status: string;
}> {
  // In real implementation, this would deploy the configuration to the appropriate environment
  
  const deploymentId = `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    deploymentId,
    deployedAt: new Date().toISOString(),
    status: 'deployed'
  };
}

/**
 * Helper functions (simplified implementations)
 */
function generateConfigHash(config: any): string {
  return `hash_${Math.random().toString(36).substr(2, 16)}`;
}

function normalizeStages(stages: any[]): any[] {
  return stages.map((stage, index) => ({
    ...stage,
    stageNumber: index + 1,
    normalized: true
  }));
}

async function resolveApprovers(approvers: any[]): Promise<any[]> {
  // In real implementation, resolve user IDs, role memberships, etc.
  return approvers.map(approver => ({
    ...approver,
    resolved: true
  }));
}

function compileRules(routingRules: any[], escalationRules: any[]): any {
  return {
    routing: routingRules || [],
    escalation: escalationRules || [],
    compiled: true
  };
}

function validateIntegrations(integration: any): any {
  return {
    ...integration,
    validated: true
  };
}

function calculateComplexityScore(config: any): number {
  let score = 0;
  score += (config.stages || []).length * 10;
  score += (config.routingRules || []).length * 5;
  score += (config.escalationRules || []).length * 5;
  score += (config.validationRules || []).length * 3;
  score += config.scripts ? 20 : 0;
  return Math.min(score, 100);
}

function estimateWorkflowPerformance(config: any): string {
  const complexity = calculateComplexityScore(config);
  if (complexity < 30) return 'high';
  if (complexity < 60) return 'medium';
  return 'low';
}

function getComplianceLevel(requirements: any[]): string {
  if (requirements.length === 0) return 'basic';
  if (requirements.length < 3) return 'standard';
  if (requirements.length < 6) return 'enhanced';
  return 'comprehensive';
}
/**
 * SOP Activepieces Integration Utilities
 * Specialized utilities for Activepieces custom piece development and integration
 */

import { logger } from './logger';
import { SOPProcess, SOPStep } from './sop-process-utilities';
import { ValidationResult } from './sop-validators';

// Activepieces-specific interfaces
export interface ActivepiecesProperty {
  displayName: string;
  description: string;
  type: 'SHORT_TEXT' | 'LONG_TEXT' | 'NUMBER' | 'CHECKBOX' | 'DROPDOWN' | 'MULTI_SELECT_DROPDOWN' | 'JSON' | 'FILE' | 'DATE_TIME' | 'ARRAY' | 'OBJECT' | 'AUTHENTICATION';
  required: boolean;
  defaultValue?: any;
  options?: DropdownOption[];
  validators?: PropertyValidator[];
  placeholder?: string;
  refreshers?: string[];
}

export interface DropdownOption {
  label: string;
  value: any;
}

export interface PropertyValidator {
  type: 'MIN_LENGTH' | 'MAX_LENGTH' | 'MIN_VALUE' | 'MAX_VALUE' | 'REGEX' | 'CUSTOM';
  value?: any;
  message?: string;
  customValidator?: (value: any) => boolean;
}

export interface ActivepiecesAction {
  displayName: string;
  description: string;
  props: Record<string, ActivepiecesProperty>;
  sampleData?: any;
  run: (context: ActivepiecesContext) => Promise<any>;
  test?: (context: ActivepiecesContext) => Promise<any>;
}

export interface ActivepiecesTrigger {
  displayName: string;
  description: string;
  type: 'POLLING' | 'WEBHOOK';
  props: Record<string, ActivepiecesProperty>;
  sampleData?: any;
  onEnable?: (context: ActivepiecesContext) => Promise<any>;
  onDisable?: (context: ActivepiecesContext) => Promise<any>;
  run: (context: ActivepiecesContext) => Promise<any[]>;
  test?: (context: ActivepiecesContext) => Promise<any>;
}

export interface ActivepiecesContext {
  propsValue: Record<string, any>;
  files: {
    write: (data: Buffer, filename: string) => Promise<string>;
  };
  run: {
    id: string;
    tags: string[];
  };
  store: {
    get: (key: string) => Promise<any>;
    put: (key: string, value: any) => Promise<any>;
    delete: (key: string) => Promise<void>;
  };
  connections: {
    get: (key: string) => any;
  };
  httpClient: {
    sendRequest: <T>(request: HttpRequest) => Promise<HttpResponse<T>>;
  };
}

export interface HttpRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  queryParams?: Record<string, string>;
  timeout?: number;
}

export interface HttpResponse<T> {
  status: number;
  headers: Record<string, string>;
  body: T;
}

export interface ActivepiecesPieceDefinition {
  displayName: string;
  description: string;
  version: string;
  minimumSupportedRelease: string;
  maximumSupportedRelease: string;
  logoUrl?: string;
  categories?: string[];
  authors?: string[];
  auth?: any;
  actions: Record<string, ActivepiecesAction>;
  triggers: Record<string, ActivepiecesTrigger>;
}

export interface SOPPieceConfig {
  name: string;
  version: string;
  description: string;
  process: SOPProcess;
  metadata?: Record<string, any>;
}

export interface PieceGenerationResult {
  success: boolean;
  piece_definition?: ActivepiecesPieceDefinition;
  generated_files?: GeneratedFile[];
  validation_errors?: string[];
  warnings?: string[];
}

export interface GeneratedFile {
  filename: string;
  path: string;
  content: string;
  type: 'typescript' | 'json' | 'markdown' | 'test';
}

/**
 * SOP Activepieces Integration Class
 */
export class SOPActivepiecesIntegration {
  private static readonly ACTIVEPIECES_VERSION = '0.30.0';
  private static readonly MINIMUM_VERSION = '0.20.0';

  /**
   * Converts SOP process to Activepieces piece definition
   */
  static convertSOPToActivepiecesPiece(
    config: SOPPieceConfig
  ): PieceGenerationResult {
    try {
      logger.info('Converting SOP process to Activepieces piece', {
        process_name: config.name,
        step_count: config.process.steps.length
      });

      const validation = this.validateSOPForConversion(config);
      if (!validation.isValid) {
        return {
          success: false,
          validation_errors: validation.errors,
          warnings: validation.warnings
        };
      }

      // Generate piece definition
      const pieceDefinition = this.generatePieceDefinition(config);
      
      // Generate associated files
      const generatedFiles = this.generatePieceFiles(config, pieceDefinition);

      logger.info('SOP to Activepieces conversion completed', {
        process_name: config.name,
        actions_count: Object.keys(pieceDefinition.actions).length,
        triggers_count: Object.keys(pieceDefinition.triggers).length,
        files_generated: generatedFiles.length
      });

      return {
        success: true,
        piece_definition: pieceDefinition,
        generated_files: generatedFiles,
        warnings: validation.warnings
      };
    } catch (error) {
      logger.error('SOP to Activepieces conversion failed', { error });
      return {
        success: false,
        validation_errors: [`Conversion error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Validates SOP process for Activepieces conversion
   */
  private static validateSOPForConversion(config: SOPPieceConfig): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Check basic requirements
    if (!config.name) {
      result.errors.push('SOP name is required');
    }
    
    if (!config.process.steps || config.process.steps.length === 0) {
      result.errors.push('SOP must have at least one step');
    }

    // Check step compatibility
    config.process.steps.forEach((step, index) => {
      if (!step.name) {
        result.errors.push(`Step ${index + 1} must have a name`);
      }
      
      if (!step.step_type) {
        result.errors.push(`Step ${index + 1} must have a step type`);
      }
      
      // Check if step type is compatible with Activepieces
      if (!this.isStepTypeCompatible(step.step_type)) {
        result.warnings.push(`Step ${index + 1} type '${step.step_type}' may need manual implementation`);
      }
    });

    // Check for unsupported features
    const hasCyclicDependencies = this.checkForCyclicDependencies(config.process.steps);
    if (hasCyclicDependencies) {
      result.errors.push('Cyclic step dependencies are not supported in Activepieces');
    }

    result.isValid = result.errors.length === 0;
    return result;
  }

  /**
   * Generates Activepieces piece definition
   */
  private static generatePieceDefinition(config: SOPPieceConfig): ActivepiecesPieceDefinition {
    const pieceId = this.sanitizePieceName(config.name);
    
    const actions: Record<string, ActivepiecesAction> = {};
    const triggers: Record<string, ActivepiecesTrigger> = {};

    // Convert steps to actions/triggers
    config.process.steps.forEach(step => {
      if (step.step_type === 'trigger' || step.step_type === 'webhook') {
        triggers[this.sanitizeStepName(step.name)] = this.convertStepToTrigger(step);
      } else {
        actions[this.sanitizeStepName(step.name)] = this.convertStepToAction(step);
      }
    });

    return {
      displayName: config.name,
      description: config.description || `SOP process: ${config.name}`,
      version: config.version || '0.1.0',
      minimumSupportedRelease: this.MINIMUM_VERSION,
      maximumSupportedRelease: this.ACTIVEPIECES_VERSION,
      logoUrl: config.metadata?.logoUrl,
      categories: config.metadata?.categories || ['SOP'],
      authors: config.metadata?.authors || ['SOP Tool'],
      actions,
      triggers
    };
  }

  /**
   * Converts SOP step to Activepieces action
   */
  private static convertStepToAction(step: SOPStep): ActivepiecesAction {
    const props = this.generatePropertiesFromStepConfig(step.configuration || {});
    
    return {
      displayName: step.name,
      description: step.description || `Execute ${step.step_type} step`,
      props,
      sampleData: this.generateSampleData(step),
      run: this.generateActionRunFunction(step),
      test: this.generateActionTestFunction(step)
    };
  }

  /**
   * Converts SOP step to Activepieces trigger
   */
  private static convertStepToTrigger(step: SOPStep): ActivepiecesTrigger {
    const props = this.generatePropertiesFromStepConfig(step.configuration || {});
    const triggerType = step.step_type === 'webhook' ? 'WEBHOOK' : 'POLLING';
    
    return {
      displayName: step.name,
      description: step.description || `Trigger for ${step.step_type}`,
      type: triggerType,
      props,
      sampleData: this.generateSampleData(step),
      run: this.generateTriggerRunFunction(step),
      test: this.generateTriggerTestFunction(step)
    };
  }

  /**
   * Generates Activepieces properties from step configuration
   */
  private static generatePropertiesFromStepConfig(
    config: Record<string, any>
  ): Record<string, ActivepiecesProperty> {
    const props: Record<string, ActivepiecesProperty> = {};
    
    Object.entries(config).forEach(([key, value]) => {
      const property = this.convertConfigToProperty(key, value);
      if (property) {
        props[key] = property;
      }
    });

    // Add common SOP properties
    props.sop_execution_id = {
      displayName: 'SOP Execution ID',
      description: 'Unique identifier for this SOP execution',
      type: 'SHORT_TEXT',
      required: false,
      placeholder: 'Auto-generated if not provided'
    };

    props.sop_context = {
      displayName: 'SOP Context Data',
      description: 'Additional context data for SOP execution',
      type: 'JSON',
      required: false
    };

    return props;
  }

  /**
   * Converts configuration value to Activepieces property
   */
  private static convertConfigToProperty(
    key: string,
    value: any
  ): ActivepiecesProperty | null {
    // Handle typed configuration
    if (typeof value === 'object' && value.type) {
      return {
        displayName: value.displayName || this.humanizeString(key),
        description: value.description || `Configuration for ${key}`,
        type: this.mapConfigTypeToActivepiecesType(value.type),
        required: value.required || false,
        defaultValue: value.defaultValue,
        placeholder: value.placeholder
      };
    }

    // Handle simple values
    const activepiecesType = this.inferActivepiecesType(value);
    if (activepiecesType) {
      return {
        displayName: this.humanizeString(key),
        description: `Configuration value for ${key}`,
        type: activepiecesType,
        required: false,
        defaultValue: value
      };
    }

    return null;
  }

  /**
   * Generates action run function
   */
  private static generateActionRunFunction(step: SOPStep) {
    return async (context: ActivepiecesContext) => {
      const { propsValue, run, store } = context;
      
      try {
        // Log execution start
        await store.put(`execution_${run.id}_start`, new Date().toISOString());
        
        // Execute step logic based on step type
        const result = await this.executeStepLogic(step, propsValue, context);
        
        // Log execution completion
        await store.put(`execution_${run.id}_complete`, {
          timestamp: new Date().toISOString(),
          result: result.success,
          step_id: step.id,
          step_type: step.step_type
        });
        
        return result;
      } catch (error) {
        // Log execution error
        await store.put(`execution_${run.id}_error`, {
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
          step_id: step.id
        });
        
        throw error;
      }
    };
  }

  /**
   * Generates action test function
   */
  private static generateActionTestFunction(step: SOPStep) {
    return async (context: ActivepiecesContext) => {
      return {
        success: true,
        message: `Test execution for step: ${step.name}`,
        step_id: step.id,
        step_type: step.step_type,
        test_data: context.propsValue
      };
    };
  }

  /**
   * Generates trigger run function
   */
  private static generateTriggerRunFunction(step: SOPStep) {
    return async (context: ActivepiecesContext) => {
      const { propsValue, store } = context;
      
      // For polling triggers, implement polling logic
      if (step.step_type === 'polling') {
        const lastPoll = await store.get('last_poll_timestamp');
        const currentTime = new Date().toISOString();
        
        // Store current poll time
        await store.put('last_poll_timestamp', currentTime);
        
        // Return mock trigger data - replace with actual logic
        return [{
          id: `trigger_${Date.now()}`,
          timestamp: currentTime,
          last_poll: lastPoll,
          step_id: step.id,
          data: propsValue
        }];
      }
      
      // For webhook triggers, return empty array (webhooks are handled differently)
      return [];
    };
  }

  /**
   * Generates trigger test function
   */
  private static generateTriggerTestFunction(step: SOPStep) {
    return async (context: ActivepiecesContext) => {
      return {
        success: true,
        message: `Test trigger for step: ${step.name}`,
        step_id: step.id,
        step_type: step.step_type,
        sample_trigger_data: {
          id: 'test_trigger_1',
          timestamp: new Date().toISOString(),
          data: context.propsValue
        }
      };
    };
  }

  /**
   * Executes step logic based on step type
   */
  private static async executeStepLogic(
    step: SOPStep,
    propsValue: Record<string, any>,
    context: ActivepiecesContext
  ): Promise<any> {
    const stepType = step.step_type;
    const config = step.configuration || {};
    
    switch (stepType) {
      case 'data_processing':
        return this.executeDataProcessingStep(propsValue, config);
      case 'notification':
        return this.executeNotificationStep(propsValue, config, context);
      case 'approval':
        return this.executeApprovalStep(propsValue, config, context);
      case 'integration':
        return this.executeIntegrationStep(propsValue, config, context);
      case 'conditional':
        return this.executeConditionalStep(propsValue, config);
      default:
        return this.executeGenericStep(step, propsValue);
    }
  }

  /**
   * Step execution implementations
   */
  private static async executeDataProcessingStep(
    propsValue: Record<string, any>,
    config: Record<string, any>
  ): Promise<any> {
    const inputData = propsValue.input_data || propsValue;
    const transformations = config.transformations || [];
    
    let processedData = { ...inputData };
    
    // Apply transformations
    transformations.forEach((transform: any) => {
      if (transform.type === 'map_field') {
        if (processedData[transform.source_field] !== undefined) {
          processedData[transform.target_field] = processedData[transform.source_field];
          if (transform.remove_source) {
            delete processedData[transform.source_field];
          }
        }
      }
    });
    
    return {
      success: true,
      processed_data: processedData,
      transformations_applied: transformations.length
    };
  }

  private static async executeNotificationStep(
    propsValue: Record<string, any>,
    config: Record<string, any>,
    context: ActivepiecesContext
  ): Promise<any> {
    const notificationType = config.notification_type || 'log';
    const message = this.interpolateTemplate(
      config.message || propsValue.message || 'SOP Notification',
      propsValue
    );
    
    // For demonstration, we'll just log the notification
    // In a real implementation, you'd integrate with notification services
    
    return {
      success: true,
      notification_sent: true,
      notification_type: notificationType,
      message,
      timestamp: new Date().toISOString()
    };
  }

  private static async executeApprovalStep(
    propsValue: Record<string, any>,
    config: Record<string, any>,
    context: ActivepiecesContext
  ): Promise<any> {
    const approvalType = config.approval_type || 'single';
    const requiredApprovers = config.required_approvers || [];
    
    // Create approval request
    const approvalRequest = {
      id: `approval_${Date.now()}`,
      type: approvalType,
      required_approvers: requiredApprovers,
      approval_data: propsValue,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    // Store approval request
    await context.store.put(`approval_${approvalRequest.id}`, approvalRequest);
    
    return {
      success: true,
      approval_request: approvalRequest,
      status: 'pending_approval',
      next_action: 'wait_for_approval'
    };
  }

  private static async executeIntegrationStep(
    propsValue: Record<string, any>,
    config: Record<string, any>,
    context: ActivepiecesContext
  ): Promise<any> {
    const integrationType = config.integration_type || 'webhook';
    
    if (integrationType === 'webhook') {
      const endpoint = config.endpoint || propsValue.endpoint;
      if (!endpoint) {
        throw new Error('Webhook endpoint is required for integration step');
      }
      
      const response = await context.httpClient.sendRequest({
        method: config.method || 'POST',
        url: endpoint,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers
        },
        body: propsValue
      });
      
      return {
        success: true,
        integration_type: integrationType,
        response_status: response.status,
        response_data: response.body
      };
    }
    
    return {
      success: true,
      integration_type: integrationType,
      message: 'Integration executed (mock)'
    };
  }

  private static async executeConditionalStep(
    propsValue: Record<string, any>,
    config: Record<string, any>
  ): Promise<any> {
    const conditions = config.conditions || [];
    let conditionMet = false;
    let matchedCondition = null;
    
    for (const condition of conditions) {
      if (this.evaluateCondition(condition, propsValue)) {
        conditionMet = true;
        matchedCondition = condition;
        break;
      }
    }
    
    return {
      success: true,
      condition_met: conditionMet,
      matched_condition: matchedCondition,
      next_step: conditionMet ? matchedCondition?.next_step : config.default_next_step
    };
  }

  private static async executeGenericStep(
    step: SOPStep,
    propsValue: Record<string, any>
  ): Promise<any> {
    return {
      success: true,
      step_id: step.id,
      step_type: step.step_type,
      step_name: step.name,
      input_data: propsValue,
      executed_at: new Date().toISOString()
    };
  }

  /**
   * Generates sample data for step
   */
  private static generateSampleData(step: SOPStep): any {
    const baseSample = {
      step_id: step.id,
      step_name: step.name,
      step_type: step.step_type,
      timestamp: new Date().toISOString()
    };
    
    switch (step.step_type) {
      case 'data_processing':
        return {
          ...baseSample,
          input_data: { field1: 'value1', field2: 'value2' },
          processed_data: { transformed_field1: 'processed_value1' }
        };
      case 'notification':
        return {
          ...baseSample,
          message: 'Sample notification message',
          recipient: 'user@example.com',
          notification_sent: true
        };
      case 'approval':
        return {
          ...baseSample,
          approval_request_id: 'approval_123',
          status: 'pending',
          required_approvers: ['approver1@example.com']
        };
      default:
        return baseSample;
    }
  }

  /**
   * Generates piece files
   */
  private static generatePieceFiles(
    config: SOPPieceConfig,
    pieceDefinition: ActivepiecesPieceDefinition
  ): GeneratedFile[] {
    const files: GeneratedFile[] = [];
    const pieceName = this.sanitizePieceName(config.name);
    
    // Generate main piece file
    files.push({
      filename: `${pieceName}.ts`,
      path: `src/lib/pieces/${pieceName}`,
      content: this.generatePieceMainFile(pieceName, pieceDefinition),
      type: 'typescript'
    });
    
    // Generate actions files
    Object.entries(pieceDefinition.actions).forEach(([actionName, action]) => {
      files.push({
        filename: `${actionName}.ts`,
        path: `src/lib/pieces/${pieceName}/actions`,
        content: this.generateActionFile(actionName, action),
        type: 'typescript'
      });
    });
    
    // Generate triggers files
    Object.entries(pieceDefinition.triggers).forEach(([triggerName, trigger]) => {
      files.push({
        filename: `${triggerName}.ts`,
        path: `src/lib/pieces/${pieceName}/triggers`,
        content: this.generateTriggerFile(triggerName, trigger),
        type: 'typescript'
      });
    });
    
    // Generate package.json
    files.push({
      filename: 'package.json',
      path: `src/lib/pieces/${pieceName}`,
      content: JSON.stringify(this.generatePackageJson(config), null, 2),
      type: 'json'
    });
    
    // Generate README
    files.push({
      filename: 'README.md',
      path: `src/lib/pieces/${pieceName}`,
      content: this.generateReadmeFile(config, pieceDefinition),
      type: 'markdown'
    });
    
    return files;
  }

  /**
   * File generation methods
   */
  private static generatePieceMainFile(
    pieceName: string,
    pieceDefinition: ActivepiecesPieceDefinition
  ): string {
    const actionImports = Object.keys(pieceDefinition.actions)
      .map(name => `import { ${name} } from './actions/${name}';`)
      .join('\n');
    
    const triggerImports = Object.keys(pieceDefinition.triggers)
      .map(name => `import { ${name} } from './triggers/${name}';`)
      .join('\n');
    
    return `import { createPiece } from '@activepieces/pieces-framework';
${actionImports}
${triggerImports}

export const ${pieceName} = createPiece({
  displayName: '${pieceDefinition.displayName}',
  description: '${pieceDefinition.description}',
  logoUrl: '${pieceDefinition.logoUrl || ''}',
  version: '${pieceDefinition.version}',
  minimumSupportedRelease: '${pieceDefinition.minimumSupportedRelease}',
  maximumSupportedRelease: '${pieceDefinition.maximumSupportedRelease}',
  authors: [${pieceDefinition.authors?.map(author => `'${author}'`).join(', ') || ''}],
  categories: [${pieceDefinition.categories?.map(cat => `'${cat}'`).join(', ') || ''}],
  actions: {
    ${Object.keys(pieceDefinition.actions).join(',\n    ')}
  },
  triggers: {
    ${Object.keys(pieceDefinition.triggers).join(',\n    ')}
  },
});
`;
  }

  private static generateActionFile(
    actionName: string,
    action: ActivepiecesAction
  ): string {
    const propsContent = this.generatePropsCode(action.props);
    
    return `import { createAction, Property } from '@activepieces/pieces-framework';

export const ${actionName} = createAction({
  name: '${actionName}',
  displayName: '${action.displayName}',
  description: '${action.description}',
  props: {
${propsContent}
  },
  async run(context) {
    // SOP Action Implementation
    const { propsValue, run, store } = context;
    
    try {
      // Log execution start
      await store.put(\`execution_\${run.id}_start\`, new Date().toISOString());
      
      // TODO: Implement actual step logic here
      const result = {
        success: true,
        message: 'SOP action executed successfully',
        data: propsValue,
        timestamp: new Date().toISOString()
      };
      
      // Log execution completion
      await store.put(\`execution_\${run.id}_complete\`, {
        timestamp: new Date().toISOString(),
        result: result.success
      });
      
      return result;
    } catch (error) {
      await store.put(\`execution_\${run.id}_error\`, {
        timestamp: new Date().toISOString(),
        error: error.message
      });
      throw error;
    }
  },
});
`;
  }

  private static generateTriggerFile(
    triggerName: string,
    trigger: ActivepiecesTrigger
  ): string {
    const propsContent = this.generatePropsCode(trigger.props);
    const triggerType = trigger.type === 'WEBHOOK' ? 'TriggerStrategy.WEBHOOK' : 'TriggerStrategy.POLLING';
    
    return `import { createTrigger, TriggerStrategy, Property } from '@activepieces/pieces-framework';

export const ${triggerName} = createTrigger({
  name: '${triggerName}',
  displayName: '${trigger.displayName}',
  description: '${trigger.description}',
  type: ${triggerType},
  props: {
${propsContent}
  },
  async run(context) {
    const { propsValue, store } = context;
    
    ${trigger.type === 'POLLING' ? `
    // Polling logic
    const lastPoll = await store.get('last_poll_timestamp');
    const currentTime = new Date().toISOString();
    await store.put('last_poll_timestamp', currentTime);
    
    // TODO: Implement polling logic
    return [{
      id: \`trigger_\${Date.now()}\`,
      timestamp: currentTime,
      last_poll: lastPoll,
      data: propsValue
    }];` : `
    // Webhook logic
    // TODO: Implement webhook handling
    return [];`}
  },
});
`;
  }

  private static generatePropsCode(props: Record<string, ActivepiecesProperty>): string {
    return Object.entries(props)
      .map(([propName, prop]) => {
        const validators = prop.validators ? 
          `, validators: [${prop.validators.map(v => this.generateValidatorCode(v)).join(', ')}]` : '';
        const options = prop.options ? 
          `, options: [${prop.options.map(opt => `{ label: '${opt.label}', value: ${JSON.stringify(opt.value)} }`).join(', ')}]` : '';
        
        return `    ${propName}: Property.${prop.type}({
      displayName: '${prop.displayName}',
      description: '${prop.description}',
      required: ${prop.required}${prop.defaultValue !== undefined ? `,\n      defaultValue: ${JSON.stringify(prop.defaultValue)}` : ''}${prop.placeholder ? `,\n      placeholder: '${prop.placeholder}'` : ''}${validators}${options}
    })`;
      })
      .join(',\n');
  }

  private static generateValidatorCode(validator: PropertyValidator): string {
    switch (validator.type) {
      case 'MIN_LENGTH':
        return `Validators.minLength(${validator.value})`;
      case 'MAX_LENGTH':
        return `Validators.maxLength(${validator.value})`;
      case 'MIN_VALUE':
        return `Validators.minValue(${validator.value})`;
      case 'MAX_VALUE':
        return `Validators.maxValue(${validator.value})`;
      case 'REGEX':
        return `Validators.pattern(/${validator.value}/)`;
      default:
        return 'Validators.required';
    }
  }

  private static generatePackageJson(config: SOPPieceConfig): any {
    return {
      name: `@activepieces/piece-${this.sanitizePieceName(config.name)}`,
      version: config.version || '0.1.0',
      description: config.description,
      main: 'index.js',
      types: 'index.d.ts',
      dependencies: {
        '@activepieces/pieces-framework': '^0.30.0'
      },
      peerDependencies: {
        '@activepieces/pieces-framework': '^0.30.0'
      },
      keywords: ['activepieces', 'sop', 'automation'],
      author: config.metadata?.author || 'SOP Tool',
      license: 'MIT'
    };
  }

  private static generateReadmeFile(
    config: SOPPieceConfig,
    pieceDefinition: ActivepiecesPieceDefinition
  ): string {
    const actionsList = Object.keys(pieceDefinition.actions)
      .map(name => `- **${name}**: ${pieceDefinition.actions[name].description}`)
      .join('\n');
    
    const triggersList = Object.keys(pieceDefinition.triggers)
      .map(name => `- **${name}**: ${pieceDefinition.triggers[name].description}`)
      .join('\n');
    
    return `# ${pieceDefinition.displayName}

${pieceDefinition.description}

## Version
${pieceDefinition.version}

## Actions
${actionsList || 'No actions defined'}

## Triggers
${triggersList || 'No triggers defined'}

## Installation

1. Copy this piece to your Activepieces installation
2. Build the piece: \`npm run build\`
3. Install in your Activepieces instance

## Configuration

This piece was generated from SOP process: **${config.process.name}**

Original SOP had ${config.process.steps.length} steps.

## Support

Generated by SOP to Activepieces conversion tool.
`;
  }

  /**
   * Helper methods
   */
  private static isStepTypeCompatible(stepType: string): boolean {
    const compatibleTypes = [
      'data_processing',
      'notification',
      'integration',
      'webhook',
      'conditional',
      'trigger',
      'polling'
    ];
    return compatibleTypes.includes(stepType);
  }

  private static checkForCyclicDependencies(steps: SOPStep[]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (stepId: string): boolean => {
      if (recursionStack.has(stepId)) return true;
      if (visited.has(stepId)) return false;
      
      visited.add(stepId);
      recursionStack.add(stepId);
      
      const step = steps.find(s => s.id === stepId);
      if (step && step.parent_step_id) {
        if (hasCycle(step.parent_step_id)) return true;
      }
      
      recursionStack.delete(stepId);
      return false;
    };
    
    for (const step of steps) {
      if (step.id && !visited.has(step.id)) {
        if (hasCycle(step.id)) return true;
      }
    }
    
    return false;
  }

  private static sanitizePieceName(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');
  }

  private static sanitizeStepName(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/_+/g, '_');
  }

  private static humanizeString(str: string): string {
    return str.replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private static mapConfigTypeToActivepiecesType(type: string): ActivepiecesProperty['type'] {
    const typeMap: Record<string, ActivepiecesProperty['type']> = {
      'string': 'SHORT_TEXT',
      'text': 'LONG_TEXT',
      'number': 'NUMBER',
      'boolean': 'CHECKBOX',
      'select': 'DROPDOWN',
      'multiselect': 'MULTI_SELECT_DROPDOWN',
      'json': 'JSON',
      'file': 'FILE',
      'datetime': 'DATE_TIME',
      'array': 'ARRAY',
      'object': 'OBJECT'
    };
    
    return typeMap[type] || 'SHORT_TEXT';
  }

  private static inferActivepiecesType(value: any): ActivepiecesProperty['type'] | null {
    if (typeof value === 'string') return 'SHORT_TEXT';
    if (typeof value === 'number') return 'NUMBER';
    if (typeof value === 'boolean') return 'CHECKBOX';
    if (Array.isArray(value)) return 'ARRAY';
    if (typeof value === 'object' && value !== null) return 'JSON';
    return null;
  }

  private static evaluateCondition(condition: any, data: any): boolean {
    const value = data[condition.field];
    
    switch (condition.operator) {
      case 'equals': return value === condition.value;
      case 'not_equals': return value !== condition.value;
      case 'greater_than': return Number(value) > Number(condition.value);
      case 'less_than': return Number(value) < Number(condition.value);
      case 'contains': return String(value).includes(String(condition.value));
      case 'exists': return value !== undefined && value !== null;
      default: return false;
    }
  }

  private static interpolateTemplate(template: string, data: any): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      return data[key.trim()] || match;
    });
  }
}

/**
 * SOP Process Utilities
 * Core utilities for SOP process management, transformation, and execution
 */

import { logger } from './logger';
import { SOPValidator, ValidationResult } from './sop-validators';

// Core interfaces for SOP processing
export interface SOPProcess {
  id: string;
  name: string;
  description?: string;
  steps: SOPStep[];
  metadata?: Record<string, any>;
  status: 'draft' | 'active' | 'archived';
  version: number;
}

export interface SOPStep {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  step_type: string;
  configuration?: Record<string, any>;
  position: number;
  parent_step_id?: string;
  is_active: boolean;
  dependencies?: string[];
}

export interface SOPExecutionContext {
  process_id: string;
  execution_id: string;
  current_step_id?: string;
  user_id?: string;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  metadata?: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at?: Date;
  completed_at?: Date;
}

export interface SOPDecision {
  id: string;
  step_id: string;
  decision_type: 'approval' | 'conditional' | 'routing';
  decision_data: Record<string, any>;
  decision_maker?: string;
  timestamp: Date;
  result: 'approved' | 'rejected' | 'conditional' | 'route';
  next_step_id?: string;
}

export interface ProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
  warnings?: string[];
  metadata?: Record<string, any>;
}

/**
 * Core SOP Process Utilities Class
 */
export class SOPProcessUtilities {
  /**
   * Parses and validates SOP process definition
   */
  static parseSOPProcess(processData: any): ProcessingResult {
    try {
      const validation = SOPValidator.validateSOPProcess(processData);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Process validation failed: ${validation.errors.join('; ')}`,
          warnings: validation.warnings
        };
      }

      // Transform and normalize process data
      const normalizedProcess = this.normalizeProcessData(processData);
      
      // Build step dependency graph
      const dependencyGraph = this.buildDependencyGraph(normalizedProcess.steps);
      
      return {
        success: true,
        data: {
          process: normalizedProcess,
          dependency_graph: dependencyGraph,
          execution_order: this.calculateExecutionOrder(normalizedProcess.steps)
        },
        warnings: validation.warnings
      };
    } catch (error) {
      logger.error('Failed to parse SOP process', { error });
      return {
        success: false,
        error: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Normalizes process data to consistent format
   */
  private static normalizeProcessData(processData: any): SOPProcess {
    return {
      id: processData.id || this.generateId(),
      name: processData.name,
      description: processData.description,
      steps: processData.steps?.map((step: any, index: number) => ({
        id: step.id || this.generateId(),
        project_id: processData.id,
        name: step.name,
        description: step.description,
        step_type: step.step_type,
        configuration: step.configuration || {},
        position: step.position !== undefined ? step.position : index,
        parent_step_id: step.parent_step_id,
        is_active: step.is_active !== false,
        dependencies: step.dependencies || []
      })) || [],
      metadata: processData.metadata || {},
      status: processData.status || 'draft',
      version: processData.version || 1
    };
  }

  /**
   * Builds step dependency graph
   */
  private static buildDependencyGraph(steps: SOPStep[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    
    steps.forEach(step => {
      const dependencies = [];
      
      // Add parent step as dependency
      if (step.parent_step_id) {
        dependencies.push(step.parent_step_id);
      }
      
      // Add explicit dependencies
      if (step.dependencies) {
        dependencies.push(...step.dependencies);
      }
      
      graph.set(step.id, dependencies);
    });
    
    return graph;
  }

  /**
   * Calculates optimal execution order for steps
   */
  private static calculateExecutionOrder(steps: SOPStep[]): string[] {
    const dependencyGraph = this.buildDependencyGraph(steps);
    const visited = new Set<string>();
    const result: string[] = [];
    
    const visit = (stepId: string) => {
      if (visited.has(stepId)) return;
      
      const dependencies = dependencyGraph.get(stepId) || [];
      dependencies.forEach(dep => {
        if (!visited.has(dep)) {
          visit(dep);
        }
      });
      
      visited.add(stepId);
      result.push(stepId);
    };
    
    // Sort steps by position first, then apply topological sort
    const sortedSteps = [...steps].sort((a, b) => a.position - b.position);
    sortedSteps.forEach(step => {
      if (!visited.has(step.id)) {
        visit(step.id);
      }
    });
    
    return result;
  }

  /**
   * Transforms SOP data between different formats
   */
  static transformSOPData(data: any, fromFormat: string, toFormat: string): ProcessingResult {
    try {
      let transformedData;
      
      switch (`${fromFormat}_to_${toFormat}`) {
        case 'json_to_activepieces':
          transformedData = this.transformJsonToActivepieces(data);
          break;
        case 'activepieces_to_json':
          transformedData = this.transformActivepiecesToJson(data);
          break;
        case 'template_to_process':
          transformedData = this.transformTemplateToProcess(data);
          break;
        default:
          throw new Error(`Unsupported transformation: ${fromFormat} to ${toFormat}`);
      }
      
      return {
        success: true,
        data: transformedData
      };
    } catch (error) {
      logger.error('Data transformation failed', { error, fromFormat, toFormat });
      return {
        success: false,
        error: `Transformation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Transforms JSON process to Activepieces format
   */
  private static transformJsonToActivepieces(jsonData: any): any {
    return {
      displayName: jsonData.name,
      description: jsonData.description,
      version: `0.${jsonData.version}.0`,
      minimumSupportedRelease: '0.20.0',
      maximumSupportedRelease: '0.30.0',
      actions: this.transformStepsToActions(jsonData.steps || []),
      triggers: this.transformStepsToTriggers(jsonData.steps || [])
    };
  }

  /**
   * Transforms steps to Activepieces actions
   */
  private static transformStepsToActions(steps: SOPStep[]): Record<string, any> {
    const actions: Record<string, any> = {};
    
    steps.forEach(step => {
      if (step.step_type !== 'trigger') {
        actions[step.id] = {
          displayName: step.name,
          description: step.description || '',
          props: this.transformStepConfiguration(step.configuration || {}),
          async run(context: any) {
            // This would be replaced with actual step execution logic
            return {
              success: true,
              data: context.propsValue
            };
          }
        };
      }
    });
    
    return actions;
  }

  /**
   * Transforms steps to Activepieces triggers
   */
  private static transformStepsToTriggers(steps: SOPStep[]): Record<string, any> {
    const triggers: Record<string, any> = {};
    
    steps
      .filter(step => step.step_type === 'trigger')
      .forEach(step => {
        triggers[step.id] = {
          displayName: step.name,
          description: step.description || '',
          props: this.transformStepConfiguration(step.configuration || {}),
          type: 'WEBHOOK', // Default trigger type
          async run(context: any) {
            return [];
          }
        };
      });
    
    return triggers;
  }

  /**
   * Transforms step configuration to Activepieces props
   */
  private static transformStepConfiguration(config: Record<string, any>): Record<string, any> {
    const props: Record<string, any> = {};
    
    Object.entries(config).forEach(([key, value]) => {
      if (typeof value === 'object' && value.type) {
        // Handle typed configuration
        props[key] = {
          displayName: value.displayName || key,
          description: value.description || '',
          type: value.type,
          required: value.required || false
        };
      } else {
        // Handle simple configuration
        props[key] = {
          displayName: key,
          type: 'SHORT_TEXT',
          required: false
        };
      }
    });
    
    return props;
  }

  /**
   * Transforms Activepieces format back to JSON
   */
  private static transformActivepiecesToJson(activepiecesData: any): SOPProcess {
    const steps: SOPStep[] = [];
    let position = 0;
    
    // Transform actions to steps
    if (activepiecesData.actions) {
      Object.entries(activepiecesData.actions).forEach(([id, action]: [string, any]) => {
        steps.push({
          id,
          project_id: '', // Will be set when saving
          name: action.displayName,
          description: action.description,
          step_type: 'action',
          configuration: this.transformPropsToConfiguration(action.props || {}),
          position: position++,
          parent_step_id: undefined,
          is_active: true
        });
      });
    }
    
    // Transform triggers to steps
    if (activepiecesData.triggers) {
      Object.entries(activepiecesData.triggers).forEach(([id, trigger]: [string, any]) => {
        steps.push({
          id,
          project_id: '',
          name: trigger.displayName,
          description: trigger.description,
          step_type: 'trigger',
          configuration: this.transformPropsToConfiguration(trigger.props || {}),
          position: position++,
          parent_step_id: undefined,
          is_active: true
        });
      });
    }
    
    return {
      id: this.generateId(),
      name: activepiecesData.displayName,
      description: activepiecesData.description,
      steps,
      status: 'draft',
      version: 1
    };
  }

  /**
   * Transforms Activepieces props back to configuration
   */
  private static transformPropsToConfiguration(props: Record<string, any>): Record<string, any> {
    const config: Record<string, any> = {};
    
    Object.entries(props).forEach(([key, prop]) => {
      if (typeof prop === 'object') {
        config[key] = {
          type: prop.type,
          displayName: prop.displayName,
          description: prop.description,
          required: prop.required
        };
      }
    });
    
    return config;
  }

  /**
   * Transforms template to process
   */
  private static transformTemplateToProcess(template: any): SOPProcess {
    const templateData = template.template_data;
    
    return {
      id: this.generateId(),
      name: template.name,
      description: template.description,
      steps: templateData.steps?.map((step: any, index: number) => ({
        id: this.generateId(),
        project_id: '', // Will be set when saving
        name: step.name,
        description: step.description,
        step_type: step.step_type,
        configuration: step.configuration || {},
        position: index,
        parent_step_id: step.parent_step_id,
        is_active: true
      })) || [],
      status: 'draft',
      version: 1,
      metadata: {
        created_from_template: template.id,
        template_category: template.category
      }
    };
  }

  /**
   * Executes a single SOP step
   */
  static async executeSOPStep(
    step: SOPStep, 
    context: SOPExecutionContext, 
    inputData?: Record<string, any>
  ): Promise<ProcessingResult> {
    try {
      logger.info(`Executing SOP step: ${step.name}`, { 
        step_id: step.id, 
        execution_id: context.execution_id 
      });

      // Validate input data
      const inputValidation = SOPValidator.validateStepInput(
        step.configuration || {}, 
        inputData
      );
      
      if (!inputValidation.isValid) {
        return {
          success: false,
          error: `Input validation failed: ${inputValidation.errors.join('; ')}`,
          warnings: inputValidation.warnings
        };
      }

      // Execute step based on type
      const result = await this.executeStepByType(step, context, inputData);
      
      logger.info(`SOP step execution completed`, { 
        step_id: step.id, 
        success: result.success 
      });
      
      return result;
      
    } catch (error) {
      logger.error('SOP step execution failed', { 
        step_id: step.id, 
        error 
      });
      
      return {
        success: false,
        error: `Execution error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Executes step based on its type
   */
  private static async executeStepByType(
    step: SOPStep, 
    context: SOPExecutionContext, 
    inputData?: Record<string, any>
  ): Promise<ProcessingResult> {
    const config = step.configuration || {};
    
    switch (step.step_type) {
      case 'approval':
        return this.executeApprovalStep(step, context, inputData);
      case 'data_processing':
        return this.executeDataProcessingStep(step, context, inputData);
      case 'notification':
        return this.executeNotificationStep(step, context, inputData);
      case 'conditional':
        return this.executeConditionalStep(step, context, inputData);
      case 'integration':
        return this.executeIntegrationStep(step, context, inputData);
      default:
        return this.executeGenericStep(step, context, inputData);
    }
  }

  /**
   * Executes approval step
   */
  private static async executeApprovalStep(
    step: SOPStep, 
    context: SOPExecutionContext, 
    inputData?: Record<string, any>
  ): Promise<ProcessingResult> {
    // Create approval request
    const approvalRequest = {
      id: this.generateId(),
      step_id: step.id,
      execution_id: context.execution_id,
      requester_id: context.user_id,
      approval_data: inputData,
      status: 'pending',
      created_at: new Date()
    };
    
    return {
      success: true,
      data: {
        approval_request: approvalRequest,
        status: 'pending_approval',
        next_action: 'wait_for_approval'
      },
      metadata: {
        requires_approval: true,
        approval_timeout: step.configuration?.approval_timeout || 3600000 // 1 hour default
      }
    };
  }

  /**
   * Executes data processing step
   */
  private static async executeDataProcessingStep(
    step: SOPStep, 
    context: SOPExecutionContext, 
    inputData?: Record<string, any>
  ): Promise<ProcessingResult> {
    const config = step.configuration || {};
    const transformations = config.transformations || [];
    
    let processedData = { ...inputData };
    
    // Apply transformations
    transformations.forEach((transform: any) => {
      processedData = this.applyDataTransformation(processedData, transform);
    });
    
    return {
      success: true,
      data: processedData,
      metadata: {
        transformations_applied: transformations.length
      }
    };
  }

  /**
   * Executes notification step
   */
  private static async executeNotificationStep(
    step: SOPStep, 
    context: SOPExecutionContext, 
    inputData?: Record<string, any>
  ): Promise<ProcessingResult> {
    const config = step.configuration || {};
    
    const notification = {
      id: this.generateId(),
      type: config.notification_type || 'email',
      recipient: config.recipient || context.user_id,
      subject: this.interpolateTemplate(config.subject || 'SOP Notification', inputData),
      message: this.interpolateTemplate(config.message || 'Step completed', inputData),
      sent_at: new Date()
    };
    
    // Here you would integrate with actual notification service
    
    return {
      success: true,
      data: { notification_sent: true },
      metadata: { notification }
    };
  }

  /**
   * Executes conditional step
   */
  private static async executeConditionalStep(
    step: SOPStep, 
    context: SOPExecutionContext, 
    inputData?: Record<string, any>
  ): Promise<ProcessingResult> {
    const config = step.configuration || {};
    const conditions = config.conditions || [];
    
    let conditionMet = false;
    let nextStepId: string | undefined;
    
    for (const condition of conditions) {
      if (this.evaluateCondition(condition, inputData)) {
        conditionMet = true;
        nextStepId = condition.next_step_id;
        break;
      }
    }
    
    return {
      success: true,
      data: {
        condition_met: conditionMet,
        next_step_id: nextStepId || config.default_next_step
      }
    };
  }

  /**
   * Executes integration step
   */
  private static async executeIntegrationStep(
    step: SOPStep, 
    context: SOPExecutionContext, 
    inputData?: Record<string, any>
  ): Promise<ProcessingResult> {
    const config = step.configuration || {};
    
    // This would integrate with external systems
    return {
      success: true,
      data: {
        integration_type: config.integration_type,
        result: 'integration_executed',
        external_id: this.generateId()
      }
    };
  }

  /**
   * Executes generic step
   */
  private static async executeGenericStep(
    step: SOPStep, 
    context: SOPExecutionContext, 
    inputData?: Record<string, any>
  ): Promise<ProcessingResult> {
    return {
      success: true,
      data: inputData,
      metadata: {
        step_type: step.step_type,
        executed_at: new Date()
      }
    };
  }

  /**
   * Applies data transformation
   */
  private static applyDataTransformation(data: any, transform: any): any {
    const result = { ...data };
    
    switch (transform.type) {
      case 'map_field':
        if (result[transform.source_field] !== undefined) {
          result[transform.target_field] = result[transform.source_field];
          if (transform.remove_source) {
            delete result[transform.source_field];
          }
        }
        break;
      case 'format_string':
        if (result[transform.field] !== undefined) {
          result[transform.field] = this.interpolateTemplate(
            transform.template, 
            { [transform.field]: result[transform.field] }
          );
        }
        break;
      case 'calculate':
        result[transform.target_field] = this.evaluateExpression(
          transform.expression, 
          data
        );
        break;
    }
    
    return result;
  }

  /**
   * Evaluates condition
   */
  private static evaluateCondition(condition: any, data: any): boolean {
    const value = data?.[condition.field];
    
    switch (condition.operator) {
      case 'equals':
        return value === condition.value;
      case 'not_equals':
        return value !== condition.value;
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      case 'contains':
        return String(value).includes(String(condition.value));
      case 'exists':
        return value !== undefined && value !== null;
      default:
        return false;
    }
  }

  /**
   * Interpolates template string with data
   */
  private static interpolateTemplate(template: string, data: any): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      return data?.[key.trim()] || match;
    });
  }

  /**
   * Evaluates mathematical expression
   */
  private static evaluateExpression(expression: string, data: any): any {
    // Simple expression evaluation - in production, use a safer evaluator
    try {
      const interpolated = this.interpolateTemplate(expression, data);
      // This is a simplified evaluator - use a proper expression parser in production
      return Function('"use strict"; return (' + interpolated + ')')();
    } catch (error) {
      logger.warn('Expression evaluation failed', { expression, error });
      return null;
    }
  }

  /**
   * Generates unique ID
   */
  private static generateId(): string {
    return `sop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Creates execution context
   */
  static createExecutionContext(
    processId: string, 
    userId?: string, 
    metadata?: Record<string, any>
  ): SOPExecutionContext {
    return {
      process_id: processId,
      execution_id: this.generateId(),
      user_id: userId,
      status: 'pending',
      metadata: metadata || {},
      started_at: new Date()
    };
  }
}

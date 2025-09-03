/**
 * SOP Validation System
 * Comprehensive validation utilities for SOP processes, steps, and data
 */

import { z } from 'zod';
import { logger } from './logger';

// Core SOP validation schemas
const sopProjectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  metadata: z.record(z.any()).optional(),
  version: z.number().int().positive().default(1)
});

const sopStepSchema = z.object({
  id: z.string().uuid().optional(),
  project_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  step_type: z.string().min(1).max(100),
  configuration: z.record(z.any()).optional(),
  position: z.number().int().min(0),
  parent_step_id: z.string().uuid().optional(),
  is_active: z.boolean().default(true)
});

const sopTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().min(1).max(100),
  template_data: z.record(z.any()),
  is_public: z.boolean().default(false),
  usage_count: z.number().int().min(0).default(0)
});

// SOP process execution validation
const sopExecutionContextSchema = z.object({
  project_id: z.string().uuid(),
  step_id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  execution_id: z.string().uuid(),
  input_data: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional()
});

const sopDecisionSchema = z.object({
  decision_id: z.string().uuid(),
  step_id: z.string().uuid(),
  decision_type: z.enum(['approval', 'conditional', 'routing']),
  decision_data: z.record(z.any()),
  decision_maker: z.string().uuid().optional(),
  decision_timestamp: z.date().optional()
});

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data?: any;
}

export interface ComplianceResult {
  isCompliant: boolean;
  violations: ComplianceViolation[];
  score: number;
  auditTrail: AuditEntry[];
}

export interface ComplianceViolation {
  severity: 'low' | 'medium' | 'high' | 'critical';
  code: string;
  message: string;
  step_id?: string;
  data?: any;
}

export interface AuditEntry {
  timestamp: Date;
  action: string;
  user_id?: string;
  step_id?: string;
  data?: any;
}

// Core validation functions
export class SOPValidator {
  /**
   * Validates a complete SOP process definition
   */
  static validateSOPProcess(process: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Validate project structure
      const projectValidation = sopProjectSchema.safeParse(process.project);
      if (!projectValidation.success) {
        result.isValid = false;
        result.errors.push(...projectValidation.error.errors.map(e => `Project: ${e.path.join('.')} - ${e.message}`));
      }

      // Validate steps
      if (process.steps && Array.isArray(process.steps)) {
        process.steps.forEach((step: any, index: number) => {
          const stepValidation = sopStepSchema.safeParse(step);
          if (!stepValidation.success) {
            result.isValid = false;
            result.errors.push(...stepValidation.error.errors.map(e => `Step ${index}: ${e.path.join('.')} - ${e.message}`));
          }
        });

        // Validate step sequence and dependencies
        this.validateStepSequence(process.steps, result);
      } else {
        result.errors.push('Process must contain at least one step');
        result.isValid = false;
      }

      logger.info(`SOP process validation completed`, {
        isValid: result.isValid,
        errorCount: result.errors.length,
        warningCount: result.warnings.length
      });

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      logger.error('SOP process validation failed', { error });
    }

    return result;
  }

  /**
   * Validates step sequence and dependencies
   */
  private static validateStepSequence(steps: any[], result: ValidationResult): void {
    const stepIds = new Set(steps.map(step => step.id).filter(id => id));
    const positions = steps.map(step => step.position);
    
    // Check for duplicate positions
    const duplicatePositions = positions.filter((pos, index) => positions.indexOf(pos) !== index);
    if (duplicatePositions.length > 0) {
      result.errors.push(`Duplicate step positions found: ${duplicatePositions.join(', ')}`);
    }

    // Check parent step references
    steps.forEach((step, index) => {
      if (step.parent_step_id && !stepIds.has(step.parent_step_id)) {
        result.errors.push(`Step ${index} references non-existent parent step: ${step.parent_step_id}`);
      }
    });

    // Check for circular dependencies
    if (this.hasCircularDependencies(steps)) {
      result.errors.push('Circular dependencies detected in step hierarchy');
    }
  }

  /**
   * Detects circular dependencies in step hierarchy
   */
  private static hasCircularDependencies(steps: any[]): boolean {
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

  /**
   * Validates step execution context
   */
  static validateExecutionContext(context: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const validation = sopExecutionContextSchema.safeParse(context);
    if (!validation.success) {
      result.isValid = false;
      result.errors.push(...validation.error.errors.map(e => `Context: ${e.path.join('.')} - ${e.message}`));
    }

    return result;
  }

  /**
   * Validates decision point data
   */
  static validateDecision(decision: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const validation = sopDecisionSchema.safeParse(decision);
    if (!validation.success) {
      result.isValid = false;
      result.errors.push(...validation.error.errors.map(e => `Decision: ${e.path.join('.')} - ${e.message}`));
    }

    return result;
  }

  /**
   * Validates template structure
   */
  static validateTemplate(template: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    const validation = sopTemplateSchema.safeParse(template);
    if (!validation.success) {
      result.isValid = false;
      result.errors.push(...validation.error.errors.map(e => `Template: ${e.path.join('.')} - ${e.message}`));
    }

    // Validate template data structure
    if (template.template_data) {
      this.validateTemplateData(template.template_data, result);
    }

    return result;
  }

  /**
   * Validates template data structure
   */
  private static validateTemplateData(templateData: any, result: ValidationResult): void {
    if (!templateData.steps || !Array.isArray(templateData.steps)) {
      result.errors.push('Template data must contain steps array');
      return;
    }

    templateData.steps.forEach((step: any, index: number) => {
      if (!step.name) {
        result.errors.push(`Template step ${index} must have a name`);
      }
      if (!step.step_type) {
        result.errors.push(`Template step ${index} must have a step_type`);
      }
    });
  }

  /**
   * Comprehensive compliance validation
   */
  static validateCompliance(process: any, rules: any[]): ComplianceResult {
    const violations: ComplianceViolation[] = [];
    const auditTrail: AuditEntry[] = [];
    let score = 100;

    // Apply compliance rules
    rules.forEach(rule => {
      try {
        const ruleResult = this.applyComplianceRule(process, rule);
        if (!ruleResult.passed) {
          const violation: ComplianceViolation = {
            severity: rule.severity || 'medium',
            code: rule.code,
            message: ruleResult.message,
            data: ruleResult.data
          };
          violations.push(violation);
          score -= this.getViolationPenalty(violation.severity);
        }

        auditTrail.push({
          timestamp: new Date(),
          action: `compliance_check_${rule.code}`,
          data: { passed: ruleResult.passed, rule: rule.code }
        });
      } catch (error) {
        logger.error(`Compliance rule ${rule.code} failed`, { error });
      }
    });

    return {
      isCompliant: violations.length === 0,
      violations,
      score: Math.max(0, score),
      auditTrail
    };
  }

  /**
   * Applies a single compliance rule
   */
  private static applyComplianceRule(process: any, rule: any): { passed: boolean; message: string; data?: any } {
    // Implement specific compliance rules
    switch (rule.type) {
      case 'required_approvals':
        return this.checkRequiredApprovals(process, rule);
      case 'step_documentation':
        return this.checkStepDocumentation(process, rule);
      case 'audit_trail':
        return this.checkAuditTrail(process, rule);
      case 'data_retention':
        return this.checkDataRetention(process, rule);
      default:
        return { passed: true, message: 'Unknown rule type' };
    }
  }

  /**
   * Checks required approval compliance
   */
  private static checkRequiredApprovals(process: any, rule: any): { passed: boolean; message: string } {
    const approvalSteps = process.steps?.filter((step: any) => 
      step.step_type === 'approval' || 
      step.configuration?.requires_approval
    ) || [];

    const required = rule.minimum_approvals || 1;
    const passed = approvalSteps.length >= required;

    return {
      passed,
      message: passed 
        ? 'Required approvals present' 
        : `Process requires at least ${required} approval step(s), found ${approvalSteps.length}`
    };
  }

  /**
   * Checks step documentation compliance
   */
  private static checkStepDocumentation(process: any, rule: any): { passed: boolean; message: string } {
    const undocumentedSteps = process.steps?.filter((step: any) => 
      !step.description || step.description.trim().length === 0
    ) || [];

    const passed = undocumentedSteps.length === 0;
    return {
      passed,
      message: passed 
        ? 'All steps documented' 
        : `${undocumentedSteps.length} step(s) missing documentation`
    };
  }

  /**
   * Checks audit trail compliance
   */
  private static checkAuditTrail(process: any, rule: any): { passed: boolean; message: string } {
    // Check if audit trail requirements are met
    const hasAuditConfig = process.metadata?.audit_enabled === true;
    const passed = hasAuditConfig;

    return {
      passed,
      message: passed 
        ? 'Audit trail configured' 
        : 'Audit trail not enabled for process'
    };
  }

  /**
   * Checks data retention compliance
   */
  private static checkDataRetention(process: any, rule: any): { passed: boolean; message: string } {
    const retentionPeriod = process.metadata?.retention_days;
    const requiredRetention = rule.minimum_retention_days || 365;
    const passed = retentionPeriod && retentionPeriod >= requiredRetention;

    return {
      passed,
      message: passed 
        ? 'Data retention policy compliant' 
        : `Data retention period insufficient: ${retentionPeriod || 0} days (required: ${requiredRetention})`
    };
  }

  /**
   * Calculates penalty for compliance violation
   */
  private static getViolationPenalty(severity: string): number {
    switch (severity) {
      case 'critical': return 25;
      case 'high': return 15;
      case 'medium': return 10;
      case 'low': return 5;
      default: return 10;
    }
  }

  /**
   * Validates input data against step configuration
   */
  static validateStepInput(stepConfig: any, inputData: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Check required fields
      const requiredFields = stepConfig.required_fields || [];
      requiredFields.forEach((field: string) => {
        if (!inputData || inputData[field] === undefined || inputData[field] === null) {
          result.errors.push(`Required field missing: ${field}`);
        }
      });

      // Check field types
      const fieldTypes = stepConfig.field_types || {};
      Object.entries(fieldTypes).forEach(([field, expectedType]) => {
        if (inputData && inputData[field] !== undefined) {
          const actualType = typeof inputData[field];
          if (actualType !== expectedType) {
            result.warnings.push(`Field ${field} type mismatch: expected ${expectedType}, got ${actualType}`);
          }
        }
      });

      result.isValid = result.errors.length === 0;

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Input validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }
}

// Export validation schemas for external use
export {
  sopProjectSchema,
  sopStepSchema,
  sopTemplateSchema,
  sopExecutionContextSchema,
  sopDecisionSchema
};

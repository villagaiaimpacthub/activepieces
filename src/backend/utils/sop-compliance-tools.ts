/**
 * SOP Compliance Tools
 * Comprehensive compliance tracking, audit logging, and reporting utilities
 */

import { logger } from './logger';
import { ComplianceResult, ComplianceViolation, AuditEntry } from './sop-validators';

// Compliance tracking interfaces
export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  type: 'required_approvals' | 'step_documentation' | 'audit_trail' | 'data_retention' | 'access_control' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'governance' | 'security' | 'operational' | 'regulatory';
  configuration: Record<string, any>;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ComplianceCheck {
  id: string;
  rule_id: string;
  process_id: string;
  execution_id?: string;
  step_id?: string;
  check_type: 'process' | 'execution' | 'step' | 'data';
  result: 'passed' | 'failed' | 'warning';
  score: number;
  details: Record<string, any>;
  violations: ComplianceViolation[];
  checked_at: Date;
  checked_by?: string;
}

export interface AuditLog {
  id: string;
  process_id: string;
  execution_id?: string;
  step_id?: string;
  user_id?: string;
  action: string;
  resource_type: 'process' | 'step' | 'approval' | 'data' | 'configuration';
  resource_id: string;
  old_value?: any;
  new_value?: any;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
}

export interface ComplianceReport {
  id: string;
  report_type: 'process' | 'period' | 'violation' | 'audit';
  scope: {
    process_ids?: string[];
    date_from?: Date;
    date_to?: Date;
    categories?: string[];
  };
  summary: {
    total_checks: number;
    passed_checks: number;
    failed_checks: number;
    warning_checks: number;
    overall_score: number;
    compliance_percentage: number;
  };
  violations: ComplianceViolation[];
  recommendations: string[];
  generated_at: Date;
  generated_by?: string;
}

/**
 * SOP Compliance Tools Class
 */
export class SOPComplianceTools {
  private static complianceRules = new Map<string, ComplianceRule>();
  private static complianceChecks = new Map<string, ComplianceCheck>();
  private static auditLogs: AuditLog[] = [];
  private static complianceReports = new Map<string, ComplianceReport>();

  /**
   * Initializes default compliance rules
   */
  static initializeDefaultRules(): void {
    const defaultRules: Omit<ComplianceRule, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        name: 'Required Approvals',
        description: 'Ensures critical steps have required approvals',
        type: 'required_approvals',
        severity: 'high',
        category: 'governance',
        configuration: {
          minimum_approvals: 1,
          critical_step_types: ['approval', 'data_modification', 'external_integration']
        },
        is_active: true
      },
      {
        name: 'Step Documentation',
        description: 'All steps must have proper documentation',
        type: 'step_documentation',
        severity: 'medium',
        category: 'operational',
        configuration: {
          minimum_description_length: 10,
          required_fields: ['description']
        },
        is_active: true
      },
      {
        name: 'Audit Trail',
        description: 'Audit logging must be enabled for all processes',
        type: 'audit_trail',
        severity: 'high',
        category: 'security',
        configuration: {
          required_events: ['step_execution', 'approval_decision', 'data_access']
        },
        is_active: true
      },
      {
        name: 'Data Retention',
        description: 'Data retention policies must be configured',
        type: 'data_retention',
        severity: 'medium',
        category: 'regulatory',
        configuration: {
          minimum_retention_days: 365,
          maximum_retention_days: 2555 // 7 years
        },
        is_active: true
      },
      {
        name: 'Access Control',
        description: 'Proper access controls must be in place',
        type: 'access_control',
        severity: 'critical',
        category: 'security',
        configuration: {
          require_role_based_access: true,
          require_approval_authorization: true
        },
        is_active: true
      }
    ];

    defaultRules.forEach(rule => {
      const fullRule: ComplianceRule = {
        ...rule,
        id: this.generateId(),
        created_at: new Date(),
        updated_at: new Date()
      };
      this.complianceRules.set(fullRule.id, fullRule);
    });

    logger.info(`Initialized ${defaultRules.length} default compliance rules`);
  }

  /**
   * Performs comprehensive compliance audit
   */
  static async auditSOPExecution(
    processId: string,
    executionId?: string,
    stepId?: string
  ): Promise<ComplianceResult> {
    try {
      const auditScope = {
        process_id: processId,
        execution_id: executionId,
        step_id: stepId
      };

      logger.info('Starting SOP compliance audit', auditScope);

      const activeRules = Array.from(this.complianceRules.values())
        .filter(rule => rule.is_active);

      const violations: ComplianceViolation[] = [];
      const auditTrail: AuditEntry[] = [];
      let totalScore = 100;
      const checksPerformed: ComplianceCheck[] = [];

      // Run compliance checks for each rule
      for (const rule of activeRules) {
        const checkResult = await this.performComplianceCheck(
          rule,
          processId,
          executionId,
          stepId
        );

        checksPerformed.push(checkResult);

        if (checkResult.result === 'failed') {
          violations.push(...checkResult.violations);
          totalScore -= this.getViolationPenalty(rule.severity);
        } else if (checkResult.result === 'warning') {
          totalScore -= this.getViolationPenalty('low');
        }

        auditTrail.push({
          timestamp: new Date(),
          action: `compliance_check_${rule.type}`,
          step_id: stepId,
          data: {
            rule_id: rule.id,
            result: checkResult.result,
            score: checkResult.score
          }
        });
      }

      // Store compliance checks
      checksPerformed.forEach(check => {
        this.complianceChecks.set(check.id, check);
      });

      // Log audit completion
      this.logAudit(
        processId,
        executionId,
        stepId,
        'compliance_audit_completed',
        'audit',
        '',
        {
          total_checks: checksPerformed.length,
          violations_found: violations.length,
          final_score: Math.max(0, totalScore)
        }
      );

      const result: ComplianceResult = {
        isCompliant: violations.length === 0,
        violations,
        score: Math.max(0, totalScore),
        auditTrail
      };

      logger.info('SOP compliance audit completed', {
        process_id: processId,
        is_compliant: result.isCompliant,
        score: result.score,
        violations_count: violations.length
      });

      return result;
    } catch (error) {
      logger.error('SOP compliance audit failed', {
        process_id: processId,
        error
      });
      throw error;
    }
  }

  /**
   * Performs individual compliance check
   */
  private static async performComplianceCheck(
    rule: ComplianceRule,
    processId: string,
    executionId?: string,
    stepId?: string
  ): Promise<ComplianceCheck> {
    const checkId = this.generateId();
    const check: ComplianceCheck = {
      id: checkId,
      rule_id: rule.id,
      process_id: processId,
      execution_id: executionId,
      step_id: stepId,
      check_type: stepId ? 'step' : executionId ? 'execution' : 'process',
      result: 'passed',
      score: 100,
      details: {},
      violations: [],
      checked_at: new Date()
    };

    try {
      switch (rule.type) {
        case 'required_approvals':
          await this.checkRequiredApprovals(check, rule);
          break;
        case 'step_documentation':
          await this.checkStepDocumentation(check, rule);
          break;
        case 'audit_trail':
          await this.checkAuditTrail(check, rule);
          break;
        case 'data_retention':
          await this.checkDataRetention(check, rule);
          break;
        case 'access_control':
          await this.checkAccessControl(check, rule);
          break;
        case 'custom':
          await this.checkCustomRule(check, rule);
          break;
        default:
          check.result = 'warning';
          check.details.message = `Unknown rule type: ${rule.type}`;
      }
    } catch (error) {
      check.result = 'failed';
      check.score = 0;
      check.violations.push({
        severity: 'critical',
        code: 'check_execution_failed',
        message: `Compliance check execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        step_id: stepId
      });
    }

    return check;
  }

  /**
   * Checks required approvals compliance
   */
  private static async checkRequiredApprovals(
    check: ComplianceCheck,
    rule: ComplianceRule
  ): Promise<void> {
    // Implementation would fetch actual process/step data
    // For now, this is a placeholder that demonstrates the structure
    const config = rule.configuration;
    const minimumApprovals = config.minimum_approvals || 1;
    
    // Simulate checking for approval steps
    const approvalStepsFound = 1; // This would be fetched from actual data
    
    if (approvalStepsFound < minimumApprovals) {
      check.result = 'failed';
      check.score = 50;
      check.violations.push({
        severity: rule.severity,
        code: 'insufficient_approvals',
        message: `Process requires at least ${minimumApprovals} approval step(s), found ${approvalStepsFound}`,
        step_id: check.step_id
      });
    }
    
    check.details = {
      minimum_required: minimumApprovals,
      found: approvalStepsFound
    };
  }

  /**
   * Checks step documentation compliance
   */
  private static async checkStepDocumentation(
    check: ComplianceCheck,
    rule: ComplianceRule
  ): Promise<void> {
    const config = rule.configuration;
    const minLength = config.minimum_description_length || 10;
    
    // Simulate checking step documentation
    const undocumentedSteps = 0; // This would be fetched from actual data
    const totalSteps = 5; // This would be fetched from actual data
    
    if (undocumentedSteps > 0) {
      check.result = 'failed';
      check.score = Math.max(0, 100 - (undocumentedSteps / totalSteps * 100));
      check.violations.push({
        severity: rule.severity,
        code: 'missing_documentation',
        message: `${undocumentedSteps} step(s) missing proper documentation`,
        step_id: check.step_id
      });
    }
    
    check.details = {
      total_steps: totalSteps,
      undocumented_steps: undocumentedSteps,
      minimum_description_length: minLength
    };
  }

  /**
   * Checks audit trail compliance
   */
  private static async checkAuditTrail(
    check: ComplianceCheck,
    rule: ComplianceRule
  ): Promise<void> {
    const config = rule.configuration;
    const requiredEvents = config.required_events || [];
    
    // Check if audit logging is properly configured
    const auditEnabled = this.auditLogs.length > 0; // Simplified check
    
    if (!auditEnabled) {
      check.result = 'failed';
      check.score = 0;
      check.violations.push({
        severity: rule.severity,
        code: 'audit_trail_disabled',
        message: 'Audit trail is not properly configured or enabled',
        step_id: check.step_id
      });
    }
    
    check.details = {
      audit_enabled: auditEnabled,
      required_events: requiredEvents,
      current_log_count: this.auditLogs.length
    };
  }

  /**
   * Checks data retention compliance
   */
  private static async checkDataRetention(
    check: ComplianceCheck,
    rule: ComplianceRule
  ): Promise<void> {
    const config = rule.configuration;
    const minRetention = config.minimum_retention_days || 365;
    const maxRetention = config.maximum_retention_days || 2555;
    
    // Simulate checking retention policy
    const currentRetention = 365; // This would be fetched from actual configuration
    
    if (currentRetention < minRetention) {
      check.result = 'failed';
      check.score = 50;
      check.violations.push({
        severity: rule.severity,
        code: 'insufficient_retention',
        message: `Data retention period ${currentRetention} days is below minimum ${minRetention} days`,
        step_id: check.step_id
      });
    } else if (currentRetention > maxRetention) {
      check.result = 'warning';
      check.score = 80;
      check.violations.push({
        severity: 'low',
        code: 'excessive_retention',
        message: `Data retention period ${currentRetention} days exceeds maximum ${maxRetention} days`,
        step_id: check.step_id
      });
    }
    
    check.details = {
      current_retention_days: currentRetention,
      minimum_required: minRetention,
      maximum_allowed: maxRetention
    };
  }

  /**
   * Checks access control compliance
   */
  private static async checkAccessControl(
    check: ComplianceCheck,
    rule: ComplianceRule
  ): Promise<void> {
    const config = rule.configuration;
    
    // Simulate access control checks
    const hasRoleBasedAccess = config.require_role_based_access || false;
    const hasApprovalAuth = config.require_approval_authorization || false;
    
    const violations = [];
    
    if (hasRoleBasedAccess && !this.hasRoleBasedAccessConfigured()) {
      violations.push({
        severity: rule.severity,
        code: 'missing_role_based_access',
        message: 'Role-based access control is not properly configured',
        step_id: check.step_id
      });
    }
    
    if (hasApprovalAuth && !this.hasApprovalAuthorizationConfigured()) {
      violations.push({
        severity: rule.severity,
        code: 'missing_approval_authorization',
        message: 'Approval authorization is not properly configured',
        step_id: check.step_id
      });
    }
    
    if (violations.length > 0) {
      check.result = 'failed';
      check.score = Math.max(0, 100 - (violations.length * 30));
      check.violations.push(...violations);
    }
    
    check.details = {
      role_based_access_required: hasRoleBasedAccess,
      approval_authorization_required: hasApprovalAuth,
      violations_found: violations.length
    };
  }

  /**
   * Checks custom compliance rule
   */
  private static async checkCustomRule(
    check: ComplianceCheck,
    rule: ComplianceRule
  ): Promise<void> {
    // Custom rules would implement specific business logic
    check.details = {
      message: 'Custom rule check not implemented',
      rule_configuration: rule.configuration
    };
  }

  /**
   * Logs audit entry
   */
  static logAudit(
    processId: string,
    executionId: string | undefined,
    stepId: string | undefined,
    action: string,
    resourceType: 'process' | 'step' | 'approval' | 'data' | 'configuration',
    resourceId: string,
    metadata: Record<string, any> = {},
    userId?: string,
    oldValue?: any,
    newValue?: any
  ): void {
    const auditEntry: AuditLog = {
      id: this.generateId(),
      process_id: processId,
      execution_id: executionId,
      step_id: stepId,
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_value: oldValue,
      new_value: newValue,
      metadata,
      timestamp: new Date()
    };

    this.auditLogs.push(auditEntry);

    // Log to application logger as well
    logger.info('Audit entry created', {
      audit_id: auditEntry.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      user_id: userId
    });
  }

  /**
   * Generates compliance report
   */
  static generateComplianceReport(
    reportType: 'process' | 'period' | 'violation' | 'audit',
    scope: {
      process_ids?: string[];
      date_from?: Date;
      date_to?: Date;
      categories?: string[];
    },
    generatedBy?: string
  ): ComplianceReport {
    const reportId = this.generateId();
    
    // Filter compliance checks based on scope
    const relevantChecks = Array.from(this.complianceChecks.values())
      .filter(check => this.checkMatchesScope(check, scope));

    const totalChecks = relevantChecks.length;
    const passedChecks = relevantChecks.filter(c => c.result === 'passed').length;
    const failedChecks = relevantChecks.filter(c => c.result === 'failed').length;
    const warningChecks = relevantChecks.filter(c => c.result === 'warning').length;

    const overallScore = totalChecks > 0 
      ? relevantChecks.reduce((sum, check) => sum + check.score, 0) / totalChecks
      : 100;

    const compliancePercentage = totalChecks > 0 
      ? (passedChecks / totalChecks) * 100 
      : 100;

    // Collect all violations
    const violations: ComplianceViolation[] = [];
    relevantChecks.forEach(check => {
      violations.push(...check.violations);
    });

    // Generate recommendations
    const recommendations = this.generateRecommendations(violations);

    const report: ComplianceReport = {
      id: reportId,
      report_type: reportType,
      scope,
      summary: {
        total_checks: totalChecks,
        passed_checks: passedChecks,
        failed_checks: failedChecks,
        warning_checks: warningChecks,
        overall_score: Math.round(overallScore),
        compliance_percentage: Math.round(compliancePercentage * 100) / 100
      },
      violations,
      recommendations,
      generated_at: new Date(),
      generated_by: generatedBy
    };

    this.complianceReports.set(reportId, report);

    logger.info('Compliance report generated', {
      report_id: reportId,
      report_type: reportType,
      total_checks: totalChecks,
      compliance_percentage: compliancePercentage
    });

    return report;
  }

  /**
   * Generates recommendations based on violations
   */
  private static generateRecommendations(violations: ComplianceViolation[]): string[] {
    const recommendations: string[] = [];
    const violationsByCode = new Map<string, number>();
    
    // Count violations by code
    violations.forEach(violation => {
      const count = violationsByCode.get(violation.code) || 0;
      violationsByCode.set(violation.code, count + 1);
    });

    // Generate recommendations for common violations
    violationsByCode.forEach((count, code) => {
      switch (code) {
        case 'insufficient_approvals':
          recommendations.push('Implement additional approval steps for critical operations');
          break;
        case 'missing_documentation':
          recommendations.push('Improve step documentation to meet minimum requirements');
          break;
        case 'audit_trail_disabled':
          recommendations.push('Enable comprehensive audit logging for all SOP operations');
          break;
        case 'insufficient_retention':
          recommendations.push('Review and update data retention policies to meet compliance requirements');
          break;
        case 'missing_role_based_access':
          recommendations.push('Implement role-based access control for process management');
          break;
        case 'missing_approval_authorization':
          recommendations.push('Configure proper authorization checks for approval processes');
          break;
        default:
          recommendations.push(`Address ${count} instance(s) of ${code} violations`);
      }
    });

    return recommendations;
  }

  /**
   * Checks if compliance check matches report scope
   */
  private static checkMatchesScope(
    check: ComplianceCheck,
    scope: {
      process_ids?: string[];
      date_from?: Date;
      date_to?: Date;
      categories?: string[];
    }
  ): boolean {
    // Filter by process IDs
    if (scope.process_ids && !scope.process_ids.includes(check.process_id)) {
      return false;
    }

    // Filter by date range
    if (scope.date_from && check.checked_at < scope.date_from) {
      return false;
    }
    if (scope.date_to && check.checked_at > scope.date_to) {
      return false;
    }

    // Filter by categories
    if (scope.categories) {
      const rule = this.complianceRules.get(check.rule_id);
      if (!rule || !scope.categories.includes(rule.category)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets compliance rule by ID
   */
  static getComplianceRule(ruleId: string): ComplianceRule | undefined {
    return this.complianceRules.get(ruleId);
  }

  /**
   * Gets all active compliance rules
   */
  static getActiveComplianceRules(): ComplianceRule[] {
    return Array.from(this.complianceRules.values())
      .filter(rule => rule.is_active);
  }

  /**
   * Gets compliance check by ID
   */
  static getComplianceCheck(checkId: string): ComplianceCheck | undefined {
    return this.complianceChecks.get(checkId);
  }

  /**
   * Gets audit logs for process/execution
   */
  static getAuditLogs(
    processId?: string,
    executionId?: string,
    stepId?: string,
    limit: number = 100
  ): AuditLog[] {
    return this.auditLogs
      .filter(log => {
        if (processId && log.process_id !== processId) return false;
        if (executionId && log.execution_id !== executionId) return false;
        if (stepId && log.step_id !== stepId) return false;
        return true;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Gets compliance report by ID
   */
  static getComplianceReport(reportId: string): ComplianceReport | undefined {
    return this.complianceReports.get(reportId);
  }

  /**
   * Helper methods for access control checks
   */
  private static hasRoleBasedAccessConfigured(): boolean {
    // This would check actual access control configuration
    return true; // Placeholder
  }

  private static hasApprovalAuthorizationConfigured(): boolean {
    // This would check actual approval authorization configuration
    return true; // Placeholder
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
   * Generates unique ID
   */
  private static generateId(): string {
    return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup old audit logs (call periodically)
   */
  static cleanupAuditLogs(olderThanDays: number = 30): number {
    const cutoffTime = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const initialCount = this.auditLogs.length;
    
    this.auditLogs = this.auditLogs.filter(log => log.timestamp >= cutoffTime);
    
    const cleanedCount = initialCount - this.auditLogs.length;
    
    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} audit log entries older than ${olderThanDays} days`);
    }
    
    return cleanedCount;
  }
}

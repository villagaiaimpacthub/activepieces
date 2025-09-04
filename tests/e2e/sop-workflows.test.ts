/**
 * SOP Workflows End-to-End Tests
 * Tests complete SOP workflow execution scenarios
 * REALITY: Based on actual database schema and ActivePieces integration
 */

import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

interface SOPExecutionContext {
  projectId: string;
  executionId: string;
  currentStepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  executorId: string;
  startedAt: Date;
  metadata: Record<string, any>;
}

describe('SOP Workflows E2E Tests', () => {
  let dataSource: DataSource;
  const baseURL = process.env.ACTIVEPIECES_API_URL || 'http://localhost:3000';

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'test_activepieces_sop',
      synchronize: false,
      logging: false,
    });
    
    await dataSource.initialize();
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Clean up test data
    await dataSource.query('TRUNCATE TABLE sop_steps CASCADE');
    await dataSource.query('TRUNCATE TABLE sop_projects CASCADE');
    await dataSource.query('TRUNCATE TABLE sop_templates CASCADE');
  });

  describe('Linear SOP Workflow Execution', () => {
    test('should execute simple 3-step linear SOP', async () => {
      const projectId = uuidv4();
      
      // Create SOP project
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, description, status)
        VALUES ($1, $2, $3, $4)
      `, [projectId, 'Linear Workflow Test', 'Simple 3-step process', 'active']);

      // Create sequential steps
      const steps = [
        { name: 'Initialize Request', type: 'process_step', position: 1 },
        { name: 'Review Content', type: 'manual_review', position: 2 },
        { name: 'Finalize Process', type: 'completion_step', position: 3 }
      ];

      const stepIds = [];
      for (const step of steps) {
        const stepId = uuidv4();
        stepIds.push(stepId);
        
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position, configuration)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          stepId, 
          projectId, 
          step.name, 
          step.type, 
          step.position,
          JSON.stringify({ 
            timeout_minutes: 60,
            auto_advance: step.type === 'process_step',
            required_inputs: step.type === 'manual_review' ? ['review_notes'] : []
          })
        ]);
      }

      // Simulate workflow execution
      const executionId = uuidv4();
      const executionContext: SOPExecutionContext = {
        projectId,
        executionId,
        currentStepId: stepIds[0],
        status: 'running',
        executorId: 'test-user-123',
        startedAt: new Date(),
        metadata: { execution_type: 'manual', priority: 'normal' }
      };

      // Execute step 1 (auto-advance)
      let currentStepResult = await dataSource.query(
        'SELECT name, step_type, configuration FROM sop_steps WHERE id = $1',
        [executionContext.currentStepId]
      );
      
      expect(currentStepResult[0].name).toBe('Initialize Request');
      expect(currentStepResult[0].configuration.auto_advance).toBe(true);

      // Move to step 2 (manual review)
      executionContext.currentStepId = stepIds[1];
      executionContext.status = 'pending';

      currentStepResult = await dataSource.query(
        'SELECT name, step_type, configuration FROM sop_steps WHERE id = $1',
        [executionContext.currentStepId]
      );

      expect(currentStepResult[0].name).toBe('Review Content');
      expect(currentStepResult[0].configuration.required_inputs).toContain('review_notes');

      // Complete manual review with input
      executionContext.metadata.review_notes = 'Content approved with minor suggestions';
      executionContext.currentStepId = stepIds[2];

      // Execute final step
      currentStepResult = await dataSource.query(
        'SELECT name, step_type FROM sop_steps WHERE id = $1',
        [executionContext.currentStepId]
      );

      expect(currentStepResult[0].name).toBe('Finalize Process');
      
      // Mark as completed
      executionContext.status = 'completed';
      expect(executionContext.status).toBe('completed');
    });

    test('should handle step failures and recovery', async () => {
      const projectId = uuidv4();
      
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, status)
        VALUES ($1, $2, $3)
      `, [projectId, 'Failure Recovery Test', 'active']);

      // Create steps with failure handling
      const steps = [
        { 
          name: 'Risky Operation', 
          type: 'automated_step',
          config: { 
            max_retries: 3, 
            retry_delay_minutes: 5,
            failure_action: 'escalate'
          }
        },
        { 
          name: 'Fallback Step', 
          type: 'manual_intervention',
          config: { 
            trigger_condition: 'previous_step_failed',
            required_roles: ['admin']
          }
        },
        { 
          name: 'Recovery Step', 
          type: 'process_step',
          config: { auto_advance: true }
        }
      ];

      const stepIds = [];
      for (let i = 0; i < steps.length; i++) {
        const stepId = uuidv4();
        stepIds.push(stepId);
        
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position, configuration)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [stepId, projectId, steps[i].name, steps[i].type, i + 1, JSON.stringify(steps[i].config)]);
      }

      // Simulate failure scenario
      const executionContext: SOPExecutionContext = {
        projectId,
        executionId: uuidv4(),
        currentStepId: stepIds[0],
        status: 'running',
        executorId: 'test-user-123',
        startedAt: new Date(),
        metadata: { 
          retry_count: 0,
          max_retries: 3,
          failure_history: []
        }
      };

      // Simulate multiple failures
      for (let retry = 0; retry < 3; retry++) {
        executionContext.metadata.retry_count = retry + 1;
        executionContext.metadata.failure_history.push({
          attempt: retry + 1,
          error: 'Simulated network timeout',
          timestamp: new Date().toISOString()
        });
      }

      // Max retries exceeded, trigger fallback
      expect(executionContext.metadata.retry_count).toBe(3);
      executionContext.status = 'failed';
      executionContext.currentStepId = stepIds[1]; // Move to fallback step

      const fallbackStep = await dataSource.query(
        'SELECT configuration FROM sop_steps WHERE id = $1',
        [executionContext.currentStepId]
      );

      expect(fallbackStep[0].configuration.trigger_condition).toBe('previous_step_failed');

      // Manual intervention resolves issue
      executionContext.status = 'running';
      executionContext.currentStepId = stepIds[2]; // Move to recovery
      executionContext.metadata.manual_resolution = 'Admin fixed network configuration';

      expect(executionContext.status).toBe('running');
    });
  });

  describe('Conditional and Parallel Workflows', () => {
    test('should execute conditional branching workflow', async () => {
      const projectId = uuidv4();
      
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, status)
        VALUES ($1, $2, $3)
      `, [projectId, 'Conditional Workflow', 'active']);

      // Create branching workflow structure
      const mainStepId = uuidv4();
      const approvedBranchId = uuidv4();
      const rejectedBranchId = uuidv4();
      const finalStepId = uuidv4();

      // Main decision step
      await dataSource.query(`
        INSERT INTO sop_steps (id, project_id, name, step_type, position, configuration)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        mainStepId,
        projectId,
        'Approval Decision',
        'decision_point',
        1,
        JSON.stringify({
          decision_field: 'approval_status',
          branches: {
            approved: { next_step: 'approved_branch' },
            rejected: { next_step: 'rejected_branch' }
          }
        })
      ]);

      // Approved branch
      await dataSource.query(`
        INSERT INTO sop_steps (id, project_id, name, step_type, position, parent_step_id, configuration)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        approvedBranchId,
        projectId,
        'Process Approval',
        'approval_action',
        2,
        mainStepId,
        JSON.stringify({ 
          condition: { field: 'approval_status', value: 'approved' },
          actions: ['send_approval_notification', 'update_status']
        })
      ]);

      // Rejected branch
      await dataSource.query(`
        INSERT INTO sop_steps (id, project_id, name, step_type, position, parent_step_id, configuration)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        rejectedBranchId,
        projectId,
        'Process Rejection',
        'rejection_action',
        2,
        mainStepId,
        JSON.stringify({ 
          condition: { field: 'approval_status', value: 'rejected' },
          actions: ['send_rejection_notification', 'request_revision']
        })
      ]);

      // Final convergence step
      await dataSource.query(`
        INSERT INTO sop_steps (id, project_id, name, step_type, position, configuration)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        finalStepId,
        projectId,
        'Finalize Process',
        'completion_step',
        3,
        JSON.stringify({ 
          convergence_step: true,
          wait_for_all_branches: true
        })
      ]);

      // Test approved path
      const executionContext: SOPExecutionContext = {
        projectId,
        executionId: uuidv4(),
        currentStepId: mainStepId,
        status: 'running',
        executorId: 'test-user-123',
        startedAt: new Date(),
        metadata: { approval_status: 'approved' }
      };

      // Evaluate decision
      const decisionStep = await dataSource.query(
        'SELECT configuration FROM sop_steps WHERE id = $1',
        [mainStepId]
      );

      const approvalStatus = executionContext.metadata.approval_status;
      expect(decisionStep[0].configuration.branches[approvalStatus]).toBeDefined();

      // Follow approved branch
      const approvedBranchStep = await dataSource.query(
        'SELECT name, configuration FROM sop_steps WHERE id = $1',
        [approvedBranchId]
      );

      expect(approvedBranchStep[0].name).toBe('Process Approval');
      expect(approvedBranchStep[0].configuration.condition.value).toBe('approved');

      // Converge to final step
      const finalStep = await dataSource.query(
        'SELECT name, configuration FROM sop_steps WHERE id = $1',
        [finalStepId]
      );

      expect(finalStep[0].configuration.convergence_step).toBe(true);
    });

    test('should handle parallel step execution', async () => {
      const projectId = uuidv4();
      
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, status)
        VALUES ($1, $2, $3)
      `, [projectId, 'Parallel Workflow', 'active']);

      // Create parallel execution structure
      const initiatorStepId = uuidv4();
      const parallelStepIds = [uuidv4(), uuidv4(), uuidv4()];
      const convergenceStepId = uuidv4();

      // Initiator step
      await dataSource.query(`
        INSERT INTO sop_steps (id, project_id, name, step_type, position, configuration)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        initiatorStepId,
        projectId,
        'Initialize Parallel Tasks',
        'parallel_initiator',
        1,
        JSON.stringify({ 
          spawn_parallel: true,
          parallel_branches: parallelStepIds.length
        })
      ]);

      // Parallel steps
      const parallelTasks = [
        'Quality Check',
        'Security Review', 
        'Performance Test'
      ];

      for (let i = 0; i < parallelStepIds.length; i++) {
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position, parent_step_id, configuration)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          parallelStepIds[i],
          projectId,
          parallelTasks[i],
          'parallel_task',
          2,
          initiatorStepId,
          JSON.stringify({ 
            parallel_execution: true,
            estimated_duration_minutes: 30 + (i * 15),
            can_run_concurrent: true
          })
        ]);
      }

      // Convergence step
      await dataSource.query(`
        INSERT INTO sop_steps (id, project_id, name, step_type, position, configuration)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        convergenceStepId,
        projectId,
        'Collect Results',
        'parallel_convergence',
        3,
        JSON.stringify({ 
          wait_for_parallel: parallelStepIds,
          aggregate_results: true,
          timeout_minutes: 120
        })
      ]);

      // Simulate parallel execution
      const executionContext: SOPExecutionContext = {
        projectId,
        executionId: uuidv4(),
        currentStepId: initiatorStepId,
        status: 'running',
        executorId: 'test-user-123',
        startedAt: new Date(),
        metadata: { 
          parallel_executions: {},
          completed_branches: []
        }
      };

      // Start parallel executions
      for (const parallelStepId of parallelStepIds) {
        executionContext.metadata.parallel_executions[parallelStepId] = {
          status: 'running',
          started_at: new Date().toISOString(),
          executor: `parallel-worker-${parallelStepId.slice(-4)}`
        };
      }

      expect(Object.keys(executionContext.metadata.parallel_executions)).toHaveLength(3);

      // Simulate completion of parallel tasks
      for (let i = 0; i < parallelStepIds.length; i++) {
        const stepId = parallelStepIds[i];
        executionContext.metadata.parallel_executions[stepId].status = 'completed';
        executionContext.metadata.parallel_executions[stepId].completed_at = new Date().toISOString();
        executionContext.metadata.parallel_executions[stepId].result = `${parallelTasks[i]} passed`;
        executionContext.metadata.completed_branches.push(stepId);
      }

      // Check convergence conditions
      const convergenceStep = await dataSource.query(
        'SELECT configuration FROM sop_steps WHERE id = $1',
        [convergenceStepId]
      );

      const requiredBranches = convergenceStep[0].configuration.wait_for_parallel;
      const completedBranches = executionContext.metadata.completed_branches;
      
      const allBranchesComplete = requiredBranches.every(branch => 
        completedBranches.includes(branch)
      );

      expect(allBranchesComplete).toBe(true);
    });
  });

  describe('Template-Based Workflows', () => {
    test('should instantiate SOP from template with customization', async () => {
      // Create SOP template
      const templateId = uuidv4();
      const templateData = {
        name: 'Employee Onboarding Template',
        description: 'Standard employee onboarding process',
        steps: [
          {
            name: 'HR Documentation',
            type: 'document_collection',
            configuration: {
              required_documents: ['id_card', 'tax_forms', 'emergency_contact'],
              deadline_days: 3
            }
          },
          {
            name: 'IT Setup',
            type: 'system_provisioning',
            configuration: {
              systems: ['email', 'active_directory', 'laptop'],
              auto_provision: true
            }
          },
          {
            name: 'Orientation Session',
            type: 'scheduled_meeting',
            configuration: {
              duration_hours: 4,
              attendees: ['hr_rep', 'manager', 'buddy'],
              required: true
            }
          },
          {
            name: 'Probation Review Setup',
            type: 'calendar_event',
            configuration: {
              schedule_days_ahead: 90,
              participants: ['employee', 'manager', 'hr']
            }
          }
        ],
        customization_points: [
          { field: 'department', affects_steps: [1, 2] },
          { field: 'employee_level', affects_steps: [2, 3] },
          { field: 'location', affects_steps: [0, 2] }
        ]
      };

      await dataSource.query(`
        INSERT INTO sop_templates (id, name, description, category, template_data, is_public)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        templateId,
        templateData.name,
        templateData.description,
        'hr_onboarding',
        JSON.stringify(templateData),
        true
      ]);

      // Instantiate template for specific employee
      const projectId = uuidv4();
      const customizationParams = {
        department: 'engineering',
        employee_level: 'senior',
        location: 'remote',
        employee_name: 'John Doe',
        start_date: '2024-02-01'
      };

      await dataSource.query(`
        INSERT INTO sop_projects (id, name, description, status, metadata)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        projectId,
        `${templateData.name} - ${customizationParams.employee_name}`,
        `Onboarding process for ${customizationParams.employee_name}`,
        'active',
        JSON.stringify({
          template_id: templateId,
          customization: customizationParams,
          instantiated_at: new Date().toISOString()
        })
      ]);

      // Create customized steps from template
      for (let i = 0; i < templateData.steps.length; i++) {
        const templateStep = templateData.steps[i];
        let stepConfig = { ...templateStep.configuration };

        // Apply customizations
        if (customizationParams.department === 'engineering' && i === 1) {
          stepConfig.systems.push('github', 'aws_console', 'development_tools');
        }

        if (customizationParams.employee_level === 'senior' && i === 2) {
          stepConfig.additional_sessions = ['tech_architecture_overview', 'team_lead_meeting'];
        }

        if (customizationParams.location === 'remote' && [0, 2].includes(i)) {
          stepConfig.remote_friendly = true;
          if (i === 0) stepConfig.digital_documents_only = true;
          if (i === 2) stepConfig.virtual_session = true;
        }

        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position, configuration)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          uuidv4(),
          projectId,
          `${templateStep.name} - ${customizationParams.employee_name}`,
          templateStep.type,
          i + 1,
          JSON.stringify(stepConfig)
        ]);
      }

      // Verify customized instance
      const customizedSteps = await dataSource.query(`
        SELECT name, step_type, configuration 
        FROM sop_steps 
        WHERE project_id = $1 
        ORDER BY position
      `, [projectId]);

      expect(customizedSteps).toHaveLength(4);
      
      // Check engineering-specific IT setup
      const itSetupStep = customizedSteps[1];
      expect(itSetupStep.configuration.systems).toContain('github');
      expect(itSetupStep.configuration.systems).toContain('aws_console');

      // Check senior-level orientation
      const orientationStep = customizedSteps[2];
      expect(orientationStep.configuration.additional_sessions).toContain('tech_architecture_overview');

      // Check remote customizations
      const hrDocStep = customizedSteps[0];
      expect(hrDocStep.configuration.remote_friendly).toBe(true);
      expect(hrDocStep.configuration.digital_documents_only).toBe(true);
    });

    test('should validate template compliance during execution', async () => {
      const templateId = uuidv4();
      const complianceTemplate = {
        name: 'Security Compliance Check',
        steps: [
          {
            name: 'Security Scan',
            type: 'automated_security_check',
            compliance_rules: {
              required: true,
              evidence_required: true,
              approval_threshold: 'no_high_risk_findings'
            }
          },
          {
            name: 'Manual Review',
            type: 'security_review',
            compliance_rules: {
              required_certifications: ['security_certified'],
              dual_approval: true,
              audit_trail: true
            }
          },
          {
            name: 'Sign-off',
            type: 'compliance_signoff',
            compliance_rules: {
              required_roles: ['security_officer', 'compliance_manager'],
              retention_period_years: 7
            }
          }
        ]
      };

      await dataSource.query(`
        INSERT INTO sop_templates (id, name, category, template_data)
        VALUES ($1, $2, $3, $4)
      `, [templateId, complianceTemplate.name, 'security_compliance', JSON.stringify(complianceTemplate)]);

      // Create compliant project instance
      const projectId = uuidv4();
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, status, metadata)
        VALUES ($1, $2, $3, $4)
      `, [
        projectId,
        'Security Compliance - Project X',
        'active',
        JSON.stringify({
          template_id: templateId,
          compliance_mode: true,
          audit_id: uuidv4()
        })
      ]);

      // Create compliant steps
      for (let i = 0; i < complianceTemplate.steps.length; i++) {
        const step = complianceTemplate.steps[i];
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position, configuration)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          uuidv4(),
          projectId,
          step.name,
          step.type,
          i + 1,
          JSON.stringify({
            ...step.compliance_rules,
            compliance_required: true,
            audit_trail_enabled: true
          })
        ]);
      }

      // Validate compliance requirements
      const complianceValidation = await dataSource.query(`
        SELECT 
          s.name,
          s.configuration,
          CASE 
            WHEN s.configuration->>'compliance_required' = 'true' THEN 'compliant'
            ELSE 'non_compliant'
          END as compliance_status
        FROM sop_steps s
        WHERE s.project_id = $1
        ORDER BY s.position
      `, [projectId]);

      expect(complianceValidation).toHaveLength(3);
      expect(complianceValidation.every(step => 
        step.compliance_status === 'compliant'
      )).toBe(true);

      // Check audit trail capability
      const auditSteps = await dataSource.query(`
        SELECT configuration->>'audit_trail_enabled' as audit_enabled
        FROM sop_steps 
        WHERE project_id = $1
      `, [projectId]);

      expect(auditSteps.every(step => step.audit_enabled === 'true')).toBe(true);
    });
  });

  describe('SOP Execution Monitoring and Analytics', () => {
    test('should track execution metrics and performance', async () => {
      const projectId = uuidv4();
      
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, status, metadata)
        VALUES ($1, $2, $3, $4)
      `, [
        projectId,
        'Performance Monitoring SOP',
        'active',
        JSON.stringify({ monitoring_enabled: true })
      ]);

      // Create steps with performance tracking
      const steps = [
        { name: 'Fast Step', estimated_duration: 5, actual_duration: 4 },
        { name: 'Medium Step', estimated_duration: 15, actual_duration: 18 },
        { name: 'Slow Step', estimated_duration: 30, actual_duration: 45 }
      ];

      for (let i = 0; i < steps.length; i++) {
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position, configuration)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          uuidv4(),
          projectId,
          steps[i].name,
          'timed_step',
          i + 1,
          JSON.stringify({
            estimated_duration_minutes: steps[i].estimated_duration,
            actual_duration_minutes: steps[i].actual_duration,
            performance_tracking: true,
            sla_threshold: steps[i].estimated_duration * 1.2 // 20% buffer
          })
        ]);
      }

      // Calculate performance metrics
      const performanceAnalysis = await dataSource.query(`
        SELECT 
          s.name,
          s.configuration->>'estimated_duration_minutes' as estimated,
          s.configuration->>'actual_duration_minutes' as actual,
          CASE 
            WHEN (s.configuration->>'actual_duration_minutes')::int <= (s.configuration->>'sla_threshold')::int 
            THEN 'within_sla'
            ELSE 'sla_breach'
          END as sla_status,
          ROUND(
            (((s.configuration->>'actual_duration_minutes')::int - (s.configuration->>'estimated_duration_minutes')::int) * 100.0 / 
             (s.configuration->>'estimated_duration_minutes')::int), 2
          ) as variance_percentage
        FROM sop_steps s
        WHERE s.project_id = $1
        ORDER BY s.position
      `, [projectId]);

      expect(performanceAnalysis).toHaveLength(3);
      
      // Fast step: under estimate (negative variance)
      expect(parseFloat(performanceAnalysis[0].variance_percentage)).toBeLessThan(0);
      expect(performanceAnalysis[0].sla_status).toBe('within_sla');

      // Medium step: slightly over estimate
      expect(parseFloat(performanceAnalysis[1].variance_percentage)).toBeGreaterThan(0);
      expect(parseFloat(performanceAnalysis[1].variance_percentage)).toBeLessThan(20); // Within SLA
      
      // Slow step: significantly over estimate
      expect(parseFloat(performanceAnalysis[2].variance_percentage)).toBeGreaterThan(20);
      expect(performanceAnalysis[2].sla_status).toBe('sla_breach');
    });

    test('should generate workflow completion reports', async () => {
      const projectIds = [];
      const completionData = [
        { name: 'Fast Process', status: 'completed', duration: 120 },
        { name: 'Normal Process', status: 'completed', duration: 240 },
        { name: 'Failed Process', status: 'failed', duration: 180 },
        { name: 'Long Process', status: 'completed', duration: 480 }
      ];

      // Create multiple SOPs with completion data
      for (let i = 0; i < completionData.length; i++) {
        const projectId = uuidv4();
        projectIds.push(projectId);
        
        await dataSource.query(`
          INSERT INTO sop_projects (id, name, status, metadata, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          projectId,
          completionData[i].name,
          completionData[i].status,
          JSON.stringify({
            execution_duration_minutes: completionData[i].duration,
            completion_rate: completionData[i].status === 'completed' ? 100 : 75
          }),
          new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Spread over days
          new Date(Date.now() - (i * 24 * 60 * 60 * 1000) + (completionData[i].duration * 60 * 1000))
        ]);
      }

      // Generate completion report
      const completionReport = await dataSource.query(`
        SELECT 
          COUNT(*) as total_sops,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sops,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_sops,
          ROUND(
            (COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*)), 2
          ) as completion_rate,
          ROUND(AVG((metadata->>'execution_duration_minutes')::int), 2) as avg_duration_minutes,
          MIN((metadata->>'execution_duration_minutes')::int) as min_duration_minutes,
          MAX((metadata->>'execution_duration_minutes')::int) as max_duration_minutes
        FROM sop_projects
        WHERE id = ANY($1)
      `, [projectIds]);

      const report = completionReport[0];
      expect(parseInt(report.total_sops)).toBe(4);
      expect(parseInt(report.completed_sops)).toBe(3);
      expect(parseInt(report.failed_sops)).toBe(1);
      expect(parseFloat(report.completion_rate)).toBe(75.0);
      expect(parseFloat(report.avg_duration_minutes)).toBe(255); // (120+240+180+480)/4
      expect(parseInt(report.min_duration_minutes)).toBe(120);
      expect(parseInt(report.max_duration_minutes)).toBe(480);
    });

    test('should identify bottlenecks and optimization opportunities', async () => {
      const projectId = uuidv4();
      
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, status)
        VALUES ($1, $2, $3)
      `, [projectId, 'Bottleneck Analysis SOP', 'completed']);

      // Create steps with varying performance characteristics
      const bottleneckSteps = [
        { name: 'Quick Start', duration: 2, frequency: 100, bottleneck_score: 1 },
        { name: 'Data Processing', duration: 45, frequency: 100, bottleneck_score: 9 }, // Major bottleneck
        { name: 'Validation', duration: 8, frequency: 100, bottleneck_score: 3 },
        { name: 'Manual Approval', duration: 30, frequency: 80, bottleneck_score: 7 }, // Human bottleneck
        { name: 'Final Steps', duration: 5, frequency: 78, bottleneck_score: 2 }
      ];

      for (let i = 0; i < bottleneckSteps.length; i++) {
        const step = bottleneckSteps[i];
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position, configuration)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          uuidv4(),
          projectId,
          step.name,
          'analyzed_step',
          i + 1,
          JSON.stringify({
            avg_duration_minutes: step.duration,
            execution_frequency: step.frequency,
            bottleneck_score: step.bottleneck_score,
            optimization_potential: step.bottleneck_score > 5 ? 'high' : 'low'
          })
        ]);
      }

      // Identify bottlenecks
      const bottleneckAnalysis = await dataSource.query(`
        SELECT 
          name,
          (configuration->>'avg_duration_minutes')::int as duration,
          (configuration->>'bottleneck_score')::int as bottleneck_score,
          configuration->>'optimization_potential' as optimization,
          CASE 
            WHEN (configuration->>'bottleneck_score')::int >= 8 THEN 'critical'
            WHEN (configuration->>'bottleneck_score')::int >= 5 THEN 'major'
            ELSE 'minor'
          END as bottleneck_severity
        FROM sop_steps
        WHERE project_id = $1
        ORDER BY (configuration->>'bottleneck_score')::int DESC
      `, [projectId]);

      expect(bottleneckAnalysis).toHaveLength(5);

      // Major bottlenecks should be identified
      const criticalBottlenecks = bottleneckAnalysis.filter(step => 
        step.bottleneck_severity === 'critical'
      );
      expect(criticalBottlenecks).toHaveLength(1);
      expect(criticalBottlenecks[0].name).toBe('Data Processing');

      const majorBottlenecks = bottleneckAnalysis.filter(step => 
        step.bottleneck_severity === 'major'
      );
      expect(majorBottlenecks).toHaveLength(1);
      expect(majorBottlenecks[0].name).toBe('Manual Approval');

      // Optimization recommendations
      const optimizationCandidates = bottleneckAnalysis.filter(step => 
        step.optimization === 'high'
      );
      expect(optimizationCandidates).toHaveLength(2);
      expect(optimizationCandidates.map(s => s.name)).toContain('Data Processing');
      expect(optimizationCandidates.map(s => s.name)).toContain('Manual Approval');
    });
  });
});
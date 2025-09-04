/**
 * SOP Export System End-to-End Tests
 * Tests the complete export functionality for SOPs
 * REALITY: Based on actual project structure and export capabilities
 */

import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

interface ExportFormat {
  json: 'application/json';
  yaml: 'text/yaml';
  markdown: 'text/markdown';
  pdf: 'application/pdf';
  csv: 'text/csv';
}

interface SOPExport {
  project: {
    id: string;
    name: string;
    description: string;
    status: string;
    version: number;
    metadata: any;
    created_at: string;
    updated_at: string;
  };
  steps: Array<{
    id: string;
    name: string;
    step_type: string;
    position: number;
    configuration: any;
    parent_step_id?: string;
    is_active: boolean;
  }>;
  template_info?: {
    template_id: string;
    template_name: string;
    customization: any;
  };
  export_metadata: {
    exported_at: string;
    export_format: keyof ExportFormat;
    exported_by: string;
    version: string;
  };
}

describe('SOP Export System E2E Tests', () => {
  let dataSource: DataSource;
  const exportDir = path.join(__dirname, '../temp/exports');

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

    // Create export directory
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }

    // Clean up export directory
    if (fs.existsSync(exportDir)) {
      fs.rmSync(exportDir, { recursive: true, force: true });
    }
  });

  beforeEach(async () => {
    // Clean up test data
    await dataSource.query('TRUNCATE TABLE sop_steps CASCADE');
    await dataSource.query('TRUNCATE TABLE sop_projects CASCADE');
    await dataSource.query('TRUNCATE TABLE sop_templates CASCADE');
  });

  describe('JSON Export Format', () => {
    test('should export complete SOP as structured JSON', async () => {
      const projectId = uuidv4();
      
      // Create comprehensive SOP project
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, description, status, version, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        projectId,
        'Customer Onboarding Process',
        'Complete customer onboarding workflow with approval gates',
        'active',
        2,
        JSON.stringify({
          department: 'sales',
          priority: 'high',
          estimated_duration_hours: 8,
          required_roles: ['sales_rep', 'manager', 'admin'],
          tags: ['customer', 'onboarding', 'sales']
        })
      ]);

      // Create complex step structure
      const steps = [
        {
          name: 'Initial Customer Contact',
          type: 'contact_step',
          position: 1,
          config: {
            contact_methods: ['email', 'phone'],
            required_info: ['company_name', 'contact_person', 'requirements'],
            timeout_hours: 24
          }
        },
        {
          name: 'Requirements Analysis',
          type: 'analysis_step', 
          position: 2,
          config: {
            analysis_type: 'technical_and_business',
            required_documents: ['requirements_doc', 'technical_specs'],
            estimated_duration_hours: 4
          }
        },
        {
          name: 'Manager Approval',
          type: 'approval_gate',
          position: 3,
          config: {
            approval_type: 'manager_review',
            required_approvers: ['direct_manager'],
            approval_criteria: {
              deal_value_threshold: 10000,
              complexity_level: 'medium'
            },
            timeout_hours: 48
          }
        },
        {
          name: 'Contract Generation',
          type: 'document_generation',
          position: 4,
          config: {
            template_type: 'standard_contract',
            auto_populate_fields: true,
            review_required: true
          }
        },
        {
          name: 'Customer Sign-off',
          type: 'external_approval',
          position: 5,
          config: {
            approval_method: 'digital_signature',
            reminder_schedule: [24, 72, 168], // hours
            escalation_after_hours: 168
          }
        }
      ];

      const stepIds = [];
      for (const step of steps) {
        const stepId = uuidv4();
        stepIds.push(stepId);
        
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position, configuration)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [stepId, projectId, step.name, step.type, step.position, JSON.stringify(step.config)]);
      }

      // Create hierarchical sub-steps
      const subStepId = uuidv4();
      await dataSource.query(`
        INSERT INTO sop_steps (id, project_id, name, step_type, position, parent_step_id, configuration)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        subStepId,
        projectId,
        'Technical Requirements Review',
        'sub_analysis',
        1,
        stepIds[1], // Under Requirements Analysis
        JSON.stringify({
          focus_areas: ['architecture', 'scalability', 'security'],
          required_expertise: 'technical_architect'
        })
      ]);

      // Export SOP as JSON
      const exportData = await dataSource.query(`
        SELECT 
          json_build_object(
            'project', json_build_object(
              'id', p.id,
              'name', p.name,
              'description', p.description,
              'status', p.status,
              'version', p.version,
              'metadata', p.metadata,
              'created_at', p.created_at,
              'updated_at', p.updated_at
            ),
            'steps', json_agg(
              json_build_object(
                'id', s.id,
                'name', s.name,
                'step_type', s.step_type,
                'position', s.position,
                'configuration', s.configuration,
                'parent_step_id', s.parent_step_id,
                'is_active', s.is_active
              ) ORDER BY s.position, s.parent_step_id NULLS FIRST
            ),
            'export_metadata', json_build_object(
              'exported_at', NOW(),
              'export_format', 'json',
              'exported_by', 'test-user',
              'version', '1.0.0'
            )
          ) as export_data
        FROM sop_projects p
        LEFT JOIN sop_steps s ON p.id = s.project_id
        WHERE p.id = $1
        GROUP BY p.id, p.name, p.description, p.status, p.version, p.metadata, p.created_at, p.updated_at
      `, [projectId]);

      const sopExport: SOPExport = exportData[0].export_data;

      // Write to file
      const exportFilePath = path.join(exportDir, `sop-${projectId}.json`);
      fs.writeFileSync(exportFilePath, JSON.stringify(sopExport, null, 2));

      // Validate export structure
      expect(sopExport.project).toBeDefined();
      expect(sopExport.project.id).toBe(projectId);
      expect(sopExport.project.name).toBe('Customer Onboarding Process');
      expect(sopExport.project.version).toBe(2);

      expect(sopExport.steps).toHaveLength(6); // 5 main steps + 1 sub-step
      expect(sopExport.steps.filter(s => s.parent_step_id === null)).toHaveLength(5);
      expect(sopExport.steps.filter(s => s.parent_step_id !== null)).toHaveLength(1);

      // Validate step configurations
      const approvalStep = sopExport.steps.find(s => s.step_type === 'approval_gate');
      expect(approvalStep.configuration.approval_criteria.deal_value_threshold).toBe(10000);

      const contractStep = sopExport.steps.find(s => s.step_type === 'document_generation');
      expect(contractStep.configuration.auto_populate_fields).toBe(true);

      // Validate export metadata
      expect(sopExport.export_metadata.export_format).toBe('json');
      expect(sopExport.export_metadata.version).toBe('1.0.0');

      // Verify file was created and is valid JSON
      expect(fs.existsSync(exportFilePath)).toBe(true);
      const fileContent = fs.readFileSync(exportFilePath, 'utf8');
      expect(() => JSON.parse(fileContent)).not.toThrow();
    });

    test('should export SOP with template information', async () => {
      const templateId = uuidv4();
      const projectId = uuidv4();

      // Create template
      await dataSource.query(`
        INSERT INTO sop_templates (id, name, description, category, template_data, is_public)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        templateId,
        'Standard Approval Template',
        'Template for approval workflows',
        'approvals',
        JSON.stringify({
          steps: [
            { name: 'Submit Request', type: 'submission' },
            { name: 'Review', type: 'review' },
            { name: 'Approve', type: 'approval' }
          ]
        }),
        true
      ]);

      // Create project from template
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, status, metadata)
        VALUES ($1, $2, $3, $4)
      `, [
        projectId,
        'Template-Based Approval Process',
        'active',
        JSON.stringify({
          template_id: templateId,
          customization: {
            department: 'hr',
            approval_level: 'manager'
          },
          instantiated_at: new Date().toISOString()
        })
      ]);

      // Add steps
      await dataSource.query(`
        INSERT INTO sop_steps (id, project_id, name, step_type, position)
        VALUES ($1, $2, $3, $4, $5)
      `, [uuidv4(), projectId, 'Template Step', 'template_step', 1]);

      // Export with template info
      const exportWithTemplate = await dataSource.query(`
        SELECT 
          json_build_object(
            'project', json_build_object(
              'id', p.id,
              'name', p.name,
              'status', p.status,
              'metadata', p.metadata
            ),
            'steps', json_agg(
              json_build_object(
                'id', s.id,
                'name', s.name,
                'step_type', s.step_type,
                'position', s.position
              )
            ),
            'template_info', CASE 
              WHEN p.metadata->>'template_id' IS NOT NULL 
              THEN json_build_object(
                'template_id', t.id,
                'template_name', t.name,
                'template_category', t.category,
                'customization', p.metadata->'customization'
              )
              ELSE NULL
            END,
            'export_metadata', json_build_object(
              'exported_at', NOW(),
              'export_format', 'json',
              'includes_template_info', CASE WHEN p.metadata->>'template_id' IS NOT NULL THEN true ELSE false END
            )
          ) as export_data
        FROM sop_projects p
        LEFT JOIN sop_steps s ON p.id = s.project_id
        LEFT JOIN sop_templates t ON (p.metadata->>'template_id')::uuid = t.id
        WHERE p.id = $1
        GROUP BY p.id, p.name, p.status, p.metadata, t.id, t.name, t.category
      `, [projectId]);

      const templateExport = exportWithTemplate[0].export_data;

      expect(templateExport.template_info).toBeDefined();
      expect(templateExport.template_info.template_id).toBe(templateId);
      expect(templateExport.template_info.template_name).toBe('Standard Approval Template');
      expect(templateExport.template_info.customization.department).toBe('hr');
      expect(templateExport.export_metadata.includes_template_info).toBe(true);
    });
  });

  describe('Human-Readable Export Formats', () => {
    test('should export SOP as structured Markdown', async () => {
      const projectId = uuidv4();
      
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, description, status, metadata)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        projectId,
        'Incident Response Procedure',
        'Standard operating procedure for security incidents',
        'active',
        JSON.stringify({
          severity_levels: ['low', 'medium', 'high', 'critical'],
          response_team: ['security_lead', 'sys_admin', 'manager']
        })
      ]);

      // Create well-structured steps for markdown export
      const markdownSteps = [
        {
          name: 'Initial Assessment',
          type: 'assessment_step',
          description: 'Evaluate the severity and scope of the incident',
          config: {
            assessment_criteria: [
              'Impact on business operations',
              'Data exposure risk',
              'System availability'
            ],
            time_limit_minutes: 15
          }
        },
        {
          name: 'Team Notification',
          type: 'notification_step',
          description: 'Notify appropriate team members based on severity',
          config: {
            notification_matrix: {
              low: ['security_lead'],
              medium: ['security_lead', 'sys_admin'],
              high: ['security_lead', 'sys_admin', 'manager'],
              critical: ['all_hands', 'executive_team']
            }
          }
        },
        {
          name: 'Containment Actions',
          type: 'action_step',
          description: 'Immediate steps to contain the incident',
          config: {
            actions: [
              'Isolate affected systems',
              'Preserve evidence',
              'Block malicious IPs',
              'Reset compromised credentials'
            ],
            parallel_execution: true
          }
        },
        {
          name: 'Recovery and Validation',
          type: 'recovery_step',
          description: 'Restore services and validate security',
          config: {
            validation_checklist: [
              'System integrity verified',
              'All patches applied',
              'Monitoring restored',
              'Access controls validated'
            ]
          }
        }
      ];

      for (let i = 0; i < markdownSteps.length; i++) {
        const step = markdownSteps[i];
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position, configuration)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          uuidv4(),
          projectId,
          step.name,
          step.type,
          i + 1,
          JSON.stringify({ description: step.description, ...step.config })
        ]);
      }

      // Generate markdown export data
      const markdownData = await dataSource.query(`
        SELECT 
          p.name as project_name,
          p.description as project_description,
          p.status,
          p.metadata,
          array_agg(
            json_build_object(
              'name', s.name,
              'type', s.step_type,
              'position', s.position,
              'description', s.configuration->>'description',
              'configuration', s.configuration - 'description'
            ) ORDER BY s.position
          ) as steps
        FROM sop_projects p
        LEFT JOIN sop_steps s ON p.id = s.project_id
        WHERE p.id = $1
        GROUP BY p.id, p.name, p.description, p.status, p.metadata
      `, [projectId]);

      const data = markdownData[0];

      // Generate markdown content
      const markdownContent = `# ${data.project_name}

${data.project_description}

**Status:** ${data.status}
**Last Updated:** ${new Date().toISOString()}

## Overview

This SOP covers the following response team roles:
${data.metadata.response_team.map(role => `- ${role.replace('_', ' ').toUpperCase()}`).join('\n')}

## Procedure Steps

${data.steps.map((step, index) => `
### Step ${step.position}: ${step.name}

**Type:** ${step.type.replace('_', ' ').toUpperCase()}

${step.description}

${step.configuration.assessment_criteria ? 
  `**Assessment Criteria:**\n${step.configuration.assessment_criteria.map(c => `- ${c}`).join('\n')}` : ''}

${step.configuration.actions ? 
  `**Actions:**\n${step.configuration.actions.map(a => `- ${a}`).join('\n')}` : ''}

${step.configuration.validation_checklist ? 
  `**Validation Checklist:**\n${step.configuration.validation_checklist.map(v => `- [ ] ${v}`).join('\n')}` : ''}

${step.configuration.time_limit_minutes ? 
  `**Time Limit:** ${step.configuration.time_limit_minutes} minutes` : ''}
`).join('\n')}

## Additional Information

- **Severity Levels:** ${data.metadata.severity_levels.join(', ')}
- **Generated:** ${new Date().toISOString()}
- **Export Format:** Markdown
`;

      // Write markdown file
      const markdownPath = path.join(exportDir, `sop-${projectId}.md`);
      fs.writeFileSync(markdownPath, markdownContent);

      // Validate markdown file
      expect(fs.existsSync(markdownPath)).toBe(true);
      const fileContent = fs.readFileSync(markdownPath, 'utf8');
      
      expect(fileContent).toContain('# Incident Response Procedure');
      expect(fileContent).toContain('## Procedure Steps');
      expect(fileContent).toContain('### Step 1: Initial Assessment');
      expect(fileContent).toContain('### Step 4: Recovery and Validation');
      expect(fileContent).toContain('**Assessment Criteria:**');
      expect(fileContent).toContain('- [ ] System integrity verified');
      expect(fileContent.split('###')).toHaveLength(5); // Title + 4 steps
    });

    test('should export SOP as CSV for data analysis', async () => {
      const projectId = uuidv4();
      
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, description, status)
        VALUES ($1, $2, $3, $4)
      `, [projectId, 'Data Analysis Export Test', 'SOP for CSV export testing', 'active']);

      // Create steps with quantifiable data
      const analyticsSteps = [
        { name: 'Data Collection', type: 'collection', duration: 30, complexity: 2, automation: false },
        { name: 'Data Validation', type: 'validation', duration: 15, complexity: 3, automation: true },
        { name: 'Analysis', type: 'analysis', duration: 60, complexity: 4, automation: false },
        { name: 'Reporting', type: 'reporting', duration: 20, complexity: 2, automation: true },
        { name: 'Review', type: 'review', duration: 25, complexity: 3, automation: false }
      ];

      for (let i = 0; i < analyticsSteps.length; i++) {
        const step = analyticsSteps[i];
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
            estimated_duration_minutes: step.duration,
            complexity_score: step.complexity,
            automated: step.automation,
            resource_requirements: step.complexity * 10,
            risk_level: step.complexity > 3 ? 'high' : 'low'
          })
        ]);
      }

      // Generate CSV export data
      const csvData = await dataSource.query(`
        SELECT 
          p.name as project_name,
          s.name as step_name,
          s.step_type,
          s.position,
          (s.configuration->>'estimated_duration_minutes')::int as duration_minutes,
          (s.configuration->>'complexity_score')::int as complexity,
          (s.configuration->>'automated')::boolean as is_automated,
          (s.configuration->>'resource_requirements')::int as resources_needed,
          s.configuration->>'risk_level' as risk_level,
          s.is_active
        FROM sop_projects p
        JOIN sop_steps s ON p.id = s.project_id
        WHERE p.id = $1
        ORDER BY s.position
      `, [projectId]);

      // Generate CSV content
      const csvHeaders = [
        'Project Name',
        'Step Name', 
        'Step Type',
        'Position',
        'Duration (minutes)',
        'Complexity Score',
        'Automated',
        'Resource Requirements',
        'Risk Level',
        'Active'
      ];

      const csvRows = csvData.map(row => [
        `"${row.project_name}"`,
        `"${row.step_name}"`,
        row.step_type,
        row.position,
        row.duration_minutes,
        row.complexity,
        row.is_automated,
        row.resources_needed,
        row.risk_level,
        row.is_active
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Write CSV file
      const csvPath = path.join(exportDir, `sop-analytics-${projectId}.csv`);
      fs.writeFileSync(csvPath, csvContent);

      // Validate CSV file
      expect(fs.existsSync(csvPath)).toBe(true);
      const fileContent = fs.readFileSync(csvPath, 'utf8');
      const lines = fileContent.split('\n');
      
      expect(lines).toHaveLength(6); // Header + 5 data rows
      expect(lines[0]).toBe(csvHeaders.join(','));
      expect(lines[1]).toContain('Data Collection');
      expect(lines[1]).toContain('30'); // Duration
      expect(lines[1]).toContain('false'); // Not automated
      
      // Validate numerical data
      const dataLines = lines.slice(1, 6);
      const totalDuration = dataLines.reduce((sum, line) => {
        const duration = parseInt(line.split(',')[4]);
        return sum + duration;
      }, 0);
      
      expect(totalDuration).toBe(150); // 30+15+60+20+25
    });
  });

  describe('Batch Export Operations', () => {
    test('should export multiple SOPs in batch operation', async () => {
      const projectIds = [];
      const sopData = [
        { name: 'Marketing Campaign SOP', category: 'marketing' },
        { name: 'Sales Process SOP', category: 'sales' },
        { name: 'IT Support SOP', category: 'it' },
        { name: 'HR Onboarding SOP', category: 'hr' }
      ];

      // Create multiple SOPs
      for (const sop of sopData) {
        const projectId = uuidv4();
        projectIds.push(projectId);
        
        await dataSource.query(`
          INSERT INTO sop_projects (id, name, status, metadata)
          VALUES ($1, $2, $3, $4)
        `, [
          projectId,
          sop.name,
          'active',
          JSON.stringify({ category: sop.category })
        ]);

        // Add sample steps to each SOP
        for (let i = 1; i <= 3; i++) {
          await dataSource.query(`
            INSERT INTO sop_steps (id, project_id, name, step_type, position)
            VALUES ($1, $2, $3, $4, $5)
          `, [uuidv4(), projectId, `${sop.category} Step ${i}`, 'process_step', i]);
        }
      }

      // Batch export query
      const batchExportData = await dataSource.query(`
        SELECT 
          json_agg(
            json_build_object(
              'project', json_build_object(
                'id', p.id,
                'name', p.name,
                'category', p.metadata->>'category',
                'status', p.status
              ),
              'steps', (
                SELECT json_agg(
                  json_build_object(
                    'name', s.name,
                    'type', s.step_type,
                    'position', s.position
                  ) ORDER BY s.position
                )
                FROM sop_steps s
                WHERE s.project_id = p.id
              ),
              'step_count', (SELECT COUNT(*) FROM sop_steps s WHERE s.project_id = p.id)
            )
          ) as batch_export
        FROM sop_projects p
        WHERE p.id = ANY($1)
      `, [projectIds]);

      const batchExport = batchExportData[0].batch_export;

      // Create batch export file
      const batchExportFile = {
        export_info: {
          exported_at: new Date().toISOString(),
          total_sops: batchExport.length,
          export_type: 'batch',
          format: 'json'
        },
        sops: batchExport
      };

      const batchPath = path.join(exportDir, 'batch-export.json');
      fs.writeFileSync(batchPath, JSON.stringify(batchExportFile, null, 2));

      // Validate batch export
      expect(batchExport).toHaveLength(4);
      expect(batchExport.every(sop => sop.step_count === 3)).toBe(true);
      
      const categories = batchExport.map(sop => sop.project.category).sort();
      expect(categories).toEqual(['hr', 'it', 'marketing', 'sales']);

      // Validate file creation
      expect(fs.existsSync(batchPath)).toBe(true);
      const fileContent = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
      expect(fileContent.export_info.total_sops).toBe(4);
      expect(fileContent.sops).toHaveLength(4);
    });

    test('should export SOP collection with filtering and grouping', async () => {
      const departments = ['engineering', 'sales', 'hr'];
      const statuses = ['active', 'draft', 'archived'];
      const allProjectIds = [];

      // Create SOPs across departments and statuses
      for (const dept of departments) {
        for (const status of statuses) {
          const projectId = uuidv4();
          allProjectIds.push(projectId);
          
          await dataSource.query(`
            INSERT INTO sop_projects (id, name, status, metadata)
            VALUES ($1, $2, $3, $4)
          `, [
            projectId,
            `${dept.toUpperCase()} ${status} SOP`,
            status,
            JSON.stringify({
              department: dept,
              created_by: `${dept}_manager`,
              priority: dept === 'engineering' ? 'high' : 'medium'
            })
          ]);

          // Add variable number of steps based on department
          const stepCount = dept === 'engineering' ? 5 : dept === 'sales' ? 3 : 2;
          for (let i = 1; i <= stepCount; i++) {
            await dataSource.query(`
              INSERT INTO sop_steps (id, project_id, name, step_type, position)
              VALUES ($1, $2, $3, $4, $5)
            `, [uuidv4(), projectId, `${dept} Step ${i}`, 'process_step', i]);
          }
        }
      }

      // Export with filtering and grouping
      const groupedExport = await dataSource.query(`
        SELECT 
          json_build_object(
            'export_metadata', json_build_object(
              'exported_at', NOW(),
              'total_projects', COUNT(*),
              'filter_criteria', json_build_object(
                'departments', array_agg(DISTINCT p.metadata->>'department'),
                'statuses', array_agg(DISTINCT p.status)
              )
            ),
            'grouped_by_department', json_object_agg(
              p.metadata->>'department',
              json_build_object(
                'department_name', p.metadata->>'department',
                'total_sops', COUNT(*),
                'by_status', json_object_agg(
                  p.status,
                  COUNT(*)
                ),
                'avg_steps_per_sop', ROUND(AVG(step_counts.step_count), 2),
                'sops', json_agg(
                  json_build_object(
                    'id', p.id,
                    'name', p.name,
                    'status', p.status,
                    'priority', p.metadata->>'priority',
                    'step_count', step_counts.step_count
                  )
                )
              )
            )
          ) as grouped_export
        FROM sop_projects p
        JOIN (
          SELECT 
            project_id,
            COUNT(*) as step_count
          FROM sop_steps
          GROUP BY project_id
        ) step_counts ON p.id = step_counts.project_id
        WHERE p.id = ANY($1)
        GROUP BY p.metadata->>'department'
      `, [allProjectIds]);

      const groupedData = groupedExport[0].grouped_export;

      // Write grouped export file
      const groupedPath = path.join(exportDir, 'grouped-export.json');
      fs.writeFileSync(groupedPath, JSON.stringify(groupedData, null, 2));

      // Validate grouped export
      expect(groupedData.export_metadata.total_projects).toBe(9);
      expect(groupedData.export_metadata.filter_criteria.departments).toHaveLength(3);
      expect(groupedData.export_metadata.filter_criteria.statuses).toHaveLength(3);

      expect(groupedData.grouped_by_department.engineering).toBeDefined();
      expect(groupedData.grouped_by_department.sales).toBeDefined();
      expect(groupedData.grouped_by_department.hr).toBeDefined();

      // Engineering should have higher average steps
      expect(parseFloat(groupedData.grouped_by_department.engineering.avg_steps_per_sop)).toBe(5.0);
      expect(parseFloat(groupedData.grouped_by_department.sales.avg_steps_per_sop)).toBe(3.0);
      expect(parseFloat(groupedData.grouped_by_department.hr.avg_steps_per_sop)).toBe(2.0);
    });
  });

  describe('Export Validation and Error Handling', () => {
    test('should validate export data integrity', async () => {
      const projectId = uuidv4();
      
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, status)
        VALUES ($1, $2, $3)
      `, [projectId, 'Validation Test SOP', 'active']);

      // Create steps with potential data issues
      const steps = [
        { name: 'Valid Step', config: { valid: true } },
        { name: 'Step with Null Config', config: null },
        { name: 'Step with Empty Config', config: {} },
        { name: 'Step with Complex Config', config: { nested: { array: [1, 2, 3], object: { key: 'value' } } } }
      ];

      for (let i = 0; i < steps.length; i++) {
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position, configuration)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          uuidv4(),
          projectId,
          steps[i].name,
          'test_step',
          i + 1,
          steps[i].config ? JSON.stringify(steps[i].config) : null
        ]);
      }

      // Export with validation
      const validationExport = await dataSource.query(`
        SELECT 
          json_build_object(
            'project', json_build_object(
              'id', p.id,
              'name', p.name,
              'validation', json_build_object(
                'has_name', CASE WHEN p.name IS NOT NULL AND p.name != '' THEN true ELSE false END,
                'has_steps', CASE WHEN COUNT(s.id) > 0 THEN true ELSE false END,
                'step_count', COUNT(s.id)
              )
            ),
            'steps', json_agg(
              json_build_object(
                'id', s.id,
                'name', s.name,
                'position', s.position,
                'configuration', COALESCE(s.configuration, '{}'::jsonb),
                'validation', json_build_object(
                  'has_name', CASE WHEN s.name IS NOT NULL AND s.name != '' THEN true ELSE false END,
                  'has_config', CASE WHEN s.configuration IS NOT NULL THEN true ELSE false END,
                  'config_is_object', CASE WHEN jsonb_typeof(COALESCE(s.configuration, '{}'::jsonb)) = 'object' THEN true ELSE false END
                )
              ) ORDER BY s.position
            ),
            'export_validation', json_build_object(
              'export_timestamp', NOW(),
              'validation_passed', CASE 
                WHEN p.name IS NOT NULL AND COUNT(s.id) > 0 THEN true 
                ELSE false 
              END,
              'issues', json_build_array()
            )
          ) as validated_export
        FROM sop_projects p
        LEFT JOIN sop_steps s ON p.id = s.project_id
        WHERE p.id = $1
        GROUP BY p.id, p.name
      `, [projectId]);

      const validatedData = validationExport[0].validated_export;

      // Write validated export
      const validatedPath = path.join(exportDir, `validated-sop-${projectId}.json`);
      fs.writeFileSync(validatedPath, JSON.stringify(validatedData, null, 2));

      // Validate export structure
      expect(validatedData.project.validation.has_name).toBe(true);
      expect(validatedData.project.validation.has_steps).toBe(true);
      expect(validatedData.project.validation.step_count).toBe(4);

      expect(validatedData.steps).toHaveLength(4);
      expect(validatedData.steps.every(step => step.validation.has_name)).toBe(true);
      
      // Check configuration handling
      const stepWithNullConfig = validatedData.steps.find(s => s.name === 'Step with Null Config');
      expect(stepWithNullConfig.validation.has_config).toBe(false);
      expect(stepWithNullConfig.configuration).toEqual({});

      const stepWithComplexConfig = validatedData.steps.find(s => s.name === 'Step with Complex Config');
      expect(stepWithComplexConfig.validation.has_config).toBe(true);
      expect(stepWithComplexConfig.configuration.nested).toBeDefined();

      expect(validatedData.export_validation.validation_passed).toBe(true);
    });

    test('should handle export errors gracefully', async () => {
      const nonExistentProjectId = uuidv4();

      // Attempt to export non-existent SOP
      const emptyExport = await dataSource.query(`
        SELECT 
          COALESCE(
            (
              SELECT json_build_object(
                'project', json_build_object(
                  'id', p.id,
                  'name', p.name
                ),
                'steps', json_agg(
                  json_build_object(
                    'id', s.id,
                    'name', s.name
                  )
                )
              )
              FROM sop_projects p
              LEFT JOIN sop_steps s ON p.id = s.project_id
              WHERE p.id = $1
              GROUP BY p.id, p.name
            ),
            json_build_object(
              'error', 'SOP not found',
              'project_id', $1,
              'export_timestamp', NOW()
            )
          ) as export_result
      `, [nonExistentProjectId]);

      const result = emptyExport[0].export_result;

      expect(result.error).toBe('SOP not found');
      expect(result.project_id).toBe(nonExistentProjectId);

      // Test export of SOP with orphaned steps
      const projectWithIssues = uuidv4();
      
      // Create project
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, status)
        VALUES ($1, $2, $3)
      `, [projectWithIssues, 'Problematic SOP', 'active']);

      // Create step with invalid parent reference
      await dataSource.query(`
        INSERT INTO sop_steps (id, project_id, name, step_type, position, parent_step_id)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [uuidv4(), projectWithIssues, 'Orphaned Step', 'test_step', 1, uuidv4()]);

      // Export with error detection
      const problematicExport = await dataSource.query(`
        SELECT 
          json_build_object(
            'project', json_build_object(
              'id', p.id,
              'name', p.name
            ),
            'steps', json_agg(
              json_build_object(
                'id', s.id,
                'name', s.name,
                'parent_step_id', s.parent_step_id,
                'has_valid_parent', CASE 
                  WHEN s.parent_step_id IS NULL THEN true
                  WHEN EXISTS (SELECT 1 FROM sop_steps ps WHERE ps.id = s.parent_step_id) THEN true
                  ELSE false
                END
              )
            ),
            'export_issues', json_agg(
              CASE 
                WHEN s.parent_step_id IS NOT NULL 
                     AND NOT EXISTS (SELECT 1 FROM sop_steps ps WHERE ps.id = s.parent_step_id)
                THEN json_build_object(
                  'step_id', s.id,
                  'step_name', s.name,
                  'issue', 'invalid_parent_reference',
                  'invalid_parent_id', s.parent_step_id
                )
                ELSE NULL
              END
            ) FILTER (WHERE s.parent_step_id IS NOT NULL 
                             AND NOT EXISTS (SELECT 1 FROM sop_steps ps WHERE ps.id = s.parent_step_id))
          ) as problematic_export
        FROM sop_projects p
        LEFT JOIN sop_steps s ON p.id = s.project_id
        WHERE p.id = $1
        GROUP BY p.id, p.name
      `, [projectWithIssues]);

      const problematicResult = problematicExport[0].problematic_export;

      expect(problematicResult.steps[0].has_valid_parent).toBe(false);
      expect(problematicResult.export_issues).toHaveLength(1);
      expect(problematicResult.export_issues[0].issue).toBe('invalid_parent_reference');
    });
  });
});
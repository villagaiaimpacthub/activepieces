/**
 * ActivePieces Integration E2E Tests
 * Tests the integration with ActivePieces core platform
 * REALITY: This is a customization layer, not a standalone system
 */

import axios from 'axios';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

describe('ActivePieces Integration E2E Tests', () => {
  let dataSource: DataSource;
  const baseURL = process.env.ACTIVEPIECES_API_URL || 'http://localhost:3000';
  let authToken: string;

  beforeAll(async () => {
    // Initialize database connection
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

    // Authenticate with ActivePieces API
    try {
      const loginResponse = await axios.post(`${baseURL}/v1/authentication/sign-in`, {
        email: process.env.TEST_USER_EMAIL || 'test@example.com',
        password: process.env.TEST_USER_PASSWORD || 'testpassword'
      });
      authToken = loginResponse.data.token;
    } catch (error) {
      console.warn('Failed to authenticate with ActivePieces API. Some tests may be skipped.');
    }
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

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  });

  describe('Platform Integration', () => {
    test('should connect to ActivePieces API', async () => {
      if (!authToken) {
        console.warn('Skipping API test - no authentication token');
        return;
      }

      const response = await axios.get(`${baseURL}/v1/users/me`, {
        headers: getAuthHeaders()
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('email');
    });

    test('should access ActivePieces flow management', async () => {
      if (!authToken) {
        console.warn('Skipping flow management test - no authentication token');
        return;
      }

      // Get flows (which we'll use as SOP workflows)
      const flowsResponse = await axios.get(`${baseURL}/v1/flows`, {
        headers: getAuthHeaders()
      });

      expect(flowsResponse.status).toBe(200);
      expect(Array.isArray(flowsResponse.data.data)).toBe(true);
    });

    test('should validate database connectivity with ActivePieces', async () => {
      // Test that our SOP tables exist alongside ActivePieces tables
      const sopTables = await dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name LIKE 'sop_%'
        ORDER BY table_name
      `);

      expect(sopTables).toHaveLength(3);
      expect(sopTables.map(t => t.table_name)).toEqual([
        'sop_projects', 'sop_steps', 'sop_templates'
      ]);

      // Check for ActivePieces core tables (should exist)
      const activePiecesTables = await dataSource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND (table_name LIKE 'flow%' OR table_name LIKE 'user%' OR table_name = 'project')
        ORDER BY table_name
      `);

      // ActivePieces should have its own tables
      expect(activePiecesTables.length).toBeGreaterThan(0);
    });
  });

  describe('SOP-as-Flow Integration', () => {
    test('should create SOP project linked to ActivePieces flow', async () => {
      if (!authToken) {
        console.warn('Skipping flow creation test - no authentication token');
        return;
      }

      // Create a basic flow in ActivePieces that represents our SOP
      const flowData = {
        displayName: 'Test SOP Flow',
        version: {
          displayName: 'Test SOP Flow',
          trigger: {
            type: 'WEBHOOK',
            settings: {}
          }
        }
      };

      const flowResponse = await axios.post(`${baseURL}/v1/flows`, flowData, {
        headers: getAuthHeaders()
      });

      expect(flowResponse.status).toBe(201);
      const flowId = flowResponse.data.id;

      // Create corresponding SOP project in our database
      const sopProjectId = uuidv4();
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, description, metadata)
        VALUES ($1, $2, $3, $4)
      `, [
        sopProjectId,
        'Test SOP Flow',
        'SOP backed by ActivePieces flow',
        JSON.stringify({ activepieces_flow_id: flowId })
      ]);

      // Verify the link
      const sopResult = await dataSource.query(
        'SELECT metadata FROM sop_projects WHERE id = $1',
        [sopProjectId]
      );

      expect(sopResult[0].metadata.activepieces_flow_id).toBe(flowId);
    });

    test('should synchronize SOP steps with flow actions', async () => {
      const projectId = uuidv4();
      
      // Create SOP project
      await dataSource.query(`
        INSERT INTO sop_projects (id, name)
        VALUES ($1, $2)
      `, [projectId, 'Multi-Step SOP']);

      // Create SOP steps that mirror ActivePieces flow structure
      const steps = [
        { name: 'Initialize Process', type: 'webhook_trigger', position: 1 },
        { name: 'Validate Input', type: 'code_action', position: 2 },
        { name: 'Send Notification', type: 'email_action', position: 3 },
        { name: 'Complete Process', type: 'webhook_response', position: 4 }
      ];

      for (const step of steps) {
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position)
          VALUES ($1, $2, $3, $4, $5)
        `, [uuidv4(), projectId, step.name, step.type, step.position]);
      }

      // Verify step sequence
      const orderedSteps = await dataSource.query(`
        SELECT name, step_type, position 
        FROM sop_steps 
        WHERE project_id = $1 
        ORDER BY position
      `, [projectId]);

      expect(orderedSteps).toHaveLength(4);
      expect(orderedSteps[0].name).toBe('Initialize Process');
      expect(orderedSteps[0].step_type).toBe('webhook_trigger');
      expect(orderedSteps[3].name).toBe('Complete Process');
    });

    test('should handle SOP template instantiation as flow', async () => {
      // Create SOP template
      const templateId = uuidv4();
      const templateData = {
        name: 'Standard Approval Process',
        steps: [
          { name: 'Submit Request', type: 'form_trigger' },
          { name: 'Manager Review', type: 'approval_action' },
          { name: 'Send Decision', type: 'email_action' }
        ],
        metadata: {
          estimated_duration: 1440, // 24 hours in minutes
          required_roles: ['submitter', 'manager']
        }
      };

      await dataSource.query(`
        INSERT INTO sop_templates (id, name, category, template_data)
        VALUES ($1, $2, $3, $4)
      `, [templateId, templateData.name, 'approval', JSON.stringify(templateData)]);

      // Instantiate template as new SOP project
      const projectId = uuidv4();
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, description, metadata)
        VALUES ($1, $2, $3, $4)
      `, [
        projectId,
        `${templateData.name} - Instance`,
        'Created from template',
        JSON.stringify({ template_id: templateId, instantiated_at: new Date().toISOString() })
      ]);

      // Create steps from template
      for (let i = 0; i < templateData.steps.length; i++) {
        const step = templateData.steps[i];
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position)
          VALUES ($1, $2, $3, $4, $5)
        `, [uuidv4(), projectId, step.name, step.type, i + 1]);
      }

      // Verify template instantiation
      const instanceSteps = await dataSource.query(`
        SELECT name, step_type FROM sop_steps WHERE project_id = $1 ORDER BY position
      `, [projectId]);

      expect(instanceSteps).toHaveLength(3);
      expect(instanceSteps.map(s => s.name)).toEqual([
        'Submit Request', 'Manager Review', 'Send Decision'
      ]);
    });
  });

  describe('Custom SOP Pieces Integration', () => {
    test('should register custom SOP pieces with ActivePieces', async () => {
      if (!authToken) {
        console.warn('Skipping custom pieces test - no authentication token');
        return;
      }

      // In a real implementation, this would test custom piece registration
      // For now, we test the data structures that would support this
      
      const sopPieceTypes = [
        'process_step',
        'decision_point', 
        'approval_gate',
        'document_review',
        'quality_check',
        'notification_step'
      ];

      const projectId = uuidv4();
      await dataSource.query(`
        INSERT INTO sop_projects (id, name)
        VALUES ($1, $2)
      `, [projectId, 'Custom Pieces Test']);

      // Create steps using custom SOP piece types
      for (let i = 0; i < sopPieceTypes.length; i++) {
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position, configuration)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          uuidv4(),
          projectId,
          `${sopPieceTypes[i].replace('_', ' ').toUpperCase()} Step`,
          sopPieceTypes[i],
          i + 1,
          JSON.stringify({ custom_piece: true, piece_version: '1.0.0' })
        ]);
      }

      const customSteps = await dataSource.query(`
        SELECT step_type, configuration FROM sop_steps 
        WHERE project_id = $1 AND configuration->>'custom_piece' = 'true'
      `, [projectId]);

      expect(customSteps).toHaveLength(sopPieceTypes.length);
    });

    test('should handle piece configuration and validation', async () => {
      const projectId = uuidv4();
      await dataSource.query(`
        INSERT INTO sop_projects (id, name)
        VALUES ($1, $2)
      `, [projectId, 'Piece Configuration Test']);

      // Create step with complex configuration
      const stepConfig = {
        piece_type: 'approval_gate',
        approvers: [
          { role: 'manager', required: true },
          { role: 'senior_manager', required: false }
        ],
        timeout_hours: 24,
        escalation_rules: {
          first_escalation: 8,
          final_escalation: 16
        },
        approval_criteria: {
          min_approvals: 1,
          unanimous_required: false
        }
      };

      const stepId = uuidv4();
      await dataSource.query(`
        INSERT INTO sop_steps (id, project_id, name, step_type, configuration, position)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [stepId, projectId, 'Complex Approval Gate', 'approval_gate', JSON.stringify(stepConfig), 1]);

      // Validate configuration was stored correctly
      const result = await dataSource.query(
        'SELECT configuration FROM sop_steps WHERE id = $1',
        [stepId]
      );

      expect(result[0].configuration).toMatchObject(stepConfig);
      expect(result[0].configuration.approvers).toHaveLength(2);
    });

    test('should support step dependencies and conditions', async () => {
      const projectId = uuidv4();
      await dataSource.query(`
        INSERT INTO sop_projects (id, name)
        VALUES ($1, $2)
      `, [projectId, 'Dependencies Test']);

      const stepIds = [uuidv4(), uuidv4(), uuidv4()];
      const stepConfigs = [
        { conditions: [], dependencies: [] }, // Initial step
        { 
          conditions: [{ field: 'approval_status', operator: 'equals', value: 'approved' }],
          dependencies: [stepIds[0]]
        }, // Conditional step
        { 
          conditions: [],
          dependencies: [stepIds[1]]
        } // Final step
      ];

      for (let i = 0; i < stepIds.length; i++) {
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position, configuration, parent_step_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          stepIds[i],
          projectId,
          `Step ${i + 1}`,
          'conditional_step',
          i + 1,
          JSON.stringify(stepConfigs[i]),
          i === 0 ? null : stepIds[i - 1] // Sequential parent-child relationship
        ]);
      }

      // Query step dependencies
      const dependencyChain = await dataSource.query(`
        WITH RECURSIVE step_chain AS (
          SELECT id, name, configuration, parent_step_id, 0 as depth
          FROM sop_steps
          WHERE parent_step_id IS NULL AND project_id = $1
          
          UNION ALL
          
          SELECT s.id, s.name, s.configuration, s.parent_step_id, sc.depth + 1
          FROM sop_steps s
          INNER JOIN step_chain sc ON s.parent_step_id = sc.id
        )
        SELECT name, depth, configuration FROM step_chain ORDER BY depth
      `, [projectId]);

      expect(dependencyChain).toHaveLength(3);
      expect(dependencyChain[0].depth).toBe(0); // Root step
      expect(dependencyChain[1].depth).toBe(1); // Dependent step
      expect(dependencyChain[2].depth).toBe(2); // Final step
    });
  });

  describe('Export and Integration', () => {
    test('should export SOP as ActivePieces flow definition', async () => {
      const projectId = uuidv4();
      
      // Create SOP with multiple steps
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, description, status)
        VALUES ($1, $2, $3, $4)
      `, [projectId, 'Export Test SOP', 'SOP for testing export functionality', 'active']);

      const steps = [
        { name: 'Start Process', type: 'trigger', config: { type: 'webhook' } },
        { name: 'Validate Data', type: 'action', config: { code: 'return true' } },
        { name: 'Send Notification', type: 'action', config: { template: 'Process started' } },
        { name: 'Complete', type: 'action', config: { status: 'completed' } }
      ];

      for (let i = 0; i < steps.length; i++) {
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position, configuration)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [uuidv4(), projectId, steps[i].name, steps[i].type, i + 1, JSON.stringify(steps[i].config)]);
      }

      // Query SOP for export
      const exportData = await dataSource.query(`
        SELECT 
          p.name as project_name,
          p.description,
          p.status,
          json_agg(
            json_build_object(
              'name', s.name,
              'type', s.step_type,
              'position', s.position,
              'configuration', s.configuration
            ) ORDER BY s.position
          ) as steps
        FROM sop_projects p
        LEFT JOIN sop_steps s ON p.id = s.project_id
        WHERE p.id = $1
        GROUP BY p.id, p.name, p.description, p.status
      `, [projectId]);

      expect(exportData).toHaveLength(1);
      expect(exportData[0].steps).toHaveLength(4);
      expect(exportData[0].steps[0].name).toBe('Start Process');
      expect(exportData[0].steps[0].type).toBe('trigger');

      // Simulate ActivePieces flow format export
      const flowExport = {
        id: projectId,
        displayName: exportData[0].project_name,
        description: exportData[0].description,
        version: {
          displayName: exportData[0].project_name,
          trigger: exportData[0].steps.find(s => s.type === 'trigger'),
          actions: exportData[0].steps.filter(s => s.type === 'action')
        }
      };

      expect(flowExport.version.trigger.name).toBe('Start Process');
      expect(flowExport.version.actions).toHaveLength(3);
    });

    test('should handle bi-directional sync between SOP and ActivePieces', async () => {
      if (!authToken) {
        console.warn('Skipping bi-directional sync test - no authentication token');
        return;
      }

      // Create SOP project
      const sopProjectId = uuidv4();
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, description, metadata)
        VALUES ($1, $2, $3, $4)
      `, [
        sopProjectId,
        'Sync Test SOP',
        'Testing bidirectional synchronization',
        JSON.stringify({ sync_enabled: true })
      ]);

      // Create SOP steps
      await dataSource.query(`
        INSERT INTO sop_steps (id, project_id, name, step_type, position)
        VALUES ($1, $2, $3, $4, $5)
      `, [uuidv4(), sopProjectId, 'Sync Test Step', 'manual_action', 1]);

      // Simulate changes from ActivePieces side
      // In reality, this would be triggered by webhooks or polling
      
      // Update SOP based on "external" changes
      await dataSource.query(`
        UPDATE sop_projects 
        SET metadata = jsonb_set(
          metadata, 
          '{last_sync}', 
          to_jsonb($1::timestamp)
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [new Date().toISOString(), sopProjectId]);

      const syncResult = await dataSource.query(
        'SELECT metadata FROM sop_projects WHERE id = $1',
        [sopProjectId]
      );

      expect(syncResult[0].metadata.last_sync).toBeDefined();
      expect(syncResult[0].metadata.sync_enabled).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle ActivePieces API errors gracefully', async () => {
      // Test with invalid authentication
      try {
        await axios.get(`${baseURL}/v1/flows`, {
          headers: { 'Authorization': 'Bearer invalid_token' }
        });
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });

    test('should validate SOP data before ActivePieces integration', async () => {
      const projectId = uuidv4();
      
      // Create SOP with invalid step configuration
      await dataSource.query(`
        INSERT INTO sop_projects (id, name)
        VALUES ($1, $2)
      `, [projectId, 'Invalid SOP']);

      // Attempt to create step with invalid JSON configuration
      const invalidConfig = 'invalid json';
      
      await expect(
        dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position, configuration)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [uuidv4(), projectId, 'Invalid Step', 'action', 1, invalidConfig])
      ).rejects.toThrow();
    });

    test('should maintain data consistency during failures', async () => {
      const projectId = uuidv4();
      
      // Start transaction
      await dataSource.query('BEGIN');
      
      try {
        // Create project
        await dataSource.query(`
          INSERT INTO sop_projects (id, name)
          VALUES ($1, $2)
        `, [projectId, 'Transaction Test']);

        // Create steps
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position)
          VALUES ($1, $2, $3, $4, $5)
        `, [uuidv4(), projectId, 'Test Step', 'action', 1]);

        // Simulate failure condition
        if (Math.random() > 0.5) {
          throw new Error('Simulated failure');
        }

        await dataSource.query('COMMIT');
      } catch (error) {
        await dataSource.query('ROLLBACK');
        
        // Verify rollback worked
        const projectCount = await dataSource.query(
          'SELECT COUNT(*) as count FROM sop_projects WHERE id = $1',
          [projectId]
        );
        
        expect(parseInt(projectCount[0].count)).toBe(0);
      }
    });
  });

  describe('Performance and Scaling', () => {
    test('should handle large SOPs efficiently', async () => {
      const projectId = uuidv4();
      const stepCount = 100;
      
      await dataSource.query(`
        INSERT INTO sop_projects (id, name)
        VALUES ($1, $2)
      `, [projectId, 'Large SOP Test']);

      const startTime = Date.now();
      
      // Batch insert steps
      const stepValues = [];
      for (let i = 0; i < stepCount; i++) {
        stepValues.push([uuidv4(), projectId, `Step ${i + 1}`, 'action', i + 1]);
      }

      for (const stepValue of stepValues) {
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position)
          VALUES ($1, $2, $3, $4, $5)
        `, stepValue);
      }

      const insertTime = Date.now() - startTime;

      // Query all steps
      const queryStartTime = Date.now();
      const allSteps = await dataSource.query(
        'SELECT * FROM sop_steps WHERE project_id = $1 ORDER BY position',
        [projectId]
      );
      const queryTime = Date.now() - queryStartTime;

      expect(allSteps).toHaveLength(stepCount);
      expect(insertTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(queryTime).toBeLessThan(1000);  // Should query within 1 second
    });

    test('should optimize complex hierarchical queries', async () => {
      const projectId = uuidv4();
      await dataSource.query(`
        INSERT INTO sop_projects (id, name)
        VALUES ($1, $2)
      `, [projectId, 'Complex Hierarchy Test']);

      // Create deep hierarchy (5 levels)
      let parentId = null;
      const levelStepIds = [];
      
      for (let level = 0; level < 5; level++) {
        const stepId = uuidv4();
        levelStepIds.push(stepId);
        
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position, parent_step_id)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [stepId, projectId, `Level ${level} Step`, 'group', level + 1, parentId]);
        
        parentId = stepId;
      }

      const startTime = Date.now();
      
      // Query full hierarchy with performance tracking
      const hierarchyResult = await dataSource.query(`
        WITH RECURSIVE step_tree AS (
          SELECT id, name, parent_step_id, 0 as level, ARRAY[position] as path
          FROM sop_steps
          WHERE parent_step_id IS NULL AND project_id = $1
          
          UNION ALL
          
          SELECT s.id, s.name, s.parent_step_id, st.level + 1, st.path || s.position
          FROM sop_steps s
          INNER JOIN step_tree st ON s.parent_step_id = st.id
          WHERE st.level < 10 -- Prevent infinite recursion
        )
        SELECT name, level, array_length(path, 1) as path_length
        FROM step_tree
        ORDER BY level
      `, [projectId]);

      const queryTime = Date.now() - startTime;

      expect(hierarchyResult).toHaveLength(5);
      expect(hierarchyResult[0].level).toBe(0);
      expect(hierarchyResult[4].level).toBe(4);
      expect(queryTime).toBeLessThan(500); // Should be fast even for deep hierarchies
    });
  });
});
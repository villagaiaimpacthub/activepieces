/**
 * Database Schema E2E Tests
 * Tests the actual database schema that exists in the codebase
 * REALITY: Only 3 tables exist - sop_projects, sop_steps, sop_templates
 */

import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

describe('Database Schema E2E Tests', () => {
  let dataSource: DataSource;

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
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await dataSource.query('TRUNCATE TABLE sop_steps CASCADE');
    await dataSource.query('TRUNCATE TABLE sop_projects CASCADE');
    await dataSource.query('TRUNCATE TABLE sop_templates CASCADE');
  });

  describe('SOP Projects Table', () => {
    test('should create project with all required fields', async () => {
      const projectData = {
        id: uuidv4(),
        name: 'Test SOP Project',
        description: 'A test project for E2E validation',
        status: 'draft',
        metadata: JSON.stringify({ created_by: 'test-user' }),
        version: 1
      };

      const insertResult = await dataSource.query(`
        INSERT INTO sop_projects (id, name, description, status, metadata, version)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [projectData.id, projectData.name, projectData.description, projectData.status, projectData.metadata, projectData.version]);

      expect(insertResult).toHaveLength(1);
      expect(insertResult[0].name).toBe('Test SOP Project');
      expect(insertResult[0].status).toBe('draft');
      expect(insertResult[0].version).toBe(1);
    });

    test('should enforce status enum constraint', async () => {
      const projectData = {
        id: uuidv4(),
        name: 'Invalid Status Project',
        status: 'invalid_status' // This should fail
      };

      await expect(
        dataSource.query(`
          INSERT INTO sop_projects (id, name, status)
          VALUES ($1, $2, $3)
        `, [projectData.id, projectData.name, projectData.status])
      ).rejects.toThrow();
    });

    test('should handle JSONB metadata correctly', async () => {
      const metadata = {
        tags: ['process', 'quality'],
        priority: 'high',
        estimated_duration: 30
      };

      const projectId = uuidv4();
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, metadata)
        VALUES ($1, $2, $3)
      `, [projectId, 'Metadata Test Project', JSON.stringify(metadata)]);

      const result = await dataSource.query(
        'SELECT metadata FROM sop_projects WHERE id = $1',
        [projectId]
      );

      expect(result[0].metadata).toEqual(metadata);
    });

    test('should update timestamps correctly', async () => {
      const projectId = uuidv4();
      
      // Insert project
      await dataSource.query(`
        INSERT INTO sop_projects (id, name)
        VALUES ($1, $2)
      `, [projectId, 'Timestamp Test']);

      const initialResult = await dataSource.query(
        'SELECT created_at, updated_at FROM sop_projects WHERE id = $1',
        [projectId]
      );

      // Wait a moment then update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await dataSource.query(`
        UPDATE sop_projects 
        SET description = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, ['Updated description', projectId]);

      const updatedResult = await dataSource.query(
        'SELECT created_at, updated_at FROM sop_projects WHERE id = $1',
        [projectId]
      );

      expect(new Date(updatedResult[0].updated_at).getTime())
        .toBeGreaterThan(new Date(initialResult[0].updated_at).getTime());
    });
  });

  describe('SOP Steps Table', () => {
    let projectId: string;

    beforeEach(async () => {
      projectId = uuidv4();
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, status)
        VALUES ($1, $2, $3)
      `, [projectId, 'Parent Project', 'draft']);
    });

    test('should create step with foreign key to project', async () => {
      const stepId = uuidv4();
      const stepData = {
        id: stepId,
        project_id: projectId,
        name: 'Test Step',
        description: 'A test step',
        step_type: 'manual_task',
        configuration: JSON.stringify({ timeout: 300 }),
        position: 1,
        is_active: true
      };

      const insertResult = await dataSource.query(`
        INSERT INTO sop_steps (id, project_id, name, description, step_type, configuration, position, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [stepData.id, stepData.project_id, stepData.name, stepData.description, 
          stepData.step_type, stepData.configuration, stepData.position, stepData.is_active]);

      expect(insertResult).toHaveLength(1);
      expect(insertResult[0].project_id).toBe(projectId);
      expect(insertResult[0].position).toBe(1);
    });

    test('should cascade delete when project is deleted', async () => {
      // Create step
      const stepId = uuidv4();
      await dataSource.query(`
        INSERT INTO sop_steps (id, project_id, name, step_type, position)
        VALUES ($1, $2, $3, $4, $5)
      `, [stepId, projectId, 'Cascade Test Step', 'manual_task', 1]);

      // Verify step exists
      let stepCount = await dataSource.query(
        'SELECT COUNT(*) as count FROM sop_steps WHERE project_id = $1',
        [projectId]
      );
      expect(parseInt(stepCount[0].count)).toBe(1);

      // Delete project
      await dataSource.query('DELETE FROM sop_projects WHERE id = $1', [projectId]);

      // Verify step was cascade deleted
      stepCount = await dataSource.query(
        'SELECT COUNT(*) as count FROM sop_steps WHERE project_id = $1',
        [projectId]
      );
      expect(parseInt(stepCount[0].count)).toBe(0);
    });

    test('should handle hierarchical step relationships', async () => {
      const parentStepId = uuidv4();
      const childStepId = uuidv4();

      // Create parent step
      await dataSource.query(`
        INSERT INTO sop_steps (id, project_id, name, step_type, position)
        VALUES ($1, $2, $3, $4, $5)
      `, [parentStepId, projectId, 'Parent Step', 'sequential_group', 1]);

      // Create child step
      await dataSource.query(`
        INSERT INTO sop_steps (id, project_id, name, step_type, position, parent_step_id)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [childStepId, projectId, 'Child Step', 'manual_task', 1, parentStepId]);

      const hierarchyResult = await dataSource.query(`
        SELECT 
          parent.name as parent_name,
          child.name as child_name
        FROM sop_steps child
        JOIN sop_steps parent ON child.parent_step_id = parent.id
        WHERE child.id = $1
      `, [childStepId]);

      expect(hierarchyResult).toHaveLength(1);
      expect(hierarchyResult[0].parent_name).toBe('Parent Step');
      expect(hierarchyResult[0].child_name).toBe('Child Step');
    });

    test('should enforce step ordering within project', async () => {
      const step1Id = uuidv4();
      const step2Id = uuidv4();

      // Create steps with specific positions
      await dataSource.query(`
        INSERT INTO sop_steps (id, project_id, name, step_type, position)
        VALUES 
          ($1, $2, $3, $4, $5),
          ($6, $7, $8, $9, $10)
      `, [step1Id, projectId, 'Step 1', 'manual_task', 1,
          step2Id, projectId, 'Step 2', 'manual_task', 2]);

      const orderedSteps = await dataSource.query(`
        SELECT name, position 
        FROM sop_steps 
        WHERE project_id = $1 
        ORDER BY position
      `, [projectId]);

      expect(orderedSteps).toHaveLength(2);
      expect(orderedSteps[0].name).toBe('Step 1');
      expect(orderedSteps[0].position).toBe(1);
      expect(orderedSteps[1].name).toBe('Step 2');
      expect(orderedSteps[1].position).toBe(2);
    });
  });

  describe('SOP Templates Table', () => {
    test('should create template with complete data', async () => {
      const templateData = {
        id: uuidv4(),
        name: 'Quality Assurance Template',
        description: 'Standard QA process template',
        category: 'quality_control',
        template_data: JSON.stringify({
          steps: [
            { name: 'Initial Review', type: 'manual_task' },
            { name: 'Approval Gate', type: 'approval' }
          ]
        }),
        is_public: true,
        usage_count: 0
      };

      const insertResult = await dataSource.query(`
        INSERT INTO sop_templates (id, name, description, category, template_data, is_public, usage_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [templateData.id, templateData.name, templateData.description, templateData.category,
          templateData.template_data, templateData.is_public, templateData.usage_count]);

      expect(insertResult).toHaveLength(1);
      expect(insertResult[0].name).toBe('Quality Assurance Template');
      expect(insertResult[0].is_public).toBe(true);
      expect(typeof insertResult[0].template_data).toBe('object');
    });

    test('should filter public vs private templates', async () => {
      const publicTemplateId = uuidv4();
      const privateTemplateId = uuidv4();

      // Create public and private templates
      await dataSource.query(`
        INSERT INTO sop_templates (id, name, category, template_data, is_public)
        VALUES 
          ($1, $2, $3, $4, $5),
          ($6, $7, $8, $9, $10)
      `, [publicTemplateId, 'Public Template', 'general', '{}', true,
          privateTemplateId, 'Private Template', 'general', '{}', false]);

      // Query public templates only
      const publicTemplates = await dataSource.query(
        'SELECT name FROM sop_templates WHERE is_public = true'
      );

      expect(publicTemplates).toHaveLength(1);
      expect(publicTemplates[0].name).toBe('Public Template');
    });

    test('should track usage count correctly', async () => {
      const templateId = uuidv4();
      
      await dataSource.query(`
        INSERT INTO sop_templates (id, name, category, template_data, usage_count)
        VALUES ($1, $2, $3, $4, $5)
      `, [templateId, 'Usage Test Template', 'test', '{}', 0]);

      // Simulate template usage
      await dataSource.query(
        'UPDATE sop_templates SET usage_count = usage_count + 1 WHERE id = $1',
        [templateId]
      );

      const result = await dataSource.query(
        'SELECT usage_count FROM sop_templates WHERE id = $1',
        [templateId]
      );

      expect(result[0].usage_count).toBe(1);
    });

    test('should group templates by category', async () => {
      const categories = ['quality', 'security', 'onboarding'];
      
      // Create templates in different categories
      for (let i = 0; i < categories.length; i++) {
        await dataSource.query(`
          INSERT INTO sop_templates (id, name, category, template_data)
          VALUES ($1, $2, $3, $4)
        `, [uuidv4(), `Template ${i + 1}`, categories[i], '{}']);
      }

      const categoryGroups = await dataSource.query(`
        SELECT category, COUNT(*) as template_count
        FROM sop_templates
        GROUP BY category
        ORDER BY category
      `);

      expect(categoryGroups).toHaveLength(3);
      expect(categoryGroups.map(g => g.category)).toEqual(['onboarding', 'quality', 'security']);
      expect(categoryGroups.every(g => parseInt(g.template_count) === 1)).toBe(true);
    });
  });

  describe('Database Indexes and Performance', () => {
    test('should use indexes for common queries', async () => {
      // Create test data
      const projects = [];
      for (let i = 0; i < 10; i++) {
        projects.push([uuidv4(), `Project ${i}`, i % 3 === 0 ? 'active' : 'draft']);
      }

      for (const project of projects) {
        await dataSource.query(`
          INSERT INTO sop_projects (id, name, status)
          VALUES ($1, $2, $3)
        `, project);
      }

      // Test status index usage
      const explainResult = await dataSource.query(`
        EXPLAIN (ANALYZE, BUFFERS) 
        SELECT * FROM sop_projects WHERE status = 'active'
      `);

      // Verify index scan is used (basic performance check)
      const explainText = explainResult.map(r => r['QUERY PLAN']).join(' ');
      expect(explainText).toMatch(/Index/);
    });

    test('should handle concurrent operations without conflicts', async () => {
      const projectId = uuidv4();
      
      await dataSource.query(`
        INSERT INTO sop_projects (id, name)
        VALUES ($1, $2)
      `, [projectId, 'Concurrent Test Project']);

      // Simulate concurrent updates
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          dataSource.query(`
            UPDATE sop_projects 
            SET version = version + 1 
            WHERE id = $1
          `, [projectId])
        );
      }

      await Promise.all(promises);

      const result = await dataSource.query(
        'SELECT version FROM sop_projects WHERE id = $1',
        [projectId]
      );

      // Version should be incremented by the number of updates
      expect(result[0].version).toBe(6); // 1 initial + 5 updates
    });
  });

  describe('Data Integrity and Constraints', () => {
    test('should maintain referential integrity', async () => {
      const nonExistentProjectId = uuidv4();
      
      // Attempt to create step with non-existent project ID
      await expect(
        dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position)
          VALUES ($1, $2, $3, $4, $5)
        `, [uuidv4(), nonExistentProjectId, 'Invalid Step', 'manual_task', 1])
      ).rejects.toThrow(/foreign key constraint/);
    });

    test('should handle NULL values correctly', async () => {
      const projectId = uuidv4();
      
      // Insert project with minimal required fields
      await dataSource.query(`
        INSERT INTO sop_projects (id, name)
        VALUES ($1, $2)
      `, [projectId, 'Minimal Project']);

      const result = await dataSource.query(
        'SELECT description, metadata FROM sop_projects WHERE id = $1',
        [projectId]
      );

      expect(result[0].description).toBeNull();
      expect(result[0].metadata).toBeNull();
    });

    test('should enforce required field constraints', async () => {
      // Attempt to create project without required name
      await expect(
        dataSource.query(`
          INSERT INTO sop_projects (id, description)
          VALUES ($1, $2)
        `, [uuidv4(), 'Project without name'])
      ).rejects.toThrow();

      // Attempt to create step without required fields
      await expect(
        dataSource.query(`
          INSERT INTO sop_steps (id, project_id)
          VALUES ($1, $2)
        `, [uuidv4(), uuidv4()])
      ).rejects.toThrow();
    });
  });

  describe('Complex Queries and Joins', () => {
    test('should join projects with their steps', async () => {
      const projectId = uuidv4();
      
      // Create project with steps
      await dataSource.query(`
        INSERT INTO sop_projects (id, name, status)
        VALUES ($1, $2, $3)
      `, [projectId, 'Project with Steps', 'active']);

      const stepIds = [uuidv4(), uuidv4()];
      for (let i = 0; i < stepIds.length; i++) {
        await dataSource.query(`
          INSERT INTO sop_steps (id, project_id, name, step_type, position)
          VALUES ($1, $2, $3, $4, $5)
        `, [stepIds[i], projectId, `Step ${i + 1}`, 'manual_task', i + 1]);
      }

      const joinResult = await dataSource.query(`
        SELECT 
          p.name as project_name,
          p.status,
          COUNT(s.id) as step_count
        FROM sop_projects p
        LEFT JOIN sop_steps s ON p.id = s.project_id
        WHERE p.id = $1
        GROUP BY p.id, p.name, p.status
      `, [projectId]);

      expect(joinResult).toHaveLength(1);
      expect(joinResult[0].project_name).toBe('Project with Steps');
      expect(parseInt(joinResult[0].step_count)).toBe(2);
    });

    test('should handle hierarchical step queries', async () => {
      const projectId = uuidv4();
      await dataSource.query(`
        INSERT INTO sop_projects (id, name)
        VALUES ($1, $2)
      `, [projectId, 'Hierarchy Test Project']);

      const parentId = uuidv4();
      const childId1 = uuidv4();
      const childId2 = uuidv4();

      // Create parent and child steps
      await dataSource.query(`
        INSERT INTO sop_steps (id, project_id, name, step_type, position, parent_step_id)
        VALUES 
          ($1, $2, $3, $4, $5, $6),
          ($7, $8, $9, $10, $11, $12),
          ($13, $14, $15, $16, $17, $18)
      `, [parentId, projectId, 'Parent Step', 'group', 1, null,
          childId1, projectId, 'Child Step 1', 'manual_task', 1, parentId,
          childId2, projectId, 'Child Step 2', 'manual_task', 2, parentId]);

      const hierarchyResult = await dataSource.query(`
        WITH RECURSIVE step_hierarchy AS (
          -- Base case: root steps
          SELECT id, name, parent_step_id, 0 as level
          FROM sop_steps
          WHERE parent_step_id IS NULL AND project_id = $1
          
          UNION ALL
          
          -- Recursive case: child steps
          SELECT s.id, s.name, s.parent_step_id, h.level + 1
          FROM sop_steps s
          INNER JOIN step_hierarchy h ON s.parent_step_id = h.id
        )
        SELECT name, level
        FROM step_hierarchy
        ORDER BY level, name
      `, [projectId]);

      expect(hierarchyResult).toHaveLength(3);
      expect(hierarchyResult[0].level).toBe(0); // Parent
      expect(hierarchyResult[1].level).toBe(1); // First child
      expect(hierarchyResult[2].level).toBe(1); // Second child
    });
  });
});
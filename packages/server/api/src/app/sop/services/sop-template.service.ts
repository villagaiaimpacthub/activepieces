/**
 * SOP Template Service
 * Manages SOP templates, library, and template-based creation
 */

import { DataSource, Repository } from 'typeorm';
import { SopProject } from '../entities/sop-project.entity';
import { SopTemplate } from '../entities/sop-template.entity';
import { SopStep } from '../entities/sop-step.entity';
import { logger } from '@activepieces/server-shared';

export interface SopTemplateSearchOptions {
  search?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
  sortBy?: 'popular' | 'recent' | 'rating' | 'title';
  limit?: number;
  offset?: number;
  bookmarkedOnly?: boolean;
  userId?: string;
}

export interface CreateSopFromTemplateRequest {
  templateId: string;
  projectId: string;
  userId: string;
  title?: string; // Override template title
  customizations?: {
    skipSteps?: string[];
    additionalSteps?: {
      title: string;
      description: string;
      position: number;
    }[];
    modifiedSteps?: {
      stepId: string;
      title?: string;
      description?: string;
    }[];
  };
}

export interface SopTemplateUsageStats {
  totalTemplates: number;
  totalUsage: number;
  popularTemplates: Array<{
    templateId: string;
    title: string;
    usageCount: number;
  }>;
  categoryStats: Array<{
    category: string;
    count: number;
  }>;
  recentUsage: Array<{
    templateId: string;
    title: string;
    usedAt: Date;
    userId: string;
  }>;
}

export class SopTemplateService {
  private templateRepository: Repository<SopTemplate>;
  private projectRepository: Repository<SopProject>;
  private stepRepository: Repository<SopStep>;

  constructor(private dataSource: DataSource) {
    this.templateRepository = dataSource.getRepository(SopTemplate);
    this.projectRepository = dataSource.getRepository(SopProject);
    this.stepRepository = dataSource.getRepository(SopStep);
  }

  /**
   * Search and filter templates
   */
  async searchTemplates(options: SopTemplateSearchOptions = {}): Promise<{
    templates: SopTemplate[];
    total: number;
  }> {
    try {
      const queryBuilder = this.templateRepository
        .createQueryBuilder('template')
        .leftJoinAndSelect('template.steps', 'steps')
        .where('template.isActive = :isActive', { isActive: true });

      // Apply search filter
      if (options.search) {
        queryBuilder.andWhere(
          '(LOWER(template.title) LIKE LOWER(:search) OR LOWER(template.description) LIKE LOWER(:search) OR template.tags @> :tags)',
          {
            search: `%${options.search}%`,
            tags: JSON.stringify([options.search])
          }
        );
      }

      // Apply category filter
      if (options.category && options.category !== 'All') {
        queryBuilder.andWhere('template.category = :category', { category: options.category });
      }

      // Apply difficulty filter
      if (options.difficulty) {
        queryBuilder.andWhere('template.difficulty = :difficulty', { difficulty: options.difficulty });
      }

      // Apply tags filter
      if (options.tags && options.tags.length > 0) {
        queryBuilder.andWhere('template.tags ?| array[:...tags]', { tags: options.tags });
      }

      // Apply bookmarked filter (requires userId)
      if (options.bookmarkedOnly && options.userId) {
        queryBuilder
          .leftJoin('template.bookmarks', 'bookmark')
          .andWhere('bookmark.userId = :userId', { userId: options.userId });
      }

      // Apply sorting
      switch (options.sortBy) {
        case 'popular':
          queryBuilder.orderBy('template.usageCount', 'DESC');
          break;
        case 'recent':
          queryBuilder.orderBy('template.updatedAt', 'DESC');
          break;
        case 'rating':
          queryBuilder.orderBy('template.rating', 'DESC');
          break;
        case 'title':
          queryBuilder.orderBy('template.title', 'ASC');
          break;
        default:
          queryBuilder.orderBy('template.usageCount', 'DESC');
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      if (options.limit) {
        queryBuilder.limit(options.limit);
      }
      if (options.offset) {
        queryBuilder.offset(options.offset);
      }

      const templates = await queryBuilder.getMany();

      logger.info(`Found ${templates.length} templates out of ${total} total`, {
        searchOptions: options
      });

      return { templates, total };
    } catch (error) {
      logger.error('Failed to search templates', error);
      throw new Error('Failed to search templates');
    }
  }

  /**
   * Get template by ID with full details
   */
  async getTemplateById(templateId: string): Promise<SopTemplate | null> {
    try {
      const template = await this.templateRepository
        .createQueryBuilder('template')
        .leftJoinAndSelect('template.steps', 'steps')
        .leftJoinAndSelect('template.resources', 'resources')
        .where('template.id = :templateId', { templateId })
        .andWhere('template.isActive = :isActive', { isActive: true })
        .orderBy('steps.position', 'ASC')
        .getOne();

      if (!template) {
        logger.warn(`Template not found: ${templateId}`);
        return null;
      }

      return template;
    } catch (error) {
      logger.error(`Failed to get template ${templateId}`, error);
      throw new Error('Failed to get template');
    }
  }

  /**
   * Create SOP from template
   */
  async createSopFromTemplate(request: CreateSopFromTemplateRequest): Promise<SopProject> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get the template
      const template = await this.getTemplateById(request.templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      // Create the SOP project
      const sopProject = new SopProject();
      sopProject.title = request.title || template.title;
      sopProject.description = template.description;
      sopProject.category = template.category;
      sopProject.priority = 'medium'; // Default priority
      sopProject.projectId = request.projectId;
      sopProject.createdBy = request.userId;
      sopProject.templateId = template.id;
      sopProject.tags = template.tags;

      const savedProject = await queryRunner.manager.save(sopProject);

      // Create steps from template
      const templateSteps = template.steps.sort((a, b) => a.position - b.position);
      const stepsToSkip = new Set(request.customizations?.skipSteps || []);
      const stepModifications = new Map(
        (request.customizations?.modifiedSteps || []).map(mod => [mod.stepId, mod])
      );

      let stepPosition = 1;

      // Process template steps
      for (const templateStep of templateSteps) {
        if (stepsToSkip.has(templateStep.id)) {
          continue;
        }

        const step = new SopStep();
        step.sopProject = savedProject;
        step.position = stepPosition++;
        
        // Apply customizations
        const modification = stepModifications.get(templateStep.id);
        step.title = modification?.title || templateStep.title;
        step.description = modification?.description || templateStep.description;
        step.estimatedDuration = templateStep.estimatedDuration;
        step.isRequired = templateStep.isRequired;
        step.validationRules = templateStep.validationRules;
        step.inputSchema = templateStep.inputSchema;
        step.outputSchema = templateStep.outputSchema;

        await queryRunner.manager.save(step);
      }

      // Add additional custom steps
      if (request.customizations?.additionalSteps) {
        for (const additionalStep of request.customizations.additionalSteps) {
          const step = new SopStep();
          step.sopProject = savedProject;
          step.position = additionalStep.position;
          step.title = additionalStep.title;
          step.description = additionalStep.description;
          step.isRequired = true; // Default for custom steps
          step.estimatedDuration = 30; // Default 30 minutes

          await queryRunner.manager.save(step);
        }

        // Reorder all steps
        const allSteps = await queryRunner.manager.find(SopStep, {
          where: { sopProject: { id: savedProject.id } },
          order: { position: 'ASC' }
        });

        allSteps.sort((a, b) => a.position - b.position);
        for (let i = 0; i < allSteps.length; i++) {
          allSteps[i].position = i + 1;
          await queryRunner.manager.save(allSteps[i]);
        }
      }

      // Update template usage count
      await queryRunner.manager
        .createQueryBuilder()
        .update(SopTemplate)
        .set({ usageCount: () => 'usageCount + 1' })
        .where('id = :templateId', { templateId: template.id })
        .execute();

      // Track usage
      await queryRunner.manager.query(`
        INSERT INTO sop_template_usage (template_id, user_id, project_id, created_at)
        VALUES ($1, $2, $3, NOW())
      `, [template.id, request.userId, request.projectId]);

      await queryRunner.commitTransaction();

      logger.info(`Created SOP from template`, {
        sopId: savedProject.id,
        templateId: template.id,
        userId: request.userId
      });

      return savedProject;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('Failed to create SOP from template', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Toggle bookmark for template
   */
  async toggleTemplateBookmark(templateId: string, userId: string): Promise<boolean> {
    try {
      // Check if bookmark exists
      const existingBookmark = await this.dataSource.query(`
        SELECT id FROM sop_template_bookmarks 
        WHERE template_id = $1 AND user_id = $2
      `, [templateId, userId]);

      if (existingBookmark.length > 0) {
        // Remove bookmark
        await this.dataSource.query(`
          DELETE FROM sop_template_bookmarks 
          WHERE template_id = $1 AND user_id = $2
        `, [templateId, userId]);
        
        logger.info(`Removed bookmark for template ${templateId} by user ${userId}`);
        return false;
      } else {
        // Add bookmark
        await this.dataSource.query(`
          INSERT INTO sop_template_bookmarks (template_id, user_id, created_at)
          VALUES ($1, $2, NOW())
        `, [templateId, userId]);
        
        logger.info(`Added bookmark for template ${templateId} by user ${userId}`);
        return true;
      }
    } catch (error) {
      logger.error('Failed to toggle template bookmark', error);
      throw new Error('Failed to toggle bookmark');
    }
  }

  /**
   * Get template usage statistics
   */
  async getTemplateUsageStats(projectId?: string): Promise<SopTemplateUsageStats> {
    try {
      // Base query conditions
      const projectCondition = projectId ? 'WHERE project_id = $1' : '';
      const projectParam = projectId ? [projectId] : [];

      // Get total templates
      const totalTemplatesResult = await this.dataSource.query(`
        SELECT COUNT(*) as count FROM sop_templates WHERE is_active = true
      `);
      const totalTemplates = parseInt(totalTemplatesResult[0].count);

      // Get total usage
      const totalUsageResult = await this.dataSource.query(`
        SELECT COUNT(*) as count FROM sop_template_usage ${projectCondition}
      `, projectParam);
      const totalUsage = parseInt(totalUsageResult[0].count);

      // Get popular templates
      const popularTemplates = await this.dataSource.query(`
        SELECT t.id as template_id, t.title, t.usage_count
        FROM sop_templates t
        WHERE t.is_active = true
        ORDER BY t.usage_count DESC
        LIMIT 10
      `);

      // Get category stats
      const categoryStats = await this.dataSource.query(`
        SELECT t.category, COUNT(*) as count
        FROM sop_templates t
        WHERE t.is_active = true
        GROUP BY t.category
        ORDER BY count DESC
      `);

      // Get recent usage
      const recentUsage = await this.dataSource.query(`
        SELECT tu.template_id, t.title, tu.created_at as used_at, tu.user_id
        FROM sop_template_usage tu
        JOIN sop_templates t ON tu.template_id = t.id
        ${projectCondition}
        ORDER BY tu.created_at DESC
        LIMIT 20
      `, projectParam);

      return {
        totalTemplates,
        totalUsage,
        popularTemplates: popularTemplates.map((row: any) => ({
          templateId: row.template_id,
          title: row.title,
          usageCount: parseInt(row.usage_count)
        })),
        categoryStats: categoryStats.map((row: any) => ({
          category: row.category,
          count: parseInt(row.count)
        })),
        recentUsage: recentUsage.map((row: any) => ({
          templateId: row.template_id,
          title: row.title,
          usedAt: new Date(row.used_at),
          userId: row.user_id
        }))
      };
    } catch (error) {
      logger.error('Failed to get template usage stats', error);
      throw new Error('Failed to get usage statistics');
    }
  }

  /**
   * Get user's bookmarked templates
   */
  async getUserBookmarkedTemplates(userId: string): Promise<SopTemplate[]> {
    try {
      const templates = await this.templateRepository
        .createQueryBuilder('template')
        .innerJoin('template.bookmarks', 'bookmark', 'bookmark.userId = :userId', { userId })
        .leftJoinAndSelect('template.steps', 'steps')
        .where('template.isActive = :isActive', { isActive: true })
        .orderBy('bookmark.createdAt', 'DESC')
        .getMany();

      return templates;
    } catch (error) {
      logger.error('Failed to get user bookmarked templates', error);
      throw new Error('Failed to get bookmarked templates');
    }
  }

  /**
   * Get featured templates
   */
  async getFeaturedTemplates(limit: number = 6): Promise<SopTemplate[]> {
    try {
      const templates = await this.templateRepository
        .createQueryBuilder('template')
        .leftJoinAndSelect('template.steps', 'steps')
        .where('template.isActive = :isActive', { isActive: true })
        .andWhere('template.isFeatured = :isFeatured', { isFeatured: true })
        .orderBy('template.rating', 'DESC')
        .addOrderBy('template.usageCount', 'DESC')
        .limit(limit)
        .getMany();

      return templates;
    } catch (error) {
      logger.error('Failed to get featured templates', error);
      throw new Error('Failed to get featured templates');
    }
  }

  private static instance: SopTemplateService | null = null;

  static getInstance(dataSource: DataSource): SopTemplateService {
    if (!SopTemplateService.instance) {
      SopTemplateService.instance = new SopTemplateService(dataSource);
    }
    return SopTemplateService.instance;
  }
}
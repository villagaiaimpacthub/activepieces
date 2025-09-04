import { EntityManager, Repository, DataSource } from 'typeorm'
import { SeekPage } from '@activepieces/shared'
import { 
  SopTemplate, 
  CreateSopTemplateRequest, 
  UpdateSopTemplateRequest, 
  ListSopTemplatesRequest,
  ImportSopTemplateRequest
} from '../dto/sop-template.dto'
import { SopTemplate as SopTemplateEntity } from '../../../backend/database/entities/sop-template.entity'
import { SopProject as SopProjectEntity, SopProjectStatus } from '../../../backend/database/entities/sop-project.entity'
import { SopStep as SopStepEntity } from '../../../backend/database/entities/sop-step.entity'
import { SOPActivepiecesIntegration, SOPPieceConfig } from '../../../backend/utils/sop-activepieces-integration'
import { logger } from '../../../backend/utils/logger'

class SopTemplateService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly sopTemplateRepository: Repository<SopTemplateEntity>,
    private readonly sopProjectRepository: Repository<SopProjectEntity>,
    private readonly sopStepRepository: Repository<SopStepEntity>
  ) {}

  async list(params: {
    category?: string
    isPublic?: boolean
    limit?: number
    cursor?: string
    projectId: string
  }): Promise<SeekPage<SopTemplate>> {
    try {
      logger.info('Listing SOP templates', { 
        projectId: params.projectId,
        filters: { category: params.category, isPublic: params.isPublic }
      })

      const queryBuilder = this.sopTemplateRepository
        .createQueryBuilder('template')
        .orderBy('template.createdAt', 'DESC')

      // Apply category filter
      if (params.category) {
        queryBuilder.andWhere('template.category = :category', { 
          category: params.category 
        })
      }

      // Apply public filter
      if (params.isPublic !== undefined) {
        queryBuilder.andWhere('template.isPublic = :isPublic', { 
          isPublic: params.isPublic 
        })
      }

      // Apply cursor pagination
      const limit = Math.min(params.limit || 10, 100)
      if (params.cursor) {
        const cursorDate = new Date(params.cursor)
        queryBuilder.andWhere('template.createdAt < :cursor', { cursor: cursorDate })
      }

      queryBuilder.limit(limit + 1)

      const results = await queryBuilder.getMany()
      
      const hasMore = results.length > limit
      const data = hasMore ? results.slice(0, -1) : results
      
      const mappedData = data.map(entity => this.mapEntityToDto(entity))
      
      return {
        data: mappedData,
        next: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
        previous: null
      }
    } catch (error) {
      logger.error('Failed to list SOP templates', { error, params })
      throw new Error(`Failed to retrieve SOP templates: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async create(params: {
    projectId: string
    request: CreateSopTemplateRequest
  }): Promise<SopTemplate> {
    try {
      logger.info('Creating SOP template', { 
        projectId: params.projectId,
        name: params.request.name 
      })

      const templateEntity = this.sopTemplateRepository.create({
        name: params.request.name,
        description: params.request.description,
        category: params.request.category,
        templateData: params.request.templateData,
        isPublic: params.request.isPublic || false,
        usageCount: 0
      })

      const savedTemplate = await this.sopTemplateRepository.save(templateEntity)

      logger.info('SOP template created successfully', { 
        id: savedTemplate.id,
        name: savedTemplate.name 
      })

      return this.mapEntityToDto(savedTemplate)
    } catch (error) {
      logger.error('Failed to create SOP template', { error, params })
      throw new Error(`Failed to create SOP template: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getOneOrThrow(params: {
    id: string
    projectId: string
  }): Promise<SopTemplate> {
    try {
      logger.info('Retrieving SOP template', { id: params.id })

      const sopTemplate = await this.sopTemplateRepository.findOne({
        where: { id: params.id }
      })

      if (!sopTemplate) {
        throw new Error(`SOP template not found: ${params.id}`)
      }

      return this.mapEntityToDto(sopTemplate)
    } catch (error) {
      logger.error('Failed to retrieve SOP template', { error, params })
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error(`Failed to retrieve SOP template: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async update(params: {
    id: string
    projectId: string
    request: UpdateSopTemplateRequest
  }): Promise<SopTemplate> {
    try {
      logger.info('Updating SOP template', { id: params.id })

      const sopTemplate = await this.sopTemplateRepository.findOne({
        where: { id: params.id }
      })

      if (!sopTemplate) {
        throw new Error(`SOP template not found: ${params.id}`)
      }

      // Update template properties
      if (params.request.name) sopTemplate.name = params.request.name
      if (params.request.description !== undefined) sopTemplate.description = params.request.description
      if (params.request.category) sopTemplate.category = params.request.category
      if (params.request.templateData) sopTemplate.templateData = params.request.templateData
      if (params.request.isPublic !== undefined) sopTemplate.isPublic = params.request.isPublic

      const savedTemplate = await this.sopTemplateRepository.save(sopTemplate)

      logger.info('SOP template updated successfully', { 
        id: savedTemplate.id,
        changes: Object.keys(params.request) 
      })

      return this.mapEntityToDto(savedTemplate)
    } catch (error) {
      logger.error('Failed to update SOP template', { error, params })
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error(`Failed to update SOP template: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async delete(params: {
    id: string
    projectId: string
  }): Promise<void> {
    try {
      logger.info('Deleting SOP template', { id: params.id })

      const sopTemplate = await this.sopTemplateRepository.findOne({
        where: { id: params.id }
      })

      if (!sopTemplate) {
        throw new Error(`SOP template not found: ${params.id}`)
      }

      await this.sopTemplateRepository.remove(sopTemplate)

      logger.info('SOP template deleted successfully', { id: params.id })
    } catch (error) {
      logger.error('Failed to delete SOP template', { error, params })
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error(`Failed to delete SOP template: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async importToProject(params: {
    templateId: string
    projectId: string
    request: ImportSopTemplateRequest
  }): Promise<{ id: string; name: string; templateId: string; projectId: string }> {
    try {
      logger.info('Importing SOP template to project', { 
        templateId: params.templateId,
        projectId: params.projectId 
      })

      return await this.dataSource.transaction(async (manager) => {
        // Get the template
        const template = await manager.findOne(SopTemplateEntity, {
          where: { id: params.templateId }
        })

        if (!template) {
          throw new Error(`SOP template not found: ${params.templateId}`)
        }

        // Create new SOP project from template
        const projectName = params.request.name || `${template.name} - Imported`
        const sopProject = manager.create(SopProjectEntity, {
          name: projectName,
          description: params.request.description || template.description,
          status: SopProjectStatus.DRAFT,
          metadata: {
            ...template.templateData.metadata,
            importedFrom: params.templateId,
            importedAt: new Date().toISOString()
          },
          version: 1
        })

        const savedProject = await manager.save(sopProject)

        // Create steps from template
        if (template.templateData.steps && Array.isArray(template.templateData.steps)) {
          const stepEntities = template.templateData.steps.map((stepData: any, index: number) => {
            return manager.create(SopStepEntity, {
              name: stepData.name,
              description: stepData.description,
              stepType: stepData.type || stepData.stepType,
              configuration: stepData.configuration || {},
              position: stepData.order || index,
              projectId: savedProject.id,
              isActive: true
            })
          })

          await manager.save(stepEntities)
        }

        // Update template usage count
        template.usageCount += 1
        await manager.save(template)

        // Convert to Activepieces piece if requested
        if (params.request.generateActivepiecesPiece) {
          const pieceConfig: SOPPieceConfig = {
            name: projectName,
            version: '1.0.0',
            description: template.description || '',
            process: {
              id: savedProject.id,
              name: projectName,
              description: template.description || '',
              version: 1,
              status: 'draft',
              steps: template.templateData.steps || [],
              metadata: template.templateData.metadata || {}
            }
          }

          const pieceResult = SOPActivepiecesIntegration.convertSOPToActivepiecesPiece(pieceConfig)
          
          if (pieceResult.success) {
            // Store piece generation result in project metadata
            savedProject.metadata = {
              ...savedProject.metadata,
              activepiecesPiece: {
                generated: true,
                definition: pieceResult.piece_definition,
                files: pieceResult.generated_files?.map(f => ({
                  filename: f.filename,
                  path: f.path,
                  type: f.type
                }))
              }
            }
            await manager.save(savedProject)
          }
        }

        logger.info('SOP template imported successfully', { 
          templateId: params.templateId,
          projectId: savedProject.id,
          projectName: savedProject.name
        })

        return {
          id: savedProject.id,
          name: savedProject.name,
          templateId: params.templateId,
          projectId: params.projectId
        }
      })
    } catch (error) {
      logger.error('Failed to import SOP template', { error, params })
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error(`Failed to import SOP template: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getStats(params: {
    id: string
    projectId: string
  }): Promise<{
    usageCount: number
    lastUsed?: string
    popularSteps: string[]
  }> {
    try {
      logger.info('Getting SOP template stats', { id: params.id })

      const template = await this.sopTemplateRepository.findOne({
        where: { id: params.id }
      })

      if (!template) {
        throw new Error(`SOP template not found: ${params.id}`)
      }

      // Get projects created from this template
      const projectsFromTemplate = await this.sopProjectRepository
        .createQueryBuilder('project')
        .where("project.metadata->>'importedFrom' = :templateId", { 
          templateId: params.id 
        })
        .orderBy('project.createdAt', 'DESC')
        .getMany()

      const lastUsed = projectsFromTemplate.length > 0 
        ? projectsFromTemplate[0].createdAt.toISOString()
        : undefined

      // Analyze popular steps from template data
      const steps = template.templateData.steps || []
      const stepTypes = steps.map((step: any) => step.type || step.stepType).filter(Boolean)
      const stepTypeCounts = stepTypes.reduce((acc: Record<string, number>, type: string) => {
        acc[type] = (acc[type] || 0) + 1
        return acc
      }, {})

      const popularSteps = Object.entries(stepTypeCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([type]) => type)

      return {
        usageCount: template.usageCount,
        lastUsed,
        popularSteps
      }
    } catch (error) {
      logger.error('Failed to get SOP template stats', { error, params })
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error(`Failed to get SOP template stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private mapEntityToDto(entity: SopTemplateEntity): SopTemplate {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      category: entity.category,
      templateData: entity.templateData,
      isPublic: entity.isPublic,
      usageCount: entity.usageCount,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString()
    }
  }
}

// Create service instance factory
let serviceInstance: SopTemplateService | null = null

export const sopTemplateService = {
  getInstance(dataSource: DataSource): SopTemplateService {
    if (!serviceInstance) {
      serviceInstance = new SopTemplateService(
        dataSource,
        dataSource.getRepository(SopTemplateEntity),
        dataSource.getRepository(SopProjectEntity),
        dataSource.getRepository(SopStepEntity)
      )
    }
    return serviceInstance
  },

  // Legacy exports for backward compatibility
  async list(params: {
    category?: string
    isPublic?: boolean
    limit?: number
    cursor?: string
    projectId: string
  }): Promise<SeekPage<SopTemplate>> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.list(params)
  },

  async create(params: {
    projectId: string
    request: CreateSopTemplateRequest
  }): Promise<SopTemplate> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.create(params)
  },

  async getOneOrThrow(params: {
    id: string
    projectId: string
  }): Promise<SopTemplate> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.getOneOrThrow(params)
  },

  async update(params: {
    id: string
    projectId: string
    request: UpdateSopTemplateRequest
  }): Promise<SopTemplate> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.update(params)
  },

  async delete(params: {
    id: string
    projectId: string
  }): Promise<void> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.delete(params)
  },

  async importToProject(params: {
    templateId: string
    projectId: string
    request: ImportSopTemplateRequest
  }): Promise<{ id: string; name: string; templateId: string; projectId: string }> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.importToProject(params)
  },

  async getStats(params: {
    id: string
    projectId: string
  }): Promise<{
    usageCount: number
    lastUsed?: string
    popularSteps: string[]
  }> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.getStats(params)
  },
}
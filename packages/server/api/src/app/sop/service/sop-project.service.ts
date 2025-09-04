import { EntityManager, Repository, DataSource } from 'typeorm'
import { SeekPage, Cursor } from '@activepieces/shared'
import { 
  SopProject, 
  CreateSopProjectRequest, 
  UpdateSopProjectRequest, 
  ListSopProjectsRequest 
} from '../dto/sop-project.dto'
import { SopProject as SopProjectEntity, SopProjectStatus } from '../../../backend/database/entities/sop-project.entity'
import { SopStep as SopStepEntity } from '../../../backend/database/entities/sop-step.entity'
import { SopExecution as SopExecutionEntity, SopExecutionStatus } from '../../../backend/database/entities/sop-execution.entity'
import { SOPWorkflowHelpers } from '../../../backend/utils/sop-workflow-helpers'
import { SOPActivepiecesIntegration } from '../../../backend/utils/sop-activepieces-integration'
import { logger } from '../../../backend/utils/logger'

class SopProjectService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly sopProjectRepository: Repository<SopProjectEntity>,
    private readonly sopStepRepository: Repository<SopStepEntity>,
    private readonly sopExecutionRepository: Repository<SopExecutionEntity>
  ) {}

  async list(params: {
    projectId: string
    status?: string[]
    limit?: number
    cursor?: string
  }): Promise<SeekPage<SopProject>> {
    try {
      logger.info('Listing SOP projects', { 
        projectId: params.projectId,
        filters: { status: params.status }
      })

      const queryBuilder = this.sopProjectRepository
        .createQueryBuilder('sop')
        .leftJoinAndSelect('sop.steps', 'steps')
        .orderBy('sop.createdAt', 'DESC')

      // Apply status filter
      if (params.status && params.status.length > 0) {
        queryBuilder.andWhere('sop.status IN (:...statuses)', { 
          statuses: params.status 
        })
      }

      // Apply cursor pagination
      const limit = Math.min(params.limit || 10, 100)
      if (params.cursor) {
        const cursorDate = new Date(params.cursor)
        queryBuilder.andWhere('sop.createdAt < :cursor', { cursor: cursorDate })
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
      logger.error('Failed to list SOP projects', { error, params })
      throw new Error(`Failed to retrieve SOP projects: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async create(params: {
    projectId: string
    request: CreateSopProjectRequest
  }): Promise<SopProject> {
    try {
      logger.info('Creating SOP project', { 
        projectId: params.projectId,
        name: params.request.name 
      })

      return await this.dataSource.transaction(async (manager) => {
        // Create main SOP project
        const sopProject = manager.create(SopProjectEntity, {
          name: params.request.name,
          description: params.request.description,
          status: params.request.status || SopProjectStatus.DRAFT,
          metadata: params.request.metadata || {},
          version: 1
        })

        const savedProject = await manager.save(sopProject)

        // Create steps if provided
        if (params.request.steps && params.request.steps.length > 0) {
          const stepEntities = params.request.steps.map(stepData => {
            return manager.create(SopStepEntity, {
              name: stepData.name,
              description: stepData.description,
              stepType: stepData.type,
              configuration: stepData.configuration || {},
              position: stepData.order,
              projectId: savedProject.id,
              isActive: true
            })
          })

          await manager.save(stepEntities)
          savedProject.steps = stepEntities
        }

        logger.info('SOP project created successfully', { 
          id: savedProject.id,
          name: savedProject.name 
        })

        return this.mapEntityToDto(savedProject)
      })
    } catch (error) {
      logger.error('Failed to create SOP project', { error, params })
      throw new Error(`Failed to create SOP project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getOneOrThrow(params: {
    id: string
    projectId: string
  }): Promise<SopProject> {
    try {
      logger.info('Retrieving SOP project', { id: params.id })

      const sopProject = await this.sopProjectRepository.findOne({
        where: { id: params.id },
        relations: ['steps']
      })

      if (!sopProject) {
        throw new Error(`SOP project not found: ${params.id}`)
      }

      return this.mapEntityToDto(sopProject)
    } catch (error) {
      logger.error('Failed to retrieve SOP project', { error, params })
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error(`Failed to retrieve SOP project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async update(params: {
    id: string
    projectId: string
    request: UpdateSopProjectRequest
  }): Promise<SopProject> {
    try {
      logger.info('Updating SOP project', { id: params.id })

      return await this.dataSource.transaction(async (manager) => {
        const sopProject = await manager.findOne(SopProjectEntity, {
          where: { id: params.id },
          relations: ['steps']
        })

        if (!sopProject) {
          throw new Error(`SOP project not found: ${params.id}`)
        }

        // Update project properties
        if (params.request.name) sopProject.name = params.request.name
        if (params.request.description !== undefined) sopProject.description = params.request.description
        if (params.request.status) sopProject.status = params.request.status as SopProjectStatus
        if (params.request.metadata) {
          sopProject.metadata = { ...sopProject.metadata, ...params.request.metadata }
        }
        if (params.request.version) {
          sopProject.version = params.request.version
        }

        const savedProject = await manager.save(sopProject)

        logger.info('SOP project updated successfully', { 
          id: savedProject.id,
          changes: Object.keys(params.request) 
        })

        return this.mapEntityToDto(savedProject)
      })
    } catch (error) {
      logger.error('Failed to update SOP project', { error, params })
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error(`Failed to update SOP project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async delete(params: {
    id: string
    projectId: string
  }): Promise<void> {
    try {
      logger.info('Deleting SOP project', { id: params.id })

      return await this.dataSource.transaction(async (manager) => {
        const sopProject = await manager.findOne(SopProjectEntity, {
          where: { id: params.id }
        })

        if (!sopProject) {
          throw new Error(`SOP project not found: ${params.id}`)
        }

        // Cancel any running executions
        await manager.update(SopExecutionEntity, 
          { projectId: params.id, status: SopExecutionStatus.RUNNING },
          { status: SopExecutionStatus.CANCELLED }
        )

        // Delete the project (cascades to steps)
        await manager.remove(sopProject)

        logger.info('SOP project deleted successfully', { id: params.id })
      })
    } catch (error) {
      logger.error('Failed to delete SOP project', { error, params })
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error(`Failed to delete SOP project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async execute(params: {
    id: string
    projectId: string
    userId: string
    inputData?: Record<string, any>
  }): Promise<{ id: string; status: string; message: string }> {
    try {
      logger.info('Starting SOP project execution', { 
        sopProjectId: params.id,
        userId: params.userId 
      })

      return await this.dataSource.transaction(async (manager) => {
        // Get SOP project with steps
        const sopProject = await manager.findOne(SopProjectEntity, {
          where: { id: params.id },
          relations: ['steps']
        })

        if (!sopProject) {
          throw new Error(`SOP project not found: ${params.id}`)
        }

        if (sopProject.status !== SopProjectStatus.ACTIVE) {
          throw new Error('SOP project must be active to execute')
        }

        // Create execution record
        const execution = manager.create(SopExecutionEntity, {
          projectId: params.id,
          userId: params.userId,
          status: SopExecutionStatus.PENDING,
          inputData: params.inputData || {},
          startedAt: new Date()
        })

        const savedExecution = await manager.save(execution)

        // Initialize workflow using SOP workflow helpers
        const workflowState = SOPWorkflowHelpers.initializeWorkflow(
          params.id,
          params.userId,
          params.inputData
        )

        // Update execution status
        savedExecution.status = SopExecutionStatus.RUNNING
        await manager.save(savedExecution)

        logger.info('SOP execution started', { 
          executionId: savedExecution.id,
          workflowExecutionId: workflowState.execution_id 
        })

        return {
          id: savedExecution.id,
          status: 'running',
          message: 'SOP execution started successfully'
        }
      })
    } catch (error) {
      logger.error('Failed to execute SOP project', { error, params })
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error(`Failed to execute SOP project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private mapEntityToDto(entity: SopProjectEntity): SopProject {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      status: entity.status,
      version: entity.version,
      metadata: entity.metadata,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      steps: entity.steps?.map(step => ({
        id: step.id,
        name: step.name,
        order: step.position,
        type: step.stepType
      }))
    }
  }
}

// Create service instance factory
let serviceInstance: SopProjectService | null = null

export const sopProjectService = {
  getInstance(dataSource: DataSource): SopProjectService {
    if (!serviceInstance) {
      serviceInstance = new SopProjectService(
        dataSource,
        dataSource.getRepository(SopProjectEntity),
        dataSource.getRepository(SopStepEntity),
        dataSource.getRepository(SopExecutionEntity)
      )
    }
    return serviceInstance
  },

  // Legacy exports for backward compatibility
  async list(params: {
    projectId: string
    status?: string[]
    limit?: number
    cursor?: string
  }): Promise<SeekPage<SopProject>> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.list(params)
  },

  async create(params: {
    projectId: string
    request: CreateSopProjectRequest
  }): Promise<SopProject> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.create(params)
  },

  async getOneOrThrow(params: {
    id: string
    projectId: string
  }): Promise<SopProject> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.getOneOrThrow(params)
  },

  async update(params: {
    id: string
    projectId: string
    request: UpdateSopProjectRequest
  }): Promise<SopProject> {
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

  async execute(params: {
    id: string
    projectId: string
    userId: string
    inputData?: Record<string, any>
  }): Promise<{ id: string; status: string; message: string }> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.execute(params)
  },
}
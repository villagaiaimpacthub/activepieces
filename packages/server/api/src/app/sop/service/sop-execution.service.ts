import { EntityManager, Repository, DataSource } from 'typeorm'
import { SeekPage } from '@activepieces/shared'
import { 
  SopExecution, 
  CreateSopExecutionRequest, 
  UpdateSopExecutionRequest, 
  ListSopExecutionsRequest 
} from '../dto/sop-execution.dto'
import { SopExecution as SopExecutionEntity, SopExecutionStatus } from '../../../backend/database/entities/sop-execution.entity'
import { SopProject as SopProjectEntity, SopProjectStatus } from '../../../backend/database/entities/sop-project.entity'
import { SopAuditLog as SopAuditLogEntity, SopAuditAction, SopAuditEntityType } from '../../../backend/database/entities/sop-audit-log.entity'
import { SOPWorkflowHelpers, WorkflowState } from '../../../backend/utils/sop-workflow-helpers'
import { SOPProcessUtilities } from '../../../backend/utils/sop-process-utilities'
import { logger } from '../../../backend/utils/logger'

class SopExecutionService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly sopExecutionRepository: Repository<SopExecutionEntity>,
    private readonly sopProjectRepository: Repository<SopProjectEntity>,
    private readonly sopAuditLogRepository: Repository<SopAuditLogEntity>
  ) {}

  async list(params: {
    projectId: string
    sopProjectId?: string
    status?: string[]
    userId?: string
    limit?: number
    cursor?: string
  }): Promise<SeekPage<SopExecution>> {
    try {
      logger.info('Listing SOP executions', { 
        projectId: params.projectId,
        filters: { 
          sopProjectId: params.sopProjectId,
          status: params.status, 
          userId: params.userId 
        }
      })

      const queryBuilder = this.sopExecutionRepository
        .createQueryBuilder('execution')
        .leftJoinAndSelect('execution.project', 'project')
        .leftJoinAndSelect('execution.step', 'step')
        .orderBy('execution.createdAt', 'DESC')

      // Apply SOP project filter
      if (params.sopProjectId) {
        queryBuilder.andWhere('execution.projectId = :sopProjectId', { 
          sopProjectId: params.sopProjectId 
        })
      }

      // Apply status filter
      if (params.status && params.status.length > 0) {
        queryBuilder.andWhere('execution.status IN (:...statuses)', { 
          statuses: params.status 
        })
      }

      // Apply user filter
      if (params.userId) {
        queryBuilder.andWhere('execution.userId = :userId', { 
          userId: params.userId 
        })
      }

      // Apply cursor pagination
      const limit = Math.min(params.limit || 10, 100)
      if (params.cursor) {
        const cursorDate = new Date(params.cursor)
        queryBuilder.andWhere('execution.createdAt < :cursor', { cursor: cursorDate })
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
      logger.error('Failed to list SOP executions', { error, params })
      throw new Error(`Failed to retrieve SOP executions: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async create(params: {
    projectId: string
    userId: string
    request: CreateSopExecutionRequest
  }): Promise<SopExecution> {
    try {
      logger.info('Creating SOP execution', { 
        projectId: params.projectId,
        sopProjectId: params.request.sopProjectId,
        userId: params.userId
      })

      return await this.dataSource.transaction(async (manager) => {
        // Verify SOP project exists and is active
        const sopProject = await manager.findOne(SopProjectEntity, {
          where: { id: params.request.sopProjectId },
          relations: ['steps']
        })

        if (!sopProject) {
          throw new Error(`SOP project not found: ${params.request.sopProjectId}`)
        }

        if (sopProject.status !== SopProjectStatus.ACTIVE) {
          throw new Error('SOP project must be active to execute')
        }

        // Create execution record
        const execution = manager.create(SopExecutionEntity, {
          projectId: params.request.sopProjectId,
          userId: params.userId,
          status: SopExecutionStatus.PENDING,
          inputData: params.request.inputData || {},
          metadata: params.request.metadata || {},
          startedAt: new Date()
        })

        const savedExecution = await manager.save(execution)

        // Initialize workflow
        const workflowState = SOPWorkflowHelpers.initializeWorkflow(
          params.request.sopProjectId,
          params.userId,
          params.request.inputData
        )

        // Update execution with workflow ID
        savedExecution.metadata = {
          ...savedExecution.metadata,
          workflowExecutionId: workflowState.execution_id
        }
        savedExecution.status = SopExecutionStatus.RUNNING
        await manager.save(savedExecution)

        // Create audit log entry
        const auditLog = manager.create(SopAuditLogEntity, {
          entityType: SopAuditEntityType.EXECUTION,
          entityId: savedExecution.id,
          action: SopAuditAction.EXECUTE,
          userId: params.userId,
          projectId: params.request.sopProjectId,
          executionId: savedExecution.id,
          description: 'SOP execution started',
          metadata: {
            sopProjectId: params.request.sopProjectId,
            workflowExecutionId: workflowState.execution_id,
            inputData: params.request.inputData
          }
        })
        await manager.save(auditLog)

        logger.info('SOP execution created successfully', { 
          id: savedExecution.id,
          sopProjectId: params.request.sopProjectId,
          workflowExecutionId: workflowState.execution_id
        })

        return this.mapEntityToDto(savedExecution)
      })
    } catch (error) {
      logger.error('Failed to create SOP execution', { error, params })
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error(`Failed to create SOP execution: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getOneOrThrow(params: {
    id: string
    projectId: string
  }): Promise<SopExecution> {
    try {
      logger.info('Retrieving SOP execution', { id: params.id })

      const execution = await this.sopExecutionRepository.findOne({
        where: { id: params.id },
        relations: ['project', 'step']
      })

      if (!execution) {
        throw new Error(`SOP execution not found: ${params.id}`)
      }

      return this.mapEntityToDto(execution)
    } catch (error) {
      logger.error('Failed to retrieve SOP execution', { error, params })
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error(`Failed to retrieve SOP execution: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async update(params: {
    id: string
    projectId: string
    request: UpdateSopExecutionRequest
  }): Promise<SopExecution> {
    try {
      logger.info('Updating SOP execution', { id: params.id })

      return await this.dataSource.transaction(async (manager) => {
        const execution = await manager.findOne(SopExecutionEntity, {
          where: { id: params.id },
          relations: ['project', 'step']
        })

        if (!execution) {
          throw new Error(`SOP execution not found: ${params.id}`)
        }

        // Update execution properties
        if (params.request.status) {
          execution.status = params.request.status as SopExecutionStatus
          
          if (params.request.status === 'completed') {
            execution.completedAt = new Date()
          }
        }
        
        if (params.request.outputData) {
          execution.outputData = params.request.outputData
        }
        
        if (params.request.errorMessage !== undefined) {
          execution.errorMessage = params.request.errorMessage
        }
        
        if (params.request.metadata) {
          execution.metadata = { ...execution.metadata, ...params.request.metadata }
        }

        const savedExecution = await manager.save(execution)

        // Create audit log entry
        const auditLog = manager.create(SopAuditLogEntity, {
          entityType: SopAuditEntityType.EXECUTION,
          entityId: savedExecution.id,
          action: SopAuditAction.UPDATE,
          userId: execution.userId || 'system',
          projectId: execution.projectId,
          executionId: savedExecution.id,
          description: 'SOP execution updated',
          metadata: {
            changes: Object.keys(params.request),
            newStatus: params.request.status
          }
        })
        await manager.save(auditLog)

        logger.info('SOP execution updated successfully', { 
          id: savedExecution.id,
          changes: Object.keys(params.request)
        })

        return this.mapEntityToDto(savedExecution)
      })
    } catch (error) {
      logger.error('Failed to update SOP execution', { error, params })
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error(`Failed to update SOP execution: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async cancel(params: {
    id: string
    projectId: string
    userId: string
  }): Promise<SopExecution> {
    try {
      logger.info('Cancelling SOP execution', { id: params.id, userId: params.userId })

      return await this.dataSource.transaction(async (manager) => {
        const execution = await manager.findOne(SopExecutionEntity, {
          where: { id: params.id },
          relations: ['project']
        })

        if (!execution) {
          throw new Error(`SOP execution not found: ${params.id}`)
        }

        if (![SopExecutionStatus.PENDING, SopExecutionStatus.RUNNING].includes(execution.status)) {
          throw new Error('Can only cancel pending or running executions')
        }

        // Update execution status
        execution.status = SopExecutionStatus.CANCELLED
        execution.completedAt = new Date()
        execution.errorMessage = `Cancelled by user ${params.userId}`

        const savedExecution = await manager.save(execution)

        // Cancel workflow if it exists
        const workflowExecutionId = execution.metadata?.workflowExecutionId
        if (workflowExecutionId) {
          SOPWorkflowHelpers.cancelWorkflow(
            workflowExecutionId,
            'User requested cancellation',
            params.userId
          )
        }

        // Create audit log entry
        const auditLog = manager.create(SopAuditLogEntity, {
          entityType: SopAuditEntityType.EXECUTION,
          entityId: savedExecution.id,
          action: SopAuditAction.CANCEL,
          userId: params.userId,
          projectId: savedExecution.projectId,
          executionId: savedExecution.id,
          description: 'SOP execution cancelled',
          metadata: {
            reason: 'User requested cancellation',
            previousStatus: SopExecutionStatus.RUNNING
          }
        })
        await manager.save(auditLog)

        logger.info('SOP execution cancelled successfully', { 
          id: savedExecution.id,
          userId: params.userId
        })

        return this.mapEntityToDto(savedExecution)
      })
    } catch (error) {
      logger.error('Failed to cancel SOP execution', { error, params })
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error(`Failed to cancel SOP execution: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async retry(params: {
    id: string
    projectId: string
    userId: string
  }): Promise<SopExecution> {
    try {
      logger.info('Retrying SOP execution', { id: params.id, userId: params.userId })

      return await this.dataSource.transaction(async (manager) => {
        const originalExecution = await manager.findOne(SopExecutionEntity, {
          where: { id: params.id },
          relations: ['project']
        })

        if (!originalExecution) {
          throw new Error(`SOP execution not found: ${params.id}`)
        }

        if (![SopExecutionStatus.FAILED, SopExecutionStatus.CANCELLED].includes(originalExecution.status)) {
          throw new Error('Can only retry failed or cancelled executions')
        }

        // Create new execution based on the original
        const retryExecution = manager.create(SopExecutionEntity, {
          projectId: originalExecution.projectId,
          userId: params.userId,
          status: SopExecutionStatus.PENDING,
          inputData: originalExecution.inputData,
          metadata: {
            ...originalExecution.metadata,
            isRetry: true,
            originalExecutionId: params.id,
            retryAttempt: (originalExecution.metadata?.retryAttempt || 0) + 1
          },
          startedAt: new Date()
        })

        const savedExecution = await manager.save(retryExecution)

        // Initialize new workflow
        const workflowState = SOPWorkflowHelpers.initializeWorkflow(
          originalExecution.projectId,
          params.userId,
          originalExecution.inputData
        )

        // Update execution with workflow ID
        savedExecution.metadata = {
          ...savedExecution.metadata,
          workflowExecutionId: workflowState.execution_id
        }
        savedExecution.status = SopExecutionStatus.RUNNING
        await manager.save(savedExecution)

        // Create audit log entries
        const auditLog = manager.create(SopAuditLogEntity, {
          entityType: SopAuditEntityType.EXECUTION,
          entityId: savedExecution.id,
          action: SopAuditAction.EXECUTE,
          userId: params.userId,
          projectId: savedExecution.projectId,
          executionId: savedExecution.id,
          description: 'SOP execution retried',
          metadata: {
            originalExecutionId: params.id,
            retryAttempt: savedExecution.metadata.retryAttempt,
            workflowExecutionId: workflowState.execution_id
          }
        })
        await manager.save(auditLog)

        logger.info('SOP execution retry created successfully', { 
          originalId: params.id,
          newId: savedExecution.id,
          retryAttempt: savedExecution.metadata.retryAttempt
        })

        return this.mapEntityToDto(savedExecution)
      })
    } catch (error) {
      logger.error('Failed to retry SOP execution', { error, params })
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error(`Failed to retry SOP execution: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getLogs(params: {
    id: string
    projectId: string
    limit?: number
    offset?: number
  }): Promise<{
    logs: Array<{
      timestamp: string
      level: 'debug' | 'info' | 'warn' | 'error'
      message: string
      stepId?: string
      metadata?: Record<string, any>
    }>
    total: number
  }> {
    try {
      logger.info('Getting SOP execution logs', { id: params.id })

      const execution = await this.sopExecutionRepository.findOne({
        where: { id: params.id }
      })

      if (!execution) {
        throw new Error(`SOP execution not found: ${params.id}`)
      }

      // Get audit logs for this execution
      const limit = Math.min(params.limit || 50, 1000)
      const offset = params.offset || 0

      const [auditLogs, total] = await this.sopAuditLogRepository.findAndCount({
        where: { executionId: params.id },
        order: { createdAt: 'DESC' },
        take: limit,
        skip: offset
      })

      // Convert audit logs to execution logs format
      const logs = auditLogs.map(auditLog => ({
        timestamp: auditLog.createdAt.toISOString(),
        level: this.getLogLevelFromAction(auditLog.action),
        message: this.formatLogMessage(auditLog.action, auditLog.details),
        stepId: auditLog.details?.stepId,
        metadata: auditLog.details
      }))

      // Get workflow logs if available
      const workflowExecutionId = execution.metadata?.workflowExecutionId
      if (workflowExecutionId) {
        const workflowState = SOPWorkflowHelpers.getWorkflowState(workflowExecutionId)
        if (workflowState?.metadata) {
          // Add workflow-specific logs
          const workflowLogs = this.extractWorkflowLogs(workflowState)
          logs.push(...workflowLogs)
        }
      }

      // Sort all logs by timestamp
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      return {
        logs: logs.slice(0, limit),
        total: total + (workflowExecutionId ? logs.length - total : 0)
      }
    } catch (error) {
      logger.error('Failed to get SOP execution logs', { error, params })
      if (error instanceof Error && error.message.includes('not found')) {
        throw error
      }
      throw new Error(`Failed to get SOP execution logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getStats(params: {
    projectId: string
    sopProjectId?: string
    timeRange?: '1h' | '24h' | '7d' | '30d'
  }): Promise<{
    totalExecutions: number
    successfulExecutions: number
    failedExecutions: number
    averageExecutionTime: number
    executionsByStatus: Record<string, number>
    executionsByHour: Array<{ hour: string; count: number }>
  }> {
    try {
      logger.info('Getting SOP execution stats', { 
        projectId: params.projectId,
        sopProjectId: params.sopProjectId,
        timeRange: params.timeRange
      })

      // Calculate time range
      const timeRange = params.timeRange || '24h'
      const hoursBack = {
        '1h': 1,
        '24h': 24,
        '7d': 24 * 7,
        '30d': 24 * 30
      }[timeRange]

      const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000)

      const queryBuilder = this.sopExecutionRepository
        .createQueryBuilder('execution')
        .where('execution.createdAt >= :startTime', { startTime })

      if (params.sopProjectId) {
        queryBuilder.andWhere('execution.projectId = :sopProjectId', { 
          sopProjectId: params.sopProjectId 
        })
      }

      const executions = await queryBuilder.getMany()

      // Calculate basic stats
      const totalExecutions = executions.length
      const successfulExecutions = executions.filter(e => e.status === SopExecutionStatus.COMPLETED).length
      const failedExecutions = executions.filter(e => e.status === SopExecutionStatus.FAILED).length

      // Calculate average execution time
      const completedExecutions = executions.filter(e => 
        e.status === SopExecutionStatus.COMPLETED && e.startedAt && e.completedAt
      )
      
      const totalExecutionTime = completedExecutions.reduce((sum, execution) => {
        const duration = execution.completedAt!.getTime() - execution.startedAt!.getTime()
        return sum + duration
      }, 0)

      const averageExecutionTime = completedExecutions.length > 0 
        ? totalExecutionTime / completedExecutions.length
        : 0

      // Group executions by status
      const executionsByStatus = executions.reduce((acc, execution) => {
        acc[execution.status] = (acc[execution.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Group executions by hour
      const executionsByHour: Array<{ hour: string; count: number }> = []
      const hoursToShow = Math.min(hoursBack, 24) // Show max 24 hours

      for (let i = hoursToShow - 1; i >= 0; i--) {
        const hour = new Date(Date.now() - i * 60 * 60 * 1000)
        const hourStart = new Date(hour.getFullYear(), hour.getMonth(), hour.getDate(), hour.getHours())
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)
        
        const count = executions.filter(e => 
          e.createdAt >= hourStart && e.createdAt < hourEnd
        ).length

        executionsByHour.push({
          hour: hourStart.toISOString(),
          count
        })
      }

      return {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        averageExecutionTime: Math.round(averageExecutionTime),
        executionsByStatus,
        executionsByHour
      }
    } catch (error) {
      logger.error('Failed to get SOP execution stats', { error, params })
      throw new Error(`Failed to get SOP execution stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private mapEntityToDto(entity: SopExecutionEntity): SopExecution {
    return {
      id: entity.id,
      sopProjectId: entity.projectId,
      stepId: entity.stepId,
      userId: entity.userId,
      status: entity.status,
      inputData: entity.inputData,
      outputData: entity.outputData,
      errorMessage: entity.errorMessage,
      startedAt: entity.startedAt?.toISOString(),
      completedAt: entity.completedAt?.toISOString(),
      metadata: entity.metadata,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString()
    }
  }

  private getLogLevelFromAction(action: string): 'debug' | 'info' | 'warn' | 'error' {
    if (action.includes('error') || action.includes('failed')) return 'error'
    if (action.includes('warning') || action.includes('cancelled')) return 'warn'
    if (action.includes('debug')) return 'debug'
    return 'info'
  }

  private formatLogMessage(action: string, details: any): string {
    switch (action) {
      case 'execution_started':
        return 'SOP execution started'
      case 'execution_completed':
        return 'SOP execution completed successfully'
      case 'execution_failed':
        return `SOP execution failed: ${details?.error || 'Unknown error'}`
      case 'execution_cancelled':
        return `SOP execution cancelled: ${details?.reason || 'User requested'}`
      case 'execution_retried':
        return `SOP execution retry started (attempt ${details?.retryAttempt || 1})`
      case 'step_started':
        return `Step started: ${details?.stepName || 'Unknown step'}`
      case 'step_completed':
        return `Step completed: ${details?.stepName || 'Unknown step'}`
      case 'step_failed':
        return `Step failed: ${details?.stepName || 'Unknown step'} - ${details?.error || 'Unknown error'}`
      default:
        return `${action}: ${JSON.stringify(details)}`
    }
  }

  private extractWorkflowLogs(workflowState: WorkflowState): Array<{
    timestamp: string
    level: 'debug' | 'info' | 'warn' | 'error'
    message: string
    stepId?: string
    metadata?: Record<string, any>
  }> {
    const logs: Array<{
      timestamp: string
      level: 'debug' | 'info' | 'warn' | 'error'
      message: string
      stepId?: string
      metadata?: Record<string, any>
    }> = []

    // Add workflow initialization log
    logs.push({
      timestamp: workflowState.created_at.toISOString(),
      level: 'info',
      message: 'Workflow initialized',
      metadata: {
        workflowExecutionId: workflowState.execution_id,
        processId: workflowState.process_id
      }
    })

    // Add workflow status changes
    if (workflowState.metadata?.last_transition) {
      const transition = workflowState.metadata.last_transition
      logs.push({
        timestamp: transition.timestamp,
        level: 'info',
        message: `Workflow transitioned from ${transition.from || 'start'} to ${transition.to}`,
        stepId: transition.to,
        metadata: { transition }
      })
    }

    return logs
  }
}

// Create service instance factory
let serviceInstance: SopExecutionService | null = null

export const sopExecutionService = {
  getInstance(dataSource: DataSource): SopExecutionService {
    if (!serviceInstance) {
      serviceInstance = new SopExecutionService(
        dataSource,
        dataSource.getRepository(SopExecutionEntity),
        dataSource.getRepository(SopProjectEntity),
        dataSource.getRepository(SopAuditLogEntity)
      )
    }
    return serviceInstance
  },

  // Legacy exports for backward compatibility
  async list(params: {
    projectId: string
    sopProjectId?: string
    status?: string[]
    userId?: string
    limit?: number
    cursor?: string
  }): Promise<SeekPage<SopExecution>> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.list(params)
  },

  async create(params: {
    projectId: string
    userId: string
    request: CreateSopExecutionRequest
  }): Promise<SopExecution> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.create(params)
  },

  async getOneOrThrow(params: {
    id: string
    projectId: string
  }): Promise<SopExecution> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.getOneOrThrow(params)
  },

  async update(params: {
    id: string
    projectId: string
    request: UpdateSopExecutionRequest
  }): Promise<SopExecution> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.update(params)
  },

  async cancel(params: {
    id: string
    projectId: string
    userId: string
  }): Promise<SopExecution> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.cancel(params)
  },

  async retry(params: {
    id: string
    projectId: string
    userId: string
  }): Promise<SopExecution> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.retry(params)
  },

  async getLogs(params: {
    id: string
    projectId: string
    limit?: number
    offset?: number
  }): Promise<{
    logs: Array<{
      timestamp: string
      level: 'debug' | 'info' | 'warn' | 'error'
      message: string
      stepId?: string
      metadata?: Record<string, any>
    }>
    total: number
  }> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.getLogs(params)
  },

  async getStats(params: {
    projectId: string
    sopProjectId?: string
    timeRange?: '1h' | '24h' | '7d' | '30d'
  }): Promise<{
    totalExecutions: number
    successfulExecutions: number
    failedExecutions: number
    averageExecutionTime: number
    executionsByStatus: Record<string, number>
    executionsByHour: Array<{ hour: string; count: number }>
  }> {
    if (!serviceInstance) {
      throw new Error('Service not initialized - call getInstance() first')
    }
    return serviceInstance.getStats(params)
  },
}
import { Type } from '@sinclair/typebox'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { StatusCodes } from 'http-status-codes'
import { PrincipalType, Permission, ApId } from '@activepieces/shared'
import { paginationHelper } from '../../helper/pagination/pagination-utils'
import { sopExecutionService } from '../service/sop-execution.service'
import {
  CreateSopExecutionRequest,
  UpdateSopExecutionRequest,
  ListSopExecutionsRequest,
  SopExecution,
  SopExecutionId,
  SopExecutionStatus,
} from '../dto/sop-execution.dto'

export const sopExecutionController: FastifyPluginAsyncTypebox = async (fastify) => {
  // List SOP Executions
  fastify.get('/', ListSopExecutionsOptions, async (request) => {
    const executions = await sopExecutionService.list({
      projectId: request.principal.projectId,
      sopProjectId: request.query.sopProjectId,
      status: request.query.status,
      userId: request.query.userId,
      limit: request.query.limit,
      cursor: request.query.cursor,
    })
    return executions
  })

  // Create SOP Execution (manual trigger)
  fastify.post('/', CreateSopExecutionOptions, async (request, reply) => {
    const execution = await sopExecutionService.create({
      projectId: request.principal.projectId,
      userId: request.principal.id,
      request: request.body,
    })
    return reply.status(StatusCodes.CREATED).send(execution)
  })

  // Get SOP Execution by ID
  fastify.get('/:id', GetSopExecutionOptions, async (request) => {
    return sopExecutionService.getOneOrThrow({
      id: request.params.id,
      projectId: request.principal.projectId,
    })
  })

  // Update SOP Execution Status
  fastify.put('/:id', UpdateSopExecutionOptions, async (request) => {
    return sopExecutionService.update({
      id: request.params.id,
      projectId: request.principal.projectId,
      request: request.body,
    })
  })

  // Cancel SOP Execution
  fastify.post('/:id/cancel', CancelSopExecutionOptions, async (request) => {
    return sopExecutionService.cancel({
      id: request.params.id,
      projectId: request.principal.projectId,
      userId: request.principal.id,
    })
  })

  // Retry Failed SOP Execution
  fastify.post('/:id/retry', RetrySopExecutionOptions, async (request, reply) => {
    const execution = await sopExecutionService.retry({
      id: request.params.id,
      projectId: request.principal.projectId,
      userId: request.principal.id,
    })
    return reply.status(StatusCodes.CREATED).send(execution)
  })

  // Get Execution Logs
  fastify.get('/:id/logs', GetSopExecutionLogsOptions, async (request) => {
    return sopExecutionService.getLogs({
      id: request.params.id,
      projectId: request.principal.projectId,
      limit: request.query.limit,
      offset: request.query.offset,
    })
  })

  // Get Execution Statistics
  fastify.get('/stats', GetSopExecutionStatsOptions, async (request) => {
    return sopExecutionService.getStats({
      projectId: request.principal.projectId,
      sopProjectId: request.query.sopProjectId,
      timeRange: request.query.timeRange,
    })
  })
}

// Request/Response Options
const ListSopExecutionsOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.READ_FLOW,
  },
  schema: {
    tags: ['sop-executions'],
    description: 'List SOP executions',
    querystring: ListSopExecutionsRequest,
    response: {
      [StatusCodes.OK]: Type.Object({
        data: Type.Array(SopExecution),
        next: Type.Optional(Type.String()),
        previous: Type.Optional(Type.String()),
      }),
    },
  },
}

const CreateSopExecutionOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.WRITE_FLOW,
  },
  schema: {
    tags: ['sop-executions'],
    description: 'Create a SOP execution',
    body: CreateSopExecutionRequest,
    response: {
      [StatusCodes.CREATED]: SopExecution,
    },
  },
}

const GetSopExecutionOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.READ_FLOW,
  },
  schema: {
    tags: ['sop-executions'],
    description: 'Get SOP execution by ID',
    params: Type.Object({
      id: SopExecutionId,
    }),
    response: {
      [StatusCodes.OK]: SopExecution,
    },
  },
}

const UpdateSopExecutionOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.WRITE_FLOW,
  },
  schema: {
    tags: ['sop-executions'],
    description: 'Update SOP execution',
    params: Type.Object({
      id: SopExecutionId,
    }),
    body: UpdateSopExecutionRequest,
    response: {
      [StatusCodes.OK]: SopExecution,
    },
  },
}

const CancelSopExecutionOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.WRITE_FLOW,
  },
  schema: {
    tags: ['sop-executions'],
    description: 'Cancel SOP execution',
    params: Type.Object({
      id: SopExecutionId,
    }),
    response: {
      [StatusCodes.OK]: SopExecution,
    },
  },
}

const RetrySopExecutionOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.WRITE_FLOW,
  },
  schema: {
    tags: ['sop-executions'],
    description: 'Retry failed SOP execution',
    params: Type.Object({
      id: SopExecutionId,
    }),
    response: {
      [StatusCodes.CREATED]: SopExecution,
    },
  },
}

const GetSopExecutionLogsOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.READ_FLOW,
  },
  schema: {
    tags: ['sop-executions'],
    description: 'Get SOP execution logs',
    params: Type.Object({
      id: SopExecutionId,
    }),
    querystring: Type.Object({
      limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 50 })),
      offset: Type.Optional(Type.Number({ minimum: 0, default: 0 })),
    }),
    response: {
      [StatusCodes.OK]: Type.Object({
        logs: Type.Array(Type.Object({
          timestamp: Type.String({ format: 'date-time' }),
          level: Type.Union([
            Type.Literal('debug'),
            Type.Literal('info'), 
            Type.Literal('warn'),
            Type.Literal('error'),
          ]),
          message: Type.String(),
          stepId: Type.Optional(Type.String()),
          metadata: Type.Optional(Type.Record(Type.String(), Type.Any())),
        })),
        total: Type.Number(),
      }),
    },
  },
}

const GetSopExecutionStatsOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.READ_FLOW,
  },
  schema: {
    tags: ['sop-executions'],
    description: 'Get SOP execution statistics',
    querystring: Type.Object({
      sopProjectId: Type.Optional(Type.String()),
      timeRange: Type.Optional(Type.Union([
        Type.Literal('1h'),
        Type.Literal('24h'),
        Type.Literal('7d'),
        Type.Literal('30d'),
      ], { default: '24h' })),
    }),
    response: {
      [StatusCodes.OK]: Type.Object({
        totalExecutions: Type.Number(),
        successfulExecutions: Type.Number(),
        failedExecutions: Type.Number(),
        averageExecutionTime: Type.Number(),
        executionsByStatus: Type.Record(Type.String(), Type.Number()),
        executionsByHour: Type.Array(Type.Object({
          hour: Type.String(),
          count: Type.Number(),
        })),
      }),
    },
  },
}
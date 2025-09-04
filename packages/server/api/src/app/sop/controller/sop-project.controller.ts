import { Type } from '@sinclair/typebox'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { StatusCodes } from 'http-status-codes'
import { PrincipalType, Permission, ApId } from '@activepieces/shared'
import { paginationHelper } from '../../helper/pagination/pagination-utils'
import { sopProjectService } from '../service/sop-project.service'
import { sopExportService } from '../export/sop-export.service'
import { databaseConnection } from '../../database/database-connection'
import {
  CreateSopProjectRequest,
  UpdateSopProjectRequest,
  ListSopProjectsRequest,
  SopProject,
  SopProjectId,
} from '../dto/sop-project.dto'

export const sopProjectController: FastifyPluginAsyncTypebox = async (fastify) => {
  // List SOP Projects
  fastify.get('/', ListSopProjectsOptions, async (request) => {
    const projects = await sopProjectService.list({
      projectId: request.principal.projectId,
      status: request.query.status,
      limit: request.query.limit,
      cursor: request.query.cursor,
    })
    return projects
  })

  // Create SOP Project
  fastify.post('/', CreateSopProjectOptions, async (request, reply) => {
    const sopProject = await sopProjectService.create({
      projectId: request.principal.projectId,
      request: request.body,
    })
    return reply.status(StatusCodes.CREATED).send(sopProject)
  })

  // Get SOP Project by ID
  fastify.get('/:id', GetSopProjectOptions, async (request) => {
    return sopProjectService.getOneOrThrow({
      id: request.params.id,
      projectId: request.principal.projectId,
    })
  })

  // Update SOP Project
  fastify.put('/:id', UpdateSopProjectOptions, async (request) => {
    return sopProjectService.update({
      id: request.params.id,
      projectId: request.principal.projectId,
      request: request.body,
    })
  })

  // Delete SOP Project
  fastify.delete('/:id', DeleteSopProjectOptions, async (request, reply) => {
    await sopProjectService.delete({
      id: request.params.id,
      projectId: request.principal.projectId,
    })
    return reply.status(StatusCodes.NO_CONTENT).send()
  })

  // Execute SOP Project
  fastify.post('/:id/execute', ExecuteSopProjectOptions, async (request, reply) => {
    const execution = await sopProjectService.execute({
      id: request.params.id,
      projectId: request.principal.projectId,
      userId: request.principal.id,
      inputData: request.body.inputData,
    })
    return reply.status(StatusCodes.ACCEPTED).send(execution)
  })

  // Export SOP Project
  fastify.get('/:id/export/:format', ExportSopProjectOptions, async (request, reply) => {
    // Get database connection
    const dataSource = databaseConnection()
    const exportData = await sopExportService.getInstance(dataSource).exportSopProject({
      sopId: request.params.id,
      format: request.params.format as any,
      projectId: request.principal.projectId,
      userId: request.principal.id,
      includeExecutionHistory: request.query.includeHistory === 'true',
      includeMetadata: request.query.includeMetadata !== 'false',
    })

    // Set appropriate content type and filename
    const filename = `sop_${request.params.id}_${Date.now()}.${exportData.fileExtension}`
    
    reply.header('Content-Type', exportData.mimeType)
    reply.header('Content-Disposition', `attachment; filename="${filename}"`)
    
    if (exportData.isBase64) {
      return reply.send(Buffer.from(exportData.content, 'base64'))
    } else {
      return reply.send(exportData.content)
    }
  })
}

// Request/Response Options
const ListSopProjectsOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.READ_FLOW, // Using existing permission for now
  },
  schema: {
    tags: ['sop-projects'],
    description: 'List SOP projects',
    querystring: ListSopProjectsRequest,
    response: {
      [StatusCodes.OK]: Type.Object({
        data: Type.Array(SopProject),
        next: Type.Optional(Type.String()),
        previous: Type.Optional(Type.String()),
      }),
    },
  },
}

const CreateSopProjectOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.WRITE_FLOW, // Using existing permission for now
  },
  schema: {
    tags: ['sop-projects'],
    description: 'Create a SOP project',
    body: CreateSopProjectRequest,
    response: {
      [StatusCodes.CREATED]: SopProject,
    },
  },
}

const GetSopProjectOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.READ_FLOW,
  },
  schema: {
    tags: ['sop-projects'],
    description: 'Get SOP project by ID',
    params: Type.Object({
      id: SopProjectId,
    }),
    response: {
      [StatusCodes.OK]: SopProject,
    },
  },
}

const UpdateSopProjectOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.WRITE_FLOW,
  },
  schema: {
    tags: ['sop-projects'],
    description: 'Update SOP project',
    params: Type.Object({
      id: SopProjectId,
    }),
    body: UpdateSopProjectRequest,
    response: {
      [StatusCodes.OK]: SopProject,
    },
  },
}

const DeleteSopProjectOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.WRITE_FLOW,
  },
  schema: {
    tags: ['sop-projects'],
    description: 'Delete SOP project',
    params: Type.Object({
      id: SopProjectId,
    }),
    response: {
      [StatusCodes.NO_CONTENT]: Type.Never(),
    },
  },
}

const ExecuteSopProjectOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.WRITE_FLOW,
  },
  schema: {
    tags: ['sop-projects'],
    description: 'Execute SOP project',
    params: Type.Object({
      id: SopProjectId,
    }),
    body: Type.Object({
      inputData: Type.Optional(Type.Record(Type.String(), Type.Any())),
    }),
    response: {
      [StatusCodes.ACCEPTED]: Type.Object({
        id: Type.String(),
        status: Type.String(),
        message: Type.String(),
      }),
    },
  },
}

const ExportSopProjectOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.READ_FLOW,
  },
  schema: {
    tags: ['sop-projects'],
    description: 'Export SOP project in specified format',
    params: Type.Object({
      id: SopProjectId,
      format: Type.Union([
        Type.Literal('json'),
        Type.Literal('text'),
        Type.Literal('pdf'),
        Type.Literal('package'),
        Type.Literal('flow'),
      ], { description: 'Export format' }),
    }),
    querystring: Type.Object({
      includeHistory: Type.Optional(Type.String({ description: 'Include execution history (true/false)' })),
      includeMetadata: Type.Optional(Type.String({ description: 'Include metadata (true/false, defaults to true)' })),
    }),
    response: {
      [StatusCodes.OK]: Type.Any({ description: 'Exported file content' }),
    },
  },
}
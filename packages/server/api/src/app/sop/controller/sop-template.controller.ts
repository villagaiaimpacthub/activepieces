import { Type } from '@sinclair/typebox'
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { StatusCodes } from 'http-status-codes'
import { PrincipalType, Permission, ApId } from '@activepieces/shared'
import { paginationHelper } from '../../helper/pagination/pagination-utils'
import { sopTemplateService } from '../service/sop-template.service'
import {
  CreateSopTemplateRequest,
  UpdateSopTemplateRequest,
  ListSopTemplatesRequest,
  SopTemplate,
  SopTemplateId,
  ImportSopTemplateRequest,
} from '../dto/sop-template.dto'

export const sopTemplateController: FastifyPluginAsyncTypebox = async (fastify) => {
  // List SOP Templates
  fastify.get('/', ListSopTemplatesOptions, async (request) => {
    const templates = await sopTemplateService.list({
      category: request.query.category,
      isPublic: request.query.isPublic,
      limit: request.query.limit,
      cursor: request.query.cursor,
      projectId: request.principal.projectId,
    })
    return templates
  })

  // Create SOP Template
  fastify.post('/', CreateSopTemplateOptions, async (request, reply) => {
    const template = await sopTemplateService.create({
      projectId: request.principal.projectId,
      request: request.body,
    })
    return reply.status(StatusCodes.CREATED).send(template)
  })

  // Get SOP Template by ID
  fastify.get('/:id', GetSopTemplateOptions, async (request) => {
    return sopTemplateService.getOneOrThrow({
      id: request.params.id,
      projectId: request.principal.projectId,
    })
  })

  // Update SOP Template
  fastify.put('/:id', UpdateSopTemplateOptions, async (request) => {
    return sopTemplateService.update({
      id: request.params.id,
      projectId: request.principal.projectId,
      request: request.body,
    })
  })

  // Delete SOP Template
  fastify.delete('/:id', DeleteSopTemplateOptions, async (request, reply) => {
    await sopTemplateService.delete({
      id: request.params.id,
      projectId: request.principal.projectId,
    })
    return reply.status(StatusCodes.NO_CONTENT).send()
  })

  // Import Template to Project
  fastify.post('/:id/import', ImportSopTemplateOptions, async (request, reply) => {
    const project = await sopTemplateService.importToProject({
      templateId: request.params.id,
      projectId: request.principal.projectId,
      request: request.body,
    })
    return reply.status(StatusCodes.CREATED).send(project)
  })

  // Get Template Usage Statistics
  fastify.get('/:id/stats', GetSopTemplateStatsOptions, async (request) => {
    return sopTemplateService.getStats({
      id: request.params.id,
      projectId: request.principal.projectId,
    })
  })
}

// Request/Response Options
const ListSopTemplatesOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.READ_FLOW,
  },
  schema: {
    tags: ['sop-templates'],
    description: 'List SOP templates',
    querystring: ListSopTemplatesRequest,
    response: {
      [StatusCodes.OK]: Type.Object({
        data: Type.Array(SopTemplate),
        next: Type.Optional(Type.String()),
        previous: Type.Optional(Type.String()),
      }),
    },
  },
}

const CreateSopTemplateOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.WRITE_FLOW,
  },
  schema: {
    tags: ['sop-templates'],
    description: 'Create a SOP template',
    body: CreateSopTemplateRequest,
    response: {
      [StatusCodes.CREATED]: SopTemplate,
    },
  },
}

const GetSopTemplateOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.READ_FLOW,
  },
  schema: {
    tags: ['sop-templates'],
    description: 'Get SOP template by ID',
    params: Type.Object({
      id: SopTemplateId,
    }),
    response: {
      [StatusCodes.OK]: SopTemplate,
    },
  },
}

const UpdateSopTemplateOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.WRITE_FLOW,
  },
  schema: {
    tags: ['sop-templates'],
    description: 'Update SOP template',
    params: Type.Object({
      id: SopTemplateId,
    }),
    body: UpdateSopTemplateRequest,
    response: {
      [StatusCodes.OK]: SopTemplate,
    },
  },
}

const DeleteSopTemplateOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.WRITE_FLOW,
  },
  schema: {
    tags: ['sop-templates'],
    description: 'Delete SOP template',
    params: Type.Object({
      id: SopTemplateId,
    }),
    response: {
      [StatusCodes.NO_CONTENT]: Type.Never(),
    },
  },
}

const ImportSopTemplateOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.WRITE_FLOW,
  },
  schema: {
    tags: ['sop-templates'],
    description: 'Import SOP template to project',
    params: Type.Object({
      id: SopTemplateId,
    }),
    body: ImportSopTemplateRequest,
    response: {
      [StatusCodes.CREATED]: Type.Object({
        id: Type.String(),
        name: Type.String(),
        templateId: Type.String(),
        projectId: Type.String(),
      }),
    },
  },
}

const GetSopTemplateStatsOptions = {
  config: {
    allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
    permission: Permission.READ_FLOW,
  },
  schema: {
    tags: ['sop-templates'],
    description: 'Get SOP template usage statistics',
    params: Type.Object({
      id: SopTemplateId,
    }),
    response: {
      [StatusCodes.OK]: Type.Object({
        usageCount: Type.Number(),
        lastUsed: Type.Optional(Type.String({ format: 'date-time' })),
        popularSteps: Type.Array(Type.String()),
      }),
    },
  },
}
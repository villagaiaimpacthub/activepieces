import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { sopProjectController } from './controller/sop-project.controller'
import { sopTemplateController } from './controller/sop-template.controller'
import { sopExecutionController } from './controller/sop-execution.controller'
import { sopExportController } from './controller'

export const sopModule: FastifyPluginAsyncTypebox = async (app) => {
  await app.register(sopProjectController, { prefix: '/v1/sop/projects' })
  await app.register(sopTemplateController, { prefix: '/v1/sop/templates' })
  await app.register(sopExecutionController, { prefix: '/v1/sop/executions' })
  await app.register(sopExportController, { prefix: '/v1/sop/export' })
}
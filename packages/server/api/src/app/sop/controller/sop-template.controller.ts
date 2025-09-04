import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { databaseConnection } from '@activepieces/server-api';
import { StatusCodes } from 'http-status-codes';
import { logger } from '@activepieces/server-shared';
import { SopTemplateService } from '../services/sop-template.service';

export const sopTemplateController: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get('/templates', {
    schema: {
      querystring: Type.Object({
        search: Type.Optional(Type.String()),
        category: Type.Optional(Type.String()),
        difficulty: Type.Optional(Type.Union([
          Type.Literal('beginner'),
          Type.Literal('intermediate'), 
          Type.Literal('advanced')
        ])),
        sortBy: Type.Optional(Type.Union([
          Type.Literal('popular'),
          Type.Literal('recent'),
          Type.Literal('rating'),
          Type.Literal('title')
        ])),
        limit: Type.Optional(Type.Number()),
        offset: Type.Optional(Type.Number()),
        bookmarkedOnly: Type.Optional(Type.Boolean())
      })
    }
  }, async (request: any, reply) => {
    try {
      const dataSource = databaseConnection();
      const templateService = SopTemplateService.getInstance(dataSource);
      
      const result = await templateService.searchTemplates({
        ...request.query,
        userId: request.principal.id
      });
      
      return reply.code(StatusCodes.OK).send({
        templates: result.templates,
        total: result.total
      });
    } catch (error) {
      logger.error('Failed to search templates', error);
      return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
        error: 'Failed to search templates'
      });
    }
  });

  fastify.get('/templates/:templateId', async (request: any, reply) => {
    try {
      const dataSource = databaseConnection();
      const templateService = SopTemplateService.getInstance(dataSource);
      
      const template = await templateService.getTemplateById(request.params.templateId);
      
      if (!template) {
        return reply.code(StatusCodes.NOT_FOUND).send({
          error: 'Template not found'
        });
      }
      
      return reply.code(StatusCodes.OK).send(template);
    } catch (error) {
      logger.error('Failed to get template', error);
      return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
        error: 'Failed to get template'
      });
    }
  });

  fastify.post('/templates/create-sop', {
    schema: {
      body: Type.Object({
        templateId: Type.String(),
        title: Type.Optional(Type.String()),
        customizations: Type.Optional(Type.Object({
          skipSteps: Type.Optional(Type.Array(Type.String())),
          additionalSteps: Type.Optional(Type.Array(Type.Object({
            title: Type.String(),
            description: Type.String(),
            position: Type.Number()
          })))
        }))
      })
    }
  }, async (request: any, reply) => {
    try {
      const dataSource = databaseConnection();
      const templateService = SopTemplateService.getInstance(dataSource);
      
      const sopProject = await templateService.createSopFromTemplate({
        ...request.body,
        projectId: request.principal.projectId,
        userId: request.principal.id
      });
      
      return reply.code(StatusCodes.CREATED).send({
        id: sopProject.id,
        title: sopProject.title,
        message: 'SOP created successfully from template'
      });
    } catch (error) {
      logger.error('Failed to create SOP from template', error);
      return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
        error: 'Failed to create SOP from template'
      });
    }
  });

  fastify.post('/templates/:templateId/bookmark', async (request: any, reply) => {
    try {
      const dataSource = databaseConnection();
      const templateService = SopTemplateService.getInstance(dataSource);
      
      const isBookmarked = await templateService.toggleTemplateBookmark(
        request.params.templateId,
        request.principal.id
      );
      
      return reply.code(StatusCodes.OK).send({ isBookmarked });
    } catch (error) {
      logger.error('Failed to toggle template bookmark', error);
      return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
        error: 'Failed to toggle bookmark'
      });
    }
  });

  fastify.get('/templates/featured', async (request: any, reply) => {
    try {
      const dataSource = databaseConnection();
      const templateService = SopTemplateService.getInstance(dataSource);
      
      const templates = await templateService.getFeaturedTemplates(6);
      
      return reply.code(StatusCodes.OK).send(templates);
    } catch (error) {
      logger.error('Failed to get featured templates', error);
      return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
        error: 'Failed to get featured templates'
      });
    }
  });
};
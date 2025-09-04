import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import { StatusCodes } from 'http-status-codes'
import { sopExportService } from './sop-export.service'
import { sopProjectService } from '../service/sop-project.service'
import { SopProjectId } from '../dto/sop-project.dto'
import { databaseConnection } from '../../database'
import { logger } from '../../../backend/utils/logger'

const ExportFormatEnum = Type.Union([
  Type.Literal('json'),
  Type.Literal('text'),
  Type.Literal('pdf'),
  Type.Literal('clientPackage'),
  Type.Literal('activepiecesFlow')
])

const ExportSopRequest = Type.Object({
  format: ExportFormatEnum
})

const ExportSopResponse = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  downloadUrl: Type.Optional(Type.String()),
  fileName: Type.Optional(Type.String()),
  contentType: Type.Optional(Type.String()),
  size: Type.Optional(Type.Number()),
  error: Type.Optional(Type.String())
})

const BatchExportRequest = Type.Object({
  sopIds: Type.Array(SopProjectId, { minItems: 1, maxItems: 10 }),
  format: ExportFormatEnum,
  packageName: Type.Optional(Type.String())
})

export const sopExportController: FastifyPluginAsyncTypebox = async (app) => {
  
  /**
   * Export single SOP in specified format
   */
  app.post('/:sopId/export', {
    schema: {
      tags: ['SOP Export'],
      summary: 'Export SOP in specified format',
      params: Type.Object({
        sopId: SopProjectId
      }),
      body: ExportSopRequest,
      response: {
        [StatusCodes.OK]: ExportSopResponse,
        [StatusCodes.BAD_REQUEST]: Type.Object({
          message: Type.String()
        }),
        [StatusCodes.NOT_FOUND]: Type.Object({
          message: Type.String()
        }),
        [StatusCodes.INTERNAL_SERVER_ERROR]: Type.Object({
          message: Type.String()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { sopId } = request.params
      const { format } = request.body
      const projectId = 'default' // In real implementation, extract from auth context

      logger.info('Processing SOP export request', { sopId, format })

      const exportService = sopExportService.getInstance(databaseConnection)
      let result

      switch (format) {
        case 'json':
          result = await exportService.exportToJson(sopId, projectId)
          break
        case 'text':
          result = await exportService.exportToText(sopId, projectId)
          break
        case 'pdf':
          result = await exportService.exportToPdf(sopId, projectId)
          break
        case 'clientPackage':
          result = await exportService.createClientPackage(sopId, projectId)
          break
        case 'activepiecesFlow':
          result = await exportService.exportToActivepiecesFlow(sopId, projectId)
          break
        default:
          return reply.status(StatusCodes.BAD_REQUEST).send({
            message: `Unsupported export format: ${format}`
          })
      }

      if (!result.success) {
        return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
          message: result.error || 'Export failed'
        })
      }

      // In a real implementation, you would:
      // 1. Store the file in a secure file storage (S3, etc.)
      // 2. Generate a signed download URL with expiration
      // 3. Implement proper cleanup of temporary files

      const downloadUrl = `/api/v1/sop/${sopId}/download/${result.fileName}`

      return reply.status(StatusCodes.OK).send({
        success: true,
        message: `SOP exported successfully as ${format}`,
        downloadUrl,
        fileName: result.fileName,
        contentType: result.contentType,
        size: result.size
      })

    } catch (error) {
      logger.error('SOP export failed', { error, params: request.params, body: request.body })
      
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(StatusCodes.NOT_FOUND).send({
          message: error.message
        })
      }

      return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: 'Internal server error during export'
      })
    }
  })

  /**
   * Batch export multiple SOPs
   */
  app.post('/batch-export', {
    schema: {
      tags: ['SOP Export'],
      summary: 'Export multiple SOPs in specified format',
      body: BatchExportRequest,
      response: {
        [StatusCodes.OK]: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
          results: Type.Array(Type.Object({
            sopId: SopProjectId,
            success: Type.Boolean(),
            fileName: Type.Optional(Type.String()),
            downloadUrl: Type.Optional(Type.String()),
            error: Type.Optional(Type.String())
          })),
          packageUrl: Type.Optional(Type.String())
        }),
        [StatusCodes.BAD_REQUEST]: Type.Object({
          message: Type.String()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { sopIds, format, packageName } = request.body
      const projectId = 'default' // In real implementation, extract from auth context

      logger.info('Processing batch SOP export', { 
        sopCount: sopIds.length, 
        format, 
        packageName 
      })

      const exportService = sopExportService.getInstance(databaseConnection)
      const results = []

      // Process each SOP export
      for (const sopId of sopIds) {
        try {
          let result

          switch (format) {
            case 'json':
              result = await exportService.exportToJson(sopId, projectId)
              break
            case 'text':
              result = await exportService.exportToText(sopId, projectId)
              break
            case 'pdf':
              result = await exportService.exportToPdf(sopId, projectId)
              break
            case 'clientPackage':
              result = await exportService.createClientPackage(sopId, projectId)
              break
            case 'activepiecesFlow':
              result = await exportService.exportToActivepiecesFlow(sopId, projectId)
              break
            default:
              result = { success: false, error: `Unsupported format: ${format}` }
          }

          results.push({
            sopId,
            success: result.success,
            fileName: result.fileName,
            downloadUrl: result.success ? `/api/v1/sop/${sopId}/download/${result.fileName}` : undefined,
            error: result.error
          })

        } catch (error) {
          logger.error('Individual SOP export failed in batch', { error, sopId })
          results.push({
            sopId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      const successCount = results.filter(r => r.success).length
      const failureCount = results.length - successCount

      return reply.status(StatusCodes.OK).send({
        success: successCount > 0,
        message: `Batch export completed: ${successCount} successful, ${failureCount} failed`,
        results
      })

    } catch (error) {
      logger.error('Batch export failed', { error, body: request.body })
      
      return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: 'Internal server error during batch export'
      })
    }
  })

  /**
   * Get supported export formats
   */
  app.get('/formats', {
    schema: {
      tags: ['SOP Export'],
      summary: 'Get list of supported export formats',
      response: {
        [StatusCodes.OK]: Type.Object({
          formats: Type.Array(Type.Object({
            key: Type.String(),
            name: Type.String(),
            description: Type.String(),
            contentType: Type.String(),
            extension: Type.String()
          }))
        })
      }
    }
  }, async (request, reply) => {
    return reply.status(StatusCodes.OK).send({
      formats: [
        {
          key: 'json',
          name: 'JSON Definition',
          description: 'Machine-readable SOP definition for system integration',
          contentType: 'application/json',
          extension: '.json'
        },
        {
          key: 'text',
          name: 'Text Documentation',
          description: 'Human-readable plain text documentation',
          contentType: 'text/plain',
          extension: '.txt'
        },
        {
          key: 'pdf',
          name: 'PDF Document',
          description: 'Professional formatted document for printing and sharing',
          contentType: 'application/pdf',
          extension: '.pdf'
        },
        {
          key: 'clientPackage',
          name: 'Client Package',
          description: 'Complete delivery package with all files and documentation',
          contentType: 'application/zip',
          extension: '.zip'
        },
        {
          key: 'activepiecesFlow',
          name: 'Activepieces Flow',
          description: 'Ready-to-import flow definition for Activepieces platform',
          contentType: 'application/json',
          extension: '.json'
        }
      ]
    })
  })

  /**
   * Download exported file (placeholder endpoint)
   */
  app.get('/:sopId/download/:fileName', {
    schema: {
      tags: ['SOP Export'],
      summary: 'Download exported SOP file',
      params: Type.Object({
        sopId: SopProjectId,
        fileName: Type.String()
      }),
      response: {
        [StatusCodes.OK]: Type.Object({
          message: Type.String()
        }),
        [StatusCodes.NOT_FOUND]: Type.Object({
          message: Type.String()
        })
      }
    }
  }, async (request, reply) => {
    const { sopId, fileName } = request.params
    
    // In a real implementation, this would:
    // 1. Validate the download token/permission
    // 2. Retrieve the file from secure storage
    // 3. Stream the file to the client
    // 4. Set appropriate headers (Content-Disposition, etc.)
    // 5. Log the download activity
    
    logger.info('File download requested', { sopId, fileName })
    
    return reply.status(StatusCodes.OK).send({
      message: `Download endpoint for ${fileName} - implement file streaming in production`
    })
  })

  /**
   * Export preview (get export metadata without generating file)
   */
  app.get('/:sopId/export-preview', {
    schema: {
      tags: ['SOP Export'],
      summary: 'Preview export metadata without generating files',
      params: Type.Object({
        sopId: SopProjectId
      }),
      response: {
        [StatusCodes.OK]: Type.Object({
          sop: Type.Object({
            id: Type.String(),
            name: Type.String(),
            version: Type.Number(),
            status: Type.String(),
            stepCount: Type.Number()
          }),
          estimatedSizes: Type.Object({
            json: Type.String(),
            text: Type.String(),
            pdf: Type.String(),
            clientPackage: Type.String(),
            activepiecesFlow: Type.String()
          }),
          supportedFormats: Type.Array(Type.String())
        }),
        [StatusCodes.NOT_FOUND]: Type.Object({
          message: Type.String()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { sopId } = request.params
      const projectId = 'default' // In real implementation, extract from auth context

      // Get SOP basic info for preview
      const sopProjectServiceInstance = sopProjectService.getInstance(databaseConnection)
      const sopProject = await sopProjectServiceInstance.getOneOrThrow({
        id: sopId,
        projectId
      })

      // Estimate file sizes based on content
      const baseSize = sopProject.name.length + (sopProject.description?.length || 0)
      const stepCount = sopProject.steps?.length || 0
      
      return reply.status(StatusCodes.OK).send({
        sop: {
          id: sopProject.id,
          name: sopProject.name,
          version: sopProject.version,
          status: sopProject.status,
          stepCount
        },
        estimatedSizes: {
          json: `~${Math.round(baseSize * 2 + stepCount * 100)}B`,
          text: `~${Math.round(baseSize * 3 + stepCount * 200)}B`,
          pdf: `~${Math.round(baseSize * 5 + stepCount * 300)}B`,
          clientPackage: `~${Math.round(baseSize * 10 + stepCount * 500)}B`,
          activepiecesFlow: `~${Math.round(baseSize * 1.5 + stepCount * 150)}B`
        },
        supportedFormats: ['json', 'text', 'pdf', 'clientPackage', 'activepiecesFlow']
      })

    } catch (error) {
      logger.error('Export preview failed', { error, sopId: request.params.sopId })
      
      if (error instanceof Error && error.message.includes('not found')) {
        return reply.status(StatusCodes.NOT_FOUND).send({
          message: error.message
        })
      }

      return reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
        message: 'Failed to generate export preview'
      })
    }
  })
}

export default sopExportController
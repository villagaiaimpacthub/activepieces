import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals'
import { DataSource } from 'typeorm'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'
import { sopExportService, SopExportService } from '../sop-export.service'
import { sopProjectService } from '../../service/sop-project.service'

// Mock dependencies
jest.mock('../../service/sop-project.service', () => ({
  sopProjectService: {
    getInstance: jest.fn()
  }
}))

jest.mock('../../../backend/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}))

jest.mock('@activepieces/server-shared', () => ({
  threadSafeMkdir: jest.fn().mockResolvedValue(undefined)
}))

describe('SopExportService', () => {
  let mockDataSource: jest.Mocked<DataSource>
  let exportServiceInstance: SopExportService
  let mockSopProjectService: any
  let tempDir: string

  const mockSopProject = {
    id: 'test-sop-id',
    name: 'Test SOP',
    description: 'Test SOP Description',
    version: 1,
    status: 'active',
    metadata: { testKey: 'testValue' },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    steps: [
      {
        id: 'step-1',
        name: 'Test Step 1',
        order: 1,
        type: 'http_request'
      },
      {
        id: 'step-2', 
        name: 'Test Step 2',
        order: 2,
        type: 'email'
      }
    ]
  }

  beforeEach(async () => {
    // Create temporary directory for tests
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sop-export-test-'))

    mockDataSource = {
      // Mock necessary DataSource methods
    } as jest.Mocked<DataSource>

    mockSopProjectService = {
      getOneOrThrow: jest.fn().mockResolvedValue(mockSopProject)
    }

    ;(sopProjectService.getInstance as jest.Mock).mockReturnValue(mockSopProjectService)

    exportServiceInstance = sopExportService.getInstance(mockDataSource)
  })

  afterEach(async () => {
    // Cleanup temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (error) {
      console.warn('Failed to cleanup temp directory:', error)
    }
  })

  describe('exportToJson', () => {
    it('should export SOP to JSON format successfully', async () => {
      const result = await exportServiceInstance.exportToJson('test-sop-id', 'test-project-id')

      expect(result.success).toBe(true)
      expect(result.fileName).toContain('Test-SOP')
      expect(result.fileName).toContain('.json')
      expect(result.contentType).toBe('application/json')
      expect(result.size).toBeGreaterThan(0)
      expect(result.filePath).toBeDefined()

      // Verify file exists and contains valid JSON
      if (result.filePath) {
        const fileExists = await fs.access(result.filePath).then(() => true).catch(() => false)
        expect(fileExists).toBe(true)

        const fileContent = await fs.readFile(result.filePath, 'utf8')
        const jsonData = JSON.parse(fileContent)
        
        expect(jsonData.format).toBe('activepieces-sop-v1.0')
        expect(jsonData.sop.id).toBe('test-sop-id')
        expect(jsonData.sop.name).toBe('Test SOP')
        expect(jsonData.sop.steps).toHaveLength(2)
        expect(jsonData.implementation.framework).toBe('activepieces')
      }
    })

    it('should handle service errors gracefully', async () => {
      mockSopProjectService.getOneOrThrow.mockRejectedValue(new Error('SOP not found'))

      const result = await exportServiceInstance.exportToJson('invalid-id', 'test-project-id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('JSON export failed')
    })
  })

  describe('exportToText', () => {
    it('should export SOP to Text format successfully', async () => {
      const result = await exportServiceInstance.exportToText('test-sop-id', 'test-project-id')

      expect(result.success).toBe(true)
      expect(result.fileName).toContain('Test-SOP')
      expect(result.fileName).toContain('.txt')
      expect(result.contentType).toBe('text/plain')
      expect(result.size).toBeGreaterThan(0)

      // Verify file content structure
      if (result.filePath) {
        const fileContent = await fs.readFile(result.filePath, 'utf8')
        
        expect(fileContent).toContain('# Standard Operating Procedure: Test SOP')
        expect(fileContent).toContain('**Version:** 1')
        expect(fileContent).toContain('**Status:** ACTIVE')
        expect(fileContent).toContain('## Implementation Guide')
        expect(fileContent).toContain('Step 1: Test Step 1')
        expect(fileContent).toContain('Step 2: Test Step 2')
        expect(fileContent).toContain('Activepieces')
      }
    })
  })

  describe('exportToPdf', () => {
    it('should export SOP to PDF format successfully', async () => {
      const result = await exportServiceInstance.exportToPdf('test-sop-id', 'test-project-id')

      expect(result.success).toBe(true)
      expect(result.fileName).toContain('Test-SOP')
      expect(result.fileName).toContain('.pdf')
      expect(result.contentType).toBe('application/pdf')
      expect(result.size).toBeGreaterThan(0)

      // Verify file contains HTML structure (placeholder implementation)
      if (result.filePath) {
        const fileContent = await fs.readFile(result.filePath, 'utf8')
        
        expect(fileContent).toContain('<!DOCTYPE html>')
        expect(fileContent).toContain('<title>SOP: Test SOP</title>')
        expect(fileContent).toContain('Standard Operating Procedure')
        expect(fileContent).toContain('Test Step 1')
        expect(fileContent).toContain('Test Step 2')
      }
    })
  })

  describe('exportToActivepiecesFlow', () => {
    it('should export SOP to Activepieces Flow format successfully', async () => {
      const result = await exportServiceInstance.exportToActivepiecesFlow('test-sop-id', 'test-project-id')

      expect(result.success).toBe(true)
      expect(result.fileName).toContain('activepieces-flow')
      expect(result.fileName).toContain('.json')
      expect(result.contentType).toBe('application/json')

      // Verify flow structure
      if (result.filePath) {
        const fileContent = await fs.readFile(result.filePath, 'utf8')
        const flowData = JSON.parse(fileContent)
        
        expect(flowData.displayName).toBe('Test SOP')
        expect(flowData.version.trigger.type).toBe('EMPTY')
        expect(flowData.version.actions).toBeDefined()
        expect(Object.keys(flowData.version.actions)).toHaveLength(2)
        expect(flowData.version.actions.step_1.displayName).toBe('Test Step 1')
        expect(flowData.version.actions.step_2.displayName).toBe('Test Step 2')
      }
    })
  })

  describe('createClientPackage', () => {
    it('should create complete client package successfully', async () => {
      const result = await exportServiceInstance.createClientPackage('test-sop-id', 'test-project-id')

      expect(result.success).toBe(true)
      expect(result.fileName).toContain('sop-package-Test-SOP-v1.zip')
      expect(result.contentType).toBe('application/zip')
      expect(result.size).toBeGreaterThan(0)

      // Note: In a real implementation, you would extract and verify ZIP contents
      // This test verifies the ZIP file was created successfully
      if (result.filePath) {
        const fileExists = await fs.access(result.filePath).then(() => true).catch(() => false)
        expect(fileExists).toBe(true)
        
        const stats = await fs.stat(result.filePath)
        expect(stats.size).toBeGreaterThan(0)
      }
    }, 10000) // Longer timeout for ZIP creation
  })

  describe('step type mapping', () => {
    it('should map SOP step types to Activepieces types correctly', async () => {
      const testCases = [
        { sopType: 'http_request', expectedType: 'HTTP' },
        { sopType: 'email', expectedType: 'EMAIL' },
        { sopType: 'webhook', expectedType: 'WEBHOOK' },
        { sopType: 'database', expectedType: 'SQL' },
        { sopType: 'file_processing', expectedType: 'FILE' },
        { sopType: 'data_transformation', expectedType: 'CODE' },
        { sopType: 'unknown_type', expectedType: 'CODE' } // Default mapping
      ]

      for (const testCase of testCases) {
        const mockSopWithType = {
          ...mockSopProject,
          steps: [{
            id: 'test-step',
            name: 'Test Step',
            order: 1,
            type: testCase.sopType
          }]
        }

        mockSopProjectService.getOneOrThrow.mockResolvedValue(mockSopWithType)

        const result = await exportServiceInstance.exportToActivepiecesFlow('test-sop-id', 'test-project-id')

        expect(result.success).toBe(true)

        if (result.filePath) {
          const fileContent = await fs.readFile(result.filePath, 'utf8')
          const flowData = JSON.parse(fileContent)
          const stepAction = flowData.version.actions.step_1
          
          expect(stepAction.type).toBe(testCase.expectedType)
        }
      }
    })
  })

  describe('error handling', () => {
    it('should handle SOP not found errors', async () => {
      const notFoundError = new Error('SOP project not found: invalid-id')
      mockSopProjectService.getOneOrThrow.mockRejectedValue(notFoundError)

      const result = await exportServiceInstance.exportToJson('invalid-id', 'test-project-id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('JSON export failed')
    })

    it('should handle file system errors', async () => {
      // Mock fs.writeFile to fail
      const originalWriteFile = fs.writeFile
      ;(fs as any).writeFile = jest.fn().mockRejectedValue(new Error('Disk full'))

      const result = await exportServiceInstance.exportToJson('test-sop-id', 'test-project-id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('JSON export failed')

      // Restore original function
      ;(fs as any).writeFile = originalWriteFile
    })
  })

  describe('memory safety', () => {
    it('should handle multiple concurrent exports', async () => {
      const promises = Array.from({ length: 5 }, (_, i) => 
        exportServiceInstance.exportToJson(`sop-${i}`, 'test-project-id')
      )

      const results = await Promise.all(promises)

      results.forEach(result => {
        expect(result.success).toBe(true)
      })
    })

    it('should generate unique filenames for concurrent exports', async () => {
      const promise1 = exportServiceInstance.exportToJson('test-sop-id', 'test-project-id')
      const promise2 = exportServiceInstance.exportToJson('test-sop-id', 'test-project-id')

      const [result1, result2] = await Promise.all([promise1, promise2])

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      
      // Files should be in different temporary directories
      if (result1.filePath && result2.filePath) {
        expect(result1.filePath).not.toBe(result2.filePath)
      }
    })
  })
})
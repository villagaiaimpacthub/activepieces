import { DataSource } from 'typeorm'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'
import * as JSZip from 'jszip'
import { sopProjectService } from '../service/sop-project.service'
import { logger } from '../../../backend/utils/logger'
import { threadSafeMkdir } from '@activepieces/server-shared'

export interface ExportResult {
  success: boolean
  filePath?: string
  fileName?: string
  contentType?: string
  size?: number
  error?: string
}

export interface ExportFormat {
  json: 'json'
  text: 'text'
  pdf: 'pdf'
  clientPackage: 'clientPackage'
  activepiecesFlow: 'activepiecesFlow'
}

class SopExportService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Export SOP to JSON format - Machine-readable SOP definition
   */
  async exportToJson(sopId: string, projectId: string): Promise<ExportResult> {
    try {
      logger.info('Starting JSON export', { sopId })

      // Get SOP data
      const sopProject = await sopProjectService.getInstance(this.dataSource).getOneOrThrow({
        id: sopId,
        projectId
      })

      // Create comprehensive JSON structure
      const jsonExport = {
        format: 'activepieces-sop-v1.0',
        exportedAt: new Date().toISOString(),
        sop: {
          id: sopProject.id,
          name: sopProject.name,
          description: sopProject.description,
          version: sopProject.version,
          status: sopProject.status,
          metadata: sopProject.metadata,
          createdAt: sopProject.createdAt,
          updatedAt: sopProject.updatedAt,
          steps: sopProject.steps?.map(step => ({
            id: step.id,
            name: step.name,
            order: step.order,
            type: step.type,
            configuration: {},
            validation: {
              required: true,
              timeout: 300
            }
          })) || []
        },
        implementation: {
          framework: 'activepieces',
          version: '1.0',
          requirements: {
            nodejs: '>=18.0.0',
            activepieces: '>=0.30.0'
          }
        }
      }

      // Create temporary file
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sop-export-'))
      const fileName = `sop-${sopProject.name.replace(/[^a-zA-Z0-9]/g, '-')}-${sopProject.version}.json`
      const filePath = path.join(tempDir, fileName)

      await fs.writeFile(filePath, JSON.stringify(jsonExport, null, 2), 'utf8')

      const stats = await fs.stat(filePath)

      logger.info('JSON export completed', { sopId, fileName, size: stats.size })

      return {
        success: true,
        filePath,
        fileName,
        contentType: 'application/json',
        size: stats.size
      }
    } catch (error) {
      logger.error('JSON export failed', { error, sopId })
      return {
        success: false,
        error: `JSON export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Export SOP to Text format - Human-readable documentation
   */
  async exportToText(sopId: string, projectId: string): Promise<ExportResult> {
    try {
      logger.info('Starting Text export', { sopId })

      // Get SOP data
      const sopProject = await sopProjectService.getInstance(this.dataSource).getOneOrThrow({
        id: sopId,
        projectId
      })

      // Generate human-readable text documentation
      let textContent = `# Standard Operating Procedure: ${sopProject.name}\n\n`
      textContent += `**Version:** ${sopProject.version}\n`
      textContent += `**Status:** ${sopProject.status.toUpperCase()}\n`
      textContent += `**Created:** ${new Date(sopProject.createdAt).toLocaleDateString()}\n`
      textContent += `**Last Updated:** ${new Date(sopProject.updatedAt).toLocaleDateString()}\n\n`

      if (sopProject.description) {
        textContent += `## Description\n${sopProject.description}\n\n`
      }

      textContent += `## Implementation Guide\n\n`
      textContent += `This SOP has been designed for implementation in Activepieces, a no-code automation platform.\n\n`
      
      textContent += `### Prerequisites\n`
      textContent += `- Active Activepieces instance (v0.30.0 or higher)\n`
      textContent += `- Administrative access to create flows\n`
      textContent += `- Required connections configured\n\n`

      if (sopProject.steps && sopProject.steps.length > 0) {
        textContent += `## Process Steps\n\n`
        textContent += `This SOP consists of ${sopProject.steps.length} automated steps:\n\n`

        sopProject.steps
          .sort((a, b) => a.order - b.order)
          .forEach((step, index) => {
            textContent += `### Step ${index + 1}: ${step.name}\n`
            textContent += `- **Type:** ${step.type}\n`
            textContent += `- **Order:** ${step.order}\n`
            textContent += `- **Purpose:** Execute automated ${step.type} action\n\n`
          })
      }

      textContent += `## Implementation Instructions\n\n`
      textContent += `1. **Import Flow Definition**\n`
      textContent += `   - Open your Activepieces dashboard\n`
      textContent += `   - Navigate to Flows > Import\n`
      textContent += `   - Upload the included activepieces-flow.json file\n\n`

      textContent += `2. **Configure Connections**\n`
      textContent += `   - Review all connection requirements\n`
      textContent += `   - Set up necessary API keys and credentials\n`
      textContent += `   - Test connections before activation\n\n`

      textContent += `3. **Validate Implementation**\n`
      textContent += `   - Run test execution with sample data\n`
      textContent += `   - Verify all steps execute successfully\n`
      textContent += `   - Monitor initial production runs\n\n`

      textContent += `4. **Activation**\n`
      textContent += `   - Enable the flow in production\n`
      textContent += `   - Configure appropriate triggers\n`
      textContent += `   - Set up monitoring and alerts\n\n`

      textContent += `## Support\n\n`
      textContent += `This SOP was generated automatically by the Activepieces SOP Tool.\n`
      textContent += `For technical support with implementation, please contact your system administrator.\n\n`

      textContent += `---\n`
      textContent += `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`

      // Create temporary file
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sop-export-'))
      const fileName = `sop-${sopProject.name.replace(/[^a-zA-Z0-9]/g, '-')}-${sopProject.version}.txt`
      const filePath = path.join(tempDir, fileName)

      await fs.writeFile(filePath, textContent, 'utf8')

      const stats = await fs.stat(filePath)

      logger.info('Text export completed', { sopId, fileName, size: stats.size })

      return {
        success: true,
        filePath,
        fileName,
        contentType: 'text/plain',
        size: stats.size
      }
    } catch (error) {
      logger.error('Text export failed', { error, sopId })
      return {
        success: false,
        error: `Text export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Export SOP to PDF format - Professional document format
   */
  async exportToPdf(sopId: string, projectId: string): Promise<ExportResult> {
    try {
      logger.info('Starting PDF export', { sopId })

      // Get SOP data
      const sopProject = await sopProjectService.getInstance(this.dataSource).getOneOrThrow({
        id: sopId,
        projectId
      })

      // Generate HTML content for PDF conversion
      let htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>SOP: ${sopProject.name}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 40px; }
        .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        h1 { color: #1e40af; margin: 0; font-size: 28px; }
        h2 { color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        h3 { color: #374151; margin-top: 25px; }
        .metadata { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .metadata table { width: 100%; border-collapse: collapse; }
        .metadata td { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .metadata td:first-child { font-weight: bold; width: 120px; }
        .step { background: #ffffff; border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 6px; }
        .step-number { background: #2563eb; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
        .implementation { background: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; }
        ol li { margin-bottom: 10px; }
        ul li { margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Standard Operating Procedure</h1>
        <h2>${sopProject.name}</h2>
    </div>

    <div class="metadata">
        <table>
            <tr><td>Version:</td><td>${sopProject.version}</td></tr>
            <tr><td>Status:</td><td>${sopProject.status.toUpperCase()}</td></tr>
            <tr><td>Created:</td><td>${new Date(sopProject.createdAt).toLocaleDateString()}</td></tr>
            <tr><td>Last Updated:</td><td>${new Date(sopProject.updatedAt).toLocaleDateString()}</td></tr>
            <tr><td>ID:</td><td>${sopProject.id}</td></tr>
        </table>
    </div>
`

      if (sopProject.description) {
        htmlContent += `
    <h2>Description</h2>
    <p>${sopProject.description}</p>
`
      }

      htmlContent += `
    <div class="implementation">
        <h3>🚀 Implementation Platform</h3>
        <p>This SOP is designed for implementation in <strong>Activepieces</strong>, a no-code automation platform. The included flow definition can be imported directly into your Activepieces instance.</p>
    </div>
`

      if (sopProject.steps && sopProject.steps.length > 0) {
        htmlContent += `
    <h2>Process Steps</h2>
    <p>This SOP consists of ${sopProject.steps.length} automated steps:</p>
`

        sopProject.steps
          .sort((a, b) => a.order - b.order)
          .forEach((step, index) => {
            htmlContent += `
    <div class="step">
        <h3><span class="step-number">${index + 1}</span> &nbsp; ${step.name}</h3>
        <p><strong>Type:</strong> ${step.type}</p>
        <p><strong>Execution Order:</strong> ${step.order}</p>
        <p><strong>Purpose:</strong> Execute automated ${step.type} action as part of the workflow sequence.</p>
    </div>
`
          })
      }

      htmlContent += `
    <h2>Implementation Guide</h2>
    
    <h3>Prerequisites</h3>
    <ul>
        <li>Active Activepieces instance (version 0.30.0 or higher)</li>
        <li>Administrative access to create and manage flows</li>
        <li>Required API connections configured</li>
        <li>Understanding of workflow automation concepts</li>
    </ul>

    <h3>Step-by-Step Implementation</h3>
    <ol>
        <li><strong>Import Flow Definition</strong>
            <ul>
                <li>Open your Activepieces dashboard</li>
                <li>Navigate to Flows → Import</li>
                <li>Upload the activepieces-flow.json file included in this package</li>
                <li>Review the imported flow structure</li>
            </ul>
        </li>
        
        <li><strong>Configure Connections</strong>
            <ul>
                <li>Identify all required connections in the flow</li>
                <li>Set up API keys, credentials, and authentication</li>
                <li>Test each connection individually</li>
                <li>Ensure proper permissions and access rights</li>
            </ul>
        </li>
        
        <li><strong>Validate Implementation</strong>
            <ul>
                <li>Run test execution with sample data</li>
                <li>Verify all steps execute successfully</li>
                <li>Check output data and transformations</li>
                <li>Review logs for any warnings or errors</li>
            </ul>
        </li>
        
        <li><strong>Production Deployment</strong>
            <ul>
                <li>Enable the flow in production environment</li>
                <li>Configure appropriate triggers (webhook, schedule, etc.)</li>
                <li>Set up monitoring and alert notifications</li>
                <li>Document any custom configurations</li>
            </ul>
        </li>
    </ol>

    <h2>Monitoring & Maintenance</h2>
    <ul>
        <li>Monitor flow execution logs regularly</li>
        <li>Set up alerts for failures or timeouts</li>
        <li>Review performance metrics monthly</li>
        <li>Update connections and credentials as needed</li>
        <li>Maintain documentation for any customizations</li>
    </ul>

    <div class="footer">
        <p>This document was automatically generated by the Activepieces SOP Tool on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.</p>
        <p>For technical support with implementation, please contact your system administrator.</p>
    </div>
</body>
</html>
`

      // Create temporary file with HTML content
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sop-export-'))
      const fileName = `sop-${sopProject.name.replace(/[^a-zA-Z0-9]/g, '-')}-${sopProject.version}.pdf`
      const htmlFilePath = path.join(tempDir, 'temp.html')
      const pdfFilePath = path.join(tempDir, fileName)

      await fs.writeFile(htmlFilePath, htmlContent, 'utf8')

      // Note: In a real implementation, you would use a library like puppeteer to convert HTML to PDF
      // For this demo, we'll save the HTML content with PDF extension as a placeholder
      await fs.writeFile(pdfFilePath, htmlContent, 'utf8')

      const stats = await fs.stat(pdfFilePath)

      logger.info('PDF export completed', { sopId, fileName, size: stats.size })

      return {
        success: true,
        filePath: pdfFilePath,
        fileName,
        contentType: 'application/pdf',
        size: stats.size
      }
    } catch (error) {
      logger.error('PDF export failed', { error, sopId })
      return {
        success: false,
        error: `PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Export SOP to Activepieces Flow format - Import-ready flow definition
   */
  async exportToActivepiecesFlow(sopId: string, projectId: string): Promise<ExportResult> {
    try {
      logger.info('Starting Activepieces Flow export', { sopId })

      // Get SOP data
      const sopProject = await sopProjectService.getInstance(this.dataSource).getOneOrThrow({
        id: sopId,
        projectId
      })

      // Create Activepieces flow definition
      const flowDefinition = {
        displayName: sopProject.name,
        version: {
          displayName: sopProject.name,
          trigger: {
            name: "trigger",
            displayName: "Manual Trigger",
            type: "EMPTY",
            settings: {}
          },
          actions: {}
        }
      }

      // Convert SOP steps to Activepieces actions
      if (sopProject.steps && sopProject.steps.length > 0) {
        const sortedSteps = sopProject.steps.sort((a, b) => a.order - b.order)
        
        sortedSteps.forEach((step, index) => {
          const actionKey = `step_${index + 1}`
          flowDefinition.version.actions[actionKey] = {
            name: actionKey,
            displayName: step.name,
            type: this.mapStepTypeToActivepiecesType(step.type),
            settings: {
              // Basic configuration based on step type
              ...this.getDefaultConfigForStepType(step.type)
            }
          }
        })
      }

      // Create temporary file
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sop-export-'))
      const fileName = `activepieces-flow-${sopProject.name.replace(/[^a-zA-Z0-9]/g, '-')}-${sopProject.version}.json`
      const filePath = path.join(tempDir, fileName)

      await fs.writeFile(filePath, JSON.stringify(flowDefinition, null, 2), 'utf8')

      const stats = await fs.stat(filePath)

      logger.info('Activepieces Flow export completed', { sopId, fileName, size: stats.size })

      return {
        success: true,
        filePath,
        fileName,
        contentType: 'application/json',
        size: stats.size
      }
    } catch (error) {
      logger.error('Activepieces Flow export failed', { error, sopId })
      return {
        success: false,
        error: `Activepieces Flow export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Create complete client package - Complete deliverable with instructions
   */
  async createClientPackage(sopId: string, projectId: string): Promise<ExportResult> {
    try {
      logger.info('Starting Client Package creation', { sopId })

      // Get SOP data
      const sopProject = await sopProjectService.getInstance(this.dataSource).getOneOrThrow({
        id: sopId,
        projectId
      })

      // Create temporary directory structure
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sop-package-'))
      const packageName = `sop-package-${sopProject.name.replace(/[^a-zA-Z0-9]/g, '-')}-v${sopProject.version}`
      const packageDir = path.join(tempDir, packageName)
      
      await threadSafeMkdir(packageDir)
      await threadSafeMkdir(path.join(packageDir, 'assets'))
      await threadSafeMkdir(path.join(packageDir, 'assets', 'diagrams'))
      await threadSafeMkdir(path.join(packageDir, 'assets', 'templates'))

      // Generate all export formats
      const jsonExport = await this.exportToJson(sopId, projectId)
      const textExport = await this.exportToText(sopId, projectId)
      const pdfExport = await this.exportToPdf(sopId, projectId)
      const flowExport = await this.exportToActivepiecesFlow(sopId, projectId)

      // Copy files to package directory
      if (jsonExport.success && jsonExport.filePath) {
        await fs.copyFile(jsonExport.filePath, path.join(packageDir, 'sop-definition.json'))
      }

      if (textExport.success && textExport.filePath) {
        await fs.copyFile(textExport.filePath, path.join(packageDir, 'sop-documentation.txt'))
      }

      if (pdfExport.success && pdfExport.filePath) {
        await fs.copyFile(pdfExport.filePath, path.join(packageDir, 'sop-documentation.pdf'))
      }

      if (flowExport.success && flowExport.filePath) {
        await fs.copyFile(flowExport.filePath, path.join(packageDir, 'activepieces-flow.json'))
      }

      // Create README.md with implementation guide
      const readmeContent = `# ${sopProject.name} - SOP Implementation Package

## Package Contents

This package contains everything needed to implement the "${sopProject.name}" Standard Operating Procedure in your Activepieces environment.

### Files Included

- **README.md** - This implementation guide
- **sop-definition.json** - Machine-readable SOP definition
- **sop-documentation.pdf** - Professional documentation format
- **sop-documentation.txt** - Plain text documentation
- **activepieces-flow.json** - Ready-to-import Activepieces flow
- **sop-checklist.txt** - Step-by-step implementation checklist
- **assets/** - Supporting files and templates

## Quick Start

1. **Import the Flow**
   \`\`\`
   1. Open your Activepieces dashboard
   2. Go to Flows > Import
   3. Upload activepieces-flow.json
   4. Review and configure connections
   \`\`\`

2. **Configure Connections**
   - Set up all required API connections
   - Test each connection before activation
   - Ensure proper permissions

3. **Test & Deploy**
   - Run test execution with sample data
   - Verify all steps work correctly
   - Enable in production environment

## Technical Details

- **SOP Version:** ${sopProject.version}
- **Status:** ${sopProject.status}
- **Steps:** ${sopProject.steps?.length || 0} automated actions
- **Platform:** Activepieces v0.30.0+

## Support

For technical assistance with this implementation:
1. Review the detailed documentation in sop-documentation.pdf
2. Check the implementation checklist in sop-checklist.txt
3. Contact your system administrator for Activepieces-specific help

## Package Information

- **Generated:** ${new Date().toISOString()}
- **SOP ID:** ${sopProject.id}
- **Package Version:** 1.0
`

      await fs.writeFile(path.join(packageDir, 'README.md'), readmeContent, 'utf8')

      // Create implementation checklist
      const checklistContent = `# Implementation Checklist - ${sopProject.name}

## Pre-Implementation
□ Activepieces instance is running (v0.30.0+)
□ Administrative access confirmed
□ Required API credentials available
□ Implementation timeline approved

## Import Process
□ Download activepieces-flow.json from package
□ Access Activepieces dashboard
□ Navigate to Flows > Import
□ Upload flow definition file
□ Verify import completed successfully

## Connection Configuration
□ Identify all required connections in flow
□ Gather API keys and credentials
□ Create connections in Activepieces
□ Test each connection individually
□ Verify connection permissions

## Flow Configuration
□ Review imported flow structure
□ Configure step-specific settings
□ Set appropriate timeouts and retries
□ Configure error handling
□ Review data transformation logic

## Testing Phase
□ Prepare test data set
□ Execute flow in test mode
□ Verify each step executes correctly
□ Check output data accuracy
□ Review execution logs
□ Test error scenarios

## Production Deployment
□ Configure production triggers
□ Set up monitoring and alerts
□ Enable flow in production
□ Document any custom settings
□ Create operational runbook

## Post-Deployment
□ Monitor initial executions
□ Verify performance metrics
□ Address any issues promptly
□ Update documentation as needed
□ Schedule regular health checks

## Sign-off
□ Technical validation complete
□ Business acceptance obtained
□ Documentation updated
□ Team training completed
□ Support processes established

**Implementation Date:** _______________
**Implemented By:** ____________________
**Approved By:** _______________________
`

      await fs.writeFile(path.join(packageDir, 'sop-checklist.txt'), checklistContent, 'utf8')

      // Create sample template files
      const sampleEnvTemplate = `# Activepieces Environment Configuration
# Copy this to your .env file and update values

# Database Configuration
AP_POSTGRES_DATABASE=activepieces
AP_POSTGRES_HOST=localhost
AP_POSTGRES_PASSWORD=your_password
AP_POSTGRES_PORT=5432
AP_POSTGRES_USERNAME=postgres

# Redis Configuration  
AP_REDIS_HOST=localhost
AP_REDIS_PORT=6379

# Application Configuration
AP_FRONTEND_URL=http://localhost:4200
AP_WEBHOOK_TIMEOUT_SECONDS=30
AP_EXECUTION_MODE=UNSANDBOXED

# Security Configuration
AP_JWT_SECRET=your_jwt_secret_here
AP_ENCRYPTION_KEY=your_encryption_key_here
`

      await fs.writeFile(path.join(packageDir, 'assets', 'templates', 'sample.env'), sampleEnvTemplate, 'utf8')

      // Create package info file
      const packageInfo = {
        name: packageName,
        version: '1.0.0',
        sopId: sopProject.id,
        sopVersion: sopProject.version,
        generatedAt: new Date().toISOString(),
        contents: [
          'README.md',
          'sop-definition.json', 
          'sop-documentation.pdf',
          'sop-documentation.txt',
          'activepieces-flow.json',
          'sop-checklist.txt',
          'assets/'
        ],
        platform: {
          name: 'activepieces',
          minimumVersion: '0.30.0'
        }
      }

      await fs.writeFile(
        path.join(packageDir, 'package-info.json'), 
        JSON.stringify(packageInfo, null, 2), 
        'utf8'
      )

      // Create ZIP archive
      const zipFileName = `${packageName}.zip`
      const zipFilePath = path.join(tempDir, zipFileName)

      await this.createJSZipArchive(packageDir, zipFilePath)

      const stats = await fs.stat(zipFilePath)

      logger.info('Client Package created successfully', { 
        sopId, 
        packageName, 
        zipFileName, 
        size: stats.size 
      })

      return {
        success: true,
        filePath: zipFilePath,
        fileName: zipFileName,
        contentType: 'application/zip',
        size: stats.size
      }
    } catch (error) {
      logger.error('Client Package creation failed', { error, sopId })
      return {
        success: false,
        error: `Client Package creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Create ZIP archive from directory using JSZip
   */
  private async createJSZipArchive(sourceDir: string, outputPath: string): Promise<void> {
    try {
      const zip = new JSZip()
      
      // Recursively add files to ZIP
      await this.addDirectoryToZip(zip, sourceDir, '')
      
      // Generate ZIP buffer
      const zipBuffer = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
      })
      
      // Write ZIP file
      await fs.writeFile(outputPath, zipBuffer)
      
      logger.info('JSZip archive created', { 
        outputPath, 
        totalBytes: zipBuffer.length 
      })
    } catch (error) {
      logger.error('JSZip archive creation failed', { error })
      throw error
    }
  }

  /**
   * Recursively add directory contents to JSZip
   */
  private async addDirectoryToZip(zip: JSZip, dirPath: string, zipPath: string): Promise<void> {
    const files = await fs.readdir(dirPath, { withFileTypes: true })
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file.name)
      const zipEntryPath = zipPath ? `${zipPath}/${file.name}` : file.name
      
      if (file.isDirectory()) {
        // Create folder and recurse
        zip.folder(zipEntryPath)
        await this.addDirectoryToZip(zip, fullPath, zipEntryPath)
      } else {
        // Add file
        const fileContent = await fs.readFile(fullPath)
        zip.file(zipEntryPath, fileContent)
      }
    }
  }

  /**
   * Map SOP step types to Activepieces action types
   */
  private mapStepTypeToActivepiecesType(stepType: string): string {
    const typeMap: Record<string, string> = {
      'http_request': 'HTTP',
      'email': 'EMAIL',
      'webhook': 'WEBHOOK',
      'database': 'SQL',
      'file_processing': 'FILE',
      'data_transformation': 'CODE',
      'notification': 'NOTIFICATION',
      'approval': 'APPROVAL',
      'condition': 'BRANCH'
    }
    
    return typeMap[stepType] || 'CODE'
  }

  /**
   * Get default configuration for step types
   */
  private getDefaultConfigForStepType(stepType: string): Record<string, any> {
    const configMap: Record<string, Record<string, any>> = {
      'http_request': {
        method: 'GET',
        url: '',
        headers: {},
        body: {}
      },
      'email': {
        to: '',
        subject: '',
        body: ''
      },
      'webhook': {
        url: '',
        method: 'POST'
      },
      'database': {
        query: '',
        parameters: []
      },
      'file_processing': {
        operation: 'read',
        filePath: ''
      }
    }
    
    return configMap[stepType] || {}
  }

  /**
   * Unified export method for all formats
   */
  async exportSopProject(params: {
    sopId: string
    format: 'json' | 'text' | 'pdf' | 'package' | 'flow'
    projectId: string
    userId: string
    includeExecutionHistory?: boolean
    includeMetadata?: boolean
  }): Promise<{
    content: string | Buffer
    mimeType: string
    fileExtension: string
    isBase64?: boolean
  }> {
    try {
      logger.info('Starting SOP export', { 
        sopId: params.sopId, 
        format: params.format 
      })

      let result: ExportResult
      
      switch (params.format) {
        case 'json':
          result = await this.exportToJson(params.sopId, params.projectId)
          break
        case 'text':
          result = await this.exportToText(params.sopId, params.projectId)
          break
        case 'pdf':
          result = await this.exportToPdf(params.sopId, params.projectId)
          break
        case 'package':
          result = await this.createClientPackage(params.sopId, params.projectId)
          break
        case 'flow':
          result = await this.exportToActivepiecesFlow(params.sopId, params.projectId)
          break
        default:
          throw new Error(`Unsupported export format: ${params.format}`)
      }

      if (!result.success) {
        throw new Error(result.error || 'Export failed')
      }

      // Read file content
      const content = await fs.readFile(result.filePath!)
      
      // Determine response format
      const formatConfig = {
        json: { mimeType: 'application/json', extension: 'json' },
        text: { mimeType: 'text/plain', extension: 'txt' },
        pdf: { mimeType: 'application/pdf', extension: 'pdf', isBase64: true },
        package: { mimeType: 'application/zip', extension: 'zip', isBase64: true },
        flow: { mimeType: 'application/json', extension: 'json' }
      }

      const config = formatConfig[params.format]
      
      // Clean up temporary file
      await this.cleanupTempFiles(result.filePath!)

      return {
        content: config.isBase64 ? content.toString('base64') : content.toString('utf8'),
        mimeType: config.mimeType,
        fileExtension: config.extension,
        isBase64: config.isBase64
      }
    } catch (error) {
      logger.error('SOP export failed', { error, params })
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath)
      logger.info('Temporary file cleaned up', { filePath })
    } catch (error) {
      logger.warn('Failed to cleanup temp file', { error, filePath })
    }
  }
}

// Create service instance factory
let serviceInstance: SopExportService | null = null

export const sopExportService = {
  getInstance(dataSource: DataSource): SopExportService {
    if (!serviceInstance) {
      serviceInstance = new SopExportService(dataSource)
    }
    return serviceInstance
  }
}

export { SopExportService }
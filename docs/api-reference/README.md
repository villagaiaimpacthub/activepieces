# ActivePieces SOP Tool API Reference

The ActivePieces SOP Tool provides a comprehensive REST API for managing Standard Operating Procedures, templates, executions, and system administration.

## API Overview

- **Base URL**: `http://localhost:3000/api/v1` (development)
- **Authentication**: Bearer token (JWT)
- **Content Type**: `application/json`
- **API Version**: v1

## Authentication

### Obtaining Access Tokens

All API endpoints require authentication via JWT tokens.

```http
POST /api/v1/auth/sign-in
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "userpassword"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "user@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  },
  "expiresIn": 3600
}
```

### Using Access Tokens

Include the token in the Authorization header for all subsequent requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Core Endpoints

### Health Check

Check system health and availability.

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "cache": "healthy"
  }
}
```

## SOP Projects API

### List SOP Projects

```http
GET /api/v1/sop/projects
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `search` (string): Search in title and description
- `category` (string): Filter by category
- `status` (string): Filter by status (`active`, `completed`, `archived`)
- `assignedTo` (string): Filter by assigned user ID
- `sortBy` (string): Sort field (`createdAt`, `title`, `updatedAt`)
- `sortOrder` (string): Sort direction (`asc`, `desc`)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-here",
      "title": "Employee Onboarding - John Doe",
      "description": "Complete onboarding process for new hire",
      "category": "Onboarding",
      "status": "active",
      "priority": "medium",
      "createdBy": "uuid-creator",
      "assignedTo": "uuid-assignee",
      "dueDate": "2024-01-30T00:00:00Z",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T14:30:00Z",
      "progress": {
        "totalSteps": 8,
        "completedSteps": 3,
        "percentage": 37.5
      },
      "tags": ["onboarding", "hr", "new-hire"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Get SOP Project

```http
GET /api/v1/sop/projects/{projectId}
```

**Response:**
```json
{
  "id": "uuid-here",
  "title": "Employee Onboarding - John Doe",
  "description": "Complete onboarding process for new hire",
  "category": "Onboarding",
  "status": "active",
  "priority": "medium",
  "createdBy": {
    "id": "uuid-creator",
    "firstName": "Jane",
    "lastName": "Manager",
    "email": "jane@company.com"
  },
  "assignedTo": {
    "id": "uuid-assignee", 
    "firstName": "HR",
    "lastName": "Team",
    "email": "hr@company.com"
  },
  "dueDate": "2024-01-30T00:00:00Z",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T14:30:00Z",
  "steps": [
    {
      "id": "uuid-step",
      "title": "Prepare workspace",
      "description": "Set up desk, computer, and access cards",
      "order": 1,
      "status": "completed",
      "assignedTo": "uuid-facilities",
      "completedAt": "2024-01-16T09:30:00Z",
      "notes": "Workspace prepared in Building A, Floor 3",
      "attachments": []
    }
  ],
  "metadata": {
    "source": "template",
    "templateId": "uuid-template",
    "customFields": {}
  }
}
```

### Create SOP Project

```http
POST /api/v1/sop/projects
Content-Type: application/json

{
  "title": "Customer Onboarding - ACME Corp",
  "description": "Onboard new enterprise customer",
  "category": "Customer Success",
  "priority": "high",
  "dueDate": "2024-02-15T00:00:00Z",
  "assignedTo": "uuid-team-lead",
  "templateId": "uuid-template",
  "tags": ["customer-success", "enterprise"],
  "customFields": {
    "customerTier": "enterprise",
    "accountManager": "John Smith"
  }
}
```

**Response:**
```json
{
  "id": "uuid-new-project",
  "title": "Customer Onboarding - ACME Corp",
  "status": "active",
  "createdAt": "2024-01-15T15:00:00Z",
  "steps": [
    {
      "id": "uuid-step-1",
      "title": "Initial customer contact",
      "order": 1,
      "status": "pending"
    }
  ]
}
```

### Update SOP Project

```http
PATCH /api/v1/sop/projects/{projectId}
Content-Type: application/json

{
  "title": "Updated Project Title",
  "description": "Updated description",
  "priority": "low",
  "assignedTo": "uuid-new-assignee",
  "dueDate": "2024-02-28T00:00:00Z",
  "tags": ["updated-tag"],
  "metadata": {
    "customFields": {
      "department": "Sales"
    }
  }
}
```

### Delete SOP Project

```http
DELETE /api/v1/sop/projects/{projectId}
```

**Response:**
```json
{
  "message": "SOP project deleted successfully",
  "deletedAt": "2024-01-15T16:00:00Z"
}
```

## SOP Steps API

### Get Project Steps

```http
GET /api/v1/sop/projects/{projectId}/steps
```

**Query Parameters:**
- `status` (string): Filter by step status
- `assignedTo` (string): Filter by assigned user

### Update Step

```http
PATCH /api/v1/sop/projects/{projectId}/steps/{stepId}
Content-Type: application/json

{
  "status": "completed",
  "notes": "Task completed successfully",
  "completedAt": "2024-01-15T16:30:00Z",
  "timeSpent": 120,
  "attachments": [
    {
      "name": "completion-report.pdf",
      "url": "/uploads/sop/uuid-file.pdf",
      "size": 1048576,
      "type": "application/pdf"
    }
  ]
}
```

### Add Step Comment

```http
POST /api/v1/sop/projects/{projectId}/steps/{stepId}/comments
Content-Type: application/json

{
  "content": "This step needs clarification on the approval process",
  "mentions": ["uuid-supervisor"]
}
```

## Templates API

### List Templates

```http
GET /api/v1/sop/templates
```

**Query Parameters:**
- `category` (string): Filter by template category
- `search` (string): Search in title and description
- `isPublic` (boolean): Filter by public/private templates
- `createdBy` (string): Filter by creator
- `tags` (string): Filter by tags (comma-separated)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-template",
      "title": "Employee Onboarding Template",
      "description": "Standard template for onboarding new employees",
      "category": "Onboarding",
      "isPublic": true,
      "createdBy": {
        "id": "uuid-creator",
        "firstName": "HR",
        "lastName": "Team"
      },
      "usageCount": 45,
      "avgCompletionTime": 5.2,
      "successRate": 94.5,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-10T10:00:00Z",
      "tags": ["onboarding", "hr", "standard"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15
  }
}
```

### Get Template

```http
GET /api/v1/sop/templates/{templateId}
```

**Response:**
```json
{
  "id": "uuid-template",
  "title": "Employee Onboarding Template",
  "description": "Standard template for onboarding new employees",
  "category": "Onboarding",
  "isPublic": true,
  "steps": [
    {
      "id": "uuid-template-step",
      "title": "Prepare workspace",
      "description": "Set up desk, computer, and access cards for new employee",
      "order": 1,
      "estimatedDuration": 60,
      "assigneeRole": "facilities",
      "prerequisites": [],
      "outputs": [
        "Workspace ready",
        "Equipment assigned",
        "Access cards prepared"
      ],
      "attachments": [
        {
          "name": "workspace-checklist.pdf",
          "url": "/templates/attachments/checklist.pdf"
        }
      ]
    }
  ],
  "metadata": {
    "estimatedTotalDuration": 480,
    "requiredRoles": ["hr", "facilities", "it"],
    "complianceRequirements": ["SOX", "GDPR"],
    "version": "1.2",
    "lastReviewed": "2024-01-10T00:00:00Z"
  }
}
```

### Create Template

```http
POST /api/v1/sop/templates
Content-Type: application/json

{
  "title": "IT Security Incident Response",
  "description": "Template for handling security incidents",
  "category": "Security",
  "isPublic": false,
  "tags": ["security", "incident", "response"],
  "steps": [
    {
      "title": "Initial assessment",
      "description": "Assess the scope and severity of the security incident",
      "order": 1,
      "estimatedDuration": 30,
      "assigneeRole": "security_analyst",
      "prerequisites": ["Access to security tools"],
      "outputs": ["Incident severity classification"]
    }
  ],
  "metadata": {
    "requiredRoles": ["security_analyst", "incident_manager"],
    "complianceRequirements": ["SOX", "HIPAA"]
  }
}
```

## Executions API

### List Executions

```http
GET /api/v1/sop/executions
```

**Query Parameters:**
- `projectId` (string): Filter by project
- `status` (string): Filter by execution status
- `executorId` (string): Filter by executor
- `startDate` (string): Filter by start date (ISO 8601)
- `endDate` (string): Filter by end date (ISO 8601)

### Get Execution Details

```http
GET /api/v1/sop/executions/{executionId}
```

**Response:**
```json
{
  "id": "uuid-execution",
  "projectId": "uuid-project",
  "status": "completed",
  "startedAt": "2024-01-15T09:00:00Z",
  "completedAt": "2024-01-16T14:30:00Z",
  "executor": {
    "id": "uuid-executor",
    "firstName": "John",
    "lastName": "Doe"
  },
  "totalSteps": 8,
  "completedSteps": 8,
  "failedSteps": 0,
  "totalDuration": 1770,
  "stepExecutions": [
    {
      "stepId": "uuid-step",
      "status": "completed",
      "startedAt": "2024-01-15T09:00:00Z",
      "completedAt": "2024-01-15T09:45:00Z",
      "duration": 45,
      "notes": "Completed without issues"
    }
  ]
}
```

## Analytics API

### Project Analytics

```http
GET /api/v1/sop/analytics/projects
```

**Query Parameters:**
- `startDate` (string): Analysis period start
- `endDate` (string): Analysis period end
- `groupBy` (string): Group results by (`day`, `week`, `month`)
- `category` (string): Filter by category

**Response:**
```json
{
  "summary": {
    "totalProjects": 145,
    "completedProjects": 132,
    "activeProjects": 13,
    "overdueProjects": 3,
    "avgCompletionTime": 4.2,
    "successRate": 91.0
  },
  "trends": [
    {
      "date": "2024-01-01",
      "completed": 12,
      "created": 15,
      "avgDuration": 4.5
    }
  ],
  "categoryBreakdown": {
    "Onboarding": {
      "count": 45,
      "successRate": 95.5,
      "avgDuration": 5.2
    }
  }
}
```

### Template Analytics

```http
GET /api/v1/sop/analytics/templates/{templateId}
```

**Response:**
```json
{
  "templateId": "uuid-template",
  "usageStats": {
    "totalUsages": 67,
    "successfulCompletions": 63,
    "failedExecutions": 4,
    "successRate": 94.0,
    "avgCompletionTime": 4.8
  },
  "stepAnalytics": [
    {
      "stepOrder": 1,
      "title": "Initial setup",
      "avgDuration": 45,
      "failureRate": 2.1,
      "commonIssues": ["Missing prerequisites", "Access problems"]
    }
  ],
  "trends": {
    "last30Days": {
      "usages": 15,
      "successRate": 93.3
    }
  }
}
```

## User Management API

### List Users

```http
GET /api/v1/users
```

**Query Parameters:**
- `role` (string): Filter by user role
- `status` (string): Filter by status (`active`, `inactive`)
- `search` (string): Search by name or email

### Create User

```http
POST /api/v1/users
Content-Type: application/json

{
  "email": "newuser@company.com",
  "firstName": "New",
  "lastName": "User",
  "role": "USER",
  "password": "SecurePassword123!",
  "department": "Marketing",
  "permissions": ["sop:read", "sop:execute"]
}
```

### Update User

```http
PATCH /api/v1/users/{userId}
Content-Type: application/json

{
  "role": "ADMIN",
  "department": "IT",
  "permissions": ["sop:read", "sop:write", "sop:execute", "sop:admin"]
}
```

## File Upload API

### Upload File

```http
POST /api/v1/uploads/sop
Content-Type: multipart/form-data

{
  "file": (binary data),
  "projectId": "uuid-project",
  "stepId": "uuid-step" // optional
}
```

**Response:**
```json
{
  "id": "uuid-file",
  "filename": "document.pdf",
  "originalName": "Project Document.pdf",
  "size": 2048576,
  "mimeType": "application/pdf",
  "url": "/uploads/sop/uuid-file.pdf",
  "uploadedAt": "2024-01-15T10:30:00Z"
}
```

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "uuid-request"
  }
}
```

### Common Error Codes

- `400 BAD_REQUEST`: Invalid request data
- `401 UNAUTHORIZED`: Missing or invalid authentication
- `403 FORBIDDEN`: Insufficient permissions
- `404 NOT_FOUND`: Resource not found
- `409 CONFLICT`: Resource already exists or conflict
- `422 VALIDATION_ERROR`: Input validation failed
- `429 RATE_LIMITED`: Too many requests
- `500 INTERNAL_ERROR`: Server error

## Rate Limiting

API requests are limited to prevent abuse:
- **Standard Users**: 100 requests per 15 minutes
- **Admin Users**: 500 requests per 15 minutes
- **System Integration**: 1000 requests per 15 minutes

Rate limit information is included in response headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642251600
```

## SDKs and Integration

### JavaScript/TypeScript SDK

```bash
npm install @activepieces/sop-tool-sdk
```

```typescript
import { SOPClient } from '@activepieces/sop-tool-sdk';

const client = new SOPClient({
  baseURL: 'http://localhost:3000',
  token: 'your-jwt-token'
});

// List projects
const projects = await client.projects.list({
  page: 1,
  limit: 20,
  category: 'Onboarding'
});

// Create project from template
const newProject = await client.projects.create({
  title: 'New Employee Onboarding',
  templateId: 'template-uuid',
  assignedTo: 'user-uuid'
});
```

### Webhook Integration

Register webhooks to receive real-time notifications:

```http
POST /api/v1/webhooks
Content-Type: application/json

{
  "url": "https://your-system.com/webhook",
  "events": [
    "sop.project.created",
    "sop.project.completed", 
    "sop.step.completed",
    "sop.execution.failed"
  ],
  "secret": "webhook-secret-key"
}
```

## API Changelog

### Version 1.0.0 (Current)
- Initial API release
- Core SOP management endpoints
- Template system
- User management
- Analytics and reporting
- File upload functionality

For detailed integration examples and advanced usage, see the [Integration Guide](../developer-guide/integrations.md).
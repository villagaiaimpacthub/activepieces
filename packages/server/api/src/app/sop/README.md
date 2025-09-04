# SOP REST API Controllers

## Overview

This module provides comprehensive REST API controllers for Standard Operating Procedure (SOP) management within the Activepieces platform. It follows Activepieces architectural patterns and provides full CRUD operations for SOP functionality.

## Architecture

```
packages/server/api/src/app/sop/
├── controller/
│   ├── sop-project.controller.ts    # SOP project management
│   ├── sop-template.controller.ts   # Template CRUD operations  
│   ├── sop-execution.controller.ts  # Execution management
│   └── index.ts
├── dto/
│   ├── sop-project.dto.ts          # Request/response types for projects
│   ├── sop-template.dto.ts         # Request/response types for templates
│   ├── sop-execution.dto.ts        # Request/response types for executions
│   └── index.ts
├── service/
│   ├── sop-project.service.ts      # Business logic for projects
│   ├── sop-template.service.ts     # Business logic for templates
│   ├── sop-execution.service.ts    # Business logic for executions
│   └── index.ts
├── sop.module.ts                   # Main Fastify module
├── index.ts                        # Module exports
└── README.md                       # This file
```

## API Endpoints

### SOP Projects
- `GET /v1/sop/projects` - List SOP projects
- `POST /v1/sop/projects` - Create new SOP project
- `GET /v1/sop/projects/:id` - Get SOP project by ID
- `PUT /v1/sop/projects/:id` - Update SOP project
- `DELETE /v1/sop/projects/:id` - Delete SOP project
- `POST /v1/sop/projects/:id/execute` - Execute SOP project

### SOP Templates  
- `GET /v1/sop/templates` - List SOP templates
- `POST /v1/sop/templates` - Create new SOP template
- `GET /v1/sop/templates/:id` - Get SOP template by ID
- `PUT /v1/sop/templates/:id` - Update SOP template
- `DELETE /v1/sop/templates/:id` - Delete SOP template
- `POST /v1/sop/templates/:id/import` - Import template to project
- `GET /v1/sop/templates/:id/stats` - Get template usage statistics

### SOP Executions
- `GET /v1/sop/executions` - List SOP executions
- `POST /v1/sop/executions` - Create new SOP execution
- `GET /v1/sop/executions/:id` - Get SOP execution by ID
- `PUT /v1/sop/executions/:id` - Update SOP execution
- `POST /v1/sop/executions/:id/cancel` - Cancel SOP execution
- `POST /v1/sop/executions/:id/retry` - Retry failed SOP execution
- `GET /v1/sop/executions/:id/logs` - Get execution logs
- `GET /v1/sop/executions/stats` - Get execution statistics

## Integration

To integrate the SOP module into the main Activepieces application, add the following to `packages/server/api/src/app/app.ts`:

```typescript
import { sopModule } from './sop/sop.module'

export const setupApp = async (app: FastifyInstance): Promise<FastifyInstance> => {
  // ... existing setup code ...
  
  // Register SOP module
  await app.register(sopModule)
  
  // ... rest of setup code ...
}
```

## Features

### Authentication & Authorization
- Integrates with Activepieces authentication middleware
- Uses existing permission system (`Permission.READ_FLOW`, `Permission.WRITE_FLOW`)
- Supports both `USER` and `SERVICE` principal types

### Request/Response Validation
- Full TypeScript type safety with TypeBox schemas
- Automatic request validation
- Structured error responses

### OpenAPI Documentation
- All endpoints automatically documented via Swagger
- Proper HTTP status codes
- Tagged endpoints for organization

### Error Handling  
- Integrates with Activepieces error handling middleware
- Consistent error response format
- Proper HTTP status codes

### Pagination
- Uses Activepieces pagination patterns
- Cursor-based pagination support
- Configurable page sizes

## Service Layer

The service layer is currently stubbed with placeholder implementations. Each service throws `Error` messages indicating "not implemented" to clearly show what needs to be completed in the next phase.

### Next Steps for Service Implementation:
1. Connect to database entities created in B1.1
2. Implement actual CRUD operations
3. Add business logic validation
4. Integrate with execution engine
5. Add audit logging

## Type Safety

All request/response types are fully typed using TypeBox schemas that compile to both TypeScript types and JSON Schema for validation:

```typescript
// Example usage
import { CreateSopProjectRequest, SopProject } from './dto/sop-project.dto'

// Type-safe request handling
const request: CreateSopProjectRequest = {
  name: "My SOP Project",
  description: "Project description",
  status: "draft"
}

// Type-safe response
const response: SopProject = await sopProjectService.create({ projectId, request })
```

## Testing

Controllers are designed for easy testing:
- Service layer is dependency-injected
- Pure functions where possible
- Mockable service interfaces
- Standard HTTP contract testing

## Performance Considerations

- Pagination implemented for all list endpoints
- Query filtering to reduce data transfer
- Cursor-based pagination for efficient large dataset handling
- Optional relationship loading (e.g., includeSteps parameter)

## Security

- All endpoints require authentication
- Project-scoped data access
- Permission-based authorization
- Input validation on all endpoints
- Rate limiting through existing middleware

## Monitoring & Observability

- Structured logging through Fastify logger
- Request/response tracing with request IDs
- Error tracking integration
- Performance metrics via existing middleware
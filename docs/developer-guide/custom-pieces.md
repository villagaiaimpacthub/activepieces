# Custom Piece Development

This guide covers developing custom ActivePieces pieces for the SOP Tool, enabling you to extend functionality with custom actions, triggers, and integrations.

## Overview

ActivePieces pieces are modular components that provide:
- **Actions**: Operations that perform tasks (e.g., send email, create ticket)
- **Triggers**: Events that start workflows (e.g., new SOP created, step completed)
- **Configuration**: Properties and settings for customization

## SOP Framework Architecture

### Core SOP Pieces

The SOP Tool includes two primary piece packages:

1. **`sop-framework`**: Core SOP management functionality
2. **`sop-approval-gate`**: Approval workflow components

### Directory Structure

```
packages/pieces/community/
├── sop-framework/
│   ├── src/
│   │   ├── index.ts                # Main piece export
│   │   ├── lib/
│   │   │   ├── common/            # Shared utilities
│   │   │   ├── actions/           # SOP actions
│   │   │   └── triggers/          # SOP triggers
│   │   └── package.json
│   └── README.md
├── sop-approval-gate/
│   ├── src/
│   │   ├── index.ts
│   │   ├── lib/
│   │   │   ├── actions/
│   │   │   └── triggers/
│   │   └── package.json
│   └── README.md
└── your-custom-piece/              # Your custom piece
```

## Creating a Custom SOP Piece

### 1. Initialize New Piece

```bash
# Navigate to pieces directory
cd packages/pieces/community

# Create new piece directory
mkdir sop-custom-integration
cd sop-custom-integration

# Initialize package.json
npm init -y
```

### 2. Basic Package Configuration

**package.json**:
```json
{
  "name": "@activepieces/piece-sop-custom-integration",
  "version": "0.1.0",
  "description": "Custom SOP integration piece",
  "main": "src/index.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@activepieces/pieces-framework": "^0.20.0",
    "@activepieces/shared": "^0.20.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  },
  "files": ["src"]
}
```

### 3. TypeScript Configuration

**tsconfig.json**:
```json
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 4. Main Piece Definition

**src/index.ts**:
```typescript
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { PieceCategory } from "@activepieces/shared";

// Import actions and triggers
import { createSOPProject } from "./lib/actions/create-sop-project";
import { updateSOPStep } from "./lib/actions/update-sop-step";
import { sopProjectCompleted } from "./lib/triggers/sop-project-completed";

export const sopCustomIntegration = createPiece({
  displayName: "SOP Custom Integration",
  description: "Custom integration for SOP Tool",
  
  auth: PieceAuth.SecretText({
    displayName: "API Key",
    description: "Enter your API key for authentication",
    required: true,
  }),

  minimumSupportedRelease: "0.20.0",
  logoUrl: "https://your-domain.com/logo.png",
  categories: [PieceCategory.PRODUCTIVITY],
  
  authors: ["Your Name"],
  
  actions: [
    createSOPProject,
    updateSOPStep,
  ],
  
  triggers: [
    sopProjectCompleted,
  ],
});
```

## Developing Actions

### Basic Action Structure

**src/lib/actions/create-sop-project.ts**:
```typescript
import { createAction, Property } from "@activepieces/pieces-framework";
import { sopCustomIntegration } from "../../index";
import { httpClient, HttpMethod } from "@activepieces/pieces-common";

export const createSOPProject = createAction({
  auth: sopCustomIntegration.auth,
  name: "create_sop_project",
  displayName: "Create SOP Project",
  description: "Creates a new SOP project from a template",
  
  props: {
    title: Property.ShortText({
      displayName: "Project Title",
      description: "Title for the new SOP project",
      required: true,
    }),
    
    description: Property.LongText({
      displayName: "Description",
      description: "Detailed description of the SOP project",
      required: false,
    }),
    
    templateId: Property.Dropdown({
      displayName: "Template",
      description: "Select an SOP template",
      required: true,
      refreshers: [], // Will be populated dynamically
      options: async ({ auth }) => {
        // Fetch templates from API
        const response = await httpClient.sendRequest({
          method: HttpMethod.GET,
          url: `${getBaseUrl()}/api/v1/sop/templates`,
          headers: {
            Authorization: `Bearer ${auth}`,
          },
        });
        
        return {
          options: response.body.data.map((template: any) => ({
            label: template.title,
            value: template.id,
          })),
        };
      },
    }),
    
    assignedTo: Property.Dropdown({
      displayName: "Assigned To",
      description: "User to assign this SOP project",
      required: false,
      refreshers: [],
      options: async ({ auth }) => {
        const response = await httpClient.sendRequest({
          method: HttpMethod.GET,
          url: `${getBaseUrl()}/api/v1/users`,
          headers: {
            Authorization: `Bearer ${auth}`,
          },
        });
        
        return {
          options: response.body.data.map((user: any) => ({
            label: `${user.firstName} ${user.lastName}`,
            value: user.id,
          })),
        };
      },
    }),
    
    dueDate: Property.DateTime({
      displayName: "Due Date",
      description: "When this SOP should be completed",
      required: false,
    }),
    
    priority: Property.StaticDropdown({
      displayName: "Priority",
      description: "Priority level for this SOP",
      required: false,
      defaultValue: "medium",
      options: {
        options: [
          { label: "Low", value: "low" },
          { label: "Medium", value: "medium" },
          { label: "High", value: "high" },
          { label: "Critical", value: "critical" },
        ],
      },
    }),
    
    customFields: Property.Object({
      displayName: "Custom Fields",
      description: "Additional metadata for the SOP project",
      required: false,
    }),
  },

  async run(context) {
    const { auth, propsValue } = context;
    
    // Prepare request payload
    const payload = {
      title: propsValue.title,
      description: propsValue.description,
      templateId: propsValue.templateId,
      assignedTo: propsValue.assignedTo,
      dueDate: propsValue.dueDate,
      priority: propsValue.priority || "medium",
      customFields: propsValue.customFields || {},
    };

    // Make API request
    const response = await httpClient.sendRequest({
      method: HttpMethod.POST,
      url: `${getBaseUrl()}/api/v1/sop/projects`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth}`,
      },
      body: payload,
    });

    return {
      success: true,
      projectId: response.body.id,
      project: response.body,
    };
  },
});

// Helper function to get base URL
function getBaseUrl(): string {
  return process.env.SOP_API_BASE_URL || "http://localhost:3000";
}
```

### Advanced Action Examples

#### File Upload Action

**src/lib/actions/upload-file.ts**:
```typescript
import { createAction, Property } from "@activepieces/pieces-framework";
import { sopCustomIntegration } from "../../index";
import { httpClient, HttpMethod } from "@activepieces/pieces-common";

export const uploadFile = createAction({
  auth: sopCustomIntegration.auth,
  name: "upload_file",
  displayName: "Upload File",
  description: "Upload a file to an SOP project step",
  
  props: {
    projectId: Property.ShortText({
      displayName: "Project ID",
      description: "SOP Project ID",
      required: true,
    }),
    
    stepId: Property.ShortText({
      displayName: "Step ID", 
      description: "SOP Step ID (optional)",
      required: false,
    }),
    
    file: Property.File({
      displayName: "File",
      description: "File to upload",
      required: true,
    }),
    
    description: Property.LongText({
      displayName: "File Description",
      description: "Description of the file",
      required: false,
    }),
  },

  async run(context) {
    const { auth, propsValue } = context;
    
    // Create form data
    const formData = new FormData();
    formData.append('file', propsValue.file.data, propsValue.file.filename);
    formData.append('projectId', propsValue.projectId);
    
    if (propsValue.stepId) {
      formData.append('stepId', propsValue.stepId);
    }
    
    if (propsValue.description) {
      formData.append('description', propsValue.description);
    }

    const response = await httpClient.sendRequest({
      method: HttpMethod.POST,
      url: `${getBaseUrl()}/api/v1/uploads/sop`,
      headers: {
        Authorization: `Bearer ${auth}`,
      },
      body: formData,
    });

    return {
      success: true,
      fileId: response.body.id,
      fileUrl: response.body.url,
      file: response.body,
    };
  },
});
```

#### Batch Update Action

**src/lib/actions/batch-update-steps.ts**:
```typescript
import { createAction, Property } from "@activepieces/pieces-framework";
import { sopCustomIntegration } from "../../index";

export const batchUpdateSteps = createAction({
  auth: sopCustomIntegration.auth,
  name: "batch_update_steps",
  displayName: "Batch Update Steps",
  description: "Update multiple SOP steps at once",
  
  props: {
    projectId: Property.ShortText({
      displayName: "Project ID",
      required: true,
    }),
    
    updates: Property.Array({
      displayName: "Step Updates",
      description: "Array of step updates to apply",
      required: true,
      properties: {
        stepId: Property.ShortText({
          displayName: "Step ID",
          required: true,
        }),
        status: Property.StaticDropdown({
          displayName: "Status",
          required: false,
          options: {
            options: [
              { label: "Pending", value: "pending" },
              { label: "In Progress", value: "in_progress" },
              { label: "Completed", value: "completed" },
              { label: "Blocked", value: "blocked" },
            ],
          },
        }),
        notes: Property.LongText({
          displayName: "Notes",
          required: false,
        }),
      },
    }),
  },

  async run(context) {
    const { auth, propsValue } = context;
    const results = [];

    for (const update of propsValue.updates) {
      try {
        const response = await httpClient.sendRequest({
          method: HttpMethod.PATCH,
          url: `${getBaseUrl()}/api/v1/sop/projects/${propsValue.projectId}/steps/${update.stepId}`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth}`,
          },
          body: {
            status: update.status,
            notes: update.notes,
          },
        });
        
        results.push({
          stepId: update.stepId,
          success: true,
          result: response.body,
        });
      } catch (error) {
        results.push({
          stepId: update.stepId,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      totalUpdates: propsValue.updates.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  },
});
```

## Developing Triggers

### Basic Trigger Structure

**src/lib/triggers/sop-project-completed.ts**:
```typescript
import { createTrigger, TriggerStrategy } from "@activepieces/pieces-framework";
import { sopCustomIntegration } from "../../index";
import { httpClient, HttpMethod } from "@activepieces/pieces-common";

export const sopProjectCompleted = createTrigger({
  auth: sopCustomIntegration.auth,
  name: "sop_project_completed",
  displayName: "SOP Project Completed",
  description: "Triggers when an SOP project is completed",
  
  type: TriggerStrategy.WEBHOOK,
  
  props: {
    category: Property.StaticDropdown({
      displayName: "Category Filter",
      description: "Only trigger for specific categories (optional)",
      required: false,
      options: {
        options: [
          { label: "All Categories", value: "" },
          { label: "Onboarding", value: "Onboarding" },
          { label: "IT", value: "IT" },
          { label: "Finance", value: "Finance" },
          { label: "HR", value: "HR" },
        ],
      },
    }),
  },

  async onEnable(context) {
    const { auth, webhookUrl, propsValue } = context;
    
    // Register webhook with SOP API
    const response = await httpClient.sendRequest({
      method: HttpMethod.POST,
      url: `${getBaseUrl()}/api/v1/webhooks`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth}`,
      },
      body: {
        url: webhookUrl,
        events: ["sop.project.completed"],
        filters: {
          category: propsValue.category || null,
        },
      },
    });

    // Store webhook ID for cleanup
    return {
      webhookId: response.body.id,
    };
  },

  async onDisable(context) {
    const { auth, webhookId } = context;
    
    if (webhookId) {
      // Unregister webhook
      await httpClient.sendRequest({
        method: HttpMethod.DELETE,
        url: `${getBaseUrl()}/api/v1/webhooks/${webhookId}`,
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      });
    }
  },

  async run(context) {
    const { body } = context;
    
    // Validate webhook payload
    if (!body || body.event !== "sop.project.completed") {
      return [];
    }

    return [
      {
        projectId: body.data.projectId,
        title: body.data.title,
        category: body.data.category,
        completedAt: body.data.completedAt,
        duration: body.data.duration,
        executor: body.data.executor,
        stepsCompleted: body.data.stepsCompleted,
        successRate: body.data.successRate,
      },
    ];
  },
});
```

### Polling Trigger

**src/lib/triggers/overdue-steps.ts**:
```typescript
import { createTrigger, TriggerStrategy } from "@activepieces/pieces-framework";
import { sopCustomIntegration } from "../../index";

export const overdueSteps = createTrigger({
  auth: sopCustomIntegration.auth,
  name: "overdue_steps",
  displayName: "Overdue Steps",
  description: "Triggers for SOP steps that are overdue",
  
  type: TriggerStrategy.POLLING,
  
  props: {
    assignedTo: Property.Dropdown({
      displayName: "Assigned To",
      description: "Filter by assigned user (optional)",
      required: false,
      refreshers: [],
      options: async ({ auth }) => {
        const response = await httpClient.sendRequest({
          method: HttpMethod.GET,
          url: `${getBaseUrl()}/api/v1/users`,
          headers: {
            Authorization: `Bearer ${auth}`,
          },
        });
        
        return {
          options: response.body.data.map((user: any) => ({
            label: `${user.firstName} ${user.lastName}`,
            value: user.id,
          })),
        };
      },
    }),
    
    overdueHours: Property.Number({
      displayName: "Overdue Hours",
      description: "Consider steps overdue after this many hours past due date",
      required: false,
      defaultValue: 24,
    }),
  },

  async onEnable(context) {
    // Setup any required initialization
    return {};
  },

  async onDisable(context) {
    // Cleanup resources if needed
  },

  async run(context) {
    const { auth, propsValue, store } = context;
    
    // Get last check timestamp
    const lastCheck = await store.get("last_check") || new Date(0).toISOString();
    const currentCheck = new Date().toISOString();
    
    // Query for overdue steps
    const params = new URLSearchParams({
      status: "pending,in_progress",
      overdue: "true",
      overdueHours: propsValue.overdueHours?.toString() || "24",
      updatedAfter: lastCheck,
    });
    
    if (propsValue.assignedTo) {
      params.append("assignedTo", propsValue.assignedTo);
    }

    const response = await httpClient.sendRequest({
      method: HttpMethod.GET,
      url: `${getBaseUrl()}/api/v1/sop/steps/overdue?${params.toString()}`,
      headers: {
        Authorization: `Bearer ${auth}`,
      },
    });

    // Store current check timestamp
    await store.put("last_check", currentCheck);
    
    // Return new overdue steps
    return response.body.data.map((step: any) => ({
      stepId: step.id,
      projectId: step.projectId,
      projectTitle: step.project.title,
      stepTitle: step.title,
      assignedTo: step.assignedTo,
      dueDate: step.dueDate,
      overdueHours: step.overdueHours,
    }));
  },
});
```

## Utility Functions and Common Patterns

### Authentication Helper

**src/lib/common/auth.ts**:
```typescript
import { httpClient, HttpMethod } from "@activepieces/pieces-common";

export class SOPApiClient {
  constructor(private auth: string, private baseUrl: string = getBaseUrl()) {}

  async request(method: HttpMethod, endpoint: string, body?: any) {
    return httpClient.sendRequest({
      method,
      url: `${this.baseUrl}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.auth}`,
      },
      body,
    });
  }

  // Project methods
  async getProject(projectId: string) {
    return this.request(HttpMethod.GET, `/api/v1/sop/projects/${projectId}`);
  }

  async updateProject(projectId: string, updates: any) {
    return this.request(HttpMethod.PATCH, `/api/v1/sop/projects/${projectId}`, updates);
  }

  // Step methods
  async getStep(projectId: string, stepId: string) {
    return this.request(HttpMethod.GET, `/api/v1/sop/projects/${projectId}/steps/${stepId}`);
  }

  async updateStep(projectId: string, stepId: string, updates: any) {
    return this.request(HttpMethod.PATCH, `/api/v1/sop/projects/${projectId}/steps/${stepId}`, updates);
  }

  // Template methods
  async getTemplates(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    return this.request(HttpMethod.GET, `/api/v1/sop/templates${params ? '?' + params : ''}`);
  }
}

function getBaseUrl(): string {
  return process.env.SOP_API_BASE_URL || "http://localhost:3000";
}
```

### Validation Helper

**src/lib/common/validation.ts**:
```typescript
export function validateSOPProject(project: any): string[] {
  const errors: string[] = [];
  
  if (!project.title || project.title.trim().length === 0) {
    errors.push("Project title is required");
  }
  
  if (project.title && project.title.length > 255) {
    errors.push("Project title must be 255 characters or less");
  }
  
  if (project.dueDate && new Date(project.dueDate) < new Date()) {
    errors.push("Due date cannot be in the past");
  }
  
  if (project.priority && !['low', 'medium', 'high', 'critical'].includes(project.priority)) {
    errors.push("Priority must be one of: low, medium, high, critical");
  }
  
  return errors;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
}
```

## Testing Custom Pieces

### Unit Testing

**src/lib/actions/__tests__/create-sop-project.test.ts**:
```typescript
import { createSOPProject } from "../create-sop-project";
import { httpClient } from "@activepieces/pieces-common";

// Mock HTTP client
jest.mock("@activepieces/pieces-common");

describe("Create SOP Project Action", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should create SOP project successfully", async () => {
    const mockResponse = {
      body: {
        id: "test-project-id",
        title: "Test Project",
        status: "active",
      },
    };

    (httpClient.sendRequest as jest.Mock).mockResolvedValue(mockResponse);

    const context = {
      auth: "test-token",
      propsValue: {
        title: "Test Project",
        description: "Test Description", 
        templateId: "template-123",
        priority: "medium",
      },
    };

    const result = await createSOPProject.run(context);

    expect(result.success).toBe(true);
    expect(result.projectId).toBe("test-project-id");
    expect(httpClient.sendRequest).toHaveBeenCalledWith({
      method: "POST",
      url: expect.stringContaining("/api/v1/sop/projects"),
      headers: expect.objectContaining({
        Authorization: "Bearer test-token",
      }),
      body: expect.objectContaining({
        title: "Test Project",
        description: "Test Description",
      }),
    });
  });

  it("should handle API errors gracefully", async () => {
    (httpClient.sendRequest as jest.Mock).mockRejectedValue(
      new Error("API Error")
    );

    const context = {
      auth: "test-token",
      propsValue: {
        title: "Test Project",
        templateId: "template-123",
      },
    };

    await expect(createSOPProject.run(context)).rejects.toThrow("API Error");
  });
});
```

### Integration Testing

**src/lib/__tests__/integration.test.ts**:
```typescript
import { sopCustomIntegration } from "../../index";

describe("SOP Custom Integration", () => {
  it("should have correct piece configuration", () => {
    expect(sopCustomIntegration.displayName).toBe("SOP Custom Integration");
    expect(sopCustomIntegration.actions).toBeDefined();
    expect(sopCustomIntegration.triggers).toBeDefined();
  });

  it("should have all required actions", () => {
    const actionNames = sopCustomIntegration.actions.map(action => action.name);
    expect(actionNames).toContain("create_sop_project");
    expect(actionNames).toContain("update_sop_step");
  });

  it("should have all required triggers", () => {
    const triggerNames = sopCustomIntegration.triggers.map(trigger => trigger.name);
    expect(triggerNames).toContain("sop_project_completed");
  });
});
```

## Building and Deployment

### Build Process

```bash
# Install dependencies
npm install

# Build the piece
npm run build

# Test the piece
npm test

# Lint code
npm run lint
```

### Integration with Main Build

Add your piece to the main ActivePieces build:

**packages/pieces/community/index.ts**:
```typescript
import { sopCustomIntegration } from "./sop-custom-integration/src";

export const pieces = [
  // ... other pieces
  sopCustomIntegration,
];
```

### Docker Integration

Update the main Dockerfile to include your piece:

**Dockerfile.sop** (add to builder stage):
```dockerfile
# Copy your custom piece
COPY packages/pieces/community/sop-custom-integration ./packages/pieces/community/sop-custom-integration/

# Build your custom piece
RUN npx nx build sop-custom-integration
```

## Best Practices

### Error Handling

```typescript
async run(context) {
  try {
    const response = await this.apiCall();
    return { success: true, data: response.body };
  } catch (error) {
    // Log error details
    console.error("SOP Action Error:", error);
    
    // Return structured error
    return {
      success: false,
      error: {
        message: error.message,
        code: error.response?.status,
        details: error.response?.body,
      },
    };
  }
}
```

### Logging

```typescript
import { createAction } from "@activepieces/pieces-framework";

export const myAction = createAction({
  // ... configuration
  
  async run(context) {
    const { logger } = context;
    
    logger.info("Starting SOP operation", { 
      projectId: context.propsValue.projectId 
    });
    
    try {
      const result = await performOperation();
      logger.info("Operation completed successfully", { 
        result: result.id 
      });
      return result;
    } catch (error) {
      logger.error("Operation failed", { 
        error: error.message,
        stack: error.stack 
      });
      throw error;
    }
  },
});
```

### Property Validation

```typescript
props: {
  email: Property.ShortText({
    displayName: "Email",
    required: true,
    validators: [
      (value) => {
        if (!validateEmail(value)) {
          return "Please enter a valid email address";
        }
        return undefined;
      },
    ],
  }),
  
  dueDate: Property.DateTime({
    displayName: "Due Date",
    required: false,
    validators: [
      (value) => {
        if (value && new Date(value) < new Date()) {
          return "Due date cannot be in the past";
        }
        return undefined;
      },
    ],
  }),
}
```

### Performance Optimization

```typescript
// Cache expensive operations
const cache = new Map();

async function getCachedTemplates(auth: string) {
  const cacheKey = `templates_${auth}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const templates = await fetchTemplates(auth);
  
  // Cache for 10 minutes
  cache.set(cacheKey, templates);
  setTimeout(() => cache.delete(cacheKey), 10 * 60 * 1000);
  
  return templates;
}
```

## Advanced Integration Examples

### Slack Integration

```typescript
import { createAction, Property } from "@activepieces/pieces-framework";

export const notifySlackOnCompletion = createAction({
  name: "notify_slack_completion",
  displayName: "Notify Slack on SOP Completion",
  
  props: {
    webhookUrl: Property.ShortText({
      displayName: "Slack Webhook URL",
      required: true,
    }),
    
    projectId: Property.ShortText({
      displayName: "Project ID",
      required: true,
    }),
  },

  async run(context) {
    const { propsValue } = context;
    
    // Get project details
    const project = await getProjectDetails(propsValue.projectId);
    
    // Send Slack notification
    const slackMessage = {
      text: `SOP Completed: ${project.title}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*SOP Project Completed* :white_check_mark:\n\n*Project:* ${project.title}\n*Category:* ${project.category}\n*Completed by:* ${project.completedBy}\n*Duration:* ${project.duration} hours`,
          },
        },
      ],
    };

    await httpClient.sendRequest({
      method: HttpMethod.POST,
      url: propsValue.webhookUrl,
      body: slackMessage,
    });

    return { success: true, message: "Slack notification sent" };
  },
});
```

### JIRA Integration

```typescript
export const createJiraIssue = createAction({
  name: "create_jira_issue",
  displayName: "Create JIRA Issue from SOP",
  
  props: {
    jiraUrl: Property.ShortText({
      displayName: "JIRA Base URL",
      required: true,
    }),
    
    username: Property.ShortText({
      displayName: "Username",
      required: true,
    }),
    
    apiToken: Property.SecretText({
      displayName: "API Token",
      required: true,
    }),
    
    projectKey: Property.ShortText({
      displayName: "JIRA Project Key",
      required: true,
    }),
  },

  async run(context) {
    const { propsValue } = context;
    
    // Prepare JIRA issue
    const issue = {
      fields: {
        project: { key: propsValue.projectKey },
        summary: `SOP Issue: ${context.propsValue.sopTitle}`,
        description: `Issue created from SOP: ${context.propsValue.sopDescription}`,
        issuetype: { name: "Task" },
      },
    };

    // Create JIRA issue
    const response = await httpClient.sendRequest({
      method: HttpMethod.POST,
      url: `${propsValue.jiraUrl}/rest/api/2/issue`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${propsValue.username}:${propsValue.apiToken}`).toString("base64")}`,
      },
      body: issue,
    });

    return {
      success: true,
      issueKey: response.body.key,
      issueUrl: `${propsValue.jiraUrl}/browse/${response.body.key}`,
    };
  },
});
```

## Documentation and Maintenance

### README Template

Create a comprehensive README for your piece:

**packages/pieces/community/sop-custom-integration/README.md**:
```markdown
# SOP Custom Integration

Custom ActivePieces integration for extending SOP Tool functionality.

## Features

- Create SOP projects from external systems
- Update step statuses automatically
- Monitor project completion with webhooks
- Batch operations for multiple steps

## Configuration

1. Obtain API key from SOP Tool admin
2. Configure base URL (default: http://localhost:3000)
3. Set up webhook endpoints for triggers

## Available Actions

### Create SOP Project
Creates a new SOP project from a template.

**Properties:**
- Title (required): Project title
- Description: Detailed description
- Template ID (required): Template to use
- Assigned To: User assignment
- Due Date: Completion deadline
- Priority: Project priority level

### Update SOP Step
Updates the status and details of an SOP step.

## Available Triggers

### SOP Project Completed
Triggers when an SOP project is marked as completed.

## API Requirements

- SOP Tool API v1
- Valid authentication token
- Network access to SOP Tool instance

## Development

```bash
npm install
npm run build
npm test
```

## Support

Contact: your-team@company.com
Issues: [GitHub Issues](https://github.com/your-org/sop-pieces)
```

Your custom SOP pieces are now ready for integration with the ActivePieces SOP Tool!
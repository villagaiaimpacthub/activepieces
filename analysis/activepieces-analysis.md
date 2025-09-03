# Activepieces Platform Analysis

## Repository Structure Analysis

### Core Architecture
```
activepieces/
├── packages/
│   ├── ui/
│   │   ├── frontend/           # Angular frontend - PRIMARY CUSTOMIZATION TARGET
│   │   └── common/            # Shared UI components
│   ├── backend/               # NestJS backend API
│   ├── pieces/                # Workflow pieces framework - CUSTOM PIECES TARGET
│   ├── shared/                # Common utilities
│   └── database/              # Database migrations and models
├── docker/                    # Docker configuration
└── tools/                     # Build and development tools
```

## Frontend Framework Analysis

**Technology Stack:**
- **Frontend**: Angular 16+ with TypeScript
- **UI Components**: Angular Material + Custom components
- **State Management**: RxJS + Services
- **Routing**: Angular Router
- **Styling**: SCSS with theming support

### Key Customization Points

**1. Branding and Theming**
```typescript
// Target files for UI customization:
packages/ui/frontend/src/
├── app/
│   ├── modules/common/
│   │   ├── components/navbar/          // Main navigation
│   │   ├── components/sidebar/         // Side navigation  
│   │   └── service/navigation.service.ts // Navigation configuration
│   ├── modules/dashboard/              // Dashboard components
│   └── modules/flow-builder/           // Workflow builder - MAIN TARGET
├── assets/                             // Static assets (logos, icons)
├── styles.scss                         // Global styles
└── theme/                             // Material theme configuration
```

**2. Workflow Builder Components**
```typescript
// Flow builder customization targets:
packages/ui/frontend/src/app/modules/flow-builder/
├── components/
│   ├── flow-canvas/                    // Drag-drop canvas
│   ├── flow-sidebar/                   // Pieces palette
│   ├── piece-selector/                 // Available pieces list
│   └── flow-actions/                   // Toolbar actions
├── services/
│   ├── flow-builder.service.ts         // Flow management
│   └── pieces.service.ts               // Pieces management
└── models/
    └── flow.model.ts                   // Flow data structure
```

## Backend API Analysis

**Technology Stack:**
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT + OAuth2 support
- **API**: REST + WebSocket for real-time updates

### Key Backend Customization Points

**1. API Endpoints for SOP Customization**
```typescript
// Target backend modules:
packages/backend/src/app/
├── flows/                              // Flow management APIs
├── pieces/                             // Pieces management
├── project/                           // Project/workspace management
├── authentication/                     // Auth endpoints
└── export/                           // Export functionality (TO BE CREATED)
```

**2. Database Schema**
```sql
-- Core tables we'll extend:
flows                  -- Workflow definitions (rename to sops)
flow_versions         -- Version history
flow_runs             -- Execution history
pieces                -- Available workflow pieces
projects              -- Workspaces/tenants
users                 -- User management
```

## Pieces Framework Analysis

### Current Piece Architecture
```typescript
// Piece definition structure:
@Piece({
  displayName: 'Piece Name',
  description: 'Piece description', 
  logoUrl: 'logo-url',
  version: '1.0.0',
  minimumSupportedRelease: '0.20.0',
  maximumSupportedRelease: '0.20.0'
})
export class ExamplePiece {
  
  @PieceAction({
    displayName: 'Action Name',
    description: 'Action description'
  })
  static async executeAction(context: ActionContext): Promise<any> {
    // Action implementation
  }
}
```

### SOP-Specific Pieces Needed
```typescript
// Custom pieces to create:
const sopPieces = [
  'ProcessStep',        // Basic procedure step
  'ApprovalGate',       // Human approval checkpoint  
  'DocumentReview',     // Document validation step
  'DataForm',           // Data collection form
  'Notification',       // Email/Slack notification
  'ComplianceCheck',    // Regulatory validation
  'QualityGate',        // Quality control checkpoint
  'Escalation',         // Exception handling
  'Documentation'       // Auto-documentation generation
];
```

## UI Customization Strategy

### 1. Theme Override Approach
```scss
// Create SOP-specific theme:
$sop-primary: #2563eb;
$sop-accent: #64748b;
$sop-success: #10b981;

.sop-theme {
  // Override Material Design colors
  --mat-primary: #{$sop-primary};
  --mat-accent: #{$sop-accent};
  
  // Custom SOP styling
  .flow-canvas {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }
}
```

### 2. Component Override Strategy
```typescript
// Create SOP-specific components:
@Component({
  selector: 'sop-navbar',
  template: `
    <nav class="sop-navbar">
      <div class="sop-logo">SOP Designer</div>
      <ul class="sop-nav-items">
        <li><a routerLink="/sops">My SOPs</a></li>
        <li><a routerLink="/templates">Templates</a></li>
        <li><a routerLink="/export">Export</a></li>
      </ul>
    </nav>
  `
})
export class SopNavbarComponent extends NavbarComponent {
  // Override navigation logic
}
```

### 3. Terminology Translation Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class SopTerminologyService {
  private translations = new Map([
    ['Flow', 'SOP'],
    ['Flows', 'SOPs'],
    ['Action', 'Step'],
    ['Trigger', 'Initiator'],
    ['Piece', 'Process Step']
  ]);
  
  translate(text: string): string {
    // Apply terminology translations
  }
}
```

## Authentication and Multi-Tenancy

### Current Authentication
- JWT-based authentication
- Project-based workspace isolation
- Role-based access control (RBAC)

### SOP Tool Requirements
- Client workspace isolation
- Simple user management per client
- Basic role system (Admin, User, Viewer)

## Export System Requirements

### Current Export Capabilities
- JSON flow export/import
- Basic flow sharing

### SOP Export Needs
```typescript
interface SopExportFormat {
  metadata: {
    sopId: string;
    title: string;
    version: string;
    createdBy: string;
    createdAt: Date;
  };
  
  process: {
    steps: ProcessStep[];
    approvals: ApprovalGate[];
    decisions: DecisionPoint[];
    integrations: Integration[];
  };
  
  specifications: {
    automationRequirements: string[];
    dataRequirements: DataModel[];
    integrationPoints: IntegrationSpec[];
    complianceRequirements: ComplianceSpec[];
  };
}
```

## Development Environment Setup

### Local Development Process
```bash
# Fork and setup
git clone https://github.com/YOUR-ORG/activepieces-sop-tool.git
cd activepieces-sop-tool

# Install dependencies
npm install

# Start development environment
npm run dev

# Frontend: http://localhost:4200
# Backend: http://localhost:3000
```

### Customization Development Workflow
```bash
# Create custom components
ng generate component modules/sop/sop-designer
ng generate service modules/sop/sop-export

# Create custom pieces
npm run create-piece sop-process-step
npm run create-piece sop-approval-gate

# Test customizations
npm run test:sop
npm run build:sop
```

## Technical Constraints and Limitations

### What We Can Customize
✅ **UI Components** - Full control over Angular components
✅ **Theming** - Complete Material Design theme override
✅ **Navigation** - Custom navigation structure
✅ **Pieces** - Custom workflow pieces following framework
✅ **Export** - Custom export formats and logic
✅ **Branding** - Complete white-label customization

### What We Cannot Easily Change
❌ **Core Architecture** - NestJS/Angular stack is fixed
❌ **Database Schema** - Major schema changes difficult
❌ **Authentication System** - Built-in auth system preferred
❌ **Real-time Engine** - WebSocket implementation is core

### Risk Assessment
- **Low Risk**: UI customization, custom pieces, theming
- **Medium Risk**: Export system modifications, navigation changes
- **High Risk**: Core workflow engine changes, database schema

## Implementation Readiness

### Ready for Implementation
- Fork repository and run locally ✅
- Identify customization points ✅  
- Understand pieces framework ✅
- Plan UI modification approach ✅

### Next Steps Required
- Create custom SOP pieces
- Implement UI customization layer
- Build export system functionality
- Test client workflow end-to-end

## Conclusion

Activepieces provides a solid foundation for SOP tool customization with:
- Well-structured Angular frontend for UI customization
- Flexible pieces framework for custom workflow elements
- Extensible backend API for additional functionality
- Built-in multi-tenancy and authentication

The platform is suitable for our SOP tool requirements with minimal modifications needed.
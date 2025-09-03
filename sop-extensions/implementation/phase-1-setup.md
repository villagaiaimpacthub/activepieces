# Phase 1: Setup and Foundation (Week 1)

## Objective
Fork Activepieces, set up development environment, and establish foundation for SOP-specific customizations.

## Prerequisites
- GitHub account with organization access
- Docker and Docker Compose installed
- Node.js 18+ and npm/yarn
- Basic TypeScript knowledge

## Tasks Overview

### Day 1: Repository Setup

#### 1.1 Fork Activepieces Repository
```bash
# Fork from GitHub UI first, then clone
git clone https://github.com/YOUR-ORG/activepieces-sop-tool.git
cd activepieces-sop-tool

# Add upstream remote for updates
git remote add upstream https://github.com/activepieces/activepieces.git

# Create development branch
git checkout -b sop-customization
```

#### 1.2 Initial Environment Setup
```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development environment
docker-compose up -d

# Install frontend dependencies
cd packages/ui/frontend
npm install
cd ../../..

# Start development server
npm run dev
```

#### 1.3 Verify Base Installation
- [ ] Activepieces UI loads at http://localhost:4200
- [ ] Can create test workflow
- [ ] Backend API responds at http://localhost:3000
- [ ] Database is accessible and migrations run
- [ ] All core services start without errors

### Day 2: Codebase Analysis

#### 2.1 Map Critical Files
```typescript
// Key directories to understand
activepieces-sop-tool/
├── packages/
│   ├── ui/
│   │   ├── frontend/           // React frontend (our main customization target)
│   │   └── common/            // Shared UI components
│   ├── backend/               // NestJS backend API
│   ├── pieces/                // Workflow pieces framework
│   └── shared/                // Common utilities
├── docker/                    // Docker configuration
└── tools/                     // Build and development tools
```

#### 2.2 Identify Customization Points
```typescript
// Files requiring modification for SOP customization
const customizationTargets = {
  branding: [
    'packages/ui/frontend/src/assets/',           // Logo and branding assets
    'packages/ui/frontend/src/app/modules/common/service/navigation.service.ts', // Navigation
    'packages/ui/frontend/src/styles.scss'       // Global styles
  ],
  
  routing: [
    'packages/ui/frontend/src/app/app-routing.module.ts',  // Route configuration
    'packages/ui/frontend/src/app/modules/dashboard/'      // Dashboard layouts
  ],
  
  components: [
    'packages/ui/frontend/src/app/modules/flow-builder/',  // Workflow builder
    'packages/ui/frontend/src/app/modules/common/',        // Common components
    'packages/ui/frontend/src/app/modules/dashboard/'      // Dashboard components
  ],
  
  pieces: [
    'packages/pieces/',                                    // Custom SOP pieces
    'packages/backend/src/app/pieces/'                     // Pieces backend logic
  ]
};
```

#### 2.3 Document Current Architecture
Create `architecture/activepieces-analysis.md` with:
- Frontend framework (Angular/React/Vue)
- Backend architecture (NestJS structure)
- Database schema overview
- Pieces framework mechanics
- Authentication and authorization flow

### Day 3: Development Environment Customization

#### 3.1 Create SOP-Specific Configuration
```typescript
// Create packages/ui/frontend/src/app/sop-config.ts
export const SOP_CONFIG = {
  branding: {
    appName: 'SOP Designer',
    logoUrl: '/assets/sop-logo.svg',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b'
  },
  
  terminology: {
    'flows': 'SOPs',
    'pieces': 'process steps', 
    'actions': 'steps',
    'triggers': 'initiators'
  },
  
  hiddenFeatures: [
    'advanced-loops',
    'webhook-triggers', 
    'api-pieces',
    'developer-tools'
  ],
  
  sopPieces: [
    'process-step',
    'approval-gate',
    'document-review',
    'data-form',
    'notification',
    'compliance-check'
  ]
};
```

#### 3.2 Setup Asset Pipeline
```bash
# Create SOP-specific assets directory
mkdir -p packages/ui/frontend/src/assets/sop/
mkdir -p packages/ui/frontend/src/assets/sop/icons/
mkdir -p packages/ui/frontend/src/assets/sop/templates/

# Add placeholder assets
touch packages/ui/frontend/src/assets/sop/logo.svg
touch packages/ui/frontend/src/assets/sop/sop-styles.scss
```

#### 3.3 Environment Configuration
```bash
# Update .env with SOP-specific settings
echo "# SOP Tool Configuration" >> .env
echo "AP_FRONTEND_URL=http://localhost:4200" >> .env
echo "AP_BACKEND_URL=http://localhost:3000" >> .env
echo "AP_BRANDING_ENABLED=true" >> .env
echo "AP_SOP_MODE=true" >> .env
```

### Day 4: Basic UI Customization

#### 4.1 Navigation Modification
```typescript
// Modify packages/ui/frontend/src/app/modules/common/service/navigation.service.ts
import { SOP_CONFIG } from '../../../sop-config';

export class NavigationService {
  getSopNavigation() {
    return [
      { label: 'My SOPs', path: '/sops', icon: 'clipboard-list' },
      { label: 'Process Library', path: '/processes', icon: 'library' },
      { label: 'Templates', path: '/templates', icon: 'template' },
      { label: 'Export Center', path: '/export', icon: 'download' },
      { label: 'Help', path: '/help', icon: 'help-circle' }
    ];
  }
}
```

#### 4.2 Brand Asset Integration
```scss
// Create packages/ui/frontend/src/assets/sop/sop-theme.scss
:root {
  --sop-primary: #2563eb;
  --sop-secondary: #64748b;
  --sop-success: #10b981;
  --sop-warning: #f59e0b;
  --sop-danger: #ef4444;
}

.sop-theme {
  .ap-navbar-brand {
    background: url('/assets/sop/logo.svg') no-repeat center;
    width: 160px;
    height: 40px;
  }
  
  .ap-primary-button {
    background-color: var(--sop-primary);
  }
  
  .ap-workflow-canvas {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }
}
```

#### 4.3 Terminology Updates
```typescript
// Create packages/ui/frontend/src/app/sop-terminology.service.ts
@Injectable({
  providedIn: 'root'
})
export class SopTerminologyService {
  private terminologyMap = {
    'Flow': 'SOP',
    'Flows': 'SOPs', 
    'flow': 'SOP',
    'flows': 'SOPs',
    'Action': 'Step',
    'Actions': 'Steps',
    'Trigger': 'Initiator',
    'Piece': 'Process Step'
  };
  
  translateText(text: string): string {
    let translatedText = text;
    Object.entries(this.terminologyMap).forEach(([original, sopTerm]) => {
      translatedText = translatedText.replace(new RegExp(original, 'g'), sopTerm);
    });
    return translatedText;
  }
}
```

### Day 5: Testing and Documentation

#### 5.1 Verification Checklist
- [ ] Development environment starts without errors
- [ ] UI loads with basic SOP branding applied
- [ ] Navigation shows SOP-specific menu items  
- [ ] Asset pipeline serves custom SOP assets
- [ ] Configuration system works for customization
- [ ] All original Activepieces functionality still works

#### 5.2 Create Development Documentation
```markdown
# SOP Tool Development Guide

## Local Development Setup
1. Clone repository
2. Run `npm install`
3. Copy `.env.example` to `.env`  
4. Start with `docker-compose up -d && npm run dev`
5. Access at http://localhost:4200

## Customization Architecture
- Configuration: `src/app/sop-config.ts`
- Theming: `src/assets/sop/sop-theme.scss`
- Navigation: `src/app/modules/common/service/navigation.service.ts`
- Terminology: `src/app/sop-terminology.service.ts`

## Key Directories
- `/src/assets/sop/` - SOP-specific assets
- `/src/app/modules/sop/` - SOP-specific components (to be created)
- `/packages/pieces/sop/` - Custom SOP workflow pieces (to be created)
```

#### 5.3 Commit Initial Setup
```bash
git add .
git commit -m "Phase 1: Initial SOP tool setup and basic customization

- Fork Activepieces and configure development environment
- Add SOP-specific configuration system
- Implement basic branding and navigation changes
- Setup asset pipeline for SOP customization
- Document development setup and architecture"

git push origin sop-customization
```

## Deliverables

### Files Created
- [ ] `architecture/activepieces-analysis.md` - Platform analysis
- [ ] `packages/ui/frontend/src/app/sop-config.ts` - Configuration system
- [ ] `packages/ui/frontend/src/assets/sop/sop-theme.scss` - Styling
- [ ] `packages/ui/frontend/src/app/sop-terminology.service.ts` - Text translation
- [ ] Development documentation

### Environment Verified
- [ ] Activepieces base functionality working
- [ ] Development server running on port 4200
- [ ] Basic SOP customizations applied
- [ ] Asset pipeline configured
- [ ] Version control setup

## Success Criteria
- Clean fork of Activepieces with SOP customizations
- Development environment fully functional
- Basic branding changes visible in UI
- Documentation created for next phases
- All changes committed to version control

## Risk Mitigation
- **Merge Conflicts**: Regular syncing with upstream Activepieces
- **Environment Issues**: Documented setup process with troubleshooting
- **Customization Breaks**: Minimal changes to core functionality
- **Version Updates**: Clear documentation of all modifications made

## Next Phase Preparation
- Identify specific UI components for Phase 2 customization
- Plan SOP-specific workflow pieces for Phase 3
- Prepare test data and scenarios for development
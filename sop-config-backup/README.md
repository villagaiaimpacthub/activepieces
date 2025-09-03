# Activepieces SOP Tool

A client-facing visual Standard Operating Procedure (SOP) design tool built on the Activepieces framework. This tool enables clients to drag-and-drop design their SOPs visually, which development teams can then export as automation specifications for AI implementation.

## 🎯 Project Overview

**Goal**: Create a client-facing SOP design tool by customizing Activepieces for standard operating procedure creation and workflow design.

The Activepieces SOP Tool transforms the traditional SOP documentation process into an interactive, visual experience. Clients can:
- Visually design complex SOPs using drag-and-drop interface
- Define process steps, approvals, and decision points
- Export SOPs as structured automation specifications
- Collaborate on SOP development with team members

## 🏗️ Architecture

- **Frontend**: Angular 16+ with TypeScript and Angular Material
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT-based with workspace isolation
- **Real-time**: WebSocket support for collaboration

**Base Platform**: Activepieces (MIT licensed)
- TypeScript-based framework
- Drag-and-drop workflow builder
- Custom pieces architecture
- UI customization capabilities
- Embedding SDK

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 13

### Environment Setup
1. Clone the repository:
```bash
git clone https://github.com/your-org/activepieces-sop-tool.git
cd activepieces-sop-tool
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Setup database:
```bash
npm run db:create
npm run migrations:run
```

### Development

Start the development servers:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:4200
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api/docs

## 📁 Project Structure

```
activepieces-sop-tool/
├── src/                               # Source code
│   ├── frontend/                     # Angular frontend application
│   │   ├── app/modules/sop-designer/  # Main SOP visual designer
│   │   ├── assets/                   # Static assets and icons
│   │   └── styles/                   # Global styles and themes
│   ├── backend/                      # NestJS backend application
│   │   ├── modules/sop/              # SOP-specific backend modules
│   │   └── database/                 # Database entities and migrations
│   ├── pieces/                       # Custom SOP workflow pieces
│   │   └── sop-pieces/               # Process steps, approvals, etc.
│   └── shared/                       # Shared models and utilities
│       ├── models/                   # TypeScript interfaces
│       └── utils/                    # Common utilities
├── tests/                            # Test suites
│   ├── unit/                         # Unit tests
│   ├── integration/                  # Integration tests
│   └── e2e/                          # End-to-end tests
├── docs/                             # Documentation
├── docker/                           # Docker configuration
├── scripts/                          # Build and utility scripts
├── analysis/                         # Research and analysis
│   ├── activepieces-analysis.md      # Platform capabilities review
│   ├── client-requirements.md        # Client-facing requirements
│   └── technical-feasibility.md      # Implementation feasibility
├── architecture/                     # System design
│   ├── system-overview.md            # High-level architecture
│   ├── ui-customization-plan.md      # Interface modification plan
│   └── custom-pieces-design.md       # SOP-specific workflow pieces
└── implementation/                   # Development plans
    ├── phase-1-setup.md              # Fork and initial setup
    ├── phase-2-customization.md      # UI and branding changes
    └── phase-3-sop-pieces.md         # Custom SOP workflow pieces
```

## 🛠️ Development Scripts

### Build Commands
```bash
npm run build              # Build entire project
npm run build:frontend     # Build Angular frontend only
npm run build:backend      # Build NestJS backend only
```

### Development Commands
```bash
npm run dev               # Start full development environment
npm run dev:frontend      # Start frontend development server only
npm run dev:backend       # Start backend development server only
```

### Testing Commands
```bash
npm run test              # Run all tests
npm run test:frontend     # Run frontend tests only
npm run test:backend      # Run backend tests only
npm run test:e2e          # Run end-to-end tests
```

### Database Commands
```bash
npm run migrations:generate   # Generate new migration
npm run migrations:run        # Run pending migrations
npm run db:reset             # Reset database (development only)
```

### Code Quality
```bash
npm run lint              # Run ESLint
npm run format            # Format code with Prettier
npm run typecheck         # TypeScript type checking
```

## 🧩 Custom SOP Pieces

The tool includes specialized workflow pieces for SOP operations:

- **ProcessStep**: Basic procedure step with instructions
- **ApprovalGate**: Human approval checkpoint
- **DocumentReview**: Document validation step
- **DataForm**: Data collection form
- **Notification**: Email/Slack notification
- **ComplianceCheck**: Regulatory validation
- **QualityGate**: Quality control checkpoint
- **Escalation**: Exception handling
- **Documentation**: Auto-documentation generation

### Creating Custom Pieces
```bash
npm run create-piece sop-custom-step
```

## 📊 Export Formats

SOPs can be exported in multiple formats:
- **JSON**: Structured data for API integration
- **YAML**: Human-readable configuration format
- **PDF**: Documentation and compliance reports

## Next Steps

1. **Analysis Phase**: Research Activepieces architecture and customization options
2. **Architecture Phase**: Design SOP-specific interface and workflow pieces
3. **Implementation Phase**: Fork, customize, and deploy the tool
4. **Documentation Phase**: Create client and developer documentation

## Key Principles

- **Client-focused**: Interface designed for SOP creation, not generic workflows
- **Simple and practical**: Avoid over-engineering from previous project
- **Leverage existing platform**: Build on Activepieces foundation
- **Fast delivery**: Target working prototype in 2-4 weeks
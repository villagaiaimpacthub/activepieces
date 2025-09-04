# SOP Tool Debugging & Integration Plan
**Status**: PROTOTYPE → FUNCTIONAL  
**Target**: Make the SOP tool operational in production  
**Created**: 2025-09-04  

---

## **🎯 Executive Summary**

The activepieces-sop-tool has excellent architectural foundations but requires systematic debugging and integration work to bridge the gap between the sophisticated backend framework and functional user interface. This plan breaks down the work into <10 minute tasks with clear dependencies and parallelization opportunities.

## **📊 Current State Assessment**

### ✅ **Assets We Have**:
- Complete Activepieces v0.68.3 fork with infrastructure
- 6 Production-ready SOP pieces with comprehensive validation
- Enterprise-grade type system and compliance frameworks
- Database schema design with proper migrations
- Sophisticated piece generation utilities

### 🚨 **Critical Gaps**:
- Database connection and environment setup
- Frontend SOP UI components missing
- Build system configuration conflicts  
- API integration layer incomplete
- End-to-end workflow not functional

---

## **🗂️ Task Categories & Dependencies**

### **CATEGORY A: Foundation (Sequential - Must Complete First)**
*These tasks have strict dependencies and must be completed in order*

### **CATEGORY B: Integration (Parallel after Category A)**  
*These tasks can run in parallel once foundations are established*

### **CATEGORY C: Validation (Parallel during Category B)**
*Testing and validation tasks that can run alongside development*

### **CATEGORY D: Polish (Sequential - Final Phase)**
*Final integration and user experience improvements*

---

## **🔥 CATEGORY A: Foundation Tasks (Sequential)**

### **A1: Environment & Database Foundation** 
*Dependency: None | Duration: 40 minutes | Agent: `coder-framework-boilerplate`*

#### **A1.1: Fix ESLint Configuration (10 min)**
- **Task**: Remove/fix problematic ESLint configs in SOP piece packages
- **Files**: `packages/pieces/community/sop-framework/src/pieces/*/package.json`
- **Agent**: `coder-framework-boilerplate`
- **Action**: Remove ESLint configs causing NX graph processing failures
- **Success**: `npm run dev:backend` starts without ESLint errors

#### **A1.2: Create Environment Configuration (10 min)**
- **Task**: Create `.env` file with database and application settings
- **Files**: `/Users/nikolai/.../activepieces-sop-tool/.env`
- **Agent**: `coder-framework-boilerplate`
- **Template**:
  ```bash
  DATABASE_HOST=localhost
  DATABASE_PORT=5432
  DATABASE_USER=postgres
  DATABASE_PASSWORD=password
  DATABASE_NAME=activepieces_sop
  AP_FRONTEND_URL=http://localhost:4200
  AP_BACKEND_URL=http://localhost:3000
  ```

#### **A1.3: Database Setup Verification (10 min)**
- **Task**: Verify PostgreSQL running and create database
- **Agent**: `coder-framework-boilerplate`
- **Actions**: 
  - Check PostgreSQL service status
  - Create `activepieces_sop` database if not exists
  - Verify connection string works

#### **A1.4: Run Database Migrations (10 min)**  
- **Task**: Execute SOP-specific database migrations
- **Files**: `src/backend/database/migrations/1709654321000-InitialSopSchema.ts`
- **Agent**: `coder-framework-boilerplate`
- **Command**: Run migration system to create SOP tables
- **Verify**: SOP tables exist in database

### **A2: Build System Foundation**
*Dependency: A1 Complete | Duration: 30 minutes | Agent: `debugger-targeted`*

#### **A2.1: Fix NX Project Graph (10 min)**
- **Task**: Resolve NX configuration conflicts
- **Files**: `nx.json`, project configurations
- **Agent**: `debugger-targeted`
- **Action**: Fix project graph processing for custom SOP pieces

#### **A2.2: TypeScript Compilation Fix (10 min)**
- **Task**: Resolve TypeScript compilation errors
- **Agent**: `debugger-targeted`  
- **Action**: Fix import paths and type definitions for SOP framework

#### **A2.3: Test Build Process (10 min)**
- **Task**: Verify backend and engine can start successfully
- **Agent**: `debugger-targeted`
- **Command**: `npm run dev:backend`
- **Success**: Backend starts without compilation errors

---

## **⚡ CATEGORY B: Integration Tasks (Parallel)**

### **B1: Backend API Integration**
*Dependency: A1-A2 Complete | Duration: 60 minutes | Agents: Multiple*

#### **B1.1: SOP Entity Creation (10 min)**
- **Task**: Create TypeORM entities for SOP tables
- **Files**: `src/backend/database/entities/sop-*.ts`
- **Agent**: `coder-framework-boilerplate`
- **Action**: Map database schema to TypeORM entities

#### **B1.2: SOP Controller Creation (10 min)**  
- **Task**: Create REST API controllers for SOP operations
- **Files**: `packages/server/api/src/app/sop/sop.controller.ts`
- **Agent**: `coder-framework-boilerplate`
- **Endpoints**: GET, POST, PUT, DELETE for SOPs

#### **B1.3: SOP Service Layer (10 min)**
- **Task**: Create service layer connecting controllers to utilities
- **Files**: `packages/server/api/src/app/sop/sop.service.ts`
- **Agent**: `coder-framework-boilerplate`
- **Action**: Bridge API layer to existing SOP utilities

#### **B1.4: API Route Registration (10 min)**
- **Task**: Register SOP routes in main application
- **Files**: `packages/server/api/src/app/app.module.ts`
- **Agent**: `coder-framework-boilerplate`
- **Action**: Add SOP routes to Express/Fastify routing

#### **B1.5: Piece Registry Integration (10 min)**
- **Task**: Register custom SOP pieces with Activepieces
- **Files**: `packages/server/api/src/app/pieces/piece-service.ts`
- **Agent**: `coder-framework-boilerplate`
- **Action**: Load SOP framework pieces into piece registry

#### **B1.6: API Testing Setup (10 min)**
- **Task**: Create basic API endpoint tests
- **Files**: `packages/server/api/test/integration/sop/`
- **Agent**: `tester-tdd-master`
- **Action**: Test CRUD operations for SOP endpoints

### **B2: Frontend UI Integration** 
*Dependency: A1-A2 Complete | Duration: 80 minutes | Agents: Multiple*

#### **B2.1: SOP Terminology Translation (10 min)**
- **Task**: Create terminology overlay system
- **Files**: `packages/react-ui/src/app/modules/common/service/terminology.service.ts`
- **Agent**: `coder-framework-boilerplate`
- **Action**: "Flows" → "SOPs", "Pieces" → "Process Steps"

#### **B2.2: SOP Dashboard Components (10 min)**
- **Task**: Create SOP-specific dashboard widgets
- **Files**: `packages/react-ui/src/app/modules/sop/components/sop-dashboard/`
- **Agent**: `coder-framework-boilerplate`  
- **Components**: SOP overview, recent activity, compliance status

#### **B2.3: SOP Navigation Integration (10 min)**
- **Task**: Update navigation with SOP-specific routes
- **Files**: `packages/react-ui/src/app/modules/common/components/navigation/`
- **Agent**: `coder-framework-boilerplate`
- **Action**: Add SOP management navigation items

#### **B2.4: SOP List/Grid View (10 min)**
- **Task**: Create SOP listing and management interface
- **Files**: `packages/react-ui/src/app/modules/sop/pages/sop-list/`  
- **Agent**: `coder-framework-boilerplate`
- **Features**: List SOPs, search, filter, basic CRUD

#### **B2.5: SOP Builder Integration (10 min)**
- **Task**: Integrate SOP pieces into flow builder
- **Files**: `packages/react-ui/src/features/builder/`
- **Agent**: `coder-framework-boilerplate`
- **Action**: Show SOP pieces in piece selector

#### **B2.6: SOP Execution Interface (10 min)**
- **Task**: Create SOP execution and monitoring interface  
- **Files**: `packages/react-ui/src/app/modules/sop/pages/sop-execution/`
- **Agent**: `coder-framework-boilerplate`
- **Features**: Start SOP, monitor progress, view results

#### **B2.7: Client Workspace UI (10 min)**
- **Task**: Create basic client workspace management
- **Files**: `packages/react-ui/src/app/modules/sop/pages/client-workspace/`
- **Agent**: `coder-framework-boilerplate`
- **Features**: Client selection, SOP sharing interface

#### **B2.8: Frontend-Backend Data Service (10 min)**
- **Task**: Create Angular/React service for SOP API calls
- **Files**: `packages/react-ui/src/app/modules/sop/service/sop-api.service.ts`
- **Agent**: `coder-framework-boilerplate`
- **Action**: HTTP client wrapper for SOP API endpoints

### **B3: Export System Implementation**
*Dependency: B1.1-B1.4 Complete | Duration: 50 minutes | Agent: `coder-framework-boilerplate`*

#### **B3.1: SOP Export Service (10 min)**
- **Task**: Create backend export service
- **Files**: `packages/server/api/src/app/sop/export/sop-export.service.ts`
- **Agent**: `coder-framework-boilerplate`
- **Formats**: JSON, Text, PDF (basic)

#### **B3.2: Export API Endpoints (10 min)**
- **Task**: Add export endpoints to SOP controller
- **Files**: Update `sop.controller.ts` with export routes
- **Agent**: `coder-framework-boilerplate`
- **Endpoints**: `/api/sops/{id}/export/{format}`

#### **B3.3: Client Package Generation (10 min)**  
- **Task**: Generate client-ready SOP packages
- **Files**: `packages/server/api/src/app/sop/export/client-package.service.ts`
- **Agent**: `coder-framework-boilerplate`
- **Output**: Zip files with SOP definitions and instructions

#### **B3.4: Frontend Export Interface (10 min)**
- **Task**: Create export UI in frontend
- **Files**: `packages/react-ui/src/app/modules/sop/components/sop-export/`
- **Agent**: `coder-framework-boilerplate`
- **Features**: Export buttons, format selection, download handling

#### **B3.5: Export Testing (10 min)**
- **Task**: Test export functionality end-to-end
- **Agent**: `tester-tdd-master`  
- **Action**: Create SOP, export all formats, verify output

---

## **🧪 CATEGORY C: Validation Tasks (Parallel)**

### **C1: Automated Testing**
*Dependency: A1-A2 Complete | Duration: 40 minutes | Agent: `tester-tdd-master`*

#### **C1.1: SOP Piece Unit Tests (10 min)**
- **Task**: Fix and run SOP piece tests
- **Files**: `packages/pieces/community/sop-framework/src/pieces/*/test/`
- **Agent**: `tester-tdd-master`
- **Action**: Ensure all 6 SOP pieces pass unit tests

#### **C1.2: Integration Test Suite (10 min)**
- **Task**: Create SOP workflow integration tests  
- **Files**: `packages/server/api/test/integration/sop/sop-workflow.test.ts`
- **Agent**: `tester-tdd-master`
- **Scenarios**: Create SOP, execute, export

#### **C1.3: API Endpoint Testing (10 min)**
- **Task**: Test all SOP API endpoints
- **Files**: `packages/server/api/test/integration/sop/sop-api.test.ts`
- **Agent**: `tester-tdd-master`
- **Coverage**: CRUD operations, export endpoints

#### **C1.4: Frontend Component Testing (10 min)**
- **Task**: Test SOP UI components
- **Files**: `packages/react-ui/src/app/modules/sop/**/*.test.ts`
- **Agent**: `tester-tdd-master`
- **Components**: Dashboard, list view, export interface

### **C2: End-to-End Validation**
*Dependency: B1-B2 Substantial Progress | Duration: 30 minutes | Agent: `bmo-e2e-test-generator`*

#### **C2.1: SOP Creation Workflow (10 min)**
- **Task**: Test complete SOP creation process
- **Agent**: `bmo-e2e-test-generator`
- **Scenario**: Login → Create SOP → Add pieces → Save

#### **C2.2: SOP Execution Workflow (10 min)**
- **Task**: Test SOP execution and monitoring
- **Agent**: `bmo-e2e-test-generator`  
- **Scenario**: Start SOP → Monitor progress → View results

#### **C2.3: Client Export Workflow (10 min)**
- **Task**: Test export and client delivery
- **Agent**: `bmo-e2e-test-generator`
- **Scenario**: Create SOP → Export package → Verify client package

---

## **✨ CATEGORY D: Polish Tasks (Sequential)**

### **D1: User Experience Polish**
*Dependency: B1-B3 Complete | Duration: 40 minutes | Agent: `coder-framework-boilerplate`*

#### **D1.1: Error Handling & Messages (10 min)**
- **Task**: Add user-friendly error handling
- **Files**: Frontend error service, backend error middleware
- **Agent**: `coder-framework-boilerplate`
- **Features**: Graceful error handling, user notifications

#### **D1.2: Loading States & Feedback (10 min)**
- **Task**: Add loading spinners and progress indicators
- **Files**: Frontend component updates
- **Agent**: `coder-framework-boilerplate`
- **UX**: Loading states for API calls, progress bars

#### **D1.3: SOP Templates & Examples (10 min)**
- **Task**: Create SOP templates and sample processes
- **Files**: `packages/server/api/src/app/sop/templates/`
- **Agent**: `coder-framework-boilerplate`
- **Templates**: Basic approval, data collection, compliance check

#### **D1.4: Documentation & Help (10 min)**  
- **Task**: Add contextual help and documentation
- **Files**: Frontend help components, documentation assets
- **Agent**: `docs-writer-feature`
- **Content**: In-app help, tooltips, getting started guide

### **D2: Production Readiness**
*Dependency: C1-C2 Complete | Duration: 30 minutes | Agent: `orchestrator-sparc-completion-maintenance`*

#### **D2.1: Performance Optimization (10 min)**
- **Task**: Optimize database queries and API responses
- **Agent**: `optimizer-module`
- **Focus**: SOP listing, piece loading, export generation

#### **D2.2: Security Audit (10 min)**  
- **Task**: Security review of SOP endpoints and data handling
- **Agent**: `security-reviewer-module`
- **Areas**: API authentication, data validation, export security

#### **D2.3: Deployment Configuration (10 min)**
- **Task**: Prepare production deployment configuration
- **Files**: Docker, environment configs, deployment scripts
- **Agent**: `orchestrator-sparc-completion-maintenance`
- **Output**: Production-ready deployment package

---

## **🔄 Execution Strategy**

### **Phase 1: Foundation (Sequential)**
```bash
# Execute Category A tasks in strict order
A1.1 → A1.2 → A1.3 → A1.4 → A2.1 → A2.2 → A2.3
Total Duration: 70 minutes
```

### **Phase 2: Integration (Parallel)**
```bash
# Launch all Category B tasks in parallel after Phase 1
Parallel Execution:
├── B1: Backend API (60 min) 
├── B2: Frontend UI (80 min)
└── B3: Export System (50 min)

# Plus parallel validation:
└── C1: Automated Testing (40 min)

Maximum Duration: 80 minutes (limited by B2)
```

### **Phase 3: Validation & Polish (Mixed)**
```bash
# Category C2 requires B1-B2 progress
# Category D executes after B1-B3 complete

Parallel: C2 (30 min) + D1 (40 min)
Sequential: D2 (30 min) after C1-C2 complete

Duration: 70 minutes
```

## **📊 Total Project Timeline**

- **Phase 1 (Foundation)**: 70 minutes
- **Phase 2 (Integration)**: 80 minutes  
- **Phase 3 (Polish)**: 70 minutes
- **Total Development**: ~220 minutes (~3.7 hours)

## **🎯 Success Criteria**

### **Minimum Viable Product (MVP)**:
1. ✅ Application starts without errors
2. ✅ User can create and save a basic SOP
3. ✅ SOP executes and shows results  
4. ✅ Basic export functionality works
5. ✅ Client can receive and use exported SOP

### **Production Ready**:
1. ✅ All MVP criteria met
2. ✅ Comprehensive test coverage
3. ✅ User-friendly error handling
4. ✅ Performance optimized
5. ✅ Security reviewed
6. ✅ Documentation complete

---

## **🚀 Quick Start Commands**

```bash
# Phase 1: Foundation Setup
cd activepieces-sop-tool
npm install
# Fix ESLint configs (A1.1)
# Create .env file (A1.2)  
# Setup database (A1.3-A1.4)
# Fix build system (A2.1-A2.3)

# Phase 2: Integration Development
# Launch parallel agents for B1, B2, B3, C1

# Phase 3: Final Integration
# Execute C2, D1, D2 in sequence
```

## **📝 Notes**

- Each task is designed to be completable in <10 minutes
- Dependencies are clearly marked to prevent blocking
- Multiple agents can work in parallel during integration phase
- Success criteria are measurable and testable
- Timeline accounts for debugging and iteration

This plan transforms the sophisticated SOP framework into a functional, production-ready tool through systematic, time-boxed execution with clear parallelization opportunities.
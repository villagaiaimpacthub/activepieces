# SOP Tool Execution Framework

## 🚀 EXECUTION RULES FOR ALL AGENTS

### Orchestration Hierarchy
**Claude-Code = Master Orchestrator**
- Provides complete context and requirements to each subagent
- Manages dependency sequencing and task prioritization
- Monitors progress and coordinates handoffs between agents
- Makes final decisions on task completion and next steps

**Subagents = Specialized Executors**
- Execute specific tasks with full context from orchestrator
- Must score themselves 1-100 on task completion
- **100/100 = ONLY acceptable completion score**
- Update todo lists and request additional agents if <100

### The 10-Minute Rule (MANDATORY)
**Every task must be completable in 10 minutes or less.**

- If a task takes >10 minutes, break it into smaller subtasks
- Each subtask must have a clear deliverable
- No exceptions - this prevents over-engineering at the execution level
- Agents must report completion status every 10 minutes

### 100/100 Completion Rule (MANDATORY)
**No task is complete until agent scores itself 100/100.**

- Agent must self-evaluate: "Is this task fully complete?" 
- If score <100: Agent updates todo list with remaining work
- If score <100: Orchestrator launches another agent to finish
- Only advance to next task when current task = 100/100
- No exceptions - partial completion blocks progress

### Dependency-Based Task Prioritization (MANDATORY)
**Tasks must be executed in correct dependency order.**

1. **Identify Dependencies**: Map all task prerequisites before execution
2. **Create Dependency Graph**: Visual representation of task relationships  
3. **Priority Sequence**: Execute foundation tasks before dependent tasks
4. **Parallel Groups**: Only launch tasks with zero remaining dependencies
5. **Blocking Prevention**: Never start a task missing required inputs

### Parallel Execution Strategy
**Use maximum concurrency for independent tasks.**

- Launch multiple agents simultaneously ONLY for tasks with zero dependencies
- Coordinate dependent tasks in strict sequence
- Each agent works on isolated components  
- Share results through file outputs only
- **Critical**: Verify all dependencies satisfied before agent launch

### Task Breakdown Structure

#### Phase 1: Setup & Foundation (Day 1-5)
```
PARALLEL GROUP A (Launch simultaneously):
├── Agent 1: Repository Setup (10 min)
│   ├── Subtask 1.1: Fork Activepieces repo (3 min)
│   ├── Subtask 1.2: Clone and setup branches (3 min) 
│   ├── Subtask 1.3: Add upstream remote (2 min)
│   └── Subtask 1.4: Create development branch (2 min)
│
├── Agent 2: Environment Configuration (10 min)
│   ├── Subtask 2.1: Copy .env.example (1 min)
│   ├── Subtask 2.2: Configure basic settings (4 min)
│   ├── Subtask 2.3: Install dependencies (3 min)
│   └── Subtask 2.4: Verify installation (2 min)
│
└── Agent 3: Development Setup (10 min)
    ├── Subtask 3.1: Start Docker services (3 min)
    ├── Subtask 3.2: Run database migrations (2 min)
    ├── Subtask 3.3: Start dev server (3 min)
    └── Subtask 3.4: Verify UI loads (2 min)

SEQUENTIAL GROUP B (After Group A completes):
├── Agent 4: Codebase Analysis (10 min)
│   ├── Subtask 4.1: Map critical files (4 min)
│   ├── Subtask 4.2: Identify customization points (4 min)
│   └── Subtask 4.3: Document findings (2 min)
│
└── Agent 5: Asset Pipeline Setup (10 min)
    ├── Subtask 5.1: Create asset directories (3 min)
    ├── Subtask 5.2: Setup asset pipeline (4 min)
    └── Subtask 5.3: Add placeholder assets (3 min)
```

#### Phase 2: UI Customization (Day 6-10)
```
PARALLEL GROUP C (Launch simultaneously):
├── Agent 6: Theme System (10 min)
│   ├── Subtask 6.1: Create SOP theme SCSS (5 min)
│   ├── Subtask 6.2: Define CSS variables (3 min)
│   └── Subtask 6.3: Apply theme to components (2 min)
│
├── Agent 7: Navigation Components (10 min)
│   ├── Subtask 7.1: Create SOP navbar component (4 min)
│   ├── Subtask 7.2: Update navigation items (3 min)
│   └── Subtask 7.3: Style navbar (3 min)
│
├── Agent 8: Terminology Service (10 min)
│   ├── Subtask 8.1: Create terminology service (4 min)
│   ├── Subtask 8.2: Build translation pipe (3 min)
│   └── Subtask 8.3: Create translation directive (3 min)
│
└── Agent 9: Layout Components (10 min)
    ├── Subtask 9.1: Create SOP layout component (4 min)
    ├── Subtask 9.2: Create sidebar component (3 min)
    └── Subtask 9.3: Implement responsive layout (3 min)

PARALLEL GROUP D (After Group C completes):
├── Agent 10: Dashboard Implementation (10 min)
│   ├── Subtask 10.1: Create dashboard component (4 min)
│   ├── Subtask 10.2: Add stats cards (3 min)
│   └── Subtask 10.3: Add recent SOPs table (3 min)
│
└── Agent 11: Branding Service (10 min)
    ├── Subtask 11.1: Create branding service (4 min)
    ├── Subtask 11.2: Implement client loading (3 min)
    └── Subtask 11.3: Apply branding dynamically (3 min)
```

#### Phase 3: SOP Pieces (Day 11-15)
```
PARALLEL GROUP E (Launch simultaneously):
├── Agent 12: Common Framework (10 min)
│   ├── Subtask 12.1: Create SOP types (3 min)
│   ├── Subtask 12.2: Build utilities (4 min)
│   └── Subtask 12.3: Create validators (3 min)
│
├── Agent 13: Process Step Piece (10 min)
│   ├── Subtask 13.1: Create process step piece (4 min)
│   ├── Subtask 13.2: Add configuration properties (3 min)
│   └── Subtask 13.3: Implement execution logic (3 min)
│
├── Agent 14: Decision Point Piece (10 min)
│   ├── Subtask 14.1: Create decision piece (4 min)
│   ├── Subtask 14.2: Add decision options (3 min)
│   └── Subtask 14.3: Implement decision logic (3 min)
│
└── Agent 15: Approval Gate Piece (10 min)
    ├── Subtask 15.1: Create approval piece (4 min)
    ├── Subtask 15.2: Add approver configuration (3 min)
    └── Subtask 15.3: Implement approval workflow (3 min)

PARALLEL GROUP F (After Group E completes):
├── Agent 16: Data Form Piece (10 min)
│   ├── Subtask 16.1: Create form piece (4 min)
│   ├── Subtask 16.2: Add field configurations (3 min)
│   └── Subtask 16.3: Implement form logic (3 min)
│
├── Agent 17: Notification Piece (10 min)
│   ├── Subtask 17.1: Create notification piece (4 min)
│   ├── Subtask 17.2: Add channel options (3 min)
│   └── Subtask 17.3: Implement notification logic (3 min)
│
└── Agent 18: Compliance Piece (10 min)
    ├── Subtask 18.1: Create compliance piece (4 min)
    ├── Subtask 18.2: Add framework options (3 min)
    └── Subtask 18.3: Implement compliance logic (3 min)
```

#### Phase 4: Integration & Export (Day 16-20)
```
PARALLEL GROUP G (Launch simultaneously):
├── Agent 19: Export Service (10 min)
│   ├── Subtask 19.1: Create export service (4 min)
│   ├── Subtask 19.2: Implement JSON export (3 min)
│   └── Subtask 19.3: Implement text export (3 min)
│
├── Agent 20: Export UI (10 min)
│   ├── Subtask 20.1: Create export dialog (4 min)
│   ├── Subtask 20.2: Add format selection (3 min)
│   └── Subtask 20.3: Handle export actions (3 min)
│
├── Agent 21: Backend API (10 min)
│   ├── Subtask 21.1: Create export controller (4 min)
│   ├── Subtask 21.2: Add JSON endpoint (3 min)
│   └── Subtask 21.3: Add text endpoint (3 min)
│
└── Agent 22: Client Management (10 min)
    ├── Subtask 22.1: Create client service (4 min)
    ├── Subtask 22.2: Add client switching (3 min)
    └── Subtask 22.3: Implement client storage (3 min)

PARALLEL GROUP H (Final integration):
├── Agent 23: Testing & Validation (10 min)
│   ├── Subtask 23.1: Run manual tests (4 min)
│   ├── Subtask 23.2: Validate exports (3 min)
│   └── Subtask 23.3: Check UI terminology (3 min)
│
└── Agent 24: Deployment Setup (10 min)
    ├── Subtask 24.1: Create production config (4 min)
    ├── Subtask 24.2: Setup Docker compose (3 min)
    └── Subtask 24.3: Verify deployment (3 min)
```

## Agent Communication Protocol

### Status Reporting Format
```
AGENT_ID: [TASK_NAME] - [STATUS] - [TIME_ELAPSED] - [COMPLETION_SCORE]
Example: Agent_12: Common Framework - COMPLETED - 8min - SCORE: 100/100
Example: Agent_15: Approval Gate - PARTIAL - 10min - SCORE: 75/100
```

### Context Provision (Orchestrator Responsibility)
**Claude-Code must provide complete context to each subagent:**

```
SUBAGENT CONTEXT TEMPLATE:
- Project Overview: [SOP Tool purpose and goals]
- Current Phase: [Which phase and day we're in]
- Specific Task: [Exact task with acceptance criteria]
- Dependencies: [What inputs are required and where to find them]
- Expected Deliverables: [Exact files/outputs expected]
- Success Criteria: [How to score 100/100]
- Time Limit: [10 minutes maximum]
- File Locations: [Where to create/modify files]
- Integration Points: [How this connects to other components]
```

### Dependency Management
```
WAITING_FOR: Agent_X to complete Task_Y
BLOCKING: Agent_Z waiting for my output
READY: All dependencies met, starting execution
```

### File Output Standards
```
Each agent must create:
├── /outputs/agent_[ID]/
│   ├── deliverables.md (what was built)
│   ├── code_changes.md (files modified)
│   ├── status.md (completion status)
│   └── next_steps.md (what depends on this)
```

## Coordination Rules

### Launch Sequence
1. **Identify parallel groups** - tasks with no dependencies
2. **Launch all agents in group simultaneously** - maximum concurrency
3. **Monitor 10-minute completion** - enforce time limit
4. **Collect outputs** - verify deliverables
5. **Launch next dependent group** - maintain flow

### Completion Verification (Orchestrator Responsibility)
**After each agent reports completion:**

1. **Verify Score**: Agent must report score 1-100
2. **If Score < 100**: 
   - Orchestrator reviews incomplete work
   - Updates todo list with remaining tasks
   - Launches new agent to complete missing work
   - **DO NOT PROCEED** to next task until 100/100
3. **If Score = 100**: 
   - Verify deliverables exist and are correct
   - Mark task as complete in master tracking
   - Enable dependent tasks to launch
4. **Documentation**: Record completion in project state

### Failure Recovery
- If agent exceeds 10 minutes: **TERMINATE** and break task smaller
- If agent score < 100: **LAUNCH** additional agent to finish work
- If agent fails: **RESTART** with clearer subtask definition  
- If blocking issue: **ESCALATE** to human coordinator
- If dependency missing: **QUEUE** until dependency resolved
- **Critical**: Never advance with incomplete work (score < 100)

### Quality Gates
```
Each subtask must produce:
✅ Working code (if applicable)
✅ Clear deliverable 
✅ Status report
✅ Time under 10 minutes
❌ No exceptions allowed
```

## Success Metrics

### Execution Efficiency
- **Target**: 95%+ tasks complete within 10 minutes
- **Concurrency**: Maximum parallel agents utilized
- **Dependencies**: Zero blocking delays >10 minutes
- **Quality**: All deliverables meet acceptance criteria

### Timeline Adherence
- **Phase 1**: Complete in 5 days maximum
- **Phase 2**: Complete in 5 days maximum  
- **Phase 3**: Complete in 5 days maximum
- **Phase 4**: Complete in 4 days maximum
- **Total**: 19 working days (4 weeks)

This execution framework ensures rapid, parallel implementation while preventing over-engineering through strict time constraints and clear deliverable requirements.
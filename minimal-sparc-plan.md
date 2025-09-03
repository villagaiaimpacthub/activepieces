# Minimal SPARC Plan - Activepieces SOP Tool

## Reality Check: We're Not Ready to Build Yet

**Critical Assessment**: The project lacks essential technical specifications for implementation. We need focused SPARC phases but with STRICT anti-over-engineering constraints.

**Time Limit**: MAXIMUM 1 week total for missing specifications

## Required SPARC Phases (Minimal & Focused)

### Phase 1: Essential Specifications (3 days max)

**Day 1: Activepieces Platform Analysis**
- [ ] Fork Activepieces repo and analyze codebase structure
- [ ] Identify UI customization points (navigation, theming, components)
- [ ] Document piece creation framework and APIs
- [ ] Map export/import capabilities
- [ ] Test local development setup

**Day 2: Functional Requirements (MVP Only)**
- [ ] Define 5-7 core SOP workflow pieces needed
- [ ] Specify export formats (JSON, PDF) with examples
- [ ] Document client workflow: design → export → handoff
- [ ] Define UI changes needed (branding, terminology, navigation)
- [ ] Create acceptance criteria for MVP features

**Day 3: Technical Specifications**
- [ ] Database schema changes (if any) for SOP customization
- [ ] API endpoints for export functionality
- [ ] Authentication/multi-tenancy approach
- [ ] File structure for custom components and pieces

### Phase 2: Simple Architecture (2 days max)

**Day 4: System Design**
- [ ] Component architecture: which Activepieces files to modify
- [ ] Custom piece framework implementation approach
- [ ] Export system design (simple, not enterprise)
- [ ] UI customization strategy (overlay, not rebuild)
- [ ] Deployment approach (Docker, not Kubernetes)

**Day 5: Integration Plan**
- [ ] Fork maintenance strategy (how to sync upstream)
- [ ] Development workflow and testing approach
- [ ] Client onboarding process design
- [ ] Data flow: SOP design → specification export

## Anti-Over-Engineering Constraints

### Forbidden Complexity
❌ **NO microservices** - Use Activepieces monolith
❌ **NO enterprise auth** - Use built-in Activepieces auth
❌ **NO complex databases** - Use existing PostgreSQL schema
❌ **NO advanced scaling** - Single instance deployment
❌ **NO comprehensive testing** - Basic validation only
❌ **NO multiple export formats** - Start with JSON + PDF only

### Required Simplicity
✅ **Fork + customize** existing Activepieces
✅ **Overlay UI changes** don't rebuild interface
✅ **Simple custom pieces** follow existing patterns
✅ **Basic export** JSON + PDF generation
✅ **Single tenant** per deployment (no multi-tenancy complexity)
✅ **Docker deployment** simple containerization

## Deliverables Required

### Specification Phase Outputs
1. **activepieces-analysis.md** - Platform capabilities and customization points
2. **sop-requirements.md** - Core features and acceptance criteria (MVP only)
3. **technical-specs.md** - API endpoints, data structures, export formats

### Architecture Phase Outputs  
4. **system-architecture.md** - Component modifications and custom pieces
5. **implementation-approach.md** - Development workflow and deployment plan

### Success Criteria (Good Enough to Start Coding)
- [ ] Developer can fork Activepieces and run locally
- [ ] Clear list of files to modify for UI customization
- [ ] Documented approach for creating 5-7 custom SOP pieces
- [ ] Export system design with example outputs
- [ ] Client workflow defined from design to specification

## Time Estimates & Schedule

**Total Duration**: 5 working days maximum

```
Week Schedule:
Monday    - Fork setup and platform analysis
Tuesday   - Functional requirements (MVP scope only)
Wednesday - Technical specifications (essential APIs only)
Thursday  - Simple architecture design
Friday    - Implementation approach and final review
```

## Go/No-Go Implementation Criteria

### Ready to Start Coding When:
- [ ] All 5 deliverables completed
- [ ] Developer can run Activepieces locally
- [ ] Custom piece creation approach documented
- [ ] Export functionality designed with examples
- [ ] UI customization plan with specific file targets
- [ ] Client workflow clearly defined

### Still Not Ready If:
- [ ] Platform analysis incomplete
- [ ] Custom piece framework not understood
- [ ] Export system design missing
- [ ] UI customization approach undefined
- [ ] Technical debt/complexity creeping in

## Anti-Over-Engineering Checklist

Before each deliverable, verify:
- [ ] **Is this essential for MVP?** (If no, remove it)
- [ ] **Can we build this in 4 weeks?** (If no, simplify)
- [ ] **Does this use Activepieces existing capabilities?** (If no, reconsider)
- [ ] **Would a developer know how to implement this?** (If no, add details)
- [ ] **Are we rebuilding what already exists?** (If yes, use existing)

## Risk Mitigation

### Primary Risks
1. **Analysis paralysis** - Strict 5-day time limit
2. **Over-engineering creep** - Daily complexity review
3. **Scope expansion** - MVP feature freeze
4. **Perfect solution syndrome** - "Good enough" standard

### Mitigation Strategies  
1. **Daily time boxing** - No deliverable takes more than 1 day
2. **Simplicity review** - Daily check against anti-over-engineering list
3. **MVP focus** - Only features needed for client SOP design tool
4. **Implementation focus** - Every spec must answer "how to build this"

## Success Definition

**Project is ready for implementation when:**
- Any developer can fork the repo and understand the customization approach
- Custom SOP pieces can be created following documented patterns
- Export system can generate client specifications
- UI can be customized for SOP-specific branding and terminology
- Client workflow is clear from SOP design to automation handoff

**Timeline**: Start coding by end of week 1 (5 days max for specs)
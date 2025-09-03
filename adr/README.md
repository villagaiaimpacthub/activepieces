# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the Activepieces SOP Tool project.

## About ADRs

Architecture Decision Records (ADRs) document significant architectural decisions made during development, including the context, decision, alternatives considered, and consequences.

## ADR Index

| ADR | Date | Status | Title | Summary |
|-----
| [ADR-006](adr-20250903-006-recent-development-changes.md) | 2025-09-03 | Accepted | Recent Development Changes | Auto-generated ADR |
| [ADR-005](adr-20250903-005-recent-development-changes.md) | 2025-09-03 | Accepted | Recent Development Changes | Auto-generated ADR |
| [ADR-004](adr-20250903-004-phase-completion.md) | 2025-09-03 | Accepted | Phase Completion | Auto-generated ADR |
| [ADR-003](adr-20250903-003-phase-2-group-e-completion---navigation-and-branding.md) | 2025-09-03 | Accepted | Phase 2 GROUP E Completion - Navigation and Branding | Auto-generated ADR ||------|--------|-------|---------|
| [ADR-001](adr-20250903-001-sop-customization-approach.md) | 2025-09-03 | Accepted | SOP Customization Approach | Decision to customize Activepieces with SOP-specific theming and terminology |
| [ADR-002](adr-20250903-002-phase-2-group-d-ui-customization-completion.md) | 2025-09-03 | Accepted | Phase 2 GROUP D UI Customization Completion | Completion of theme system, terminology service, and layout components |

## ADR Status Definitions

- **Proposed**: Under consideration, not yet implemented
- **Accepted**: Approved and implemented
- **Superseded**: Replaced by a newer decision
- **Deprecated**: No longer applicable

## Automatic ADR Generation

This project uses automatic ADR generation through:
- Claude Code integration hooks
- Git workflow automation
- Agent-based decision tracking

ADRs are automatically created when:
- Major architectural changes are made
- New phases or components are implemented  
- Significant technical decisions are made by agents
- Phase completions trigger architecture documentation

## Template

New ADRs should follow the template in [adr-YYYYMMDD-nn-short-title.md](adr-YYYYMMDD-nn-short-title.md).

## Contributing

ADRs are primarily generated automatically by the Claude Code agent system, but can be manually created following the established template and numbering convention.
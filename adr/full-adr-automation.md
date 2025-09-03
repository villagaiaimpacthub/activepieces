The markdown content previously shared is an essential foundation, but for full ADR automation with Claude-Code—especially for automatically updating decisions as agents work—one additional document is typically needed: a workflow or automation configuration file. This is what links your repository, the `/adr/` folder, and Claude-Code's agentic processes so ADRs are created and updated continuously—not just manually.

## What Else Is Needed?

### 1. ADR Directory and Naming Convention
You’ve already got the `/adr` folder and markdown template—ensure this directory exists in the repo and your team (and agents) use a standard naming pattern (e.g., `adr-YYYYMMDD-nn-title.md`).[1][2]

### 2. **Automation Script or Workflow**
You need either:
- A workflow file (e.g., `.github/workflows/adr-update.yml` for GitHub Actions, or equivalent for your CI), or
- A project-local script (e.g., `scripts/generate-adr.sh` or `.js`) that Claude-Code can call at each merge, commit, or predefined architectural event.

This workflow script should:
- Detect major changes (merged PRs, refactors, config updates, etc.).
- Generate an ADR markdown file using commit messages, diff summaries, or custom prompts, including “why” and “how”.
- Add the new file to `/adr/`, push to the repo, and optionally open a review PR.

### 3. (Optional but Recommended) ADR README or Index
A root `adr/README.md` or `adr/index.md` file should list all ADRs with statuses and links, making it easy to navigate for new devs and agents. Agents can also be configured to update this index file automatically.

***

## Example: GitHub Actions Workflow for ADR

```yaml
# .github/workflows/adr-generator.yml
name: Auto-generate ADR

on:
  pull_request:
    types: [closed]
    branches:
      - main

jobs:
  generate-adr:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Generate ADR via Claude-Code agent
        run: |
          python scripts/generate_adr_from_pr.py \
          --pr "${{ github.event.pull_request.number }}" \
          --output "adr/adr-$(date +%Y%m%d)-${{ github.run_number }}-auto.md"
      - name: Commit and push ADR
        run: |
          git config user.name "claude-code bot"
          git config user.email "bot@claude.code"
          git add adr/
          git commit -m "chore(adr): auto-generate ADR after PR #${{ github.event.pull_request.number }}"
          git push
```
*(Modify the agent/script command to match your actual implementation.)*[3][4]

***

## Minimal File Checklist

| File                                 | Purpose                                                |
|-------------------------------------- |-------------------------------------------------------|
| `/adr/README.md` or `/adr/index.md`   | List/index of ADRs, links, statuses                    |
| `/adr/adr-template.md`                | Reference template for manual or automated ADRs        |
| `/adr/adr-YYYYMMDD-nn-title.md`       | Actual decision records—one per architectural choice   |
| `.github/workflows/adr-generator.yml` | (GitHub Actions) Automation to generate ADRs on merge  |
| `scripts/generate_adr_from_pr.py`     | Script for extracting reasoning and writing new ADR    |

***

**In summary:**  
A single markdown template is enough for manual ADRs, but for fully agentic/automated ADRs—especially with Claude-Code—an additional automation workflow document (plus an ADR index) is considered best practice and will ensure the process is smooth, discoverable, and future-proof.[2][4][1][3]

[1](https://github.com/joelparkerhenderson/architecture-decision-record)
[2](https://codesoapbox.dev/preserving-critical-software-knowledge-using-architectural-decision-records/)
[3](https://gist.github.com/ruvnet/e8bb444c6149e6e060a785d1a693a194)
[4](https://www.linkedin.com/pulse/customizing-claude-code-building-agentic-ai-driven-bobby-bonestell-vzdzc)
[5](https://cloud.google.com/architecture/architecture-decision-records)
[6](https://dev.to/audaciatechnology/using-adrs-to-document-technical-development-decisions-2mmn)
[7](https://github.com/adr/adr-manager)
[8](https://endjin.com/blog/2024/03/adr-a-dotnet-tool-for-creating-and-managing-architecture-decision-records)
[9](https://patchtuesday.com/blog/tech-blog/create-automatic-deployment-rule-in-sccm/)
[10](https://handbook.gitlab.com/handbook/engineering/architecture/workflow/)
[11](https://learn.microsoft.com/en-us/intune/configmgr/sum/deploy-use/automatically-deploy-software-updates)
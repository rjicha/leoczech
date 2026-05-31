# Spec: Issue-First Agentic Workflow

## Goal

Establish a structured, issue-first development workflow where every non-content-edit change starts with a GitHub issue. The issue drives spec creation and implementation — either automated via GitHub Actions or manually on a local machine.

## Current State

- Development workflow in CLAUDE.md starts with writing a spec — no mention of GitHub issues
- Branch naming uses `feature/<short-description>` without issue numbers
- One GitHub Action exists: `issue-editor.yml` handles `content-edit` labeled issues
- README.md mentions agentic workflows but doesn't document the full process

## Target State

### Issue-First Workflow

Every feature or fix (not `content-edit`) must start with a GitHub issue describing the **what** and **why**. From the issue, a spec file is created in `docs/specs/` covering the **how**. The issue and spec reference each other.

### Two Execution Modes

| Mode | Trigger | Who does the work |
|------|---------|-------------------|
| **Automated** | Issue labeled `automate` | GitHub Action runs Claude Code to write the spec, implement, and open a PR |
| **Local** | No `automate` label | Developer picks up the issue locally, writes the spec and implements |

### Naming Conventions

| Artifact | Pattern | Example |
|----------|---------|---------|
| **Branch** | `feature/<issue-number>-<short-description>` or `fix/<issue-number>-<short-description>` | `feature/16-agentic-workflow` |
| **Spec file** | `docs/specs/<issue-number>-<short-description>.md` | `docs/specs/16-agentic-workflow.md` |
| **PR title** | `<type>: <description> (#<issue-number>)` | `feat: add issue-first agentic workflow (#16)` |

## Files to Change

### 1. `.github/workflows/issue-implementer.yml` (create)
- New GitHub Action triggered by `automate` label on issues
- Runs Claude Code with full tool access to write spec, implement, and open PR
- Follows naming conventions for branch and spec file
- PR body references the issue and includes `Closes #N`

### 2. `CLAUDE.md` (modify)
- Replace the development workflow section with the issue-first process
- Add naming conventions table
- Clarify that the first step is always a GitHub issue (unless content-edit)
- Keep the existing Conventions section unchanged

### 3. `README.md` (modify)
- Add "Agentic Workflow" section documenting both automated and local modes
- Explain the `automate` label and what to expect from each mode

### 4. `docs/specs/16-agentic-workflow.md` (create)
- This spec file itself

## Validation

1. `hugo --minify` succeeds (documentation-only changes shouldn't break build)
2. Review the GitHub Action YAML for correct syntax and triggers
3. Verify CLAUDE.md workflow is clear and complete
4. Verify README.md documents both modes
5. Check naming conventions are consistent across all files

# Agent Instructions

See `README.md` for project overview, stack, and development setup.

## Development Workflow

Every feature or fix starts with a GitHub issue. Content edits use the `content-edit` label instead (see README.md).

### Naming Conventions

| Artifact | Pattern | Example |
|----------|---------|---------|
| **Branch** | `feature/<issue-number>-<short-description>` or `fix/<issue-number>-<short-description>` | `feature/16-agentic-workflow` |
| **Spec file** | `docs/specs/<issue-number>-<short-description>.md` | `docs/specs/16-agentic-workflow.md` |
| **PR title** | `<type>: <description> (#<issue-number>)` | `feat: add issue-first agentic workflow (#16)` |
| **Squash commit** | Same as PR title (auto from repo settings) | `feat: add issue-first agentic workflow (#16)` |

The issue number ties everything together — branch, spec, PR, and commit are all traceable back to the originating issue.

### 1. Issue

Create a GitHub issue describing the **what** and **why**. If the issue should be implemented automatically by a GitHub Action, add the `automate` label. Otherwise, pick it up locally.

### 2. Spec

Write a spec in `docs/specs/<issue-number>-<short-description>.md`. The spec must include:

- **Goal** - what we're trying to achieve and why
- **Current State** - what exists today
- **Target State** - what the end result should look like, with concrete data/content
- **Files to Change** - list every file that needs modification and what changes
- **Validation** - how to verify the change works

Use `docs/specs/contact-page-grouped-layout.md` as a reference for format and level of detail.

### 3. Branch

Create a fresh git branch from `master` using the naming convention: `feature/<issue-number>-<short-description>` or `fix/<issue-number>-<short-description>`.

Break the spec into ordered implementation steps. Consider dependencies between files.

### 4. Implement

Follow the plan step by step. After each significant change, verify it builds:

```bash
hugo --minify
```

### 5. Validate

Before creating a PR:

1. Run `hugo --minify` - must succeed with no errors
2. Run `hugo server -D` and visually verify the change in a browser
3. Check both Czech and English versions if content was modified
4. Confirm the diff matches what the spec describes - nothing more, nothing less
5. If the design evolved during implementation, update the spec to reflect the final state

### 6. Pull Request

Create a PR targeting `master` with:

- Title following the convention: `<type>: <description> (#<issue-number>)`
- Body referencing the issue and listing what was done, with `Closes #<issue-number>`
- Wait for approval before merging

## Conventions

- Czech is the primary language; English mirrors it
- Contact data lives in frontmatter, not in Markdown body
- Keep CSS minimal and in `assets/css/main.css`
- Use relative URLs (`relativeURLs = true` in hugo.toml)
- Templates in `layouts/_default/` render frontmatter data

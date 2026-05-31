# Agent Instructions

See `README.md` for project overview, stack, and development setup.

## Development Workflow

Every change follows this sequence. Do not skip steps.

### 1. Spec

Write a spec in `docs/specs/` as Markdown. The spec must include:

- **Goal** - what we're trying to achieve and why
- **Current State** - what exists today
- **Target State** - what the end result should look like, with concrete data/content
- **Files to Change** - list every file that needs modification and what changes
- **Validation** - how to verify the change works

Use `docs/specs/contact-page-grouped-layout.md` as a reference for format and level of detail.

### 2. Plan

Create a fresh git branch from `master` for the implementation. Branch naming: `feature/<short-description>` or `fix/<short-description>`.

Break the spec into ordered implementation steps. Consider dependencies between files.

### 3. Implement

Follow the plan step by step. After each significant change, verify it builds:

```bash
hugo --minify
```

### 4. Validate

Before creating a PR:

1. Run `hugo --minify` - must succeed with no errors
2. Run `hugo server -D` and visually verify the change in a browser
3. Check both Czech and English versions if content was modified
4. Confirm the diff matches what the spec describes - nothing more, nothing less

### 5. Pull Request

Create a PR targeting `master` with:

- Title summarizing the change
- Body referencing the spec and listing what was done
- Wait for approval before merging

## Conventions

- Czech is the primary language; English mirrors it
- Contact data lives in frontmatter, not in Markdown body
- Keep CSS minimal and in `assets/css/main.css`
- Use relative URLs (`relativeURLs = true` in hugo.toml)
- Templates in `layouts/_default/` render frontmatter data

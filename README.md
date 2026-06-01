# LeoCzech Website

**Live site:** https://rjicha.github.io/leoczech/

Company website for LeoCzech spol. s r.o., built with [Hugo](https://gohugo.io/) and hosted on [GitHub Pages](https://pages.github.com/).

This website is developed and maintained entirely through agentic workflows. Every change starts as a spec, gets implemented by an AI agent on a dedicated branch, and lands via a reviewed pull request. Content editing is also agentic — instead of a CMS admin panel, anyone can open a GitHub Issue with the `content-edit` label and an agent creates a PR with the requested changes. The project serves as both the real company website and a personal experiment in AI-driven development.

## Development

```bash
hugo server -D
```

Open http://localhost:1313/

## Content Editing

Content files are in `content/cs/` (Czech) and `content/en/` (English) as Markdown with YAML frontmatter.

To request a content change without editing files directly, open a GitHub Issue with the `content-edit` label. An AI agent will create a PR with the proposed changes.

## Agentic Workflow

Every feature or fix starts with a GitHub issue. There are two execution modes:

### Automated (GitHub Action)

Add the `automate` label to an issue. A GitHub Action will run Claude Code to:

1. Write a spec in `docs/specs/`
2. Implement the changes on a feature branch
3. Verify the build with `hugo --minify`
4. Open a PR referencing the issue

The label can be added or removed at any time — adding it later triggers the action, removing it stops automation. This is best for smaller, well-defined changes to keep API costs down.

### Local

Without the `automate` label, a developer picks up the issue and implements it locally using their own Claude subscription, following the workflow described in `CLAUDE.md`.

Both modes converge to the same outcome: a spec in `docs/specs/`, a PR referencing the issue, and the issue closed on merge.

## Preview

Every pull request automatically gets a deploy preview hosted on Netlify. The preview URL appears as a status check on the PR, allowing reviewers to see the changes on a live site before merging.

## Deployment

Pushes to `master` automatically build and deploy via GitHub Actions.

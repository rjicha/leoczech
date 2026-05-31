# LeoCzech Website

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

## Preview

Every pull request automatically gets a deploy preview hosted on Netlify. The preview URL appears as a status check on the PR, allowing reviewers to see the changes on a live site before merging. Preview configuration is in `netlify.toml`.

## Deployment

Pushes to `master` automatically build and deploy via GitHub Actions.

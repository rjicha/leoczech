# LeoCzech Website

Company website for LeoCzech spol. s r.o., built with [Hugo](https://gohugo.io/) and hosted on [GitHub Pages](https://pages.github.com/).

## Development

```bash
hugo server -D
```

Open http://localhost:1313/

## Content Editing

Content files are in `content/cs/` (Czech) and `content/en/` (English) as Markdown with YAML frontmatter.

To request a content change without editing files directly, open a GitHub Issue with the `content-edit` label. An AI agent will create a PR with the proposed changes.

## Deployment

Pushes to `master` automatically build and deploy via GitHub Actions.

# Phase 4: Automation & Cleanup

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the AI-powered issue editor workflow and finalize the project with README and verification.

**Architecture:** GitHub Action triggered on issues with `content-edit` label. Claude Code reads the issue, edits the relevant Markdown file(s), and opens a PR for review.

**Tech Stack:** GitHub Actions, Claude Code CLI, Anthropic API

**Depends on:** Phase 1-3 complete (full site deployed with both languages)

---

### Task 1: AI Issue Editor Workflow

**Files:**
- Create: `.github/workflows/issue-editor.yml`

- [ ] **Step 1: Create issue editor workflow**

Create `.github/workflows/issue-editor.yml`:
```yaml
name: AI Content Editor

on:
  issues:
    types: [opened, labeled]

jobs:
  edit-content:
    if: contains(github.event.issue.labels.*.name, 'content-edit')
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Run Claude Code
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          ISSUE_TITLE="${{ github.event.issue.title }}"
          ISSUE_BODY=$(cat <<'ISSUE_EOF'
          ${{ github.event.issue.body }}
          ISSUE_EOF
          )

          BRANCH_NAME="content-edit/${{ github.event.issue.number }}"
          git checkout -b "$BRANCH_NAME"

          claude -p "You are editing the LeoCzech Hugo website. The content files are in content/cs/ (Czech) and content/en/ (English) as Markdown with YAML frontmatter.

          A user has requested this change via a GitHub issue:

          Title: $ISSUE_TITLE

          Description:
          $ISSUE_BODY

          Apply the requested change to the appropriate content file(s). If the change affects text content, update both Czech and English versions. Make minimal, targeted edits." --allowedTools Edit,Read,Glob,Grep

          git add -A
          git diff --cached --quiet && echo "No changes made" && exit 0

          git commit -m "content: apply edit from issue #${{ github.event.issue.number }}

          $ISSUE_TITLE"

          git push origin "$BRANCH_NAME"

      - name: Create Pull Request
        if: success()
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          BRANCH_NAME="content-edit/${{ github.event.issue.number }}"
          git rev-parse --verify "origin/$BRANCH_NAME" 2>/dev/null || exit 0

          gh pr create \
            --base master \
            --head "$BRANCH_NAME" \
            --title "Content edit: ${{ github.event.issue.title }}" \
            --body "Automated content edit from issue #${{ github.event.issue.number }}.

          Please review the changes before merging.

          Closes #${{ github.event.issue.number }}"
```

- [ ] **Step 2: Verify YAML is valid**

Run:
```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/issue-editor.yml'))" && echo "Valid YAML"
```
Expected: "Valid YAML"

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/issue-editor.yml
git commit -m "feat: add AI-powered issue editor workflow"
```

---

### Task 2: README & Final Verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Clean build from scratch**

Run:
```bash
rm -rf public/
hugo --minify
```
Expected: Build succeeds with no warnings.

- [ ] **Step 2: Check all output pages exist**

Run:
```bash
find public -name "index.html" | sort
```

Expected output:
```
public/en/about/index.html
public/en/contact/index.html
public/en/contest/index.html
public/en/index.html
public/index.html
public/kontakt/index.html
public/o-nas/index.html
public/soutez/index.html
```

- [ ] **Step 3: Verify CNAME is in output**

Run:
```bash
cat public/CNAME
```
Expected: `leoczech.cz`

- [ ] **Step 4: Update README**

Replace `README.md` with:
```markdown
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
```

- [ ] **Step 5: Final commit**

```bash
git add README.md
git commit -m "docs: update README with development and editing instructions"
```

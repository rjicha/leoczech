# Spec: Email-to-Issue Bridge via Cloudflare Email Routing + Worker

## Goal

Allow non-technical users to create GitHub issues by sending an email to `issues@leoczech.cz`. The email subject becomes the issue title, the body becomes the issue description, and the sender receives a reply with the created issue link. When a PR referencing the issue is merged, the sender receives a resolution notification with the PR link.

## Current State

- GitHub issues are created manually via the GitHub UI or `gh` CLI
- Non-technical stakeholders must log into GitHub to submit requests
- Cloudflare manages DNS for `leoczech.cz` (A/CNAME records for GitHub Pages)
- No email routing is configured in Cloudflare

## Target State

### Email → Issue Flow

1. User sends email to `issues@leoczech.cz`
2. Cloudflare Email Routing receives it and triggers a Worker
3. Worker parses the email (subject → title, plain text body → description)
4. Worker calls GitHub API to create the issue with label `email`
5. Worker sends reply: "Your request has been received — Issue #N: \<link\>"

### PR Merge → Notification Flow

1. PR with `Closes #N` is merged
2. GitHub Action triggers, fetches issue #N body
3. Action extracts sender email from `Submitted via email by: <email>`
4. Action calls Worker HTTP endpoint to send notification
5. Sender receives: "Your request has been resolved — PR: \<link\>"

### Issue Body Format

```markdown
**Submitted via email by:** sender@example.com

---

<original email body>
```

### Worker Project Structure

```
workers/email-to-issue/
├── wrangler.toml
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts       # email + fetch handlers
│   ├── format.ts      # pure formatting functions
│   └── github.ts      # GitHub API client
└── test/
    ├── format.test.ts
    └── github.test.ts
```

### Cloudflare Configuration

**Email Routing (manual in dashboard):**
- Enable Email Routing for `leoczech.cz`
- Route `issues@leoczech.cz` → Worker `email-to-issue`
- Catch-all → forward to existing email provider

**DNS (auto-added by Cloudflare):**
- MX records for Cloudflare Email Routing
- TXT records for SPF

**Worker Secrets:**
- `GITHUB_TOKEN` — fine-grained PAT scoped to `rjicha/leoczech` with Issues write
- `NOTIFY_SECRET` — shared secret for authenticating GitHub Actions → Worker calls

**Worker Vars (in wrangler.toml):**
- `GITHUB_OWNER` = `rjicha`
- `GITHUB_REPO` = `leoczech`

## Files to Change

### 1. `workers/email-to-issue/wrangler.toml` (create)
- Worker name, compatibility date, entry point
- `send_email` binding for reply/notification emails
- Environment variables for GitHub owner/repo

### 2. `workers/email-to-issue/package.json` (create)
- Runtime dependency: `postal-mime` (email parsing in Workers)
- Dev dependencies: `wrangler`, `vitest`, `@cloudflare/workers-types`, `typescript`

### 3. `workers/email-to-issue/src/format.ts` (create)
- `formatIssueTitle(subject)` — trims subject or returns "(no subject)"
- `formatIssueBody(sender, body)` — formats issue body with sender info
- `createReplyBody(issueNumber, issueUrl)` — reply email body
- `buildRawEmail(opts)` — constructs raw MIME email string

### 4. `workers/email-to-issue/src/github.ts` (create)
- `createGitHubIssue(opts)` — calls GitHub REST API to create issue

### 5. `workers/email-to-issue/src/index.ts` (create)
- `email` handler: parse email → create issue → send reply
- `fetch` handler: POST `/notify` endpoint for PR merge notifications (auth via `NOTIFY_SECRET`)

### 6. `.github/workflows/pr-merged-notify.yml` (create)
- Triggers on `pull_request` closed + merged
- Extracts issue numbers from PR body (`Closes #N`)
- Fetches issue body, extracts sender email
- Calls Worker `/notify` endpoint

## Validation

1. `cd workers/email-to-issue && npm test` — all unit tests pass
2. `npx wrangler deploy` — deploys successfully
3. Send test email to `issues@leoczech.cz` → issue appears with correct title, body, `email` label
4. Sender receives reply email with issue link
5. Merge a PR with `Closes #N` → sender receives resolution email with PR link

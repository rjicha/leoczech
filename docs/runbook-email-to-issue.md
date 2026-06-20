# Runbook: Email-to-Issue Bridge

Operational guide for setting up, deploying, and troubleshooting the email-to-issue bridge. This covers the full setup from scratch.

## Architecture Overview

```
Email (issues@web.leoczech.cz)
  → Cloudflare Email Routing (MX records on web.leoczech.cz)
  → Cloudflare Worker (email-to-issue)
  → Workers AI (configurable model — translates + rephrases into structured English issue)
  → GitHub API (creates issue with email + automate labels)
  → Resend API (sends reply email with issue link)

PR merged with "Closes #N"
  → GitHub Action (pr-merged-notify.yml)
  → Worker HTTP endpoint (/notify)
  → Resend API (sends resolution email to original sender)
```

## Prerequisites

- Cloudflare account with `leoczech.cz` zone
- GitHub repo `rjicha/leoczech`
- Resend account (free tier, resend.com)
- Node.js 18+, npm, wrangler CLI

## 1. DNS Records

All records are on the `leoczech.cz` zone in Cloudflare DNS.

### Email Routing (Cloudflare → Worker)

| Type | Name | Content | Priority |
|------|------|---------|----------|
| MX | `web.leoczech.cz` | `route1.mx.cloudflare.net` | 93 |
| MX | `web.leoczech.cz` | `route2.mx.cloudflare.net` | 81 |
| MX | `web.leoczech.cz` | `route3.mx.cloudflare.net` | 86 |
| TXT | `web.leoczech.cz` | `v=spf1 include:_spf.mx.cloudflare.net ~all` | — |

### Resend (outbound email sending)

| Type | Name | Content | Purpose |
|------|------|---------|---------|
| TXT | `resend._domainkey.web.leoczech.cz` | `p=MIGfMA0GCS...` (DKIM public key from Resend) | DKIM verification |
| MX | `send.web.leoczech.cz` | `feedback-smtp.eu-west-1.amazonses.com` | Resend SPF bounce handling |
| TXT | `send.web.leoczech.cz` | `v=spf1 include:amazonses.com ~all` | Resend SPF |
| TXT | `_dmarc.leoczech.cz` | `v=DMARC1; p=none;` | DMARC policy |

### Existing records (do NOT modify)

| Type | Name | Content | Purpose |
|------|------|---------|---------|
| CNAME | `leoczech.cz` | `rjicha.github.io` | GitHub Pages |
| CNAME | `www.leoczech.cz` | `rjicha.github.io` | GitHub Pages |
| MX | `leoczech.cz` | `mailgateway1.huhtamaki.c...` | Company email (Huhtamaki) |
| MX | `leoczech.cz` | `mailgateway2.huhtamaki.c...` | Company email (Huhtamaki) |

## 2. Cloudflare Email Routing

Dashboard: **Email → Email Routing → Routing rules**

| Routing rule | Action | Status |
|---|---|---|
| `issues@web.leoczech.cz` | Worker `email-to-issue` | Active |
| Catch-all | Drop | Disabled |

## 3. Worker Deployment

```bash
cd workers/email-to-issue
npm install
npx wrangler deploy
```

Worker URL: `https://email-to-issue.radekjicha.workers.dev`

### Worker Secrets

Set via `npx wrangler secret put <NAME>` or Cloudflare Dashboard → Worker → Settings → Variables.

| Secret | Source | Purpose |
|--------|--------|---------|
| `GITHUB_TOKEN` | GitHub → Settings → Developer Settings → Fine-grained tokens | Creates issues. Scope: `rjicha/leoczech`, Issues read/write |
| `RESEND_API_KEY` | Resend dashboard → API Keys | Sends reply and notification emails |
| `NOTIFY_SECRET` | Self-generated (`openssl rand -hex 32`) | Authenticates GitHub Action → Worker `/notify` calls |

### Worker Vars (in wrangler.toml, not secret)

| Var | Value | Notes |
|-----|-------|-------|
| `GITHUB_OWNER` | `rjicha` | |
| `GITHUB_REPO` | `leoczech` | |
| `AI_MODEL` | `@cf/meta/llama-4-scout-17b-16e-instruct` | Change if model is deprecated; see Workers AI dashboard for available models |

### Worker Bindings (in wrangler.toml)

| Binding | Type | Purpose |
|---------|------|---------|
| `AI` | Workers AI | Translates and rephrases email into structured English issue with localized version |

## 4. GitHub Configuration

### Repository Labels

| Label | Color | Purpose |
|-------|-------|---------|
| `email` | `#1d76db` | Marks issues created via email |
| `automate` | — | Triggers automated implementation via GitHub Action |

Create if missing:
```bash
gh label create email --description "Created via email" --color "1d76db"
```

### Actions Secrets

Dashboard: repo → Settings → Secrets and variables → Actions

| Secret | Value | Purpose |
|--------|-------|---------|
| `EMAIL_WORKER_URL` | `https://email-to-issue.radekjicha.workers.dev` | Worker endpoint for PR notifications |
| `EMAIL_NOTIFY_SECRET` | Same value as Worker's `NOTIFY_SECRET` | Authenticates notification requests |

### Workflows

| File | Trigger | Purpose |
|------|---------|---------|
| `.github/workflows/pr-merged-notify.yml` | PR merged | Notifies email sender when their issue's PR is merged |

## 5. Resend Configuration

Dashboard: resend.com → Domains

- Domain: `web.leoczech.cz` (verified)
- Sending from: `issues@web.leoczech.cz`
- Free tier: 100 emails/day, 3000/month

## Troubleshooting

### Email sent but no issue created

1. Check **Cloudflare → Email → Email Routing → Activity Log** — did the email arrive?
2. Check **Worker metrics** (Cloudflare → Workers → email-to-issue → Metrics) — any errors?
3. Check Worker logs: `cd workers/email-to-issue && npx wrangler tail email-to-issue --format pretty`
4. Verify `GITHUB_TOKEN` hasn't expired (fine-grained tokens have max 1 year expiry)

### Issue created but no reply email

1. Check Worker logs for "Failed to send reply" errors
2. Verify `RESEND_API_KEY` is valid in Resend dashboard
3. Check Resend dashboard → Emails for delivery status
4. Verify DNS records for `web.leoczech.cz` (DKIM, SPF) haven't been removed

### AI polishing fails

- Worker falls back to raw email text automatically — issues still get created, just without translation/structure
- Check Worker logs for "AI polishing failed" messages
- Common causes:
  - **Model deprecated:** update `AI_MODEL` in `wrangler.toml` and redeploy. Check available models at Cloudflare → AI → Models
  - **Response parsing error:** the model returned an unexpected format. The Worker handles nested objects and code-fenced JSON, but novel formats may need a parser update
- Workers AI has 10,000 neurons/day free limit — unlikely to hit with normal email volume

### PR merged but no notification email

1. Check GitHub Actions → `pr-merged-notify` run for errors
2. PR body must contain `Closes #N`, `Fixes #N`, or `Resolves #N`
3. The referenced issue must contain `**Submitted via email by:** <email>` in the body
4. Verify `EMAIL_WORKER_URL` and `EMAIL_NOTIFY_SECRET` GitHub Actions secrets are set
5. Test the Worker endpoint: `curl -X POST <WORKER_URL>/notify -H "Authorization: Bearer <SECRET>" -H "Content-Type: application/json" -d '{"to":"test@example.com","issueNumber":1,"issueTitle":"Test","prUrl":"https://example.com"}'`

### Rotating secrets

**GitHub token:** Generate new token → `npx wrangler secret put GITHUB_TOKEN` → paste new token

**Resend API key:** Regenerate in Resend dashboard → `npx wrangler secret put RESEND_API_KEY` → paste new key

**Notify secret:** Generate new value (`openssl rand -hex 32`) → update in both:
- Worker: `npx wrangler secret put NOTIFY_SECRET`
- GitHub: `gh secret set EMAIL_NOTIFY_SECRET --repo rjicha/leoczech --body "<new-value>"`

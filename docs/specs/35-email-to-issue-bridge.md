# Spec: Email-to-Issue Bridge via Cloudflare Email Routing + Worker

## Goal

Allow non-technical users to create GitHub issues by sending an email to `issues@web.leoczech.cz`. The Worker uses AI to translate and rephrase the email into a well-structured English GitHub issue, adds `email` and `automate` labels (triggering automated implementation), and replies to the sender in their language with both localized and English versions of the issue.

## Email → Issue Flow

1. User sends email to `issues@web.leoczech.cz` (any language, Czech most common)
2. Cloudflare Email Routing (MX records on `web.leoczech.cz` subdomain) triggers the Worker
3. Worker parses the email with `postal-mime`
4. Workers AI (configurable model) translates and rephrases into a structured English issue with Context, Requirements, and Acceptance Criteria sections — plus a localized version in the sender's language
5. Worker creates GitHub issue with `email` + `automate` labels
6. Worker sends HTML reply via Resend in the sender's language, showing the localized issue description first, then the English version below

## PR Merge → Notification Flow

1. PR with `Closes #N` is merged
2. GitHub Action (`pr-merged-notify.yml`) fetches issue #N body
3. Action extracts sender email from `**Original email from:** <email>` and language from `**Language:** <code>`
4. Action calls Worker HTTP endpoint `POST /notify` to send resolution email
5. Sender receives notification with PR link

## Issue Body Format (on GitHub, English)

```markdown
## Description

### Context
<AI-generated context>

### Requirements
- <bulleted list>

### Acceptance Criteria
- [ ] <checklist>

---
**Original email from:** sender@example.com
**Language:** cs

> <original email text in original language>
```

## Worker Project Structure

```
workers/email-to-issue/
├── wrangler.toml          # config, AI binding, model var
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── index.ts           # email + fetch handlers
│   ├── ai.ts              # Workers AI integration
│   ├── format.ts          # issue body + HTML email formatting
│   └── github.ts          # GitHub API client
└── test/
    ├── format.test.ts
    └── github.test.ts
```

## Infrastructure

- **Cloudflare Email Routing** — MX records on `web.leoczech.cz` subdomain (avoids conflict with Huhtamaki MX on root domain)
- **Cloudflare Workers AI** — free tier, model configurable via `AI_MODEL` env var
- **Resend** — free tier (100 emails/day), sends reply and notification emails from `issues@web.leoczech.cz`
- **GitHub Actions** — `pr-merged-notify.yml` triggers on PR merge

See `docs/runbook-email-to-issue.md` for complete setup, DNS records, secrets, and troubleshooting.

## Validation

1. `cd workers/email-to-issue && npm test` — all unit tests pass
2. `npx wrangler deploy` — deploys successfully
3. Send Czech email → issue created in English with structured description, `email` + `automate` labels
4. Sender receives HTML reply in Czech with both Czech and English issue description
5. Merge PR with `Closes #N` → sender receives resolution email

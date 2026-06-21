# Email-Based PR Merge & Authorized Email Allowlist

## Goal

Enable email requestors to approve and merge PRs directly from the preview notification email, and restrict the entire email-to-issue system to a list of authorized email addresses.

## Current State

- Emails to `issues@web.leoczech.cz` create GitHub issues via a Cloudflare Worker (no sender validation)
- GitHub Actions (issue-implementer) auto-implements the issue and opens a PR
- A preview notification email is sent to the original sender with a preview URL, PR link, and agent log
- A separate notification is sent when the PR is manually merged in GitHub
- Anyone who knows the email address can create issues

## Target State

### 1. Authorized Email Allowlist (KV)

A Workers KV namespace `AUTHORIZED_EMAILS` gates access to the system. Each authorized address is stored as a KV key (value is irrelevant, e.g. `"1"`).

**Inbound email handler (`email()`):**
- Check `await env.AUTHORIZED_EMAILS.get(sender)` before processing
- If unauthorized, silently drop the email — no reply, no AI call, no issue created
- This prevents token spend on spam/bots

**PR approval (`/approve` endpoint):**
- The accept link encodes the original sender's email
- The endpoint verifies the email is still in the KV allowlist before merging

**Management:** Via Cloudflare dashboard or `wrangler kv:key put`.

### 2. Accept Link in Preview Email

When the preview notification is sent, the Worker generates an HMAC-SHA256 token and includes an "Accept" button/link in the email.

**Token generation:**
- Payload: `{pr_number}:{issue_number}:{sender_email}`
- Key: existing `NOTIFY_SECRET`
- Algorithm: HMAC-SHA256, output as hex string

**Accept URL format:**
```
https://{worker-url}/approve?pr={pr_number}&issue={issue_number}&email={sender_email}&lang={language}&token={hmac_hex}
```

The `lang` parameter is NOT part of the HMAC — it's only used for the response page display language.

**Email template changes (`createPreviewHtml`):**
- Add a prominent "Accept Changes" / "Schválit změny" button after the preview link
- Bilingual labels following existing pattern (native language first, English below for non-English)

### 3. `/approve` Endpoint

New HTTP GET endpoint on the Worker that handles the accept link click.

**Flow:**
1. Extract `pr`, `issue`, `email`, `lang`, `token` from query params
2. Recompute HMAC over `{pr}:{issue}:{email}` and compare to `token` — reject if mismatch
3. Check `email` in `AUTHORIZED_EMAILS` KV — reject if not found
4. Call GitHub API: `PUT /repos/{owner}/{repo}/pulls/{pr}/merge` with squash merge
5. Return an HTML response page

**Response pages (bilingual — native + English):**
- **Success:** "Changes have been approved and will be deployed shortly"
- **Already merged:** "This PR has already been merged"
- **Unauthorized:** "This email address is not authorized"
- **Invalid token:** "This link is invalid"
- **Error:** "Something went wrong"

The response uses the `lang` query parameter to select the native language, with English shown below for non-English users (same bilingual pattern as all other emails).

### 4. GitHub API Token Permissions

The existing `GITHUB_TOKEN` Worker secret needs the `contents: write` scope on the repo to perform merges. Verify this is already granted or update the fine-grained token.

## Files to Change

### Worker (`workers/email-to-issue/`)

| File | Change |
|------|--------|
| `wrangler.toml` | Add KV namespace binding for `AUTHORIZED_EMAILS` |
| `src/index.ts` | Add KV check in `email()` handler; compute HMAC token and accept URL internally when handling `type: "preview"` notifications (no API contract change — the Worker has all needed data); add `/approve` GET endpoint |
| `src/format.ts` | Add `approveUrl` param to `createPreviewHtml()`; add localized strings for accept button and response pages; add `createApproveResponseHtml()` function |

### GitHub Actions

| File | Change |
|------|--------|
| `.github/workflows/pr-opened-notify.yml` | No change needed — already passes `to` (sender email) to `/notify` |

### No changes needed

- `pr-merged-notify.yml` — unchanged
- `issue-implementer.yml` — unchanged
- `issue-editor.yml` — unchanged
- `deploy.yml` — unchanged

## Infrastructure

- Create KV namespace: `wrangler kv:namespace create AUTHORIZED_EMAILS`
- Bind in `wrangler.toml`
- Seed initial authorized emails via dashboard or CLI
- Verify `GITHUB_TOKEN` has merge permissions

## Security Considerations

- HMAC token binds PR + issue + email together — a forwarded link won't work for unauthorized recipients
- KV double-check ensures revoked users can't merge even with a valid token
- No response to unauthorized inbound emails prevents information leakage
- Squash merge only — consistent with repo's existing merge strategy
- Already-merged PRs return a harmless "already merged" page (GitHub API returns 405)

## Validation

1. Send email from authorized address → issue created, PR opened, preview email contains accept button
2. Click accept button → PR merged, success page shown in correct bilingual format
3. Click accept button again → "already merged" page
4. Send email from unauthorized address → silently dropped, no issue created
5. Tamper with token in URL → "invalid link" page
6. Remove email from KV, click existing accept link → "not authorized" page

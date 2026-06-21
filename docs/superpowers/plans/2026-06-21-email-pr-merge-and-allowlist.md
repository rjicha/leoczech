# Email-Based PR Merge & Authorized Email Allowlist — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow email requestors to merge PRs from the preview notification email and restrict the email-to-issue system to authorized senders via a Workers KV allowlist.

**Architecture:** Extend the existing Cloudflare Worker (`workers/email-to-issue/`) with three additions: (1) a KV-backed email allowlist checked in the `email()` handler, (2) HMAC-signed approve URLs generated during preview notifications, and (3) a new `/approve` GET endpoint that validates the token, checks the allowlist, and merges the PR via GitHub API.

**Tech Stack:** Cloudflare Workers, Workers KV, Web Crypto API (HMAC-SHA256), GitHub REST API, Vitest

## Global Constraints

- All user-facing text must be bilingual: sender's native language first, English below (for non-English)
- Four languages: cs, sk, de, en (cs is the default fallback)
- Unauthorized inbound emails are silently dropped (no reply, no AI call)
- Squash merge only
- Tests run with `cd workers/email-to-issue && npm test`
- Build check: `cd workers/email-to-issue && npx wrangler deploy --dry-run`

---

### Task 1: Add `mergePullRequest` to github.ts

**Files:**
- Modify: `workers/email-to-issue/src/github.ts`
- Test: `workers/email-to-issue/test/github.test.ts`

**Interfaces:**
- Consumes: nothing new
- Produces: `mergePullRequest(opts: MergePullRequestOptions): Promise<MergeResult>` where `MergeResult = { status: "merged"; message: string } | { status: "already_merged" } | { status: "error"; message: string }`

- [ ] **Step 1: Write the failing test**

Add to `workers/email-to-issue/test/github.test.ts`:

```ts
import { createGitHubIssue, mergePullRequest } from "../src/github";

// ... existing tests ...

describe("mergePullRequest", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns merged on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Pull Request successfully merged" }), { status: 200 }),
    );

    const result = await mergePullRequest({
      pullNumber: 43,
      token: "ghp_test",
      owner: "rjicha",
      repo: "leoczech",
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/rjicha/leoczech/pulls/43/merge",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          Authorization: "Bearer ghp_test",
        }),
      }),
    );

    const sentBody = JSON.parse(
      (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(sentBody.merge_method).toBe("squash");
    expect(result).toEqual({ status: "merged", message: "Pull Request successfully merged" });
  });

  it("returns already_merged on 405", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Method Not Allowed", { status: 405 }),
    );

    const result = await mergePullRequest({
      pullNumber: 43,
      token: "ghp_test",
      owner: "rjicha",
      repo: "leoczech",
    });

    expect(result).toEqual({ status: "already_merged" });
  });

  it("returns error on other failures", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Conflict", { status: 409 }),
    );

    const result = await mergePullRequest({
      pullNumber: 43,
      token: "ghp_test",
      owner: "rjicha",
      repo: "leoczech",
    });

    expect(result).toEqual({ status: "error", message: "GitHub API error: 409 Conflict" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd workers/email-to-issue && npx vitest run test/github.test.ts`
Expected: FAIL — `mergePullRequest` is not exported

- [ ] **Step 3: Write minimal implementation**

Add to end of `workers/email-to-issue/src/github.ts`:

```ts
export interface MergePullRequestOptions {
  pullNumber: number;
  token: string;
  owner: string;
  repo: string;
}

export type MergeResult =
  | { status: "merged"; message: string }
  | { status: "already_merged" }
  | { status: "error"; message: string };

export async function mergePullRequest(
  opts: MergePullRequestOptions,
): Promise<MergeResult> {
  const response = await fetch(
    `https://api.github.com/repos/${opts.owner}/${opts.repo}/pulls/${opts.pullNumber}/merge`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${opts.token}`,
        "Content-Type": "application/json",
        "User-Agent": "email-to-issue-worker",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({ merge_method: "squash" }),
    },
  );

  if (response.ok) {
    const data = (await response.json()) as { message: string };
    return { status: "merged", message: data.message };
  }

  if (response.status === 405) {
    return { status: "already_merged" };
  }

  const error = await response.text();
  return { status: "error", message: `GitHub API error: ${response.status} ${error}` };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd workers/email-to-issue && npx vitest run test/github.test.ts`
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add workers/email-to-issue/src/github.ts workers/email-to-issue/test/github.test.ts
git commit -m "feat: add mergePullRequest to github.ts"
```

---

### Task 2: Add HMAC crypto utility

**Files:**
- Create: `workers/email-to-issue/src/crypto.ts`
- Test: `workers/email-to-issue/test/crypto.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `computeHmac(secret: string, data: string): Promise<string>` (hex-encoded), `verifyHmac(secret: string, data: string, token: string): Promise<boolean>`

- [ ] **Step 1: Write the failing test**

Create `workers/email-to-issue/test/crypto.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { computeHmac, verifyHmac } from "../src/crypto";

describe("computeHmac", () => {
  it("produces a deterministic hex string", async () => {
    const a = await computeHmac("secret", "43:10:alice@example.com");
    const b = await computeHmac("secret", "43:10:alice@example.com");
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces different output for different data", async () => {
    const a = await computeHmac("secret", "43:10:alice@example.com");
    const b = await computeHmac("secret", "44:10:alice@example.com");
    expect(a).not.toBe(b);
  });

  it("produces different output for different secrets", async () => {
    const a = await computeHmac("secret1", "data");
    const b = await computeHmac("secret2", "data");
    expect(a).not.toBe(b);
  });
});

describe("verifyHmac", () => {
  it("returns true for valid token", async () => {
    const token = await computeHmac("secret", "43:10:alice@example.com");
    const valid = await verifyHmac("secret", "43:10:alice@example.com", token);
    expect(valid).toBe(true);
  });

  it("returns false for tampered token", async () => {
    const valid = await verifyHmac("secret", "43:10:alice@example.com", "deadbeef");
    expect(valid).toBe(false);
  });

  it("returns false for wrong data", async () => {
    const token = await computeHmac("secret", "43:10:alice@example.com");
    const valid = await verifyHmac("secret", "44:10:alice@example.com", token);
    expect(valid).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd workers/email-to-issue && npx vitest run test/crypto.test.ts`
Expected: FAIL — module `../src/crypto` not found

- [ ] **Step 3: Write minimal implementation**

Create `workers/email-to-issue/src/crypto.ts`:

```ts
export async function computeHmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyHmac(
  secret: string,
  data: string,
  token: string,
): Promise<boolean> {
  const expected = await computeHmac(secret, data);
  return expected === token;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd workers/email-to-issue && npx vitest run test/crypto.test.ts`
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add workers/email-to-issue/src/crypto.ts workers/email-to-issue/test/crypto.test.ts
git commit -m "feat: add HMAC crypto utility"
```

---

### Task 3: Update format.ts — accept button and approval response page

**Files:**
- Modify: `workers/email-to-issue/src/format.ts`
- Modify: `workers/email-to-issue/test/format.test.ts`

**Interfaces:**
- Consumes: nothing new
- Produces:
  - Updated `createPreviewHtml(issueNumber: number, issueTitle: string, prUrl: string, previewUrl: string, actionsUrl: string, approveUrl: string, language: string): string` — note the new `approveUrl` parameter inserted before `language`
  - New `createApproveResponseHtml(type: ApproveResult, language: string): string` where `ApproveResult = "success" | "already_merged" | "unauthorized" | "invalid_token" | "error"`

- [ ] **Step 1: Write the failing tests**

Replace the `createPreviewHtml` describe block and add a new `createApproveResponseHtml` describe block in `workers/email-to-issue/test/format.test.ts`:

```ts
import {
  formatIssueBody,
  createReplyHtml,
  createPreviewHtml,
  createResolvedHtml,
  createApproveResponseHtml,
} from "../src/format";

// ... existing formatIssueBody and createReplyHtml tests unchanged ...

describe("createPreviewHtml", () => {
  it("renders in Czech with preview, PR, agent, and approve links", () => {
    const result = createPreviewHtml(
      42,
      "Add German version",
      "https://github.com/rjicha/leoczech/pull/43",
      "https://deploy-preview-43--leoczech-preview.netlify.app",
      "https://github.com/rjicha/leoczech/actions/runs/123",
      "https://worker.example.com/approve?pr=43&issue=42&token=abc",
      "cs",
    );
    expect(result).toContain("Dobrý den,");
    expect(result).toContain("připraven ke kontrole");
    expect(result).toContain("deploy-preview-43");
    expect(result).toContain("actions/runs/123");
    expect(result).toContain("Schválit změny");
    expect(result).toContain("approve?pr=43");
  });

  it("renders in English for English emails", () => {
    const result = createPreviewHtml(
      1, "Title", "https://pr", "https://preview", "https://actions",
      "https://worker.example.com/approve?token=abc", "en",
    );
    expect(result).toContain("Hi,");
    expect(result).toContain("ready for review");
    expect(result).toContain("Approve Changes");
  });
});

describe("createApproveResponseHtml", () => {
  it("renders success page in Czech with English below", () => {
    const result = createApproveResponseHtml("success", "cs");
    expect(result).toContain("Změny schváleny");
    expect(result).toContain("brzy budou nasazeny");
    expect(result).toContain("Changes Approved");
    expect(result).toContain("deployed shortly");
  });

  it("renders success page in English without duplicate", () => {
    const result = createApproveResponseHtml("success", "en");
    expect(result).toContain("Changes Approved");
    expect(result).not.toContain("Změny schváleny");
  });

  it("renders already_merged page", () => {
    const result = createApproveResponseHtml("already_merged", "cs");
    expect(result).toContain("Již schváleno");
    expect(result).toContain("Already Approved");
  });

  it("renders unauthorized page", () => {
    const result = createApproveResponseHtml("unauthorized", "de");
    expect(result).toContain("Zugriff verweigert");
    expect(result).toContain("Access Denied");
  });

  it("renders invalid_token page", () => {
    const result = createApproveResponseHtml("invalid_token", "sk");
    expect(result).toContain("Neplatný odkaz");
    expect(result).toContain("Invalid Link");
  });

  it("renders error page", () => {
    const result = createApproveResponseHtml("error", "en");
    expect(result).toContain("Something went wrong");
  });

  it("falls back to Czech for unknown language", () => {
    const result = createApproveResponseHtml("success", "fr");
    expect(result).toContain("Změny schváleny");
  });
});

// ... existing createResolvedHtml tests unchanged ...
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd workers/email-to-issue && npx vitest run test/format.test.ts`
Expected: FAIL — `createApproveResponseHtml` not exported, `createPreviewHtml` signature mismatch

- [ ] **Step 3: Update format.ts implementation**

**3a.** Add accept button strings to the `Strings` interface and each language in `STRINGS`:

Add to the `Strings` interface:

```ts
  acceptDesc: string;
  acceptButton: string;
```

Add to each language object in `STRINGS`:

```ts
// cs:
  acceptDesc: "Pokud jste spokojeni s náhledem, klikněte pro schválení:",
  acceptButton: "Schválit změny",

// sk:
  acceptDesc: "Ak ste spokojní s náhľadom, kliknite pre schválenie:",
  acceptButton: "Schváliť zmeny",

// de:
  acceptDesc: "Wenn Sie mit der Vorschau zufrieden sind, klicken Sie zur Genehmigung:",
  acceptButton: "Änderungen genehmigen",

// en:
  acceptDesc: "If you're happy with the preview, click to approve:",
  acceptButton: "Approve Changes",
```

**3b.** Update `createPreviewHtml` signature and body — add `approveUrl: string` parameter before `language`, and add the accept button after the preview link:

```ts
export function createPreviewHtml(
  issueNumber: number,
  issueTitle: string,
  prUrl: string,
  previewUrl: string,
  actionsUrl: string,
  approveUrl: string,
  language: string,
): string {
  const s = getStrings(language);
  return [
    `<p>${s.hi}</p>`,
    `<p>${s.preview}</p>`,
    `<h3>${s.previewLink}</h3>`,
    `<p><a href="${previewUrl}">${previewUrl}</a></p>`,
    `<p>${s.acceptDesc}</p>`,
    `<p><a href="${approveUrl}" style="display:inline-block;padding:12px 24px;background:#2ea44f;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">${s.acceptButton}</a></p>`,
    `<h3>${s.pullRequest}</h3>`,
    `<p><a href="${prUrl}">${prUrl}</a></p>`,
    `<h3>${s.agentLog}</h3>`,
    `<p>${s.agentLogDesc} <a href="${actionsUrl}">${actionsUrl}</a></p>`,
    "<hr>",
    `<p>Issue #${issueNumber}: <strong>${issueTitle}</strong></p>`,
    `<p style="color: #888; font-size: 12px;">${s.previewFooter}</p>`,
  ].join("\n");
}
```

**3c.** Add `ApproveResult` type, `APPROVE_STRINGS`, and `createApproveResponseHtml` at the end of `format.ts`:

```ts
export type ApproveResult = "success" | "already_merged" | "unauthorized" | "invalid_token" | "error";

interface ApproveResponseStrings {
  title: string;
  message: string;
}

const APPROVE_STRINGS: Record<string, Record<ApproveResult, ApproveResponseStrings>> = {
  cs: {
    success: { title: "Změny schváleny", message: "Změny byly schváleny a brzy budou nasazeny na web." },
    already_merged: { title: "Již schváleno", message: "Tento požadavek již byl schválen a nasazen." },
    unauthorized: { title: "Přístup odepřen", message: "Tato e-mailová adresa není oprávněna ke schvalování změn." },
    invalid_token: { title: "Neplatný odkaz", message: "Tento odkaz je neplatný nebo poškozený." },
    error: { title: "Chyba", message: "Něco se pokazilo. Zkuste to prosím znovu nebo nás kontaktujte." },
  },
  sk: {
    success: { title: "Zmeny schválené", message: "Zmeny boli schválené a čoskoro budú nasadené na web." },
    already_merged: { title: "Už schválené", message: "Táto požiadavka už bola schválená a nasadená." },
    unauthorized: { title: "Prístup zamietnutý", message: "Táto e-mailová adresa nie je oprávnená na schvaľovanie zmien." },
    invalid_token: { title: "Neplatný odkaz", message: "Tento odkaz je neplatný alebo poškodený." },
    error: { title: "Chyba", message: "Niečo sa pokazilo. Skúste to prosím znova alebo nás kontaktujte." },
  },
  de: {
    success: { title: "Änderungen genehmigt", message: "Die Änderungen wurden genehmigt und werden in Kürze veröffentlicht." },
    already_merged: { title: "Bereits genehmigt", message: "Diese Anfrage wurde bereits genehmigt und veröffentlicht." },
    unauthorized: { title: "Zugriff verweigert", message: "Diese E-Mail-Adresse ist nicht zur Genehmigung von Änderungen berechtigt." },
    invalid_token: { title: "Ungültiger Link", message: "Dieser Link ist ungültig oder beschädigt." },
    error: { title: "Fehler", message: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder kontaktieren Sie uns." },
  },
  en: {
    success: { title: "Changes Approved", message: "The changes have been approved and will be deployed shortly." },
    already_merged: { title: "Already Approved", message: "This request has already been approved and deployed." },
    unauthorized: { title: "Access Denied", message: "This email address is not authorized to approve changes." },
    invalid_token: { title: "Invalid Link", message: "This link is invalid or corrupted." },
    error: { title: "Error", message: "Something went wrong. Please try again or contact us." },
  },
};

function getApproveStrings(language: string): Record<ApproveResult, ApproveResponseStrings> {
  return APPROVE_STRINGS[language] || APPROVE_STRINGS.cs;
}

export function createApproveResponseHtml(type: ApproveResult, language: string): string {
  const s = getApproveStrings(language)[type];
  const en = APPROVE_STRINGS.en[type];

  const sections = [
    "<!DOCTYPE html>",
    '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${s.title}</title>`,
    "<style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:40px auto;padding:0 20px;color:#333}h1{font-size:24px}.en{color:#666;font-size:14px;margin-top:24px;padding-top:16px;border-top:1px solid #eee}</style>",
    "</head><body>",
    `<h1>${s.title}</h1>`,
    `<p>${s.message}</p>`,
  ];

  if (language !== "en") {
    sections.push(
      '<div class="en">',
      `<h2>${en.title}</h2>`,
      `<p>${en.message}</p>`,
      "</div>",
    );
  }

  sections.push("</body></html>");
  return sections.join("\n");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd workers/email-to-issue && npx vitest run test/format.test.ts`
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add workers/email-to-issue/src/format.ts workers/email-to-issue/test/format.test.ts
git commit -m "feat: add accept button to preview email and approval response page"
```

---

### Task 4: Wire everything in index.ts and wrangler.toml

**Files:**
- Modify: `workers/email-to-issue/wrangler.toml`
- Modify: `workers/email-to-issue/src/index.ts`

**Interfaces:**
- Consumes:
  - `mergePullRequest(opts: MergePullRequestOptions): Promise<MergeResult>` from `./github`
  - `computeHmac(secret: string, data: string): Promise<string>` from `./crypto`
  - `verifyHmac(secret: string, data: string, token: string): Promise<boolean>` from `./crypto`
  - `createPreviewHtml(issueNumber, issueTitle, prUrl, previewUrl, actionsUrl, approveUrl, language): string` from `./format`
  - `createApproveResponseHtml(type: ApproveResult, language: string): string` from `./format`
- Produces: working `/approve` endpoint, KV-gated email handler

- [ ] **Step 1: Create KV namespace**

Run: `cd workers/email-to-issue && npx wrangler kv:namespace create AUTHORIZED_EMAILS`

Copy the `id` from the output. It will look like:

```
🌀 Creating namespace "AUTHORIZED_EMAILS"
✅ Success! Add the following to wrangler.toml:
[[kv_namespaces]]
binding = "AUTHORIZED_EMAILS"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

- [ ] **Step 2: Add KV binding to wrangler.toml**

Add to the end of `workers/email-to-issue/wrangler.toml`, using the `id` from step 1:

```toml
[[kv_namespaces]]
binding = "AUTHORIZED_EMAILS"
id = "<paste-id-from-step-1>"
```

- [ ] **Step 3: Seed initial authorized emails**

Run for each authorized address:

```bash
cd workers/email-to-issue && npx wrangler kv:key put --namespace-id="<paste-id>" "user@example.com" "1"
```

- [ ] **Step 4: Update index.ts**

Replace the entire contents of `workers/email-to-issue/src/index.ts` with:

```ts
import PostalMime from "postal-mime";
import { formatIssueBody, createReplyHtml, createPreviewHtml, createResolvedHtml, createApproveResponseHtml } from "./format";
import type { ApproveResult } from "./format";
import { createGitHubIssue, mergePullRequest } from "./github";
import { polishEmail } from "./ai";
import { computeHmac, verifyHmac } from "./crypto";

interface Env {
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  RESEND_API_KEY: string;
  NOTIFY_SECRET: string;
  AI: Ai;
  AI_MODEL: string;
  AUTHORIZED_EMAILS: KVNamespace;
}

async function sendEmail(
  env: Env,
  opts: { from: string; to: string; subject: string; html: string },
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(opts),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${response.status} ${error}`);
  }
}

function htmlResponse(html: string, status: number): Response {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export default {
  async email(
    message: ForwardableEmailMessage,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    const sender = message.from;

    const authorized = await env.AUTHORIZED_EMAILS.get(sender);
    if (!authorized) {
      console.log(`Unauthorized sender: ${sender}, dropping`);
      return;
    }

    const rawEmail = await new Response(message.raw).arrayBuffer();
    const parsed = await new PostalMime().parse(rawEmail);

    const originalText =
      parsed.text ||
      parsed.html?.replace(/<[^>]*>/g, "") ||
      "(empty body)";

    const emailContent = parsed.subject
      ? `Subject: ${parsed.subject}\n\n${originalText}`
      : originalText;

    let polished;
    try {
      polished = await polishEmail(env.AI, env.AI_MODEL, emailContent);
    } catch (err) {
      console.error("AI polishing failed:", String(err));
      const fallbackTitle = parsed.subject?.trim() || "(no subject)";
      polished = {
        title: fallbackTitle,
        description: originalText,
        title_local: fallbackTitle,
        description_local: originalText,
        language: "cs",
      };
    }

    const issue = await createGitHubIssue({
      title: polished.title,
      body: formatIssueBody(sender, polished.description, originalText, polished.language),
      labels: ["email", "automate"],
      token: env.GITHUB_TOKEN,
      owner: env.GITHUB_OWNER,
      repo: env.GITHUB_REPO,
    });

    try {
      await sendEmail(env, {
        from: "issues@web.leoczech.cz",
        to: sender,
        subject: `Re: ${polished.title}`,
        html: createReplyHtml(
          issue.number,
          issue.html_url,
          polished.title,
          polished.description,
          polished.title_local,
          polished.description_local,
          polished.language,
        ),
      });
    } catch (err) {
      console.error("Failed to send reply:", String(err));
    }
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/approve" && request.method === "GET") {
      const pr = url.searchParams.get("pr");
      const issue = url.searchParams.get("issue");
      const email = url.searchParams.get("email");
      const lang = url.searchParams.get("lang") || "cs";
      const token = url.searchParams.get("token");

      if (!pr || !issue || !email || !token) {
        return htmlResponse(createApproveResponseHtml("invalid_token", lang), 400);
      }

      const valid = await verifyHmac(env.NOTIFY_SECRET, `${pr}:${issue}:${email}`, token);
      if (!valid) {
        return htmlResponse(createApproveResponseHtml("invalid_token", lang), 403);
      }

      const authorized = await env.AUTHORIZED_EMAILS.get(email);
      if (!authorized) {
        return htmlResponse(createApproveResponseHtml("unauthorized", lang), 403);
      }

      const result = await mergePullRequest({
        pullNumber: parseInt(pr, 10),
        token: env.GITHUB_TOKEN,
        owner: env.GITHUB_OWNER,
        repo: env.GITHUB_REPO,
      });

      if (result.status === "merged") {
        return htmlResponse(createApproveResponseHtml("success", lang), 200);
      }

      if (result.status === "already_merged") {
        return htmlResponse(createApproveResponseHtml("already_merged", lang), 200);
      }

      console.error(`Merge failed for PR #${pr}: ${result.message}`);
      return htmlResponse(createApproveResponseHtml("error", lang), 500);
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname !== "/notify") {
      return new Response("Not found", { status: 404 });
    }

    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${env.NOTIFY_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = (await request.json()) as {
      type: "preview" | "resolved";
      to: string;
      issueNumber: number;
      issueTitle: string;
      prUrl: string;
      previewUrl?: string;
      actionsUrl?: string;
      language?: string;
    };

    const lang = body.language || "cs";
    let subject: string;
    let html: string;

    if (body.type === "preview") {
      const prNumber = body.prUrl.split("/").pop()!;
      const hmacData = `${prNumber}:${body.issueNumber}:${body.to}`;
      const token = await computeHmac(env.NOTIFY_SECRET, hmacData);
      const approveUrl = `${url.origin}/approve?pr=${prNumber}&issue=${body.issueNumber}&email=${encodeURIComponent(body.to)}&lang=${lang}&token=${token}`;

      subject = `Re: ${body.issueTitle}`;
      html = createPreviewHtml(
        body.issueNumber,
        body.issueTitle,
        body.prUrl,
        body.previewUrl || body.prUrl,
        body.actionsUrl || body.prUrl,
        approveUrl,
        lang,
      );
    } else {
      subject = `Re: ${body.issueTitle}`;
      html = createResolvedHtml(body.issueNumber, body.issueTitle, body.prUrl, lang);
    }

    await sendEmail(env, {
      from: "issues@web.leoczech.cz",
      to: body.to,
      subject,
      html,
    });

    return new Response("OK", { status: 200 });
  },
};
```

- [ ] **Step 5: Run all tests**

Run: `cd workers/email-to-issue && npm test`
Expected: all tests PASS

- [ ] **Step 6: Dry-run deploy to check types**

Run: `cd workers/email-to-issue && npx wrangler deploy --dry-run`
Expected: build succeeds with no errors

- [ ] **Step 7: Commit**

```bash
git add workers/email-to-issue/wrangler.toml workers/email-to-issue/src/index.ts
git commit -m "feat: add email allowlist gate and /approve merge endpoint"
```

- [ ] **Step 8: Deploy and verify**

Run: `cd workers/email-to-issue && npx wrangler deploy`

Verify the `GITHUB_TOKEN` secret has merge permissions on the repo. If not, regenerate the fine-grained token with `Contents: Read and write` scope and update:

```bash
cd workers/email-to-issue && npx wrangler secret put GITHUB_TOKEN
```

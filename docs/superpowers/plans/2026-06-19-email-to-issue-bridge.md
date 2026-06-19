# Email-to-Issue Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow non-technical users to create GitHub issues by emailing `issues@leoczech.cz`, with automatic reply confirmation and PR merge resolution notifications.

**Architecture:** Cloudflare Email Worker receives inbound email, parses it with `postal-mime`, creates a GitHub issue via REST API, and replies to the sender with the issue link. A secondary HTTP handler lets a GitHub Actions workflow trigger notification emails when PRs referencing email-created issues are merged.

**Tech Stack:** Cloudflare Workers (TypeScript), postal-mime, GitHub REST API, Vitest

## Global Constraints

- Worker runs on Cloudflare Workers runtime — use `nodejs_compat` flag, no Node.js-only APIs
- `postal-mime` is the only runtime dependency
- GitHub token stored as Worker secret (`GITHUB_TOKEN`), never committed
- Reply/notification emails sent from `issues@leoczech.cz` via `send_email` binding
- Sender email in issue body must follow exact format `**Submitted via email by:** <email>` for downstream extraction

---

### Task 1: Project Scaffold + Core Formatting Functions

**Files:**
- Create: `workers/email-to-issue/package.json`
- Create: `workers/email-to-issue/wrangler.toml`
- Create: `workers/email-to-issue/tsconfig.json`
- Create: `workers/email-to-issue/vitest.config.ts`
- Create: `workers/email-to-issue/src/format.ts`
- Test: `workers/email-to-issue/test/format.test.ts`

**Interfaces:**
- Consumes: nothing (first task)
- Produces:
  - `formatIssueTitle(subject: string | undefined): string`
  - `formatIssueBody(sender: string, body: string): string`
  - `createReplyBody(issueNumber: number, issueUrl: string): string`
  - `createNotifyBody(issueNumber: number, issueTitle: string, prUrl: string): string`
  - `buildRawEmail(opts: { from: string; to: string; subject: string; body: string; inReplyTo?: string }): string`

- [ ] **Step 1: Create project scaffold**

Create `workers/email-to-issue/package.json`:

```json
{
  "name": "email-to-issue",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "postal-mime": "^2.4.1"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20241230.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0",
    "wrangler": "^3.99.0"
  }
}
```

Create `workers/email-to-issue/wrangler.toml`:

```toml
name = "email-to-issue"
main = "src/index.ts"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[vars]
GITHUB_OWNER = "rjicha"
GITHUB_REPO = "leoczech"

[[send_email]]
name = "SEND_EMAIL"
```

Create `workers/email-to-issue/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "types": ["@cloudflare/workers-types"],
    "outDir": "dist"
  },
  "include": ["src", "test"]
}
```

Create `workers/email-to-issue/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
  },
});
```

- [ ] **Step 2: Install dependencies**

Run: `cd workers/email-to-issue && npm install`
Expected: `node_modules/` created, no errors

- [ ] **Step 3: Write failing tests for formatting functions**

Create `workers/email-to-issue/test/format.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  formatIssueTitle,
  formatIssueBody,
  createReplyBody,
  createNotifyBody,
  buildRawEmail,
} from "../src/format";

describe("formatIssueTitle", () => {
  it("uses email subject as title", () => {
    expect(formatIssueTitle("Fix the homepage")).toBe("Fix the homepage");
  });

  it("trims whitespace", () => {
    expect(formatIssueTitle("  Fix the homepage  ")).toBe("Fix the homepage");
  });

  it("returns placeholder for empty subject", () => {
    expect(formatIssueTitle("")).toBe("(no subject)");
  });

  it("returns placeholder for undefined subject", () => {
    expect(formatIssueTitle(undefined)).toBe("(no subject)");
  });
});

describe("formatIssueBody", () => {
  it("includes sender email and body text", () => {
    const result = formatIssueBody("user@example.com", "Please update the contact page");
    expect(result).toContain("**Submitted via email by:** user@example.com");
    expect(result).toContain("Please update the contact page");
  });

  it("separates sender info from body with horizontal rule", () => {
    const result = formatIssueBody("user@example.com", "Body text");
    expect(result).toBe(
      "**Submitted via email by:** user@example.com\n\n---\n\nBody text"
    );
  });
});

describe("createReplyBody", () => {
  it("includes issue number and URL", () => {
    const result = createReplyBody(42, "https://github.com/rjicha/leoczech/issues/42");
    expect(result).toContain("#42");
    expect(result).toContain("https://github.com/rjicha/leoczech/issues/42");
  });

  it("includes automated reply notice", () => {
    const result = createReplyBody(1, "https://example.com");
    expect(result).toContain("automated reply");
  });
});

describe("createNotifyBody", () => {
  it("includes issue number, title, and PR URL", () => {
    const result = createNotifyBody(42, "Fix homepage", "https://github.com/rjicha/leoczech/pull/43");
    expect(result).toContain("#42");
    expect(result).toContain("Fix homepage");
    expect(result).toContain("https://github.com/rjicha/leoczech/pull/43");
  });

  it("includes resolved language", () => {
    const result = createNotifyBody(1, "Title", "https://example.com");
    expect(result).toContain("resolved");
  });
});

describe("buildRawEmail", () => {
  it("produces valid MIME email with required headers", () => {
    const raw = buildRawEmail({
      from: "issues@leoczech.cz",
      to: "user@example.com",
      subject: "Re: Fix homepage",
      body: "Your request has been received.",
    });
    expect(raw).toContain("From: issues@leoczech.cz");
    expect(raw).toContain("To: user@example.com");
    expect(raw).toContain("Subject: Re: Fix homepage");
    expect(raw).toContain("MIME-Version: 1.0");
    expect(raw).toContain("Content-Type: text/plain; charset=utf-8");
    expect(raw).toContain("Your request has been received.");
  });

  it("includes In-Reply-To and References when inReplyTo is provided", () => {
    const raw = buildRawEmail({
      from: "issues@leoczech.cz",
      to: "user@example.com",
      subject: "Re: Test",
      body: "Body",
      inReplyTo: "<abc123@mail.example.com>",
    });
    expect(raw).toContain("In-Reply-To: <abc123@mail.example.com>");
    expect(raw).toContain("References: <abc123@mail.example.com>");
  });

  it("omits In-Reply-To when not provided", () => {
    const raw = buildRawEmail({
      from: "issues@leoczech.cz",
      to: "user@example.com",
      subject: "Re: Test",
      body: "Body",
    });
    expect(raw).not.toContain("In-Reply-To:");
    expect(raw).not.toContain("References:");
  });

  it("separates headers from body with double CRLF", () => {
    const raw = buildRawEmail({
      from: "a@b.com",
      to: "c@d.com",
      subject: "Test",
      body: "Hello",
    });
    expect(raw).toContain("\r\n\r\nHello");
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `cd workers/email-to-issue && npx vitest run`
Expected: All tests FAIL — `format` module does not exist

- [ ] **Step 5: Implement formatting functions**

Create `workers/email-to-issue/src/format.ts`:

```ts
export function formatIssueTitle(subject: string | undefined): string {
  const trimmed = subject?.trim();
  return trimmed || "(no subject)";
}

export function formatIssueBody(sender: string, body: string): string {
  return `**Submitted via email by:** ${sender}\n\n---\n\n${body}`;
}

export function createReplyBody(issueNumber: number, issueUrl: string): string {
  return [
    "Your request has been received and tracked.",
    "",
    `Issue #${issueNumber}: ${issueUrl}`,
    "",
    "---",
    "This is an automated reply from LeoCzech issue tracker.",
  ].join("\n");
}

export function createNotifyBody(
  issueNumber: number,
  issueTitle: string,
  prUrl: string,
): string {
  return [
    `Your request (issue #${issueNumber}: "${issueTitle}") has been resolved.`,
    "",
    `Pull request: ${prUrl}`,
    "",
    "---",
    "This is an automated notification from LeoCzech issue tracker.",
  ].join("\n");
}

export function buildRawEmail(opts: {
  from: string;
  to: string;
  subject: string;
  body: string;
  inReplyTo?: string;
}): string {
  const headers = [
    `From: ${opts.from}`,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=utf-8`,
  ];
  if (opts.inReplyTo) {
    headers.push(`In-Reply-To: ${opts.inReplyTo}`);
    headers.push(`References: ${opts.inReplyTo}`);
  }
  return headers.join("\r\n") + "\r\n\r\n" + opts.body;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd workers/email-to-issue && npx vitest run`
Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
git add workers/email-to-issue/package.json workers/email-to-issue/wrangler.toml \
  workers/email-to-issue/tsconfig.json workers/email-to-issue/vitest.config.ts \
  workers/email-to-issue/src/format.ts workers/email-to-issue/test/format.test.ts
git commit -m "feat(worker): scaffold project and add formatting functions (#35)"
```

---

### Task 2: GitHub API Client + Email Handler

**Files:**
- Create: `workers/email-to-issue/src/github.ts`
- Create: `workers/email-to-issue/src/index.ts`
- Test: `workers/email-to-issue/test/github.test.ts`

**Interfaces:**
- Consumes: `formatIssueTitle`, `formatIssueBody`, `createReplyBody`, `createNotifyBody`, `buildRawEmail` from Task 1
- Produces:
  - `createGitHubIssue(opts: CreateIssueOptions): Promise<{ number: number; html_url: string }>`
  - Default export with `email(message, env, ctx)` and `fetch(request, env)` handlers

- [ ] **Step 1: Write failing tests for GitHub API client**

Create `workers/email-to-issue/test/github.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createGitHubIssue } from "../src/github";

describe("createGitHubIssue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends correct request to GitHub API", async () => {
    const mockIssue = {
      number: 42,
      html_url: "https://github.com/rjicha/leoczech/issues/42",
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify(mockIssue), { status: 201 }),
    );

    const result = await createGitHubIssue({
      title: "Test issue",
      body: "Test body",
      labels: ["email"],
      token: "ghp_test",
      owner: "rjicha",
      repo: "leoczech",
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/rjicha/leoczech/issues",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer ghp_test",
        }),
      }),
    );

    const sentBody = JSON.parse(
      (fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    );
    expect(sentBody.title).toBe("Test issue");
    expect(sentBody.body).toBe("Test body");
    expect(sentBody.labels).toEqual(["email"]);

    expect(result).toEqual(mockIssue);
  });

  it("throws on non-OK response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response("Not Found", { status: 404 }),
    );

    await expect(
      createGitHubIssue({
        title: "Test",
        body: "Test",
        labels: [],
        token: "bad_token",
        owner: "rjicha",
        repo: "leoczech",
      }),
    ).rejects.toThrow("GitHub API error: 404");
  });

  it("returns only number and html_url from response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          number: 10,
          html_url: "https://github.com/rjicha/leoczech/issues/10",
          id: 999999,
          node_id: "abc",
          state: "open",
        }),
        { status: 201 },
      ),
    );

    const result = await createGitHubIssue({
      title: "T",
      body: "B",
      labels: [],
      token: "t",
      owner: "o",
      repo: "r",
    });

    expect(result).toEqual({
      number: 10,
      html_url: "https://github.com/rjicha/leoczech/issues/10",
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd workers/email-to-issue && npx vitest run`
Expected: `github.test.ts` tests FAIL — `github` module does not exist. `format.test.ts` tests still PASS.

- [ ] **Step 3: Implement GitHub API client**

Create `workers/email-to-issue/src/github.ts`:

```ts
export interface CreateIssueOptions {
  title: string;
  body: string;
  labels: string[];
  token: string;
  owner: string;
  repo: string;
}

interface GitHubIssueResponse {
  number: number;
  html_url: string;
}

export async function createGitHubIssue(
  opts: CreateIssueOptions,
): Promise<GitHubIssueResponse> {
  const response = await fetch(
    `https://api.github.com/repos/${opts.owner}/${opts.repo}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.token}`,
        "Content-Type": "application/json",
        "User-Agent": "email-to-issue-worker",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        title: opts.title,
        body: opts.body,
        labels: opts.labels,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${response.status} ${error}`);
  }

  const data = (await response.json()) as GitHubIssueResponse;
  return { number: data.number, html_url: data.html_url };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd workers/email-to-issue && npx vitest run`
Expected: All tests PASS (both `format.test.ts` and `github.test.ts`)

- [ ] **Step 5: Implement the email handler and fetch handler**

Create `workers/email-to-issue/src/index.ts`:

```ts
import PostalMime from "postal-mime";
import {
  formatIssueTitle,
  formatIssueBody,
  createReplyBody,
  createNotifyBody,
  buildRawEmail,
} from "./format";
import { createGitHubIssue } from "./github";

interface Env {
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  SEND_EMAIL: SendEmail;
  NOTIFY_SECRET: string;
}

export default {
  async email(
    message: ForwardableEmailMessage,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    const rawEmail = await new Response(message.raw).arrayBuffer();
    const parsed = await new PostalMime().parse(rawEmail);

    const title = formatIssueTitle(parsed.subject);
    const body =
      parsed.text ||
      parsed.html?.replace(/<[^>]*>/g, "") ||
      "(empty body)";
    const sender = message.from;

    const issue = await createGitHubIssue({
      title,
      body: formatIssueBody(sender, body),
      labels: ["email"],
      token: env.GITHUB_TOKEN,
      owner: env.GITHUB_OWNER,
      repo: env.GITHUB_REPO,
    });

    const replyRaw = buildRawEmail({
      from: message.to,
      to: sender,
      subject: `Re: ${title}`,
      body: createReplyBody(issue.number, issue.html_url),
      inReplyTo: message.headers.get("message-id") || undefined,
    });

    const replyMessage = new EmailMessage(
      message.to,
      sender,
      new Blob([replyRaw]).stream(),
    );
    await env.SEND_EMAIL.send(replyMessage);
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/notify") {
      return new Response("Not found", { status: 404 });
    }

    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${env.NOTIFY_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { to, issueNumber, issueTitle, prUrl } = (await request.json()) as {
      to: string;
      issueNumber: number;
      issueTitle: string;
      prUrl: string;
    };

    const raw = buildRawEmail({
      from: "issues@leoczech.cz",
      to,
      subject: `Resolved: ${issueTitle}`,
      body: createNotifyBody(issueNumber, issueTitle, prUrl),
    });

    const emailMsg = new EmailMessage(
      "issues@leoczech.cz",
      to,
      new Blob([raw]).stream(),
    );
    await env.SEND_EMAIL.send(emailMsg);

    return new Response("OK", { status: 200 });
  },
};
```

- [ ] **Step 6: Verify build**

Run: `cd workers/email-to-issue && npx wrangler deploy --dry-run`
Expected: Build succeeds (dry-run, no actual deploy). If TypeScript errors appear, fix them.

- [ ] **Step 7: Commit**

```bash
git add workers/email-to-issue/src/github.ts workers/email-to-issue/src/index.ts \
  workers/email-to-issue/test/github.test.ts
git commit -m "feat(worker): add GitHub API client and email/fetch handlers (#35)"
```

---

### Task 3: PR Merge Notification Workflow

**Files:**
- Create: `.github/workflows/pr-merged-notify.yml`

**Interfaces:**
- Consumes: Worker HTTP endpoint `POST /notify` with `{ to, issueNumber, issueTitle, prUrl }` (from Task 2)
- Produces: GitHub Actions workflow triggered on PR merge

- [ ] **Step 1: Create the GitHub Actions workflow**

Create `.github/workflows/pr-merged-notify.yml`:

```yaml
name: Notify email sender on PR merge

on:
  pull_request:
    types: [closed]

jobs:
  notify:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - name: Extract issue numbers and notify senders
        uses: actions/github-script@v7
        env:
          WORKER_URL: ${{ secrets.EMAIL_WORKER_URL }}
          NOTIFY_SECRET: ${{ secrets.EMAIL_NOTIFY_SECRET }}
        with:
          script: |
            const body = context.payload.pull_request.body || '';
            const matches = body.match(/(?:closes|fixes|resolves)\s+#(\d+)/gi) || [];
            const issueNumbers = matches.map(m => parseInt(m.match(/\d+/)[0]));

            if (issueNumbers.length === 0) {
              console.log('No issue references found in PR body');
              return;
            }

            for (const num of issueNumbers) {
              const { data: issue } = await github.rest.issues.get({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: num,
              });

              const emailMatch = issue.body?.match(/\*\*Submitted via email by:\*\* (.+)/);
              if (!emailMatch) {
                console.log(`Issue #${num} was not created via email, skipping`);
                continue;
              }

              const senderEmail = emailMatch[1].trim();
              console.log(`Notifying ${senderEmail} about issue #${num}`);

              const response = await fetch(process.env.WORKER_URL + '/notify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.NOTIFY_SECRET}`,
                },
                body: JSON.stringify({
                  to: senderEmail,
                  issueNumber: num,
                  issueTitle: issue.title,
                  prUrl: context.payload.pull_request.html_url,
                }),
              });

              if (!response.ok) {
                console.error(`Failed to notify for issue #${num}: ${response.status}`);
              }
            }
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/pr-merged-notify.yml
git commit -m "feat: add PR merge notification workflow (#35)"
```

---

### Task 4: Cloudflare Configuration + Deployment

This task covers manual configuration steps and deployment. No code changes.

- [ ] **Step 1: Check existing MX records**

Run: `dig MX leoczech.cz +short`

If MX records exist for another email provider, note them — enabling Cloudflare Email Routing will replace them. You'll need to set up a catch-all forwarding rule to preserve existing email delivery.

- [ ] **Step 2: Create GitHub fine-grained PAT**

1. Go to GitHub → Settings → Developer Settings → Fine-grained tokens
2. Create token named `email-to-issue-worker`
3. Scope: `rjicha/leoczech` repository only
4. Permissions: Issues (Read & Write)
5. Copy the token

- [ ] **Step 3: Create the `email` label in the repository**

Run: `gh label create email --description "Created via email" --color "1d76db"`

- [ ] **Step 4: Set Worker secrets**

```bash
cd workers/email-to-issue
npx wrangler secret put GITHUB_TOKEN
# paste the fine-grained PAT when prompted

npx wrangler secret put NOTIFY_SECRET
# enter a random secret string (e.g., generate with: openssl rand -hex 32)
```

- [ ] **Step 5: Deploy the Worker**

Run: `cd workers/email-to-issue && npx wrangler deploy`
Expected: Worker deployed. Note the Worker URL (e.g., `https://email-to-issue.<account>.workers.dev`)

- [ ] **Step 6: Add GitHub Actions secrets**

1. Go to GitHub → `rjicha/leoczech` → Settings → Secrets → Actions
2. Add `EMAIL_WORKER_URL` = the Worker URL from step 5 (e.g., `https://email-to-issue.<account>.workers.dev`)
3. Add `EMAIL_NOTIFY_SECRET` = the same secret you set in step 4

- [ ] **Step 7: Enable Cloudflare Email Routing**

1. Go to Cloudflare Dashboard → `leoczech.cz` → Email → Email Routing
2. Enable Email Routing (Cloudflare adds MX and SPF records automatically)
3. If there were existing MX records: set up catch-all → forward to existing provider
4. Add route: `issues@leoczech.cz` → Worker `email-to-issue`

- [ ] **Step 8: Integration test — email to issue**

1. Send an email to `issues@leoczech.cz` with subject "Test issue from email" and body "This is a test"
2. Check GitHub: issue should appear with:
   - Title: "Test issue from email"
   - Body contains: `**Submitted via email by:** <your-email>`
   - Body contains: "This is a test"
   - Label: `email`
3. Check email: you should receive a reply with the issue link

- [ ] **Step 9: Integration test — PR merge notification**

1. Create a branch, make a trivial change, push
2. Create a PR with `Closes #<test-issue-number>` in the body
3. Merge the PR
4. Check email: you should receive a resolution notification with the PR link

- [ ] **Step 10: Close the test issue**

Clean up: close the test issue created in step 8.

- [ ] **Step 11: Final commit + push**

```bash
git push origin feature/35-email-to-issue-bridge
```

Create PR targeting `master` with title: `feat: email-to-issue bridge via Cloudflare Worker (#35)`

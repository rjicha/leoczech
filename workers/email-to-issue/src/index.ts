import PostalMime from "postal-mime";
import { formatIssueBody, createReplyHtml, createPreviewHtml, createResolvedHtml } from "./format";
import { createGitHubIssue } from "./github";
import { polishEmail } from "./ai";

interface Env {
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  RESEND_API_KEY: string;
  NOTIFY_SECRET: string;
  AI: Ai;
  AI_MODEL: string;
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

export default {
  async email(
    message: ForwardableEmailMessage,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    const rawEmail = await new Response(message.raw).arrayBuffer();
    const parsed = await new PostalMime().parse(rawEmail);

    const originalText =
      parsed.text ||
      parsed.html?.replace(/<[^>]*>/g, "") ||
      "(empty body)";
    const sender = message.from;

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
      subject = `Re: ${body.issueTitle}`;
      html = createPreviewHtml(
        body.issueNumber,
        body.issueTitle,
        body.prUrl,
        body.previewUrl || body.prUrl,
        body.actionsUrl || body.prUrl,
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

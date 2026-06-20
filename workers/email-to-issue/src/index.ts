import PostalMime from "postal-mime";
import { formatIssueBody, createReplyBody, createNotifyBody } from "./format";
import { createGitHubIssue } from "./github";
import { polishEmail } from "./ai";

interface Env {
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  RESEND_API_KEY: string;
  NOTIFY_SECRET: string;
  AI: Ai;
}

async function sendEmail(
  env: Env,
  opts: { from: string; to: string; subject: string; text: string },
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
      polished = await polishEmail(env.AI, emailContent);
      console.log(`AI polished: "${polished.title}"`);
    } catch (err) {
      console.error("AI polishing failed, using raw email:", err);
      polished = {
        title: parsed.subject?.trim() || "(no subject)",
        description: originalText,
      };
    }

    const issue = await createGitHubIssue({
      title: polished.title,
      body: formatIssueBody(sender, polished.description, originalText),
      labels: ["email", "automate"],
      token: env.GITHUB_TOKEN,
      owner: env.GITHUB_OWNER,
      repo: env.GITHUB_REPO,
    });

    try {
      console.log(`Sending reply to ${sender}`);
      await sendEmail(env, {
        from: "issues@web.leoczech.cz",
        to: sender,
        subject: `Re: ${polished.title}`,
        text: createReplyBody(
          issue.number,
          issue.html_url,
          polished.title,
          polished.description,
        ),
      });
      console.log("Reply sent successfully");
    } catch (err) {
      console.error("Failed to send reply:", err);
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

    const { to, issueNumber, issueTitle, prUrl } = (await request.json()) as {
      to: string;
      issueNumber: number;
      issueTitle: string;
      prUrl: string;
    };

    await sendEmail(env, {
      from: "issues@web.leoczech.cz",
      to,
      subject: `Resolved: ${issueTitle}`,
      text: createNotifyBody(issueNumber, issueTitle, prUrl),
    });

    return new Response("OK", { status: 200 });
  },
};

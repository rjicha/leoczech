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

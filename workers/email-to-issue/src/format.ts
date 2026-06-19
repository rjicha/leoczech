export function formatIssueTitle(subject: string | undefined): string {
  const trimmed = subject?.trim();
  return trimmed || "(no subject)";
}

export function formatIssueBody(sender: string, body: string): string {
  return `**Submitted via email by:** ${sender}\n\n---\n\n${body}`;
}

export function createReplyBody(
  issueNumber: number,
  issueUrl: string,
): string {
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

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
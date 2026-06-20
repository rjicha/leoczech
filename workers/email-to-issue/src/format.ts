export function formatIssueBody(
  sender: string,
  description: string,
  originalText: string,
): string {
  return [
    "## Description",
    "",
    description,
    "",
    "---",
    `**Original email from:** ${sender}`,
    "",
    `> ${originalText.split("\n").join("\n> ")}`,
  ].join("\n");
}

export function createReplyBody(
  issueNumber: number,
  issueUrl: string,
  title: string,
  description: string,
): string {
  return [
    "Hi,",
    "",
    "I've received your request and will start working on it shortly.",
    "",
    "Here's the issue I've created based on your email:",
    "",
    `Title: ${title}`,
    `Description: ${description}`,
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

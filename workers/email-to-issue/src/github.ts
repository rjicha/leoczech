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

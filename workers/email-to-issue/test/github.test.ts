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

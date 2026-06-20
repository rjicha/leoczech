import { describe, it, expect } from "vitest";
import {
  formatIssueTitle,
  formatIssueBody,
  createReplyBody,
  createNotifyBody,
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
    const result = formatIssueBody(
      "user@example.com",
      "Please update the contact page",
    );
    expect(result).toContain("**Submitted via email by:** user@example.com");
    expect(result).toContain("Please update the contact page");
  });

  it("separates sender info from body with horizontal rule", () => {
    const result = formatIssueBody("user@example.com", "Body text");
    expect(result).toBe(
      "**Submitted via email by:** user@example.com\n\n---\n\nBody text",
    );
  });
});

describe("createReplyBody", () => {
  it("includes issue number and URL", () => {
    const result = createReplyBody(
      42,
      "https://github.com/rjicha/leoczech/issues/42",
    );
    expect(result).toContain("#42");
    expect(result).toContain(
      "https://github.com/rjicha/leoczech/issues/42",
    );
  });

  it("includes automated reply notice", () => {
    const result = createReplyBody(1, "https://example.com");
    expect(result).toContain("automated reply");
  });
});

describe("createNotifyBody", () => {
  it("includes issue number, title, and PR URL", () => {
    const result = createNotifyBody(
      42,
      "Fix homepage",
      "https://github.com/rjicha/leoczech/pull/43",
    );
    expect(result).toContain("#42");
    expect(result).toContain("Fix homepage");
    expect(result).toContain("https://github.com/rjicha/leoczech/pull/43");
  });

  it("includes resolved language", () => {
    const result = createNotifyBody(1, "Title", "https://example.com");
    expect(result).toContain("resolved");
  });
});

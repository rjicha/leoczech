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

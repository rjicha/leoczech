import { describe, it, expect } from "vitest";
import {
  formatIssueBody,
  createReplyBody,
  createNotifyBody,
} from "../src/format";

describe("formatIssueBody", () => {
  it("includes description and original text with sender", () => {
    const result = formatIssueBody(
      "user@example.com",
      "Add a German version of the website and translate all pages.",
      "Pridej nemeckou verzi webu a preloz vsechny stranky do nemciny.",
    );
    expect(result).toContain("## Description");
    expect(result).toContain(
      "Add a German version of the website and translate all pages.",
    );
    expect(result).toContain("**Original email from:** user@example.com");
    expect(result).toContain(
      "> Pridej nemeckou verzi webu a preloz vsechny stranky do nemciny.",
    );
  });

  it("quotes multiline original text", () => {
    const result = formatIssueBody(
      "user@example.com",
      "Description",
      "Line one\nLine two",
    );
    expect(result).toContain("> Line one\n> Line two");
  });
});

describe("createReplyBody", () => {
  it("includes greeting and issue details", () => {
    const result = createReplyBody(
      42,
      "https://github.com/rjicha/leoczech/issues/42",
      "Add German version of the website",
      "Create a German language version and translate all pages.",
    );
    expect(result).toContain("Hi,");
    expect(result).toContain("received your request");
    expect(result).toContain("Title: Add German version of the website");
    expect(result).toContain(
      "Description: Create a German language version and translate all pages.",
    );
    expect(result).toContain("#42");
    expect(result).toContain(
      "https://github.com/rjicha/leoczech/issues/42",
    );
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

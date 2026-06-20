import { describe, it, expect } from "vitest";
import {
  formatIssueBody,
  createReplyHtml,
  createPreviewHtml,
  createResolvedHtml,
} from "../src/format";

describe("formatIssueBody", () => {
  it("includes description and original text with sender", () => {
    const result = formatIssueBody(
      "user@example.com",
      "### Context\nNeed German version.\n\n### Requirements\n- Translate pages",
      "Pridej nemeckou verzi",
    );
    expect(result).toContain("## Description");
    expect(result).toContain("### Context");
    expect(result).toContain("**Original email from:** user@example.com");
    expect(result).toContain("> Pridej nemeckou verzi");
  });
});

describe("createReplyHtml", () => {
  it("renders local and English versions for Czech emails", () => {
    const result = createReplyHtml(
      42,
      "https://github.com/rjicha/leoczech/issues/42",
      "Add German version",
      "### Context\nNeed it.",
      "Přidat německou verzi",
      "### Kontext\nJe to potřeba.",
      "cs",
    );
    expect(result).toContain("Dobrý den,");
    expect(result).toContain("<h2>Přidat německou verzi</h2>");
    expect(result).toContain("Anglická verze");
    expect(result).toContain('<a href="https://github.com/rjicha/leoczech/issues/42"');
  });
});

describe("createPreviewHtml", () => {
  it("includes preview link, PR link, and actions link", () => {
    const result = createPreviewHtml(
      42,
      "Add German version",
      "https://github.com/rjicha/leoczech/pull/43",
      "https://deploy-preview-43--leoczech-preview.netlify.app",
      "https://github.com/rjicha/leoczech/actions/runs/123",
    );
    expect(result).toContain("ready for review");
    expect(result).toContain("deploy-preview-43--leoczech-preview.netlify.app");
    expect(result).toContain("pull/43");
    expect(result).toContain("actions/runs/123");
    expect(result).toContain("Agent Log");
  });
});

describe("createResolvedHtml", () => {
  it("includes issue info and PR link", () => {
    const result = createResolvedHtml(
      42,
      "Add German version",
      "https://github.com/rjicha/leoczech/pull/43",
    );
    expect(result).toContain("#42");
    expect(result).toContain("approved and deployed");
    expect(result).toContain("pull/43");
  });
});

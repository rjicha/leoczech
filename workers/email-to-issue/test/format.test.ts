import { describe, it, expect } from "vitest";
import {
  formatIssueBody,
  createReplyHtml,
  createNotifyHtml,
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
      "### Context\nNeed it.\n\n### Requirements\n- Translate pages",
      "Přidat německou verzi",
      "### Kontext\nJe to potřeba.\n\n### Požadavky\n- Přeložit stránky",
      "cs",
    );
    expect(result).toContain("Dobrý den,");
    expect(result).toContain("<h2>Přidat německou verzi</h2>");
    expect(result).toContain("<h3>Kontext</h3>");
    expect(result).toContain("<h3>Context</h3>");
    expect(result).toContain("Anglická verze");
    expect(result).toContain('<a href="https://github.com/rjicha/leoczech/issues/42"');
  });

  it("skips English section for English emails", () => {
    const result = createReplyHtml(
      1,
      "https://example.com",
      "Fix homepage",
      "### Context\nIt is broken.",
      "Fix homepage",
      "### Context\nIt is broken.",
      "en",
    );
    expect(result).toContain("Hi,");
    expect(result).toContain("<h2>Fix homepage</h2>");
    expect(result).not.toContain("Anglická verze");
  });
});

describe("createNotifyHtml", () => {
  it("includes issue info and PR link as HTML", () => {
    const result = createNotifyHtml(
      42,
      "Fix homepage",
      "https://github.com/rjicha/leoczech/pull/43",
    );
    expect(result).toContain("#42");
    expect(result).toContain("resolved");
    expect(result).toContain('<a href="https://github.com/rjicha/leoczech/pull/43"');
  });
});

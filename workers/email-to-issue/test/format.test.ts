import { describe, it, expect } from "vitest";
import {
  formatIssueBody,
  createReplyHtml,
  createPreviewHtml,
  createResolvedHtml,
  createApproveResponseHtml,
} from "../src/format";

describe("formatIssueBody", () => {
  it("includes description, sender, language, and original text", () => {
    const result = formatIssueBody(
      "user@example.com",
      "### Context\nNeed German version.",
      "Pridej nemeckou verzi",
      "cs",
    );
    expect(result).toContain("**Original email from:** user@example.com");
    expect(result).toContain("**Language:** cs");
    expect(result).toContain("> Pridej nemeckou verzi");
  });
});

describe("createReplyHtml", () => {
  it("renders bilingual reply for Czech emails", () => {
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
  });
});

describe("createPreviewHtml", () => {
  it("renders in Czech with preview, PR, agent, and approve links", () => {
    const result = createPreviewHtml(
      42,
      "Add German version",
      "https://github.com/rjicha/leoczech/pull/43",
      "https://deploy-preview-43--leoczech-preview.netlify.app",
      "https://github.com/rjicha/leoczech/actions/runs/123",
      "https://worker.example.com/approve?pr=43&issue=42&token=abc",
      "cs",
    );
    expect(result).toContain("Dobrý den,");
    expect(result).toContain("připraven ke kontrole");
    expect(result).toContain("deploy-preview-43");
    expect(result).toContain("actions/runs/123");
    expect(result).toContain("Schválit změny");
    expect(result).toContain("approve?pr=43");
  });

  it("renders in English for English emails", () => {
    const result = createPreviewHtml(
      1, "Title", "https://pr", "https://preview", "https://actions",
      "https://worker.example.com/approve?token=abc", "en",
    );
    expect(result).toContain("Hi,");
    expect(result).toContain("ready for review");
    expect(result).toContain("Approve Changes");
  });
});

describe("createApproveResponseHtml", () => {
  it("renders success page in Czech with English below", () => {
    const result = createApproveResponseHtml("success", "cs");
    expect(result).toContain("Změny schváleny");
    expect(result).toContain("brzy budou nasazeny");
    expect(result).toContain("Changes Approved");
    expect(result).toContain("deployed shortly");
  });

  it("renders success page in English without duplicate", () => {
    const result = createApproveResponseHtml("success", "en");
    expect(result).toContain("Changes Approved");
    expect(result).not.toContain("Změny schváleny");
  });

  it("renders already_merged page", () => {
    const result = createApproveResponseHtml("already_merged", "cs");
    expect(result).toContain("Již schváleno");
    expect(result).toContain("Already Approved");
  });

  it("renders unauthorized page", () => {
    const result = createApproveResponseHtml("unauthorized", "de");
    expect(result).toContain("Zugriff verweigert");
    expect(result).toContain("Access Denied");
  });

  it("renders invalid_token page", () => {
    const result = createApproveResponseHtml("invalid_token", "sk");
    expect(result).toContain("Neplatný odkaz");
    expect(result).toContain("Invalid Link");
  });

  it("renders error page", () => {
    const result = createApproveResponseHtml("error", "en");
    expect(result).toContain("Something went wrong");
  });

  it("falls back to Czech for unknown language", () => {
    const result = createApproveResponseHtml("success", "fr");
    expect(result).toContain("Změny schváleny");
  });
});

describe("createResolvedHtml", () => {
  it("renders in Czech", () => {
    const result = createResolvedHtml(
      42, "Add German version", "https://github.com/rjicha/leoczech/pull/43", "cs",
    );
    expect(result).toContain("Dobrý den,");
    expect(result).toContain("schválen a nasazen");
    expect(result).toContain("pull/43");
  });
});

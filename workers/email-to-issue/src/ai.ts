export interface PolishedIssue {
  title: string;
  description: string;
  title_local: string;
  description_local: string;
  language: string;
}

function flattenDescription(desc: unknown): string {
  if (typeof desc === "string") return desc;
  if (typeof desc !== "object" || desc === null) return String(desc);
  const obj = desc as Record<string, unknown>;
  const parts: string[] = [];
  for (const [key, val] of Object.entries(obj)) {
    parts.push(`### ${key}`);
    if (Array.isArray(val)) {
      parts.push(val.map((v) => String(v).replace(/^\*\s*/, "- ")).join("\n"));
    } else {
      parts.push(String(val));
    }
  }
  return parts.join("\n\n");
}

export async function polishEmail(
  ai: Ai,
  model: string,
  emailBody: string,
): Promise<PolishedIssue> {
  const response = (await ai.run(model as BaseAiTextGenerationModels, {
    messages: [
      {
        role: "system",
        content:
          "You translate and rephrase user emails into well-structured GitHub issues. " +
          "The emails may be in any language but are most often in Czech. " +
          "Respond with ONLY a raw JSON object — no markdown fences, no explanation. " +
          "All values MUST be flat strings, never objects or arrays. " +
          "The JSON has exactly 5 keys: " +
          '"language" (ISO 639-1 code, e.g. "cs"), ' +
          '"title" (English issue title, imperative, under 80 chars), ' +
          '"description" (English Markdown string with sections: ### Context, ### Requirements, ### Acceptance Criteria), ' +
          '"title_local" (same title in the original language), ' +
          '"description_local" (same description in the original language). ' +
          "Use \\n for newlines inside strings. " +
          "If the email is in English, title_local=title and description_local=description.",
      },
      {
        role: "user",
        content: emailBody,
      },
    ],
  })) as { response?: string | object };

  const raw = response.response;
  console.log("AI raw response:", raw);

  let obj: Record<string, unknown>;
  if (typeof raw === "object" && raw !== null) {
    obj = raw as Record<string, unknown>;
  } else {
    const text = String(raw || "")
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI response did not contain valid JSON");
    }
    obj = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  }

  const title = String(obj.title || "");
  const description = flattenDescription(obj.description);
  if (!title || !description) {
    throw new Error("AI response missing title or description");
  }

  return {
    language: String(obj.language || "cs"),
    title,
    description,
    title_local: String(obj.title_local || title),
    description_local: flattenDescription(obj.description_local || description),
  };
}

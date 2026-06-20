export interface PolishedIssue {
  title: string;
  description: string;
}

export async function polishEmail(
  ai: Ai,
  emailBody: string,
): Promise<PolishedIssue> {
  const response = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
    messages: [
      {
        role: "system",
        content: [
          "You are a GitHub issue writer. You receive raw email text (often in Czech or another language) and transform it into a well-structured GitHub issue in English.",
          "Return ONLY valid JSON with exactly two fields:",
          '- "title": a concise issue title (under 80 characters, imperative mood, e.g. "Add German version of the website")',
          '- "description": a clear 2-4 sentence description of what needs to be done and why',
          "Do not include markdown formatting, code blocks, or any text outside the JSON object.",
        ].join(" "),
      },
      {
        role: "user",
        content: emailBody,
      },
    ],
  });

  const text =
    typeof response === "string"
      ? response
      : (response as { response?: string }).response || "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      title: emailBody.split("\n")[0].slice(0, 80),
      description: emailBody,
    };
  }

  const parsed = JSON.parse(jsonMatch[0]) as PolishedIssue;
  return {
    title: parsed.title || emailBody.split("\n")[0].slice(0, 80),
    description: parsed.description || emailBody,
  };
}

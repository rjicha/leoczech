export function formatIssueBody(
  sender: string,
  description: string,
  originalText: string,
): string {
  return [
    "## Description",
    "",
    description,
    "",
    "---",
    `**Original email from:** ${sender}`,
    "",
    `> ${originalText.split("\n").join("\n> ")}`,
  ].join("\n");
}

const GREETINGS: Record<string, { hi: string; received: string; created: string; english: string }> = {
  cs: {
    hi: "Dobrý den,",
    received: "obdrželi jsme Váš požadavek a brzy se na něj podíváme.",
    created: "Na základě Vašeho e-mailu jsme vytvořili následující úkol:",
    english: "Anglická verze (použitá na GitHubu):",
  },
  sk: {
    hi: "Dobrý deň,",
    received: "dostali sme Vašu požiadavku a čoskoro sa na ňu pozrieme.",
    created: "Na základe Vášho e-mailu sme vytvorili nasledujúcu úlohu:",
    english: "Anglická verzia (použitá na GitHube):",
  },
  de: {
    hi: "Guten Tag,",
    received: "wir haben Ihre Anfrage erhalten und werden uns in Kürze darum kümmern.",
    created: "Basierend auf Ihrer E-Mail haben wir folgende Aufgabe erstellt:",
    english: "Englische Version (auf GitHub verwendet):",
  },
  en: {
    hi: "Hi,",
    received: "I've received your request and will start working on it shortly.",
    created: "Here's the issue I've created based on your email:",
    english: "",
  },
};

function getGreeting(language: string) {
  return GREETINGS[language] || GREETINGS.cs;
}

function markdownToHtml(md: string): string {
  return md
    .replace(/### (.+)/g, "<h3>$1</h3>")
    .replace(/## (.+)/g, "<h2>$1</h2>")
    .replace(/^- \[ \] (.+)$/gm, "<li>☐ $1</li>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/\n\n/g, "<br><br>")
    .replace(/\n/g, "\n");
}

export function createReplyHtml(
  issueNumber: number,
  issueUrl: string,
  title: string,
  description: string,
  titleLocal: string,
  descriptionLocal: string,
  language: string,
): string {
  const g = getGreeting(language);
  const localHtml = markdownToHtml(descriptionLocal);
  const englishHtml = markdownToHtml(description);

  const sections = [
    `<p>${g.hi}</p>`,
    `<p>${g.received}</p>`,
    `<p>${g.created}</p>`,
    "<hr>",
    `<h2>${titleLocal}</h2>`,
    localHtml,
  ];

  if (language !== "en") {
    sections.push(
      "<hr>",
      `<p style="color: #666; font-size: 13px;"><em>${g.english}</em></p>`,
      `<h3 style="color: #666;">${title}</h3>`,
      `<div style="color: #666; font-size: 13px;">${englishHtml}</div>`,
    );
  }

  sections.push(
    "<hr>",
    `<p>Issue #${issueNumber}: <a href="${issueUrl}">${issueUrl}</a></p>`,
    '<p style="color: #888; font-size: 12px;">This is an automated reply from LeoCzech issue tracker.</p>',
  );

  return sections.join("\n");
}

export function createNotifyHtml(
  issueNumber: number,
  issueTitle: string,
  prUrl: string,
): string {
  return [
    `<p>Your request (issue #${issueNumber}: "${issueTitle}") has been resolved.</p>`,
    `<p>Pull request: <a href="${prUrl}">${prUrl}</a></p>`,
    "<hr>",
    '<p style="color: #888; font-size: 12px;">This is an automated notification from LeoCzech issue tracker.</p>',
  ].join("\n");
}

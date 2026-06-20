export function formatIssueBody(
  sender: string,
  description: string,
  originalText: string,
  language: string,
): string {
  return [
    "## Description",
    "",
    description,
    "",
    "---",
    `**Original email from:** ${sender}`,
    `**Language:** ${language}`,
    "",
    `> ${originalText.split("\n").join("\n> ")}`,
  ].join("\n");
}

interface Strings {
  hi: string;
  received: string;
  created: string;
  english: string;
  preview: string;
  previewLink: string;
  pullRequest: string;
  agentLog: string;
  agentLogDesc: string;
  previewFooter: string;
  resolved: string;
  resolvedFooter: string;
}

const STRINGS: Record<string, Strings> = {
  cs: {
    hi: "Dobrý den,",
    received: "obdrželi jsme Váš požadavek a brzy se na něj podíváme.",
    created: "Na základě Vašeho e-mailu jsme vytvořili následující úkol:",
    english: "Anglická verze (použitá na GitHubu):",
    preview: "Váš požadavek byl zpracován a je připraven ke kontrole.",
    previewLink: "Náhled změn:",
    pullRequest: "Pull Request:",
    agentLog: "Záznam agenta:",
    agentLogDesc: "Podívejte se, jak AI agent zpracoval Váš požadavek:",
    previewFooter: "Změny budou nasazeny po kontrole a schválení.",
    resolved: "Váš požadavek byl schválen a nasazen.",
    resolvedFooter: "Změny jsou nyní dostupné na webu.",
  },
  sk: {
    hi: "Dobrý deň,",
    received: "dostali sme Vašu požiadavku a čoskoro sa na ňu pozrieme.",
    created: "Na základe Vášho e-mailu sme vytvorili nasledujúcu úlohu:",
    english: "Anglická verzia (použitá na GitHube):",
    preview: "Vaša požiadavka bola spracovaná a je pripravená na kontrolu.",
    previewLink: "Náhľad zmien:",
    pullRequest: "Pull Request:",
    agentLog: "Záznam agenta:",
    agentLogDesc: "Pozrite sa, ako AI agent spracoval Vašu požiadavku:",
    previewFooter: "Zmeny budú nasadené po kontrole a schválení.",
    resolved: "Vaša požiadavka bola schválená a nasadená.",
    resolvedFooter: "Zmeny sú teraz dostupné na webe.",
  },
  de: {
    hi: "Guten Tag,",
    received: "wir haben Ihre Anfrage erhalten und werden uns in Kürze darum kümmern.",
    created: "Basierend auf Ihrer E-Mail haben wir folgende Aufgabe erstellt:",
    english: "Englische Version (auf GitHub verwendet):",
    preview: "Ihre Anfrage wurde umgesetzt und ist zur Überprüfung bereit.",
    previewLink: "Vorschau der Änderungen:",
    pullRequest: "Pull Request:",
    agentLog: "Agent-Protokoll:",
    agentLogDesc: "Sehen Sie, wie der KI-Agent Ihre Anfrage bearbeitet hat:",
    previewFooter: "Die Änderungen werden nach Überprüfung und Genehmigung veröffentlicht.",
    resolved: "Ihre Anfrage wurde genehmigt und veröffentlicht.",
    resolvedFooter: "Die Änderungen sind jetzt auf der Website verfügbar.",
  },
  en: {
    hi: "Hi,",
    received: "I've received your request and will start working on it shortly.",
    created: "Here's the issue I've created based on your email:",
    english: "",
    preview: "Your request has been implemented and is ready for review.",
    previewLink: "See the changes live:",
    pullRequest: "Pull Request:",
    agentLog: "Agent Log:",
    agentLogDesc: "See how the AI agent worked on your request:",
    previewFooter: "The changes will go live after review and approval.",
    resolved: "Your request has been approved and deployed.",
    resolvedFooter: "The changes are now live on the website.",
  },
};

function getStrings(language: string): Strings {
  return STRINGS[language] || STRINGS.cs;
}

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
  const g = getStrings(language);
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

export function createPreviewHtml(
  issueNumber: number,
  issueTitle: string,
  prUrl: string,
  previewUrl: string,
  actionsUrl: string,
  language: string,
): string {
  const s = getStrings(language);
  return [
    `<p>${s.hi}</p>`,
    `<p>${s.preview}</p>`,
    `<h3>${s.previewLink}</h3>`,
    `<p><a href="${previewUrl}">${previewUrl}</a></p>`,
    `<h3>${s.pullRequest}</h3>`,
    `<p><a href="${prUrl}">${prUrl}</a></p>`,
    `<h3>${s.agentLog}</h3>`,
    `<p>${s.agentLogDesc} <a href="${actionsUrl}">${actionsUrl}</a></p>`,
    "<hr>",
    `<p>Issue #${issueNumber}: <strong>${issueTitle}</strong></p>`,
    `<p style="color: #888; font-size: 12px;">${s.previewFooter}</p>`,
  ].join("\n");
}

export function createResolvedHtml(
  issueNumber: number,
  issueTitle: string,
  prUrl: string,
  language: string,
): string {
  const s = getStrings(language);
  return [
    `<p>${s.hi}</p>`,
    `<p>${s.resolved}</p>`,
    `<p>${s.pullRequest} <a href="${prUrl}">${prUrl}</a></p>`,
    "<hr>",
    `<p>Issue #${issueNumber}: <strong>${issueTitle}</strong></p>`,
    `<p style="color: #888; font-size: 12px;">${s.resolvedFooter}</p>`,
  ].join("\n");
}

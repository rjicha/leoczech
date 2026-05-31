# LeoCzech Website Redesign — Design Spec

## Overview

Rebuild the leoczech.cz company website as a modern static site using Hugo, hosted on GitHub Pages with a custom domain. The site retains the same content and brand identity as the current ASP.NET MVC site but modernizes the presentation and adds English as a second language.

## Goals

- Modernize the look while keeping the existing brand (orange `#ff6501`, Saira font, logo)
- Bilingual: Czech (default) + English
- Zero infrastructure: GitHub Pages hosting, GitHub Actions CI/CD
- Content editable by AI agents via git or via GitHub Issues (automated PR workflow)
- No JavaScript shipped to the browser

## Non-Goals

- CMS or admin panel
- Dynamic features (forms, search, user accounts)
- Complete visual rebrand (new logo, new colors)

## Technology Stack

| Component       | Choice                          | Why                                      |
|-----------------|---------------------------------|------------------------------------------|
| Static site gen | Hugo                            | Native i18n, fast builds, markdown content |
| Styling         | Hand-written CSS                | 4 pages, no framework needed             |
| Fonts           | Saira (Google Fonts)            | Existing brand font                      |
| Hosting         | GitHub Pages                    | Free, custom domain, HTTPS via Let's Encrypt |
| CI/CD           | GitHub Actions                  | Free for public repos / 2000 min/mo private |
| AI editing      | Claude Code in GitHub Actions   | Triggered by labeled issues, opens PRs   |

## Site Structure

### Pages

| Page    | Route (CS)  | Route (EN)     | Content                                         |
|---------|-------------|----------------|--------------------------------------------------|
| Home    | `/`         | `/en/`         | Welcome, services list, opening hours sidebar    |
| About   | `/o-nas/`   | `/en/about/`   | Company history, operations, certifications      |
| Contest | `/soutez/`  | `/en/contest/` | Papírový lev school contest, prizes, photos      |
| Contact | `/kontakt/` | `/en/contact/` | Personnel directory, company details, parking notice |

### File Layout

```
san-juan/
├── hugo.toml
├── content/
│   ├── cs/
│   │   ├── _index.md          # Homepage
│   │   ├── about.md           # O nás
│   │   ├── contest.md         # Papírový lev
│   │   └── contact.md         # Kontakt
│   └── en/
│       ├── _index.md
│       ├── about.md
│       ├── contest.md
│       └── contact.md
├── i18n/
│   ├── cs.toml                # Czech UI strings
│   └── en.toml                # English UI strings
├── layouts/
│   ├── _default/
│   │   ├── baseof.html        # Base layout (head, nav, footer)
│   │   └── single.html        # Single page template
│   ├── index.html             # Homepage template
│   └── partials/
│       ├── header.html        # Navbar with language switcher
│       ├── footer.html        # Footer
│       └── opening-hours.html # Opening hours component
├── static/
│   ├── images/
│   │   ├── logo.gif           # Existing logo (from current site)
│   │   ├── iso.png            # ISO certification badge
│   │   ├── sber1.jpg          # Contest photos
│   │   ├── sber2.jpg
│   │   └── sber3.jpg
│   ├── files/
│   │   └── VOP.zip            # General terms download
│   └── CNAME                  # Custom domain for GitHub Pages
├── assets/
│   └── css/
│       └── main.css           # All styles
└── .github/
    └── workflows/
        ├── deploy.yml         # Hugo build + GitHub Pages deploy
        └── issue-editor.yml   # Claude Code triggered on issues
```

## Visual Design

### Brand Palette

| Token      | Value      | Usage                              |
|------------|------------|------------------------------------|
| Primary    | `#ff6501`  | Navbar, buttons, accents, links    |
| Text       | `#1a1a1a`  | Body text                          |
| Background | `#ffffff`  | Page background                    |
| Surface    | `#f7f7f8`  | Cards, opening hours, footer bg    |
| Border     | `#e5e5e5`  | Subtle separators                  |

### Typography

- **Font family:** Saira (Google Fonts), fallback `sans-serif`
- **Base size:** 18px, line-height 1.6
- **Headings:** Saira 700
- **Body:** Saira 400
- **Subtle/meta:** Saira 300

### Layout

- **Max content width:** 1100px, centered
- **Navbar:** Sticky, orange background, logo left, nav links right, language switcher (CS | EN) far right. Mobile: CSS-only hamburger toggle (checkbox pattern, no JS).
- **Homepage:** Intro section with light gray background, services as a clean list or card grid, opening hours in a styled sidebar card (right column on desktop, stacked on mobile).
- **About:** Single-column prose, certification badges displayed inline.
- **Contest:** Date/status header, prize list as cards in a row, photo gallery as a simple grid.
- **Contact:** Personnel as card list (name, role, phone, email), company info in sidebar.
- **Footer:** Three columns — address & IDs | links (terms) | ISO badge. Copyright row below.
- **Responsive:** Mobile-first. Single column below 768px, two-column layout above.

## Multilingual Setup

### Hugo Configuration

```toml
defaultContentLanguage = "cs"
defaultContentLanguageInSubdir = false

[languages.cs]
  languageName = "Česky"
  weight = 1
  [languages.cs.params]
    flag = "🇨🇿"

[languages.en]
  languageName = "English"
  weight = 2
  [languages.en.params]
    flag = "🇬🇧"
```

- Czech pages at root (`/`, `/o-nas/`, `/soutez/`, `/kontakt/`)
- English pages under `/en/` (`/en/`, `/en/about/`, `/en/contest/`, `/en/contact/`)
- Language switcher in navbar links to the same page in the other language using Hugo's `.Translations`

### Content Structure

Markdown files with YAML frontmatter. Structured data (hours, contacts, prizes) lives in frontmatter so templates render it without parsing prose:

```yaml
# content/cs/_index.md
---
title: "Vítejte na stránkách společnosti LeoCzech!"
description: "Profesionální servis v oblasti nakládání s odpady"
opening_hours:
  - day: "Pondělí"
    hours: "7:30 – 15:00"
  - day: "Úterý"
    hours: "7:30 – 15:00"
  - day: "Středa"
    hours: "7:00 – 15:00"
  - day: "Čtvrtek"
    hours: "7:30 – 15:00"
  - day: "Pátek"
    hours: "7:30 – 13:00"
---

Naše společnost Vám nabízí profesionální servis...
```

### UI Strings

`i18n/cs.toml` and `i18n/en.toml` for shared labels:

```toml
[opening_hours]
other = "Otevírací hodiny"

[contact_us]
other = "Kontaktujte nás"

[read_more]
other = "Více informací"
```

## Deployment

### GitHub Pages Deploy (`deploy.yml`)

Triggered on push to `master`:

1. Checkout repo
2. Install Hugo via `peaceiris/actions-hugo`
3. Run `hugo --minify`
4. Deploy `public/` to GitHub Pages via `peaceiris/actions-gh-pages`

Custom domain: `static/CNAME` contains `leoczech.cz`. DNS requires a CNAME record pointing to `<org>.github.io`.

### AI Issue Editor (`issue-editor.yml`)

Triggered on `issues.opened` with label `content-edit`:

1. Checkout repo on a new branch (`content-edit/<issue-number>`)
2. Run Claude Code with the issue title + body as prompt
3. Claude edits the relevant markdown file(s)
4. Commit and open a PR referencing the issue
5. Human reviews and merges

**Safeguards:**
- Agent only creates PRs, never pushes to `master`
- PR requires approval before merge
- API key stored in repo secrets (`ANTHROPIC_API_KEY`)

## Content Migration

All content is migrated from the current leoczech.cz site:

1. Homepage text, services list, opening hours -> `content/cs/_index.md`
2. About page (history, operations, certifications) -> `content/cs/about.md`
3. Contest page (dates, prizes, photos, contact person) -> `content/cs/contest.md`
4. Contact page (personnel directory, company details, parking notice) -> `content/cs/contact.md`
5. Static assets downloaded: `logo.gif`, `iso.png`, `sber*.jpg`, `VOP.zip`
6. English translations generated via LLM for all content files

## Out of Scope (Future)

- Automated contest page updates (season rollover)
- Contact form / email integration
- Analytics (could add Plausible or similar later)
- Blog / news section

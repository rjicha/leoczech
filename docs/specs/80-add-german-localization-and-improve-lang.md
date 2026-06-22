# Spec: Add German localization and improve language switcher

## Goal

Add a full German (`de`) language mutation alongside Czech and English, and
redesign the language switcher so it stays compact and unobtrusive when more
than two languages are available. The current switcher renders each alternate
language as a full-word labelled button (e.g. "English", "Deutsch"), which
becomes large and visually disruptive once a third language is introduced.

## Current State

- Two languages configured in `hugo.toml`: `cs` (default) and `en`.
- Content lives in `content/cs/` and `content/en/` (`_index.md`, `about.md`,
  `contact.md`, `contest.md`).
- UI strings live in `i18n/cs.toml` and `i18n/en.toml`.
- `layouts/partials/header.html` renders the switcher by ranging over
  `.Translations` and outputting one `<a class="lang-switch">` per alternate
  language, using the full `.Language.Label` ("Česky" / "English").
- `.lang-switch` styling in `assets/css/main.css` makes each link a bordered
  pill with full-word text — fine for one alternate, bulky for two or more.

## Target State

- Three languages configured: `cs` (default), `en`, `de`.
- A complete `content/de/` mirror of all four pages with German translations,
  preserving frontmatter structure (only human-readable strings translated;
  emails, phone numbers, image paths, keys, ICO, etc. unchanged).
- `i18n/de.toml` mirroring every key in `i18n/cs.toml` / `i18n/en.toml`.
- A single compact switcher: one bordered segmented control listing **all**
  languages by short uppercase code (`CS` / `EN` / `DE`), with the active
  language highlighted. Scales cleanly to any number of languages and takes far
  less horizontal space than full-word pills.

### German menu (hugo.toml)

| Code | Label    | Menu items (name / url)                                            |
|------|----------|-------------------------------------------------------------------|
| de   | Deutsch  | Start `/de/`, Über uns `/de/uber-uns/`, Papierlöwe `/de/wettbewerb/`, Kontakt `/de/kontakt/` |

German page slugs: `about` → `uber-uns`, `contest` → `wettbewerb`,
`contact` → `kontakt`.

## Files to Change

### 1. `hugo.toml`
- Add a `[languages.de]` block (label "Deutsch", weight 3, contentDir
  `content/de`) with a `main` menu mirroring `cs`/`en` (Start, Über uns,
  Papierlöwe, Kontakt) pointing at `/de/…` URLs.

### 2. `i18n/de.toml`
- New file translating every key present in `i18n/cs.toml` to German.

### 3. `content/de/_index.md`
- German translation of the homepage: title, description, hero_headline,
  intro, opening-hours day names, and the six service title/description pairs.
  `contact_name`, `contact_phone`, and service `icon` values stay unchanged.

### 4. `content/de/about.md`
- German translation of the About page. `slug: "uber-uns"`.

### 5. `content/de/contact.md`
- German translation of group titles/subtitles, personnel roles, and
  descriptions. `slug: "kontakt"`, `layout: "contact"`. Names, emails, phones,
  and group keys unchanged.

### 6. `content/de/contest.md`
- German translation of contest copy. `slug: "wettbewerb"`,
  `layout: "contest"`. Dates, prizes wording, sorting lists, tagline,
  target_audience translated. Contact name/phone/email, billing, image paths,
  and `place` numbers unchanged.

### 7. `layouts/partials/header.html`
- Replace the per-translation loop with a single `<li class="lang-switch">`
  containing one `<a>` per language from `.AllTranslations`, using
  `.Language.Lang | upper` as the label and marking the current language with
  an `is-active` class and `aria-current="page"`.

### 8. `assets/css/main.css`
- Restyle `.lang-switch` from a per-link pill into a compact segmented control:
  a single bordered container with divided, smaller-text segments; the active
  segment filled with the primary color. Update the mobile `@media` rule
  accordingly.

## Validation

1. `hugo --minify` succeeds with no errors and emits `public/de/` pages.
2. Switcher shows `CS · EN · DE` as one compact control on every page, with the
   current language highlighted, in both desktop and mobile (hamburger) layouts.
3. Clicking each code navigates to the same page in that language
   (e.g. About ↔ Über uns ↔ About).
4. German pages render with translated menu, content, footer terms link, and
   contact/contest layout strings — no leftover Czech/English UI strings.
5. Czech and English pages are unchanged apart from the new switcher styling.

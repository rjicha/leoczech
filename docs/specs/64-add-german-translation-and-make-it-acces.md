# Spec: Add German translation and a subtle language switcher

## Goal

Make the website available in German alongside Czech and English, and replace the current bordered language "button" with a subtle, compact switcher that scales gracefully to three (or more) languages.

The originating request (issue #64): translate the site into German, expose the German version, and use an unobtrusive switcher — the current large button is not visually appealing and would look worse with two language mutations.

## Current State

- Two languages configured in `hugo.toml`: `cs` (default, at root) and `en` (under `/en/`), each with its own `menus.main` and `contentDir`.
- Content lives in `content/cs/` and `content/en/` (`_index.md`, `about.md`, `contact.md`, `contest.md`).
- UI strings live in `i18n/cs.toml` and `i18n/en.toml`.
- The language switcher in `layouts/partials/header.html` ranges over `.Translations` and renders each as an `<a class="lang-switch">` showing the full language label ("Česky" / "English"). It is styled as a bordered pill (`.lang-switch` in `assets/css/main.css`). With three languages this would render two bordered buttons per page — visually heavy.

## Target State

### Languages
A third language `de` (Deutsch, weight 3) served under `/de/`, with its own main menu and content directory `content/de/`.

### Content (`content/de/`)
German translations mirroring the Czech/English files, with German slugs:
- `_index.md` — home (hero headline, intro, opening hours day names, service cards)
- `about.md` — slug `ueber-uns`
- `contact.md` — slug `kontakt`, layout `contact`; group keys `vertrieb` / `produktion` / `finanzen` (must match the `group` field on each person)
- `contest.md` — slug `wettbewerb`, layout `contest`

Phone numbers, e-mails, image paths, and company identifiers are language-neutral and copied verbatim.

### UI strings (`i18n/de.toml`)
German values for every key present in `i18n/cs.toml` / `i18n/en.toml`.

### Switcher
A single compact switcher rendered once per page listing all available languages as short codes (`CS` / `EN` / `DE`). The current language is highlighted (primary color, semibold) and is non-clickable; the others are muted links separated by a thin divider. No borders/pills. Implemented by iterating `.AllTranslations` (sorted by language weight) so it always lists every translation including the current one.

## Files to Change

### 1. `hugo.toml`
- Add a `[languages.de]` block (label `Deutsch`, weight 3, `contentDir = "content/de"`) with four `menus.main` entries: `Startseite` → `/de/`, `Über uns` → `/de/ueber-uns/`, `Papierlöwe` → `/de/wettbewerb/`, `Kontakt` → `/de/kontakt/`.

### 2. `content/de/_index.md` (new)
- German home frontmatter: title, description, `hero_headline`, `contact_name`, `contact_phone`, `opening_hours` (German weekday names), `intro` (3 paragraphs), `services` (6 cards) with the same `icon` keys.

### 3. `content/de/about.md` (new)
- `slug: ueber-uns`; translated body.

### 4. `content/de/contact.md` (new)
- `layout: contact`, `slug: kontakt`; `groups` with keys `vertrieb`/`produktion`/`finanzen`; `personnel` with translated roles/descriptions and matching `group` keys.

### 5. `content/de/contest.md` (new)
- `layout: contest`, `slug: wettbewerb`; translated frontmatter (tagline, target_audience, prizes, sorting lists, dates) and body.

### 6. `i18n/de.toml` (new)
- German translation of every key in `i18n/en.toml`.

### 7. `layouts/partials/header.html`
- Replace the `{{ if .IsTranslated }}` / `.Translations` block with a single `<li class="lang-switcher">` that ranges over `.AllTranslations`, marking the current language active (a `<span>`) and others as links, showing `.Language.Lang | upper`.

### 8. `assets/css/main.css`
- Remove `.lang-switch` rules; add `.lang-switcher` / `.lang-option` styles (compact, borderless, active = primary semibold, thin separators) and adjust the mobile override accordingly.

## Validation

1. `hugo --minify` succeeds with no errors and emits `public/de/...` pages.
2. Home, About, Contact, and Contest render in German under `/de/` with translated menu, UI strings, and content.
3. The switcher shows `CS · EN · DE` on every page; the current language is highlighted and not a link; the others navigate to the corresponding translation.
4. Switcher looks subtle (no bordered button) on both desktop and the mobile hamburger menu.
5. Czech and English versions are unchanged in content and still build.

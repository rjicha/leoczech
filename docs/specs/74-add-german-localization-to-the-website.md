# Spec: Add German localization to the website

## Goal

Add a full German (`de`) language mutation of the website alongside the existing Czech (`cs`) and English (`en`) versions, and rework the language switcher so it stays compact and works well with three (or more) languages.

The site currently only offers Czech and English. The original request (issue #74) asks to localize the site into German and to fix the language switcher, which is too large and would look even worse with more language mutations.

## Current State

- Two languages configured in `hugo.toml`: `cs` (default, no subdir) and `en` (under `/en/`).
- Content lives in `content/cs/` and `content/en/`, each with `_index.md`, `about.md`, `contact.md`, `contest.md`.
- UI strings live in `i18n/cs.toml` and `i18n/en.toml`.
- The language switcher in `layouts/partials/header.html` ranges over `.Translations` (every language *other* than the current one) and renders each as a full-width-ish button showing the full language label (e.g. "English", "Česky"). Styled by `.lang-switch` in `assets/css/main.css`. With three languages this produces two large buttons and looks cluttered.

## Target State

- A third language `de` ("Deutsch") configured in `hugo.toml`, served under `/de/`, with a German main menu.
- A complete `content/de/` directory mirroring the Czech/English content, fully translated into German, with German URL slugs (`ueber-uns`, `wettbewerb`, `kontakt`).
- A German UI string file `i18n/de.toml` covering every key present in `cs.toml`/`en.toml`.
- A compact language switcher that shows **all** languages as short uppercase codes (`CS` / `EN` / `DE`) grouped in a single pill-style control, with the current language highlighted. Scales cleanly to any number of languages.

## Files to Change

### 1. `hugo.toml`
- Add a `[languages.de]` block: `label = "Deutsch"`, `weight = 3`, `contentDir = "content/de"`.
- Add a German `main` menu (Startseite `/de/`, Über uns `/de/ueber-uns/`, Papierlöwe `/de/wettbewerb/`, Kontakt `/de/kontakt/`).

### 2. `i18n/de.toml`
- New file. German translations of every key in `i18n/en.toml`.

### 3. `content/de/_index.md`
- New file. German homepage frontmatter: title, description, hero headline, opening hours (German weekday names), intro text, service cards.

### 4. `content/de/about.md`
- New file. `slug: "ueber-uns"`, German title/description and body.

### 5. `content/de/contact.md`
- New file. `slug: "kontakt"`, `layout: "contact"`, German group titles and personnel roles/descriptions. Names, phones, emails unchanged.

### 6. `content/de/contest.md`
- New file. `slug: "wettbewerb"`, `layout: "contest"`, German title/tagline/audience/prizes/sorting lists and body. Dates, contact, billing, images unchanged.

### 7. `layouts/partials/header.html`
- Replace the language switcher: range over `.AllTranslations`, wrap the links in a single `<li class="lang-switcher">`, render each as `<a class="lang-option">` showing `.Language.Lang | upper`, marking the current language `active`.

### 8. `assets/css/main.css`
- Replace the `.lang-switch` rules (desktop and mobile) with compact `.lang-switcher` / `.lang-option` pill styles, including an `.active` state.

## Validation

1. `hugo --minify` succeeds with no errors.
2. `hugo server -D` and visually verify:
   - Czech, English, and German versions render at `/`, `/en/`, `/de/`.
   - The switcher shows `CS EN DE` as a compact pill with the current language highlighted, on every page.
   - Switching languages keeps you on the equivalent page (home ↔ home, contact ↔ kontakt, etc.).
   - German menu, contact groups, contest page, footer terms link, and parking alert all read in German.
3. Responsive: the switcher stays compact and centered in the mobile hamburger menu.

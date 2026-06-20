# Spec: Add German localization and improve language switcher

## Goal

Add a full German (`de`) language version of the website and redesign the
language switcher so it stays compact and usable as the number of languages
grows. The current switcher renders each non-active language as a full-width
bordered button showing the long label ("Česky", "English"). With a third
language this becomes visually heavy and unbalanced. We want a compact,
segmented control that shows every available language as a short code and
highlights the active one.

## Current State

- Two languages configured in `hugo.toml`: `cs` (default, no subdir) and `en`
  (`/en/` subdir). Each has its own `main` menu.
- Content lives in `content/cs/` and `content/en/`, each with `_index.md`,
  `about.md`, `contact.md`, `contest.md`.
- UI strings live in `i18n/cs.toml` and `i18n/en.toml`.
- The language switcher in `layouts/partials/header.html` iterates
  `.Translations` (other languages only) and renders each as an
  `<a class="lang-switch">` showing `.Language.Label` (the long label).
- `.lang-switch` is styled in `assets/css/main.css` as a bordered pill placed
  after the nav links.

## Target State

- Three languages: `cs`, `en`, `de`. German mirrors the existing structure with
  its own menu, content files, and i18n strings.
- The language switcher is a single compact segmented control listing **all**
  languages as short uppercase codes (`CS` / `EN` / `DE`). The active language
  is visually highlighted (primary colour fill); the others are muted and
  clickable. It works without JavaScript and collapses gracefully into the
  mobile menu.

### German menu (in `hugo.toml`)

| Name        | URL                |
|-------------|--------------------|
| Startseite  | `/de/`             |
| Über uns    | `/de/ueber-uns/`   |
| Papierlöwe  | `/de/wettbewerb/`  |
| Kontakt     | `/de/kontakt/`     |

German page slugs: `about` → `ueber-uns`, `contest` → `wettbewerb`,
`contact` → `kontakt`.

### Switcher markup (in `header.html`)

Replace the `.Translations` loop with one `<li class="lang-switcher">`
containing an `<a class="lang-option">` per `.AllTranslations` entry, marking
the active language with an `active` class and `aria-current="true"`. The label
is `strings.ToUpper .Language.Lang`.

## Files to Change

### 1. `hugo.toml`
- Add `[languages.de]` block (`label = "Deutsch"`, `weight = 3`,
  `contentDir = "content/de"`) with the four-item `main` menu above.

### 2. `content/de/_index.md` (new)
- German translation of the home page frontmatter mirroring `content/cs/_index.md`
  (title, description, hero headline, opening-hours day names, intro, services).
  Keep contact name/phone, hours, and icon keys identical.

### 3. `content/de/about.md` (new)
- `slug: "ueber-uns"`, German title/description and body translated from
  `content/cs/about.md`.

### 4. `content/de/contact.md` (new)
- `slug: "kontakt"`, `layout: "contact"`, German group titles/subtitle and
  roles/descriptions. Names, phones, and emails stay identical to the cs/en files.

### 5. `content/de/contest.md` (new)
- `slug: "wettbewerb"`, `layout: "contest"`, German title, tagline, audience,
  prizes, sorting lists, and intro body. Dates, contact data, billing, images
  stay identical.

### 6. `i18n/de.toml` (new)
- German translation of every key present in `i18n/en.toml`.

### 7. `layouts/partials/header.html`
- Replace the `.IsTranslated`/`.Translations` block with a single
  `.lang-switcher` list item iterating `.AllTranslations`, rendering short
  uppercase codes and highlighting the active language.

### 8. `assets/css/main.css`
- Replace `.lang-switch` rules with `.lang-switcher` (segmented container) and
  `.lang-option` (individual code, plus `.active` state). Update the mobile
  media-query block to center the switcher instead of the old `.lang-switch`.

## Validation

1. `hugo --minify` succeeds with no errors and emits `public/de/` pages.
2. Visual checks (`hugo server -D`):
   - Home, About, Contest, Contact render in German under `/de/`.
   - The switcher shows `CS EN DE`, active one highlighted, others link to the
     matching translated page.
   - Switching between all three languages stays on the equivalent page.
   - Switcher is compact on desktop and usable inside the mobile menu.
3. Edge cases:
   - German menu links resolve to the correct slugs (`/de/ueber-uns/`, etc.).
   - `aria-current` is set on the active language only.

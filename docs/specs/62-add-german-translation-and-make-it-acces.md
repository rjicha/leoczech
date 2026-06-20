# Spec: Add German translation and make it accessible

## Goal

The website is currently available in Czech (primary) and English. Issue #62 requests
a full German translation that is accessible and navigable, so German-speaking partners
(notably in Germany, Austria, and Switzerland) can read the site in their own language.

## Current State

Hugo is configured for two languages in `hugo.toml`:

- `cs` (default, `contentDir = "content/cs"`) — served at the site root.
- `en` (`contentDir = "content/en"`) — served under `/en/`.

Each language has:

- A content set in `content/<lang>/`: `_index.md`, `about.md`, `contact.md`, `contest.md`.
- A UI-string translation table in `i18n/<lang>.toml`.
- A `main` menu defined under `[[languages.<lang>.menus.main]]` in `hugo.toml`.

The header partial (`layouts/partials/header.html`) renders `.Site.Menus.main` and a
language switcher that iterates `.Translations`, so any additional configured language is
automatically picked up by both the navigation menu and the per-page language switcher.

There is no German language, content, or UI strings.

## Target State

A third language `de` is added that mirrors the existing English structure:

- New `[languages.de]` block in `hugo.toml` with a `main` menu, served under `/de/`.
- New `i18n/de.toml` with German translations of every key in `i18n/en.toml`.
- New `content/de/` with German translations of `_index.md`, `about.md`, `contact.md`,
  and `contest.md`.

German page slugs (so URLs are German):

| Page    | Slug        | URL              |
|---------|-------------|------------------|
| Home    | (none)      | `/de/`           |
| About   | `ueber-uns` | `/de/ueber-uns/` |
| Contest | `wettbewerb`| `/de/wettbewerb/`|
| Contact | `kontakt`   | `/de/kontakt/`   |

The language switcher in the header will automatically show "Deutsch" alongside the
existing language options on every translated page.

Contact data (names, phone numbers, emails, addresses, IČO/DUNS) is identical across
languages and is copied verbatim; only labels and role descriptions are translated.

## Files to Change

### 1. `hugo.toml`
- Add a `[languages.de]` block after the `en` block: `label = "Deutsch"`, `weight = 3`,
  `contentDir = "content/de"`.
- Add four `[[languages.de.menus.main]]` entries mirroring the English menu, pointing to
  `/de/`, `/de/ueber-uns/`, `/de/wettbewerb/`, `/de/kontakt/`.

### 2. `i18n/de.toml` (new)
- German translation of every key present in `i18n/en.toml`.

### 3. `content/de/_index.md` (new)
- German translation of the home page front matter: `title`, `description`,
  `hero_headline`, `intro`, `opening_hours` day names, and `services` titles/descriptions.
- `contact_name`, `contact_phone`, and service `icon` values copied verbatim.

### 4. `content/de/about.md` (new)
- German translation of `about.md`, `slug: "ueber-uns"`.

### 5. `content/de/contact.md` (new)
- German translation of `contact.md`, `slug: "kontakt"`, `layout: "contact"`.
- Translate group titles/subtitle and personnel roles/descriptions; keep `group` keys
  matching the (English-style) group keys used in `groups`, and copy names/phones/emails
  verbatim.

### 6. `content/de/contest.md` (new)
- German translation of `contest.md`, `slug: "wettbewerb"`, `layout: "contest"`.
- Translate `title`, `description`, `tagline`, `target_audience`, prize names, sorting
  lists, and body. Keep dates, contact data, image paths, and `billing_ico` verbatim.

## Validation

1. `hugo --minify` succeeds with no errors.
2. `hugo server -D` and verify in a browser:
   - `/de/` renders the German home page with translated hero, intro, services, and hours.
   - `/de/ueber-uns/`, `/de/wettbewerb/`, `/de/kontakt/` render with German content.
   - The header navigation shows the German menu labels on German pages.
   - The language switcher offers Česky / English / Deutsch and links to the correct
     translated page for each.
3. Confirm Czech and English versions are unchanged.

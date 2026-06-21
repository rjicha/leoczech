# Spec: Add German localization to the website

## Goal

Add a full German (`de`) translation of the website alongside the existing Czech and English versions, and rework the language switcher so that picking a language is no longer visually distracting — especially now that there are three languages instead of two.

This addresses GitHub issue #77. The original request (Czech) asks to prepare a German localization and adjust the language-mutation switcher so it isn't so distracting, noting that with multiple languages the current side-by-side switching wouldn't look nice.

## Current State

- Two languages are configured in `hugo.toml`: `cs` (default, weight 1) and `en` (weight 2). Each declares its own `main` menu.
- Content lives in `content/cs/` and `content/en/`, each with `_index.md`, `about.md`, `contact.md`, `contest.md`.
- Translatable UI strings live in `i18n/cs.toml` and `i18n/en.toml`.
- The language switcher in `layouts/partials/header.html` renders one inline `<a class="lang-switch">` button per translation directly inside the navbar:

  ```go-html-template
  {{ if .IsTranslated }}
    {{ range .Translations }}
      <li><a href="{{ .RelPermalink }}" class="lang-switch">{{ .Language.Label }}</a></li>
    {{ end }}
  {{ end }}
  ```

  With two languages this shows a single button. With three languages it would show two inline buttons ("English", "Deutsch") sitting next to the nav links, which is cluttered and grows with every added language.

## Target State

### Three configured languages

`hugo.toml` gains a `[languages.de]` block (label `Deutsch`, weight 3, `contentDir = "content/de"`) with a German `main` menu mirroring the Czech/English menus:

| cs | en | de | url |
|----|----|----|-----|
| Úvod | Home | Start | `/de/` |
| O nás | About | Über uns | `/de/uber-uns/` |
| Papírový lev | Paper Lion | Papierlöwe | `/de/wettbewerb/` |
| Kontakt | Contact | Kontakt | `/de/kontakt/` |

### German content

New `content/de/` directory with German translations of all four pages, mirroring the structure and frontmatter of the Czech/English files:

- `_index.md` — title, description, hero headline, opening hours (German weekday names), intro paragraphs, six service cards.
- `about.md` — slug `uber-uns`, company history prose.
- `contact.md` — slug `kontakt`, layout `contact`, three groups (Vertrieb / Produktion / Finanzen) and the full personnel list (names and emails unchanged, roles/descriptions translated).
- `contest.md` — slug `wettbewerb`, layout `contest`, all contest fields translated. Proper names, dates, addresses, IČO, phone/email, and image paths stay identical to the other languages.

### German UI strings

New `i18n/de.toml` with German translations of every key present in `i18n/cs.toml` / `i18n/en.toml`.

### Reworked language switcher

Replace the inline per-translation buttons with a single compact, collapsible language picker built with a native `<details>`/`<summary>` element (CSS-only, no JavaScript):

- The `<summary>` shows a small globe icon plus the current language code (e.g. `CS`), acting as the single, low-distraction control in the navbar.
- Opening it reveals a dropdown menu listing **all** languages (via `.AllTranslations` plus the current page), each linking to its translation. The current language is marked `aria-current="page"` and visually highlighted.
- The dropdown is absolutely positioned on desktop so it overlays content rather than pushing the nav around. On mobile (inside the collapsed hamburger menu) it renders inline within the menu flow.

This keeps the navbar calm with a single control regardless of how many languages exist, and scales cleanly as languages are added.

## Files to Change

### 1. `hugo.toml`
- Add a `[languages.de]` block with `label = "Deutsch"`, `weight = 3`, `contentDir = "content/de"`, and four `languages.de.menus.main` entries (Start, Über uns, Papierlöwe, Kontakt) with `/de/...` URLs.

### 2. `content/de/_index.md` (new)
- German translation of the home page frontmatter (title, description, hero_headline, contact_name, contact_phone, opening_hours, intro, services).

### 3. `content/de/about.md` (new)
- German translation; `slug: "uber-uns"`.

### 4. `content/de/contact.md` (new)
- German translation; `slug: "kontakt"`, `layout: "contact"`; translated group titles/subtitles and personnel roles/descriptions; unchanged names, phones, emails.

### 5. `content/de/contest.md` (new)
- German translation; `slug: "wettbewerb"`, `layout: "contest"`; translated tagline, audience, prizes, sorting lists, body; unchanged proper names, dates, address, IČO, contacts, image paths.

### 6. `i18n/de.toml` (new)
- German translation of every key in `i18n/cs.toml` / `i18n/en.toml`.

### 7. `layouts/partials/header.html`
- Replace the inline `.Translations` loop with a `<details class="lang-picker">` dropdown that lists all languages via `.AllTranslations` (plus the current page), highlighting the active one.

### 8. `assets/css/main.css`
- Add styles for `.lang-picker`, its `summary`, the globe icon, and the `.lang-menu` dropdown (desktop absolute-positioned overlay, active-item highlight, marker removed). Add mobile overrides so the picker renders inline inside the collapsed menu. Remove/replace the now-unused `.lang-switch` rules.

## Validation

How to verify the change works:

1. `hugo --minify` succeeds with no errors and emits `/de/`, `/de/uber-uns/`, `/de/wettbewerb/`, `/de/kontakt/`.
2. Run `hugo server -D` and check:
   - The navbar shows a single language control (current language code + globe), not multiple inline buttons.
   - Clicking it opens a dropdown listing Česky / English / Deutsch; the current language is highlighted; each link navigates to the correct translated page.
   - The German pages render fully translated (menu, hero, opening hours, services, contest, contact, footer terms link).
   - Switching between all three languages keeps you on the equivalent page.
3. Edge cases:
   - Mobile width (≤768px): the picker appears inside the hamburger menu and is usable.
   - Czech and English pages are unchanged in content and still build.

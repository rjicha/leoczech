# Spec: Add German localization and improve language switcher

## Goal

Make the LeoCzech website available in German (issue #71) and redesign the
language switcher so that adding a third language does not clutter the
navigation. The original request (translated from Czech) asks to "add German
localization and adjust the language switcher so it is not so disruptive."

## Current State

The site ships two languages, configured in `hugo.toml`:

- `cs` (default, served at `/`) and `en` (served at `/en/`)
- Per-language `main` menus and `contentDir` (`content/cs`, `content/en`)
- Translation strings in `i18n/cs.toml` and `i18n/en.toml`
- Content in `content/cs/*.md` and `content/en/*.md` (`_index`, `about`,
  `contact`, `contest`)

The language switcher lives in `layouts/partials/header.html`. It ranges over
`.Translations` (every language *except* the current one) and renders each as a
full-width pill button showing the language's full label ("English"):

```go-html-template
{{ if .IsTranslated }}
  {{ range .Translations }}
    <li><a href="{{ .RelPermalink }}" class="lang-switch">{{ .Language.Label }}</a></li>
  {{ end }}
{{ end }}
```

With two languages this shows a single "English"/"Česky" button. With a third
language it would render two separate full-label buttons, adding visual noise
to the navbar and giving no indication of the currently active language.

## Target State

### German is a first-class language

- `hugo.toml` gains a `[languages.de]` block (weight 3, `contentDir
  "content/de"`) with a German `main` menu mirroring `cs`/`en`, served under
  `/de/`.
- `i18n/de.toml` mirrors every key in `i18n/cs.toml` / `i18n/en.toml` with
  German strings.
- `content/de/{_index,about,contact,contest}.md` mirror the English content,
  translated to German. Frontmatter keys and structure are identical to the
  English files; only human-readable values are translated. Contact data
  (names, phones, emails, IČO) stays unchanged. German page slugs:
  `ueber-uns`, `kontakt`, `wettbewerb`.

### Compact, less disruptive language switcher

The switcher renders all languages as compact two-letter codes (`CS` `EN`
`DE`) grouped into a single segmented control, with the active language
visually marked instead of hidden. This replaces the row of full-label
buttons.

`layouts/partials/header.html`:

```go-html-template
{{ if .IsTranslated }}
  <li class="lang-switch-group" aria-label="Language">
    {{ range .AllTranslations }}
      <a href="{{ .RelPermalink }}"
         class="lang-switch{{ if eq .Language.Lang $.Language.Lang }} lang-switch-current{{ end }}"
         {{ if eq .Language.Lang $.Language.Lang }}aria-current="true"{{ end }}>{{ .Language.Lang | upper }}</a>
    {{ end }}
  </li>
{{ end }}
```

`.AllTranslations` includes the current page, so the active language is shown
and highlighted. `assets/css/main.css` restyles `.lang-switch` as a segment of
a grouped control and adds `.lang-switch-group` / `.lang-switch-current`.

## Files to Change

### 1. `hugo.toml`
- Add `[languages.de]` (label "Deutsch", weight 3, `contentDir "content/de"`)
  with a `main` menu: Start `/de/`, Über uns `/de/ueber-uns/`, Papierlöwe
  `/de/wettbewerb/`, Kontakt `/de/kontakt/`.

### 2. `i18n/de.toml`
- New file mirroring all keys of `i18n/en.toml`, translated to German.

### 3. `content/de/_index.md`
- German translation of `content/en/_index.md` (same frontmatter shape).

### 4. `content/de/about.md`
- German translation of `content/en/about.md`; `slug: ueber-uns`.

### 5. `content/de/contact.md`
- German translation of `content/en/contact.md`; `slug: kontakt`. Group titles
  and roles translated; personnel contact data unchanged.

### 6. `content/de/contest.md`
- German translation of `content/en/contest.md`; `slug: wettbewerb`.

### 7. `layouts/partials/header.html`
- Replace the `.Translations` loop with an `.AllTranslations` loop rendering
  compact uppercased language codes in a `.lang-switch-group`, marking the
  current language.

### 8. `assets/css/main.css`
- Restyle `.lang-switch` and add `.lang-switch-group` / `.lang-switch-current`
  for the segmented control, including the mobile (`max-width: 768px`) rules.

## Validation

1. `hugo --minify` succeeds with no errors.
2. `hugo server -D` and verify:
   - `/`, `/en/`, `/de/` all render; German pages show German text.
   - The switcher shows `CS EN DE` grouped together on every page, with the
     current language highlighted and non-disruptive.
   - Clicking a code navigates to the same page in that language.
   - German menu links (Über uns, Papierlöwe, Kontakt) resolve correctly.
3. Mobile width: the switcher stays compact and readable in the hamburger menu.

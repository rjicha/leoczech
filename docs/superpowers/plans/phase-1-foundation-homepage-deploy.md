# Phase 1: Foundation + Homepage + Deploy

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Get a live site on GitHub Pages with the homepage, navbar, footer, and deploy pipeline working end-to-end.

**Architecture:** Hugo static site generator with hand-written CSS, no JavaScript. Czech homepage with opening hours. GitHub Actions auto-deploy on push to master.

**Tech Stack:** Hugo, CSS, Google Fonts (Saira), GitHub Pages, GitHub Actions

**Depends on:** Nothing (first phase)

**Produces:** Live site at leoczech.cz with homepage only

---

### Task 1: Hugo Project Scaffolding & Configuration

**Files:**
- Create: `hugo.toml`

- [ ] **Step 1: Install Hugo (if not already installed)**

Run:
```bash
brew install hugo
```

Verify:
```bash
hugo version
```
Expected: Hugo version output (v0.140+ recommended)

- [ ] **Step 2: Initialize Hugo project structure**

The repo already exists, so we create the Hugo structure manually rather than using `hugo new site` (which requires an empty directory).

Run:
```bash
mkdir -p content/cs content/en layouts/_default layouts/partials i18n static/images static/files assets/css .github/workflows
```

- [ ] **Step 3: Create `hugo.toml`**

```toml
baseURL = "https://leoczech.cz/"
title = "LeoCzech spol. s r.o."

defaultContentLanguage = "cs"
defaultContentLanguageInSubdir = false

[markup.goldmark.renderer]
  unsafe = true

[languages.cs]
  languageName = "Česky"
  weight = 1

  [[languages.cs.menus.main]]
    name = "Úvod"
    url = "/"
    weight = 1
  [[languages.cs.menus.main]]
    name = "O nás"
    url = "/o-nas/"
    weight = 2
  [[languages.cs.menus.main]]
    name = "Papírový lev"
    url = "/soutez/"
    weight = 3
  [[languages.cs.menus.main]]
    name = "Kontakt"
    url = "/kontakt/"
    weight = 4

[languages.en]
  languageName = "English"
  weight = 2

  [[languages.en.menus.main]]
    name = "Home"
    url = "/en/"
    weight = 1
  [[languages.en.menus.main]]
    name = "About"
    url = "/en/about/"
    weight = 2
  [[languages.en.menus.main]]
    name = "Paper Lion"
    url = "/en/contest/"
    weight = 3
  [[languages.en.menus.main]]
    name = "Contact"
    url = "/en/contact/"
    weight = 4
```

- [ ] **Step 4: Create `.gitignore`**

Create `.gitignore`:
```
public/
resources/_gen/
.hugo_build.lock
```

- [ ] **Step 5: Create a minimal homepage to verify Hugo works**

Create `content/cs/_index.md`:
```markdown
---
title: "Vítejte na stránkách společnosti LeoCzech!"
---

Test obsah.
```

Create `layouts/index.html`:
```html
{{ define "main" }}
<h1>{{ .Title }}</h1>
{{ .Content }}
{{ end }}
```

Create `layouts/_default/baseof.html`:
```html
<!DOCTYPE html>
<html lang="{{ .Lang }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ .Title }} | {{ .Site.Title }}</title>
</head>
<body>
  {{ block "main" . }}{{ end }}
</body>
</html>
```

- [ ] **Step 6: Build and verify**

Run:
```bash
hugo
```
Expected: Build succeeds, `public/` directory created with `index.html`.

Run:
```bash
grep "Vítejte" public/index.html
```
Expected: The title text appears in the output HTML.

- [ ] **Step 7: Commit**

```bash
git add hugo.toml .gitignore content/cs/_index.md layouts/ assets/ i18n/ static/ .github/
git commit -m "feat: scaffold Hugo project with basic config and i18n"
```

---

### Task 2: Download Static Assets

**Files:**
- Create: `static/images/logo.gif`
- Create: `static/images/iso.png`
- Create: `static/images/sber1.jpg`
- Create: `static/images/sber2.jpg`
- Create: `static/images/sber3.jpg`
- Create: `static/files/VOP.zip`
- Create: `static/CNAME`

- [ ] **Step 1: Download all assets from current site**

```bash
curl -sL https://leoczech.cz/Content/Images/logo.gif -o static/images/logo.gif
curl -sL https://leoczech.cz/Content/Images/iso.png -o static/images/iso.png
curl -sL https://leoczech.cz/Content/Images/Photos/Thumbs/sber1.jpg -o static/images/sber1.jpg
curl -sL https://leoczech.cz/Content/Images/Photos/Thumbs/sber2.jpg -o static/images/sber2.jpg
curl -sL https://leoczech.cz/Content/Images/Photos/Thumbs/sber3.jpg -o static/images/sber3.jpg
curl -sL https://leoczech.cz/Content/VOP.zip -o static/files/VOP.zip
```

- [ ] **Step 2: Verify downloads**

```bash
file static/images/logo.gif static/images/iso.png static/images/sber1.jpg
ls -la static/images/ static/files/
```
Expected: All files exist and have non-zero sizes. `logo.gif` is a GIF, `iso.png` is a PNG, `sber*.jpg` are JPEGs.

- [ ] **Step 3: Create CNAME file for GitHub Pages custom domain**

Create `static/CNAME`:
```
leoczech.cz
```

- [ ] **Step 4: Commit**

```bash
git add static/
git commit -m "feat: add static assets from current site and CNAME"
```

---

### Task 3: Base Layout, Navbar & Footer

**Files:**
- Modify: `layouts/_default/baseof.html`
- Create: `layouts/partials/header.html`
- Create: `layouts/partials/footer.html`
- Create: `assets/css/main.css`

- [ ] **Step 1: Create the CSS file with reset, brand tokens, and all styles**

Create `assets/css/main.css`:
```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --color-primary: #ff6501;
  --color-primary-dark: #e55a00;
  --color-text: #1a1a1a;
  --color-bg: #ffffff;
  --color-surface: #f7f7f8;
  --color-border: #e5e5e5;
  --font-family: 'Saira', sans-serif;
  --max-width: 1100px;
}

html {
  font-size: 18px;
  line-height: 1.6;
}

body {
  font-family: var(--font-family);
  color: var(--color-text);
  background: var(--color-bg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

img {
  max-width: 100%;
  height: auto;
}

/* --- Navbar --- */

.navbar {
  background: var(--color-primary);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.navbar-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 70px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #fff;
  font-size: 1.4rem;
  font-weight: 700;
  text-decoration: none;
}

.navbar-brand:hover {
  text-decoration: none;
}

.navbar-brand img {
  height: 50px;
  width: auto;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  list-style: none;
}

.navbar-nav a {
  color: #fff;
  padding: 0.5rem 1rem;
  font-weight: 400;
  font-size: 1rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.navbar-nav a:hover {
  background: rgba(255, 255, 255, 0.15);
  text-decoration: none;
}

.lang-switch {
  color: rgba(255, 255, 255, 0.8);
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 4px;
  margin-left: 0.5rem;
}

.lang-switch:hover {
  color: #fff;
  border-color: #fff;
  text-decoration: none;
}

/* Mobile hamburger (CSS-only) */
.menu-toggle {
  display: none;
}

.menu-toggle-label {
  display: none;
  cursor: pointer;
  padding: 0.5rem;
}

.menu-toggle-label span,
.menu-toggle-label span::before,
.menu-toggle-label span::after {
  display: block;
  background: #fff;
  height: 3px;
  width: 25px;
  border-radius: 2px;
  position: relative;
  transition: transform 0.3s;
}

.menu-toggle-label span::before,
.menu-toggle-label span::after {
  content: '';
  position: absolute;
}

.menu-toggle-label span::before {
  top: -8px;
}

.menu-toggle-label span::after {
  top: 8px;
}

@media (max-width: 768px) {
  .menu-toggle-label {
    display: block;
  }

  .navbar-nav {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    background: var(--color-primary);
    padding: 1rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .menu-toggle:checked ~ .navbar-nav {
    display: flex;
  }

  .navbar-nav a {
    padding: 0.75rem 1rem;
    width: 100%;
  }

  .lang-switch {
    margin-left: 0;
    margin-top: 0.5rem;
    text-align: center;
  }
}

/* --- Main content --- */

.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1rem;
  flex: 1;
}

.page-header {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--color-border);
}

/* --- Two-column layout --- */

.two-col {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 768px) {
  .two-col {
    grid-template-columns: 1fr;
  }
}

/* --- Cards / Panels --- */

.card {
  background: var(--color-surface);
  border-radius: 8px;
  padding: 1.5rem;
}

.card h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

/* --- Opening hours --- */

.opening-hours dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 1rem;
}

.opening-hours dt {
  font-weight: 400;
  text-align: right;
}

.opening-hours dd {
  font-weight: 300;
}

/* --- Content prose --- */

.prose p {
  margin-bottom: 1rem;
}

.prose ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.5rem;
}

.prose h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 2rem 0 1rem;
}

/* --- Contact list --- */

.contact-list {
  list-style: none;
}

.contact-list li {
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
}

.contact-list li:last-child {
  border-bottom: none;
}

.contact-list h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.contact-list .role {
  font-weight: 300;
  font-size: 0.9rem;
  color: #666;
}

.contact-list .details {
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.contact-list .details a {
  margin-left: 1rem;
}

/* --- Contest --- */

.prize-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.prize-item {
  background: var(--color-surface);
  border-radius: 8px;
  padding: 1.25rem;
  text-align: center;
  font-weight: 400;
}

.prize-item .place {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  display: block;
  margin-bottom: 0.5rem;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
  margin: 1.5rem 0;
}

.photo-grid img {
  border-radius: 4px;
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
}

/* --- Alert banner --- */

.alert {
  background: #fff3e0;
  border: 1px solid var(--color-primary);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin: 1.5rem 0;
  text-align: center;
  font-weight: 400;
}

.alert strong {
  color: #d32f2f;
}

/* --- Footer --- */

.site-footer {
  background: var(--color-surface);
  margin-top: auto;
  padding: 2.5rem 1rem;
}

.footer-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 768px) {
  .footer-inner {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

.site-footer address {
  font-style: normal;
  line-height: 1.8;
}

.site-footer address strong {
  font-size: 1.1rem;
}

.site-footer .footer-links a {
  display: block;
  margin-bottom: 0.5rem;
}

.site-footer .footer-cert img {
  max-height: 150px;
}

.footer-copy {
  max-width: var(--max-width);
  margin: 1.5rem auto 0;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  text-align: center;
  font-size: 0.85rem;
  font-weight: 300;
  color: #666;
}
```

- [ ] **Step 2: Create header partial**

Create `layouts/partials/header.html`:
```html
<nav class="navbar">
  <div class="navbar-inner">
    <a class="navbar-brand" href="{{ .Site.Home.RelPermalink }}">
      <img src="/images/logo.gif" alt="LeoCzech logo">
      LeoCzech spol. s r.o.
    </a>

    <input type="checkbox" id="menu-toggle" class="menu-toggle" aria-hidden="true">
    <label for="menu-toggle" class="menu-toggle-label" aria-label="Menu">
      <span></span>
    </label>

    <ul class="navbar-nav">
      {{ range .Site.Menus.main }}
        <li><a href="{{ .URL }}">{{ .Name }}</a></li>
      {{ end }}
      {{ if .IsTranslated }}
        {{ range .Translations }}
          <li><a href="{{ .RelPermalink }}" class="lang-switch">{{ .Language.LanguageName }}</a></li>
        {{ end }}
      {{ end }}
    </ul>
  </div>
</nav>
```

- [ ] **Step 3: Create footer partial**

Create `layouts/partials/footer.html`:
```html
<footer class="site-footer">
  <div class="footer-inner">
    <div>
      <address>
        <strong>LeoCzech spol. s r.o.</strong><br>
        Hostín u Vojkovic č.p. 64, okres Mělník, PSČ 277 44
      </address>
      <p>IČO: 47052163; DIČ: CZ47052163, DUNS: 495197840</p>
    </div>
    <div class="footer-links">
      <a href="/files/VOP.zip">{{ i18n "terms" }}</a>
    </div>
    <div class="footer-cert">
      <img src="/images/iso.png" alt="ISO 9001 certification">
    </div>
  </div>
  <div class="footer-copy">
    &copy; {{ now.Year }} LeoCzech spol. s r.o.
  </div>
</footer>
```

- [ ] **Step 4: Update baseof.html with full layout**

Replace `layouts/_default/baseof.html` with:
```html
<!DOCTYPE html>
<html lang="{{ .Lang }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ .Title }} | {{ .Site.Title }}</title>
  {{ if .Description }}<meta name="description" content="{{ .Description }}">{{ end }}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Saira:wght@300;400;700&display=swap" rel="stylesheet">
  {{ $css := resources.Get "css/main.css" | minify | fingerprint }}
  <link rel="stylesheet" href="{{ $css.RelPermalink }}">
</head>
<body>
  {{ partial "header.html" . }}

  <main class="container">
    {{ block "main" . }}{{ end }}
  </main>

  {{ partial "footer.html" . }}
</body>
</html>
```

- [ ] **Step 5: Build and verify**

Run:
```bash
hugo
```
Expected: Build succeeds.

Run:
```bash
grep "navbar" public/index.html
grep "site-footer" public/index.html
```
Expected: Both navbar and footer HTML present in output.

- [ ] **Step 6: Commit**

```bash
git add layouts/ assets/css/main.css
git commit -m "feat: add base layout with navbar, footer, and CSS"
```

---

### Task 4: i18n String Files

**Files:**
- Create: `i18n/cs.toml`
- Create: `i18n/en.toml`

- [ ] **Step 1: Create Czech UI strings**

Create `i18n/cs.toml`:
```toml
[terms]
other = "Všeobecné obchodní podmínky"

[opening_hours]
other = "Drobný výkup"

[opening_hours_desc]
other = "Otevírací hodiny provozovny Hostín u Vojkovic pro drobný výkup:"

[parking_warning]
other = "Pro všechny automobily platí"

[parking_ban]
other = "Přísný zákaz parkování v obci Hostín u Vojkovic"

[parking_suffix]
other = ", mimo areál firmy LeoCzech."

[contest_title]
other = "Papírový lev"

[contest_subtitle]
other = "PAPÍROVÝ LEV aneb nahraďte papír za plast"

[contest_continues]
other = "Soutěž pro děti a mládež pokračuje!"

[contest_closing]
other = "Soutěž se uzavírá dne"

[prizes]
other = "Tři školy s největším objemem sběru odměníme"

[place_1]
other = "1. místo"

[place_2]
other = "2. místo"

[place_3]
other = "3. místo"

[good_luck]
other = "Hodně štěstí přeje za LeoCzech"

[phone]
other = "Tel."

[email]
other = "E-mail"

[registration]
other = "zaps. v obchodním rejstříku vedeném Městským soudem v Praze pod sp. zn. C 14549"
```

- [ ] **Step 2: Create English UI strings**

Create `i18n/en.toml`:
```toml
[terms]
other = "General Terms and Conditions"

[opening_hours]
other = "Small-Scale Buyback"

[opening_hours_desc]
other = "Opening hours of the Hostín u Vojkovic facility for small-scale buyback:"

[parking_warning]
other = "For all vehicles"

[parking_ban]
other = "Strict parking ban in the village of Hostín u Vojkovic"

[parking_suffix]
other = ", outside the LeoCzech company premises."

[contest_title]
other = "Paper Lion"

[contest_subtitle]
other = "PAPER LION — replace paper for plastic"

[contest_continues]
other = "The competition for children and youth continues!"

[contest_closing]
other = "The competition closes on"

[prizes]
other = "The three schools with the largest collection volume will be rewarded"

[place_1]
other = "1st place"

[place_2]
other = "2nd place"

[place_3]
other = "3rd place"

[good_luck]
other = "Best of luck from LeoCzech"

[phone]
other = "Phone"

[email]
other = "Email"

[registration]
other = "registered with the Prague Municipal Court under ref. C 14549"
```

- [ ] **Step 3: Build and verify**

Run:
```bash
hugo
```
Expected: Build succeeds without i18n warnings.

- [ ] **Step 4: Commit**

```bash
git add i18n/
git commit -m "feat: add i18n string files for Czech and English"
```

---

### Task 5: Homepage (Czech Content + Template)

**Files:**
- Modify: `content/cs/_index.md`
- Modify: `layouts/index.html`
- Create: `layouts/partials/opening-hours.html`

- [ ] **Step 1: Write Czech homepage content**

Replace `content/cs/_index.md` with:
```markdown
---
title: "Vítejte na stránkách společnosti LeoCzech!"
description: "Profesionální servis v oblasti nakládání s vybranými odpady"
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

Naše společnost Vám nabízí profesionální servis v oblasti nakládání s vybranými odpady. Zaměřujeme se zejména na výkup a zpracování sběrového papíru a plastových fólií.

Spolupracujeme s papírnami v České republice, na Slovensku, v Nizozemsku, v Německu, Rakousku, Slovinsku a jinde v Evropě. Jsme výhradním dodavatelem sběrového papíru pro papírnu Huhtamaki Česká republika (dříve Jipack).

Nabízíme firmám, institucím i soukromým osobám:

- Nákup, prodej a vlastní zpracování sběrového papíru a fólií
- Pravidelný odvoz veškerého využitelného papíru a fólií z Vašeho objektu ZDARMA!
- Výkup sběrového papíru ze škol a mateřských školek - organizování "bleskových sběrů"
- Dlouhodobé smlouvy na výkup papíru a fólií za velmi výhodných podmínek
- Drobný výkup papíru a fólií na provozovně Hostín za nejlepší možné ceny
- Garantujeme přesné vážení pravidelně kalibrovanou mostní váhou
```

- [ ] **Step 2: Create opening hours partial**

Create `layouts/partials/opening-hours.html`:
```html
{{ with .Params.opening_hours }}
<div class="card opening-hours">
  <h2>{{ i18n "opening_hours" }}</h2>
  <p>{{ i18n "opening_hours_desc" }}</p>
  <dl>
    {{ range . }}
      <dt>{{ .day }}</dt>
      <dd>{{ .hours }}</dd>
    {{ end }}
  </dl>
</div>
{{ end }}
```

- [ ] **Step 3: Update homepage template**

Replace `layouts/index.html` with:
```html
{{ define "main" }}
  <h1 class="page-header">{{ .Title }}</h1>

  <div class="two-col">
    <div class="prose">
      {{ .Content }}
    </div>
    <aside>
      {{ partial "opening-hours.html" . }}
    </aside>
  </div>

  <div class="alert">
    {{ i18n "parking_warning" }} <strong>{{ i18n "parking_ban" }}</strong>{{ i18n "parking_suffix" }}
  </div>
{{ end }}
```

- [ ] **Step 4: Build and verify**

Run:
```bash
hugo
```
Expected: Build succeeds.

Run:
```bash
grep "sběrového papíru" public/index.html
grep "opening-hours" public/index.html
```
Expected: Both homepage content and opening hours present.

- [ ] **Step 5: Commit**

```bash
git add content/cs/_index.md layouts/index.html layouts/partials/opening-hours.html
git commit -m "feat: add homepage with content and opening hours"
```

---

### Task 6: GitHub Actions Deploy Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create deploy workflow**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy Hugo to GitHub Pages

on:
  push:
    branches:
      - master

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v3
        with:
          hugo-version: 'latest'
          extended: true

      - name: Build
        run: hugo --minify

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Verify YAML is valid**

Run:
```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))" && echo "Valid YAML"
```
Expected: "Valid YAML"

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add GitHub Actions workflow for Pages deployment"
```

---

### Task 7: Local Verification

- [ ] **Step 1: Start Hugo dev server**

Run:
```bash
hugo server -D
```
Expected: Server starts at `http://localhost:1313/`. Open in a browser.

- [ ] **Step 2: Verify homepage**

Navigate to `http://localhost:1313/`:
- Orange navbar with logo and nav links
- Homepage title and services list
- Opening hours card in right sidebar
- Parking warning alert
- Footer with company info and ISO badge

- [ ] **Step 3: Verify mobile layout**

Open browser dev tools, toggle device toolbar (responsive mode). Check at 375px width:
- Hamburger menu appears
- Content is single-column
- Opening hours card stacks below main content

- [ ] **Step 4: Fix any visual issues and commit**

```bash
git add -A
git commit -m "fix: visual polish after local testing"
```

# Modern Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize the LeoCzech website — replace Saira with Inter, restyle the navbar to white with orange accent, add a full-width hero with frosted glass opening hours to the homepage, and replace prose bullet lists with service cards using Lucide SVG icons.

**Architecture:** Hugo static site with a single CSS file (`assets/css/main.css`), Go templates in `layouts/`, and content in `content/{cs,en}/`. Changes are CSS-first — the navbar and typography are pure style updates. The homepage gets a new template structure (hero + cards) replacing the current two-column prose layout. Content data (hero text, service cards) lives in frontmatter.

**Tech Stack:** Hugo, CSS (no preprocessor), Google Fonts (Inter), Lucide Icons (inline SVG), HTML/Go templates

**Spec:** `docs/specs/24-modern-redesign.md` | **Issue:** #24

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `layouts/_default/baseof.html` | Modify | Replace Saira Google Fonts link with Inter |
| `assets/css/main.css` | Modify | Font variable, navbar restyle, hero styles, service card styles, heading sizes, mobile updates |
| `layouts/partials/header.html` | Modify | Navbar color classes for mobile hamburger |
| `layouts/index.html` | Rewrite | Hero section + service cards grid (replaces two-col prose) |
| `content/cs/_index.md` | Modify | Remove prose body, add hero/services frontmatter data |
| `content/en/_index.md` | Modify | Mirror Czech frontmatter changes in English |
| `content/cs/about.md` | Modify | Break dense paragraphs into shorter ones |
| `content/en/about.md` | Modify | Break dense paragraphs into shorter ones |
| `i18n/cs.toml` | Modify | Add `hero_label` and `services_heading` strings |
| `i18n/en.toml` | Modify | Add `hero_label` and `services_heading` strings |
| `static/images/hero.jpg` | Add | Stock photo placeholder (sourced manually after implementation) |

---

### Task 1: Replace Saira with Inter (global typography)

**Files:**
- Modify: `layouts/_default/baseof.html:8-10`
- Modify: `assets/css/main.css:9-19`

- [ ] **Step 1: Update Google Fonts link in baseof.html**

Replace the Saira font links:

```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Update CSS variables and heading sizes**

In `assets/css/main.css`, update the `:root` block:

```css
  --font-family: 'Inter', sans-serif;
```

Update `.page-header`:

```css
.page-header {
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: 2rem;
}
```

- [ ] **Step 3: Build and verify**

Run: `hugo --minify`
Expected: Success, no errors. Inter font loads on all pages.

- [ ] **Step 4: Commit**

```bash
git add layouts/_default/baseof.html assets/css/main.css
git commit -m "feat: replace Saira font with Inter (#24)"
```

---

### Task 2: Restyle navbar to white with orange accent

**Files:**
- Modify: `assets/css/main.css:49-192` (navbar section)
- Modify: `layouts/partials/header.html`

- [ ] **Step 1: Update navbar CSS**

Replace the navbar styles in `assets/css/main.css`:

```css
/* --- Navbar --- */

.navbar {
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 2px solid var(--color-primary);
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
  color: var(--color-primary);
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
  color: var(--color-text-secondary);
  padding: 0.5rem 1rem;
  font-weight: 400;
  font-size: 1rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.navbar-nav a:hover {
  background: rgba(0, 0, 0, 0.04);
  text-decoration: none;
}

.lang-switch {
  color: var(--color-text-secondary);
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  margin-left: 0.5rem;
}

.lang-switch:hover {
  color: var(--color-text);
  border-color: var(--color-text);
  text-decoration: none;
}
```

- [ ] **Step 2: Update mobile hamburger colors**

Replace the mobile hamburger and mobile menu styles:

```css
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
  background: var(--color-text);
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
    background: #ffffff;
    padding: 1rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-bottom: 2px solid var(--color-primary);
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
```

- [ ] **Step 3: Build and verify**

Run: `hugo --minify`
Expected: Success. Navbar is white with orange bottom border on all pages.

- [ ] **Step 4: Commit**

```bash
git add assets/css/main.css layouts/partials/header.html
git commit -m "feat: restyle navbar to white with orange accent (#24)"
```

---

### Task 3: Add hero section CSS

**Files:**
- Modify: `assets/css/main.css` (add new section after navbar styles)

- [ ] **Step 1: Add hero CSS**

Add after the `/* --- Main content --- */` section comment (before `.container`):

```css
/* --- Hero --- */

.hero {
  position: relative;
  background: #3a3a3a url('/images/hero.jpg') center/cover no-repeat;
  color: #fff;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%);
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 3.5rem 1rem 3rem;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: start;
}

.hero-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.hero-headline {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 0.75rem;
}

.hero-subtitle {
  font-size: 1rem;
  opacity: 0.85;
  max-width: 90%;
  line-height: 1.5;
}

.hero-hours {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  min-width: 220px;
}

.hero-hours h2 {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #fff;
}

.hero-hours dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0;
}

.hero-hours dt,
.hero-hours dd {
  padding: 0.25rem 0;
  font-size: 0.9rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
}

.hero-hours dt:last-of-type,
.hero-hours dd:last-of-type {
  border-bottom: none;
}

.hero-hours dt {
  font-weight: 500;
  padding-right: 1.5rem;
  color: #fff;
}

@media (max-width: 768px) {
  .hero-inner {
    grid-template-columns: 1fr;
    padding: 2.5rem 1rem 2rem;
  }

  .hero-headline {
    font-size: 1.75rem;
  }

  .hero-subtitle {
    max-width: 100%;
  }
}
```

- [ ] **Step 2: Build and verify**

Run: `hugo --minify`
Expected: Success. (Hero won't be visible yet — template changes come in Task 5.)

- [ ] **Step 3: Commit**

```bash
git add assets/css/main.css
git commit -m "feat: add hero section CSS (#24)"
```

---

### Task 4: Add service cards CSS

**Files:**
- Modify: `assets/css/main.css` (add new section after hero styles)

- [ ] **Step 1: Add service cards CSS**

Add after the hero CSS section:

```css
/* --- Service cards --- */

.services-heading {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.service-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.service-card {
  background: var(--color-surface);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.service-card svg {
  width: 32px;
  height: 32px;
  stroke: var(--color-primary);
  stroke-width: 1.5;
  fill: none;
  margin-bottom: 0.75rem;
}

.service-card h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.service-card p {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}
```

- [ ] **Step 2: Build and verify**

Run: `hugo --minify`
Expected: Success.

- [ ] **Step 3: Commit**

```bash
git add assets/css/main.css
git commit -m "feat: add service cards CSS (#24)"
```

---

### Task 5: Add i18n strings for hero and services

**Files:**
- Modify: `i18n/cs.toml`
- Modify: `i18n/en.toml`

- [ ] **Step 1: Add Czech i18n strings**

Add to `i18n/cs.toml`:

```toml
[hero_label]
other = "Profesionální servis"

[services_heading]
other = "Co nabízíme"
```

- [ ] **Step 2: Add English i18n strings**

Add to `i18n/en.toml`:

```toml
[hero_label]
other = "Professional services"

[services_heading]
other = "What we offer"
```

- [ ] **Step 3: Build and verify**

Run: `hugo --minify`
Expected: Success.

- [ ] **Step 4: Commit**

```bash
git add i18n/cs.toml i18n/en.toml
git commit -m "feat: add i18n strings for hero and services (#24)"
```

---

### Task 6: Update homepage content frontmatter (Czech)

**Files:**
- Modify: `content/cs/_index.md`

- [ ] **Step 1: Rewrite Czech homepage content**

Replace the entire file `content/cs/_index.md` with:

```markdown
---
title: "Vítejte na stránkách společnosti LeoCzech!"
description: "Profesionální servis v oblasti nakládání s vybranými odpady"
hero_headline: "Nakládání se sběrovým papírem a fóliemi"
hero_subtitle: "Spolupracujeme s papírnami v celé Evropě. Výhradní dodavatel pro Huhtamaki ČR."
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
services:
  - title: "Výkup papíru"
    description: "Nákup a zpracování sběrového papíru"
    icon: "package"
  - title: "Odvoz zdarma"
    description: "Pravidelný svoz z vašeho objektu"
    icon: "truck"
  - title: "Školy a školky"
    description: "Bleskové sběry a výkup"
    icon: "school"
  - title: "Fólie"
    description: "Výkup plastových fólií"
    icon: "file"
  - title: "Smlouvy"
    description: "Dlouhodobé výhodné podmínky"
    icon: "file-text"
  - title: "Přesné vážení"
    description: "Kalibrovaná mostní váha"
    icon: "scale"
---
```

Note: the Markdown body is intentionally empty — all content is now in frontmatter and rendered by the template.

- [ ] **Step 2: Build and verify**

Run: `hugo --minify`
Expected: Success.

- [ ] **Step 3: Commit**

```bash
git add content/cs/_index.md
git commit -m "feat: update Czech homepage frontmatter for hero and cards (#24)"
```

---

### Task 7: Update homepage content frontmatter (English)

**Files:**
- Modify: `content/en/_index.md`

- [ ] **Step 1: Rewrite English homepage content**

Replace the entire file `content/en/_index.md` with:

```markdown
---
title: "Welcome to LeoCzech!"
description: "Professional waste management services for recyclable paper and plastic films"
hero_headline: "Recyclable paper and film management"
hero_subtitle: "Partnering with paper mills across Europe. Exclusive supplier for Huhtamaki Czech Republic."
opening_hours:
  - day: "Monday"
    hours: "7:30 – 15:00"
  - day: "Tuesday"
    hours: "7:30 – 15:00"
  - day: "Wednesday"
    hours: "7:00 – 15:00"
  - day: "Thursday"
    hours: "7:30 – 15:00"
  - day: "Friday"
    hours: "7:30 – 13:00"
services:
  - title: "Paper buyback"
    description: "Purchase and processing of recyclable paper"
    icon: "package"
  - title: "Free collection"
    description: "Regular pickup from your premises"
    icon: "truck"
  - title: "Schools"
    description: "Flash collections and buyback"
    icon: "school"
  - title: "Films"
    description: "Purchase of plastic films"
    icon: "file"
  - title: "Contracts"
    description: "Long-term favorable terms"
    icon: "file-text"
  - title: "Accurate weighing"
    description: "Calibrated bridge scale"
    icon: "scale"
---
```

- [ ] **Step 2: Build and verify**

Run: `hugo --minify`
Expected: Success.

- [ ] **Step 3: Commit**

```bash
git add content/en/_index.md
git commit -m "feat: update English homepage frontmatter for hero and cards (#24)"
```

---

### Task 8: Rewrite homepage template and baseof.html

The hero section needs to sit full-width outside `.container`. The current `baseof.html` wraps everything in `<main class="container">`, so we add a `precontent` block before it and put the hero there. The service cards and parking alert stay inside `main`.

**Files:**
- Modify: `layouts/_default/baseof.html:14-18`
- Modify: `layouts/index.html`

- [ ] **Step 1: Update baseof.html to support pre-container blocks**

Replace lines 14-18 in `layouts/_default/baseof.html`:

```html
  {{ block "precontent" . }}{{ end }}

  <main class="container">
    {{ block "main" . }}{{ end }}
  </main>
```

- [ ] **Step 2: Rewrite the homepage template**

Replace the entire file `layouts/index.html` with:

```html
{{ define "precontent" }}
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-text">
        <p class="hero-label">{{ i18n "hero_label" }}</p>
        <h1 class="hero-headline">{{ .Params.hero_headline }}</h1>
        <p class="hero-subtitle">{{ .Params.hero_subtitle }}</p>
      </div>
      {{ with .Params.opening_hours }}
      <div class="hero-hours">
        <h2>{{ i18n "opening_hours" }}</h2>
        <dl>
          {{ range . }}
            <dt>{{ .day }}</dt>
            <dd>{{ .hours }}</dd>
          {{ end }}
        </dl>
      </div>
      {{ end }}
    </div>
  </section>
{{ end }}

{{ define "main" }}
  <h2 class="services-heading">{{ i18n "services_heading" }}</h2>

  {{ with .Params.services }}
  <div class="service-cards">
    {{ range . }}
    <div class="service-card">
      {{ if eq .icon "package" }}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
      {{ else if eq .icon "truck" }}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
      {{ else if eq .icon "school" }}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      {{ else if eq .icon "file" }}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
      {{ else if eq .icon "file-text" }}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
      {{ else if eq .icon "scale" }}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
      {{ end }}
      <h3>{{ .title }}</h3>
      <p>{{ .description }}</p>
    </div>
    {{ end }}
  </div>
  {{ end }}

  <div class="alert">
    {{ i18n "parking_warning" }} <strong>{{ i18n "parking_ban" }}</strong>{{ i18n "parking_suffix" }}
  </div>
{{ end }}
```

- [ ] **Step 3: Build and verify**

Run: `hugo --minify`
Expected: Success. Hero renders full-width above the container. Service cards and alert render inside the container.

- [ ] **Step 4: Commit**

```bash
git add layouts/_default/baseof.html layouts/index.html
git commit -m "feat: rewrite homepage with hero and service cards (#24)"
```

---

### Task 9: Add placeholder hero image

**Files:**
- Add: `static/images/hero.jpg`

- [ ] **Step 1: Create a placeholder gradient image**

Since the stock photo must be sourced manually, create a simple 1x1 pixel placeholder so the build doesn't show a missing image. The dark gray fallback in the CSS (`background: #3a3a3a url(...)`) handles the visual gracefully.

```bash
# Create a minimal 1-pixel JPEG placeholder
printf '\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\x27 ",#\x1c\x1c(7),01444\x1f\x27444444444444\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16\x17\x18\x19\x1a%&\x27()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xfb\xd2\x8a(\x03\xff\xd9' > static/images/hero.jpg
```

Note: The real hero image should be sourced manually from Unsplash/Pexels/Pixabay — search for "paper recycling warehouse", "cardboard bales", or "paper mill industrial". Recommended size: 1920x800px minimum, landscape orientation, JPEG compressed to under 200KB.

- [ ] **Step 2: Build and verify**

Run: `hugo --minify`
Expected: Success.

- [ ] **Step 3: Commit**

```bash
git add static/images/hero.jpg
git commit -m "feat: add placeholder hero image (#24)"
```

---

### Task 10: Improve About page paragraph spacing

**Files:**
- Modify: `content/cs/about.md`
- Modify: `content/en/about.md`

- [ ] **Step 1: Break Czech About page into shorter paragraphs**

Replace the body of `content/cs/about.md` (keep frontmatter as-is):

```markdown
Firma LeoCzech vznikla v roce 1999 jako společnost s ručením omezeným. Téhož roku odkoupila 60% podíl nizozemská společnost Huhtamaki Paper Recycling BV. Její mateřskou firmou je mezinárodní společnost s finským vedením - Huhtamaki Oyj.

V roce 2011 se stala společnost Huhtamaki stoprocentním vlastníkem LeoCzech spol. s r.o. Huhtamaki je mezinárodním řetězcem firem s pobočkami v Evropě, Asii, Africe i Americe. Vlastní síť papíren, tiskáren a obchodních společností.

Již od počátku činnosti si LeoCzech spol. s r.o. vybudoval stabilní pozici na českém trhu. Spolupracujeme s řadou firem, které nám dodávají materiál ke zpracování, jako jsou tiskárny, obchody, zpracovatelské závody, ale i školy a zájmové organizace.

Na straně odběratelů jsou to zejména papírny v tuzemsku i ve světě. Jsme výhradním dodavatelem materiálu do sesterské společnosti, papírny Huhtamaki Czech Republic Přibyslavice. Tato papírna používá při své výrobě technologii nasávané papíroviny. Její pomocí vyrábí krabičky a proložky na vejce, ovoce a fixační části obalů pro elektroniku.

Při zpracování odpadní folie spolupracujeme na straně odběratelů s renomovanými zpracovateli a obchodníky, kteří působí po celém světě. Od roku 2003 je naše společnost držitelem certifikátu jakosti dle norem ISO 9001:2000, uděleným společností BUREAU VERITAS CZECH REPUBLIC.
```

- [ ] **Step 2: Break English About page into shorter paragraphs**

Replace the body of `content/en/about.md` (keep frontmatter as-is):

```markdown
LeoCzech was established in 1999 as a limited liability company. That same year, the Dutch company Huhtamaki Paper Recycling BV acquired a 60% stake. Its parent company is the international Finnish-led corporation Huhtamaki Oyj.

In 2011, Huhtamaki became the sole owner of LeoCzech spol. s r.o. Huhtamaki is an international network of companies with branches in Europe, Asia, Africa, and the Americas. It owns a network of paper mills, printing plants, and trading companies.

Since its inception, LeoCzech spol. s r.o. has built a stable position in the Czech market. We cooperate with numerous companies that supply us with material for processing, including printing houses, retailers, processing plants, as well as schools and interest organizations.

On the customer side, our main partners are paper mills both domestically and internationally. We are the exclusive material supplier to our sister company, the Huhtamaki Czech Republic paper mill in Přibyslavice. This mill uses molded pulp technology in its production, manufacturing egg cartons, fruit trays, and protective packaging components for electronics.

In processing waste film, we cooperate on the customer side with renowned processors and traders operating worldwide. Since 2003, our company has held the ISO 9001:2000 quality certificate, issued by BUREAU VERITAS CZECH REPUBLIC.
```

- [ ] **Step 3: Build and verify**

Run: `hugo --minify`
Expected: Success. About pages have better paragraph spacing.

- [ ] **Step 4: Commit**

```bash
git add content/cs/about.md content/en/about.md
git commit -m "feat: improve About page paragraph spacing (#24)"
```

---

### Task 11: Final validation

- [ ] **Step 1: Full build**

Run: `hugo --minify`
Expected: Success with no errors or warnings.

- [ ] **Step 2: Visual verification**

Run: `hugo server -D`

Check all pages in the browser:
- [ ] Homepage `/cs/`: white navbar, hero with dark overlay, opening hours glass card top-right, 6 service cards with SVG icons, parking alert, footer unchanged
- [ ] Homepage `/en/`: same layout with English text
- [ ] About `/cs/o-nas/`: Inter font, white navbar, shorter paragraphs, footer unchanged
- [ ] About `/en/about/`: same in English
- [ ] Contact `/cs/kontakt/`: Inter font, white navbar, grouped contacts unchanged
- [ ] Contact `/en/contact/`: same in English
- [ ] Contest `/cs/soutez/`: Inter font, white navbar, contest layout unchanged
- [ ] Mobile: hamburger menu has dark bars on white background, hero stacks to single column with hours card below headline

- [ ] **Step 3: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address visual issues from final review (#24)"
```

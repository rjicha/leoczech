# Phase 2: Czech Pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the remaining three Czech pages (About, Contest, Contact), each deployed and verified individually.

**Architecture:** Each page uses its own layout template. Content is in Markdown with structured data in YAML frontmatter. Pushes to master trigger automatic deployment via the Phase 1 pipeline.

**Tech Stack:** Hugo, CSS (already created in Phase 1)

**Depends on:** Phase 1 complete (Hugo scaffolding, base layout, CSS, deploy pipeline)

---

### Task 1: About Page

**Files:**
- Create: `content/cs/about.md`
- Create: `layouts/_default/single.html`

- [ ] **Step 1: Write Czech about page content**

Create `content/cs/about.md`:
```markdown
---
title: "O nás"
slug: "o-nas"
description: "Historie a činnost společnosti LeoCzech"
---

Firma LeoCzech vznikla v roce 1999 jako společnost s ručením omezeným. Téhož roku odkoupila 60% podíl nizozemská společnost Huhtamaki Paper Recycling BV. Její mateřskou firmou je mezinárodní společnost s finským vedením - Huhtamaki Oyj. V roce 2011 se stala společnost Huhtamaki stoprocentním vlastníkem LeoCzech spol. s r.o.

Huhtamaki je mezinárodním řetězcem firem s pobočkami v Evropě, Asii, Africe i Americe. Vlastní síť papíren, tiskáren a obchodních společností.

Již od počátku činnosti si LeoCzech spol. s r.o. vybudoval stabilní pozici na českém trhu.

Spolupracujeme s řadou firem, které nám dodávají materiál ke zpracování, jako jsou tiskárny, obchody, zpracovatelské závody, ale i školy a zájmové organizace. Na straně odběratelů jsou to zejména papírny v tuzemsku i ve světě. Jsme výhradním dodavatelem materiálu do sesterské společnosti, papírny Huhtamaki Czech Republic Přibyslavice. Tato papírna používá při své výrobě technologii nasávané papíroviny. Její pomocí vyrábí krabičky a proložky na vejce, ovoce a fixační části obalů pro elektroniku.

Při zpracování odpadní folie spolupracujeme na straně odběratelů s renomovanými zpracovateli a obchodníky, kteří působí po celém světě. Od roku 2003 je naše společnost držitelem certifikátu jakosti dle norem ISO 9001:2000, uděleným společností BUREAU VERITAS CZECH REPUBLIC a od roku 2013 jsme držitelem certifikátu FSC, uděleným společností SCS global services USA.
```

- [ ] **Step 2: Create single page template**

Create `layouts/_default/single.html`:
```html
{{ define "main" }}
  <h1 class="page-header">{{ .Title }}</h1>

  <div class="prose">
    {{ .Content }}
  </div>
{{ end }}
```

- [ ] **Step 3: Build and verify**

Run:
```bash
hugo
```
Expected: Build succeeds.

Run:
```bash
ls public/o-nas/index.html
grep "1999" public/o-nas/index.html
```
Expected: About page generated at correct slug, contains founding year.

- [ ] **Step 4: Commit**

```bash
git add content/cs/about.md layouts/_default/single.html
git commit -m "feat: add about page with company history"
```

---

### Task 2: Contest Page

**Files:**
- Create: `content/cs/contest.md`
- Create: `layouts/_default/contest.html`

- [ ] **Step 1: Write Czech contest page content**

Create `content/cs/contest.md`:
```markdown
---
title: "Papírový lev"
slug: "soutez"
description: "Soutěž pro děti a mládež ve sběru papíru"
layout: "contest"
contest_year: "2022-2023"
contest_start: "1. 7. 2022"
contest_end: "23. 6. 2023"
prizes:
  - place: 1
    prize: "Notebook"
  - place: 2
    prize: "Mobilní telefon"
  - place: 3
    prize: "Poukázka v hodnotě 1000,- Kč"
contact_person: "Bc. Marie Kopolovičová"
photos:
  - "/images/sber1.jpg"
  - "/images/sber2.jpg"
  - "/images/sber3.jpg"
---

Pro školní rok 2022-2023 jsme připravili soutěž pro děti ze středních a základních škol.

A co je potřeba, abyste mohli s námi soutěžit o ceny? Zapojit se do sběrů a nasbírat co nejvíce v období od 1. 7. 2022 do 23. 6. 2023.
```

- [ ] **Step 2: Create contest template**

Create `layouts/_default/contest.html`:
```html
{{ define "main" }}
  <h1 class="page-header">{{ .Title }}</h1>

  <h2>{{ i18n "contest_subtitle" }}</h2>
  <p><strong>{{ i18n "contest_continues" }}</strong></p>

  <div class="prose">
    {{ .Content }}
  </div>

  <p>{{ i18n "prizes" }}:</p>

  {{ with .Params.prizes }}
  <div class="prize-list">
    {{ range . }}
      <div class="prize-item">
        <span class="place">{{ i18n (printf "place_%d" .place) }}</span>
        {{ .prize }}
      </div>
    {{ end }}
  </div>
  {{ end }}

  <p>{{ i18n "contest_closing" }} {{ .Params.contest_end }}.</p>

  {{ with .Params.photos }}
  <div class="photo-grid">
    {{ range . }}
      <img src="{{ . }}" alt="">
    {{ end }}
  </div>
  {{ end }}

  <p><em>{{ i18n "good_luck" }} {{ $.Params.contact_person }}.</em></p>
{{ end }}
```

- [ ] **Step 3: Build and verify**

Run:
```bash
hugo
```
Expected: Build succeeds.

Run:
```bash
ls public/soutez/index.html
grep "prize-list" public/soutez/index.html
```
Expected: Contest page generated, prize list present.

- [ ] **Step 4: Commit**

```bash
git add content/cs/contest.md layouts/_default/contest.html
git commit -m "feat: add contest page with prizes and photo grid"
```

---

### Task 3: Contact Page

**Files:**
- Create: `content/cs/contact.md`
- Create: `layouts/_default/contact.html`

- [ ] **Step 1: Write Czech contact page content**

Create `content/cs/contact.md`:
```markdown
---
title: "Kontakt"
slug: "kontakt"
description: "Kontaktní údaje společnosti LeoCzech"
layout: "contact"
personnel:
  - name: "Bc. Lenka Jíchová"
    role: "jednatelka"
  - name: "Ing. Pavel Botur"
    role: "controlling"
    phone: "+420 608 374 526"
    email: "pavel.botur@huhtamaki.com"
  - name: "Ing. Petr Badáň"
    role: "sales manager"
    phone: "+420 734 353 674"
    email: "petr.badan@huhtamaki.com"
  - name: "Ivana Petržílková"
    role: "obchod"
    phone: "+420 602 134 770"
    email: "ivana.petrzilkova@huhtamaki.com"
  - name: "Bedřich Vališ"
    role: "logistika"
    phone: "+420 602 100 053"
    email: "bedrich.valis@huhtamaki.com"
  - name: "Dana Kalašová"
    role: "hlavní účetní"
    phone: "+420 602 391 584"
    email: "dana.kalasova@huhtamaki.com"
  - name: "Miloš Pečený"
    role: "BOZP"
    phone: "+420 602 435 159"
    email: "milos.peceny@huhtamaki.com"
  - name: "Tomáš Sikora"
    role: "váha"
    phone: "+420 724 170 545"
    email: "tomas.sikora@huhtamaki.com"
---
```

- [ ] **Step 2: Create contact page template**

Create `layouts/_default/contact.html`:
```html
{{ define "main" }}
  <h1 class="page-header">{{ .Title }}</h1>

  <div class="two-col">
    <div>
      {{ with .Params.personnel }}
      <ul class="contact-list">
        {{ range . }}
          <li>
            <h3>{{ .name }} <span class="role">{{ .role }}</span></h3>
            {{ if or .phone .email }}
              <div class="details">
                {{ with .phone }}<span>{{ i18n "phone" }}: {{ . }}</span>{{ end }}
                {{ with .email }}<a href="mailto:{{ . }}">{{ . }}</a>{{ end }}
              </div>
            {{ end }}
          </li>
        {{ end }}
      </ul>
      {{ end }}
    </div>

    <aside>
      <div class="card">
        <address>
          <strong>LeoCzech spol. s r.o.</strong><br>
          Hostín u Vojkovic č.p. 64, okres Mělník, PSČ: 277 44
        </address>
        <p style="margin-top: 1rem; font-size: 0.9rem;">
          IČO: 47052163, {{ i18n "registration" }}
        </p>
      </div>

      <div class="alert" style="margin-top: 1rem;">
        {{ i18n "parking_warning" }} <strong>{{ i18n "parking_ban" }}</strong>{{ i18n "parking_suffix" }}
      </div>
    </aside>
  </div>
{{ end }}
```

- [ ] **Step 3: Build and verify**

Run:
```bash
hugo
```
Expected: Build succeeds.

Run:
```bash
ls public/kontakt/index.html
grep "contact-list" public/kontakt/index.html
grep "Jíchová" public/kontakt/index.html
```
Expected: Contact page generated with personnel list.

- [ ] **Step 4: Commit**

```bash
git add content/cs/contact.md layouts/_default/contact.html
git commit -m "feat: add contact page with personnel directory"
```

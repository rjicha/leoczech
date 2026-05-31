# Phase 3: English Content

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add English translations for all four pages and verify the language switcher works.

**Architecture:** Hugo i18n with content files in `content/en/`. Each English file mirrors its Czech counterpart. The language switcher in the navbar links to the same page in the other language via Hugo's `.Translations`.

**Tech Stack:** Hugo i18n (already configured in Phase 1)

**Depends on:** Phase 1 + Phase 2 complete (all Czech pages and templates exist)

---

### Task 1: English Homepage

**Files:**
- Create: `content/en/_index.md`

- [ ] **Step 1: Create English homepage**

Create `content/en/_index.md`:
```markdown
---
title: "Welcome to LeoCzech!"
description: "Professional waste management services for recyclable paper and plastic films"
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
---

Our company offers professional services in the management of selected waste materials. We specialize in the purchase and processing of recyclable paper and plastic films.

We cooperate with paper mills in the Czech Republic, Slovakia, the Netherlands, Germany, Austria, Slovenia, and elsewhere in Europe. We are the exclusive supplier of recyclable paper to the Huhtamaki Czech Republic paper mill (formerly Jipack).

We offer companies, institutions, and individuals:

- Purchase, sale, and in-house processing of recyclable paper and films
- Regular collection of all usable paper and films from your premises FREE OF CHARGE!
- Purchase of recyclable paper from schools and kindergartens — organizing "flash collections"
- Long-term contracts for the purchase of paper and films on very favorable terms
- Small-scale buyback of paper and films at the Hostín facility at the best possible prices
- We guarantee accurate weighing with a regularly calibrated bridge scale
```

- [ ] **Step 2: Build and verify**

Run:
```bash
hugo
```
Expected: Build succeeds.

Run:
```bash
ls public/en/index.html
grep "Welcome" public/en/index.html
grep "lang-switch" public/index.html
```
Expected: English homepage generated. Language switcher present on Czech homepage.

- [ ] **Step 3: Commit**

```bash
git add content/en/_index.md
git commit -m "feat: add English homepage"
```

---

### Task 2: English About Page

**Files:**
- Create: `content/en/about.md`

- [ ] **Step 1: Create English about page**

Create `content/en/about.md`:
```markdown
---
title: "About Us"
slug: "about"
description: "History and operations of LeoCzech"
---

LeoCzech was established in 1999 as a limited liability company. That same year, the Dutch company Huhtamaki Paper Recycling BV acquired a 60% stake. Its parent company is the international Finnish-led corporation Huhtamaki Oyj. In 2011, Huhtamaki became the sole owner of LeoCzech spol. s r.o.

Huhtamaki is an international network of companies with branches in Europe, Asia, Africa, and the Americas. It owns a network of paper mills, printing plants, and trading companies.

Since its inception, LeoCzech spol. s r.o. has built a stable position in the Czech market.

We cooperate with numerous companies that supply us with material for processing, including printing houses, retailers, processing plants, as well as schools and interest organizations. On the customer side, our main partners are paper mills both domestically and internationally. We are the exclusive material supplier to our sister company, the Huhtamaki Czech Republic paper mill in Přibyslavice. This mill uses molded pulp technology in its production, manufacturing egg cartons, fruit trays, and protective packaging components for electronics.

In processing waste film, we cooperate on the customer side with renowned processors and traders operating worldwide. Since 2003, our company has held the ISO 9001:2000 quality certificate, issued by BUREAU VERITAS CZECH REPUBLIC, and since 2013, we hold the FSC certificate, issued by SCS Global Services USA.
```

- [ ] **Step 2: Build and verify**

Run:
```bash
hugo && ls public/en/about/index.html && grep "1999" public/en/about/index.html
```
Expected: English about page generated with founding year.

- [ ] **Step 3: Commit**

```bash
git add content/en/about.md
git commit -m "feat: add English about page"
```

---

### Task 3: English Contest Page

**Files:**
- Create: `content/en/contest.md`

- [ ] **Step 1: Create English contest page**

Create `content/en/contest.md`:
```markdown
---
title: "Paper Lion"
slug: "contest"
description: "Paper collection competition for schools"
layout: "contest"
contest_year: "2022-2023"
contest_start: "July 1, 2022"
contest_end: "June 23, 2023"
prizes:
  - place: 1
    prize: "Notebook"
  - place: 2
    prize: "Mobile phone"
  - place: 3
    prize: "Voucher worth CZK 1,000"
contact_person: "Bc. Marie Kopolovičová"
photos:
  - "/images/sber1.jpg"
  - "/images/sber2.jpg"
  - "/images/sber3.jpg"
---

For the 2022-2023 school year, we have prepared a competition for primary and secondary school students.

What do you need to do to compete for prizes? Get involved in paper collection drives and collect as much as possible between July 1, 2022 and June 23, 2023.
```

- [ ] **Step 2: Build and verify**

Run:
```bash
hugo && ls public/en/contest/index.html && grep "prize-list" public/en/contest/index.html
```
Expected: English contest page generated with prize list.

- [ ] **Step 3: Commit**

```bash
git add content/en/contest.md
git commit -m "feat: add English contest page"
```

---

### Task 4: English Contact Page

**Files:**
- Create: `content/en/contact.md`

- [ ] **Step 1: Create English contact page**

Create `content/en/contact.md`:
```markdown
---
title: "Contact"
slug: "contact"
description: "Contact information for LeoCzech"
layout: "contact"
personnel:
  - name: "Bc. Lenka Jíchová"
    role: "Director"
  - name: "Ing. Pavel Botur"
    role: "Controlling"
    phone: "+420 608 374 526"
    email: "pavel.botur@huhtamaki.com"
  - name: "Ing. Petr Badáň"
    role: "Sales Manager"
    phone: "+420 734 353 674"
    email: "petr.badan@huhtamaki.com"
  - name: "Ivana Petržílková"
    role: "Sales"
    phone: "+420 602 134 770"
    email: "ivana.petrzilkova@huhtamaki.com"
  - name: "Bedřich Vališ"
    role: "Logistics"
    phone: "+420 602 100 053"
    email: "bedrich.valis@huhtamaki.com"
  - name: "Dana Kalašová"
    role: "Chief Accountant"
    phone: "+420 602 391 584"
    email: "dana.kalasova@huhtamaki.com"
  - name: "Miloš Pečený"
    role: "Health & Safety"
    phone: "+420 602 435 159"
    email: "milos.peceny@huhtamaki.com"
  - name: "Tomáš Sikora"
    role: "Weighing"
    phone: "+420 724 170 545"
    email: "tomas.sikora@huhtamaki.com"
---
```

- [ ] **Step 2: Build and verify**

Run:
```bash
hugo && ls public/en/contact/index.html && grep "Director" public/en/contact/index.html
```
Expected: English contact page generated with translated roles.

- [ ] **Step 3: Commit**

```bash
git add content/en/contact.md
git commit -m "feat: add English contact page"
```

---

### Task 5: Verify Language Switcher

- [ ] **Step 1: Start Hugo dev server**

Run:
```bash
hugo server -D
```

- [ ] **Step 2: Test language switching on each page**

For each of the 4 pages, verify:
1. Navigate to the Czech version
2. Click the "English" language switcher in the navbar
3. Verify you land on the correct English page
4. Click "Česky" to switch back
5. Verify you return to the correct Czech page

Pages to test:
- `/` ↔ `/en/`
- `/o-nas/` ↔ `/en/about/`
- `/soutez/` ↔ `/en/contest/`
- `/kontakt/` ↔ `/en/contact/`

- [ ] **Step 3: Fix any issues and commit**

```bash
git add -A
git commit -m "fix: language switcher and translation fixes"
```

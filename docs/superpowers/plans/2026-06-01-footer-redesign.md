# Footer Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the footer from a cluttered 3-column grid into a clean two-zone layout — company info + cert on top, metadata bar on bottom.

**Architecture:** Replace the 3-column CSS grid with a flex row (company left, cert right) and a centered bottom bar (IČO/DIČ/DUNS · VOP · copyright). Mobile stacks vertically with cert on top.

**Tech Stack:** Hugo templates (Go), CSS

---

### Task 1: Create branch and commit .gitignore update

**Files:**
- Modified: `.gitignore` (already edited — just needs committing)

- [ ] **Step 1: Create feature branch from master**

```bash
git checkout -b feature/22-footer-redesign master
```

- [ ] **Step 2: Stage and commit .gitignore**

```bash
git add .gitignore
git commit -m "chore: add .superpowers/ to .gitignore"
```

---

### Task 2: Replace footer HTML template

**Files:**
- Modify: `layouts/partials/footer.html` (replace entire file)

- [ ] **Step 1: Replace footer.html with the new two-zone structure**

Replace the entire content of `layouts/partials/footer.html` with:

```html
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-company">
      <address>
        <strong>LeoCzech spol. s r.o.</strong><br>
        Hostín u Vojkovic č.p. 64, okres Mělník, PSČ 277 44
      </address>
    </div>
    <div class="footer-cert">
      <img src="{{ "images/iso.png" | relURL }}" alt="ISO 9001 certification">
    </div>
  </div>
  <div class="footer-bottom">
    <span>IČO: 47052163 · DIČ: CZ47052163 · DUNS: 495197840</span>
    <span class="footer-sep">|</span>
    <a href="{{ "files/VOP.zip" | relURL }}">{{ i18n "terms" }}</a>
    <span class="footer-sep">|</span>
    <span>&copy; {{ now.Year }} LeoCzech spol. s r.o.</span>
  </div>
</footer>
```

Key changes from the old template:
- Removed the `<p>` with IČO/DIČ/DUNS from inside the address block
- Removed the `.footer-links` div (VOP link moves to bottom bar)
- Added `.footer-bottom` div with three groups separated by `.footer-sep` spans
- Removed the old `.footer-copy` div (copyright moves into `.footer-bottom`)

- [ ] **Step 2: Commit**

```bash
git add layouts/partials/footer.html
git commit -m "feat: restructure footer HTML to two-zone layout (#22)"
```

---

### Task 3: Replace footer CSS

**Files:**
- Modify: `assets/css/main.css` (lines 411–462 — the `/* --- Footer --- */` section through end of file)

- [ ] **Step 1: Replace footer CSS block**

Replace everything from `/* --- Footer --- */` (line 411) through end of file (line 462) with:

```css
/* --- Footer --- */

.site-footer {
  background: var(--color-surface);
  margin-top: auto;
  padding: 2.5rem 1rem;
}

.footer-inner {
  max-width: var(--max-width);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
}

.site-footer address {
  font-style: normal;
  line-height: 1.8;
}

.site-footer address strong {
  font-size: 1.1rem;
}

.site-footer .footer-cert img {
  max-height: 120px;
}

.footer-bottom {
  max-width: var(--max-width);
  margin: 1.5rem auto 0;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  text-align: center;
  font-size: 0.85rem;
  font-weight: 300;
  color: var(--color-text-secondary);
  line-height: 2;
}

.footer-bottom a {
  color: var(--color-text-secondary);
  text-decoration: underline;
}

.footer-sep {
  margin: 0 0.4rem;
  color: var(--color-border);
}

@media (max-width: 768px) {
  .footer-inner {
    flex-direction: column-reverse;
    align-items: center;
    text-align: center;
  }

  .footer-bottom span,
  .footer-bottom a {
    display: block;
  }

  .footer-sep {
    display: none;
  }
}
```

Key changes:
- `.footer-inner`: grid → flex with `justify-content: space-between`
- Removed `.footer-links` and `.footer-copy` rules
- Added `.footer-bottom`, `.footer-bottom a`, `.footer-sep` rules
- Mobile: `column-reverse` puts cert on top; separators hidden, items stack via `display: block`
- Cert image max-height reduced from 150px to 120px

- [ ] **Step 2: Commit**

```bash
git add assets/css/main.css
git commit -m "feat: restyle footer CSS for two-zone layout (#22)"
```

---

### Task 4: Validate build and visual check

- [ ] **Step 1: Run hugo build**

```bash
hugo --minify
```

Expected: build succeeds with no errors.

- [ ] **Step 2: Start dev server and verify visually**

```bash
hugo server -D
```

Open in browser and check:
- **Desktop:** company/address left, ISO cert right, bottom bar centered on one line with `IČO · DIČ · DUNS | VOP | © 2026`
- **Mobile (narrow viewport ≤ 768px):** ISO cert centered on top, company/address below, bottom bar items stacked vertically
- **Czech version** (`/cs/`): VOP label reads "Všeobecné obchodní podmínky"
- **English version** (`/en/`): VOP label reads "General Terms and Conditions"

- [ ] **Step 3: Commit spec**

```bash
git add docs/specs/22-footer-redesign.md
git commit -m "docs: add footer redesign spec (#22)"
```

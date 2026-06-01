# Footer Redesign

**Issue:** #22
**Branch:** `feature/22-footer-redesign`

## Goal

Simplify the footer layout so that information is easier to scan and the VOP link doesn't waste an entire grid column. Address and business identifiers (IČO/DIČ/DUNS) should be visually separated.

## Current State

Three-column grid (`1fr 1fr auto`):
- Left: company name, address, and IČO/DIČ/DUNS all in one block
- Center: VOP link alone in its own column
- Right: ISO 9001 certificate image

Below: centered copyright line with top border.

Problems: VOP wastes space, identifiers are crammed with the address, layout feels unbalanced.

## Target State

Two visual zones:

### Top row (flex, space-between)
- **Left:** Company name (bold) + address on a new line
- **Right:** ISO 9001 certificate image (max-height 120px)

### Bottom bar (centered, top border)
Single line with mixed separators:

```
IČO: 47052163 · DIČ: CZ47052163 · DUNS: 495197840 | Všeobecné obchodní podmínky | © 2026 LeoCzech spol. s r.o.
```

- Interpunct (`·`) separates identifiers from each other
- Pipe (`|`) separates the three logical groups: identifiers, VOP link, copyright
- VOP remains a link to `files/VOP.zip`
- Copyright year uses `{{ now.Year }}`

### Mobile (≤ 768px)
- Top row stacks vertically, centered: ISO cert on top, then company name + address
- Bottom bar wraps naturally; identifiers, VOP, and copyright each on their own line

## Files to Change

### `layouts/partials/footer.html`

Replace the current three-div `.footer-inner` grid with:

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

### `assets/css/main.css`

Replace footer CSS (lines ~411–462) with:

```css
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

## Validation

1. `hugo --minify` succeeds without errors
2. `hugo server -D` — visually verify:
   - Desktop: company/address left, ISO right, bottom bar centered on one line
   - Mobile (narrow viewport): ISO on top centered, company below, bottom bar stacked
3. Check both `/cs/` and `/en/` — VOP label should use the i18n string
4. Diff matches this spec — no extra changes

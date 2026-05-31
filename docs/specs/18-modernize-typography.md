# Spec: Modernize Website Typography and Visual Design

## Goal

Give the website a more modern, fresh look while preserving brand identity (Saira font, `#ff6501` orange, overall structure). Reduce visual heaviness by lightening typography weights, improving hierarchy, replacing borders with whitespace, and refining the color system.

## Current State

- Almost all headings use `font-weight: 700`
- Contact page department names and employee names have similar visual weight
- Navbar has a heavy `box-shadow: 0 2px 8px`
- Alert banner uses dated beige/red pattern
- Borders overused as separators (page header, contact groups, contact items)
- Multiple inconsistent gray text colors (`#666`, `#888`)
- Phone/email on same line with awkward `margin-left` spacing
- Google Fonts loads weights 300, 400, 700 only

## Target State

### Font Weight Import
Load weights 300, 400, 500, 600, 700 from Google Fonts to enable intermediate weights.

### Typography Changes
| Element | Current | Target |
|---------|---------|--------|
| `.page-header` | 700 | 600 |
| `.card h2` | 700 | 600 |
| `.contact-list h3` (person name) | 700 | 500 |
| `.contact-group h2` (department) | 700 | 600, uppercase, smaller size, letter-spacing |
| `.prose h2` | 700 | 600 |
| `.navbar-brand` | 700 | 700 (keep — brand element) |

### Contact Page Hierarchy
- Department headings: `font-weight: 600`, `text-transform: uppercase`, `font-size: 0.85rem`, `letter-spacing: 0.05em`, `color: #666` — reads as a section divider
- Employee names: `font-weight: 500`, `font-size: 1.05rem` — reads as content
- Phone and email: stack vertically instead of inline with `margin-left`

### Separator Changes
- `.page-header`: remove `border-bottom`, keep margin for spacing
- `.contact-group h2`: remove `border-bottom`, let uppercase + color create separation
- `.contact-list li`: change border from `1px solid` to lighter `1px solid #f0f0f0` or remove

### Color System
- Add `--color-text-secondary: #64748b` (slate-500) as consistent secondary text
- Replace `#666` and `#888` usages with the variable
- Alert banner: use a light orange tint (`rgba(255, 101, 1, 0.06)`) background, orange text for strong instead of red

### Navbar
- Reduce box-shadow to `0 1px 3px rgba(0, 0, 0, 0.1)`

### Spacing
- Contact list items: increase padding from `1rem 0` to `1.25rem 0`
- Two-column sidebar: change fixed `350px` to `minmax(280px, 350px)` or a relative unit

## Files to Change

### 1. `layouts/_default/baseof.html`
- Update Google Fonts URL to load weights 300, 400, 500, 600, 700

### 2. `assets/css/main.css`
- Add `--color-text-secondary` CSS variable
- Reduce heading font-weights (page-header, card h2, prose h2)
- Restyle contact-group h2 as uppercase section divider
- Reduce contact-list h3 weight
- Replace hardcoded `#666`/`#888` with `--color-text-secondary`
- Soften/remove borders on page-header, contact-group, contact-list items
- Update alert banner colors
- Reduce navbar box-shadow
- Increase contact list padding
- Make sidebar column responsive

### 3. `layouts/_default/contact.html`
- Restructure `.details` div: stack phone and email on separate lines

## Validation

1. `hugo --minify` builds without errors
2. Visual review of all pages — contact, homepage, about, and contest
3. Both Czech and English versions checked
4. Brand identity preserved: Saira font, orange accent, overall structure unchanged

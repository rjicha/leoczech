# Modern Website Redesign

Issue: #24

## Goal

Modernize the website's visual design — new font, lighter navbar, hero image on the homepage, and service cards instead of prose bullet lists. The footer stays as-is. Other pages (About, Contact, Contest) receive only global styling changes.

## Current State

- **Font:** Saira (Google Fonts), weights 300–700
- **Navbar:** Solid orange (#ff6501) background, white text, sticky
- **Homepage:** Two-column layout — prose (2 paragraphs + 6-item bullet list) on the left, opening hours card on the right
- **About:** 3 dense paragraphs, single-column prose
- **Contact:** Grouped personnel list from frontmatter — well-structured, no prose
- **Contest:** Prize cards + photo grid + short intro — already compact

## Target State

### Global Changes

**Typography**
- Replace Saira with Inter (Google Fonts, weights 400, 500, 600, 700, 800)
- Page headers: 2.25rem, weight 800
- Body: 18px (1rem), weight 400
- Line-height remains 1.6
- Update `--font-family` CSS variable and the Google Fonts `<link>` in `baseof.html`

**Navbar**
- Background: white (#ffffff)
- Bottom border: 2px solid #ff6501
- Logo/brand text: #ff6501
- Nav links: #1a1a1a (active), #64748b (inactive)
- Language switch: #64748b text, #e5e5e5 border
- Hover: subtle background highlight (rgba(0,0,0,0.04))
- Mobile hamburger: keep CSS-only toggle, update colors (bars become #1a1a1a, dropdown background becomes white)

**Color palette** — unchanged (--color-primary: #ff6501, etc.)

**Footer** — no changes

### Homepage

**Hero section** (new element, sits outside `.container`)
- Full-width, directly below navbar
- Background: stock photo (industrial/professional — bales of sorted paper or warehouse operations), sourced from Unsplash/Pexels/Pixabay (free license)
- Dark gradient overlay: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)`
- Inner layout: CSS Grid, two columns (`1fr auto`), items aligned to start (top)
- Left column:
  - Small label: "Profesionální servis" (uppercase, letter-spaced, semi-transparent white)
  - Headline: "Nakládání se sběrovým papírem a fóliemi" (Inter 800, ~2.5rem, white)
  - Subtitle: one line about European partnerships and Huhtamaki (small, semi-transparent white)
  - Left column has top padding to vertically center the text
- Right column:
  - Opening hours card with frosted glass effect: `background: rgba(255,255,255,0.12)`, `backdrop-filter: blur(6px)`, `border: 1px solid rgba(255,255,255,0.2)`, rounded corners
  - Lists all 5 days with hours, white text
- Mobile: single column, hours card below the headline
- Hero image stored in `static/images/hero.jpg` (to be sourced manually)

**Services section** (replaces prose + bullet list)
- Inside `.container`, below hero
- Section heading: "Co nabízíme"
- 3-column CSS Grid (`repeat(3, 1fr)`), responsive via `repeat(auto-fit, minmax(200px, 1fr))`
- 6 cards, each with:
  - Simple line icon (inline SVG, sourced from Lucide Icons — no emoji)
  - Short title (bold)
  - One-line description
- Cards:
  1. Výkup papíru — Nákup a zpracování sběrového papíru
  2. Odvoz zdarma — Pravidelný svoz z vašeho objektu
  3. Školy a školky — Bleskové sběry a výkup
  4. Fólie — Výkup plastových fólií
  5. Smlouvy — Dlouhodobé výhodné podmínky
  6. Přesné vážení — Kalibrovaná mostní váha

**Removed from homepage:**
- The two intro paragraphs (company description and partnership info) — this content already exists on the About page and is partially covered by the hero subtitle
- The opening hours sidebar (moved into the hero)

**Parking alert** — stays at the bottom, no changes

**English homepage** — mirrors all structural changes; translate hero text and card content to match `content/en/_index.md`

### About Page

- Global styling only (Inter font, white navbar)
- Break text into shorter paragraphs with increased vertical spacing
- No structural changes

### Contact Page

- Global styling only
- No structural changes

### Contest Page

- Global styling only
- No structural changes

## Files to Change

| File | Change |
|------|--------|
| `layouts/_default/baseof.html` | Replace Saira Google Fonts link with Inter |
| `assets/css/main.css` | Update `--font-family`, navbar styles, add hero section styles, add service cards styles, update heading sizes |
| `layouts/index.html` | New hero section with opening hours, service cards grid, remove two-col prose layout |
| `layouts/partials/header.html` | Update navbar markup for white styling |
| `content/cs/_index.md` | Remove prose paragraphs, add hero frontmatter fields (subtitle text), add service cards data |
| `content/en/_index.md` | Mirror Czech changes in English |
| `static/images/hero.jpg` | Add stock photo (sourced manually, free license) |
| `layouts/partials/opening-hours.html` | May need a variant partial for the hero glass card, or inline in `index.html` |

## Validation

1. `hugo --minify` succeeds with no errors
2. `hugo server -D` — visually verify:
   - White navbar with orange accent line on all pages
   - Inter font renders correctly everywhere
   - Homepage hero displays with dark overlay and readable white text
   - Opening hours glass card visible top-right in hero (desktop), below headline (mobile)
   - 6 service cards display in 3-column grid (desktop), responsive on mobile
   - About, Contact, Contest pages look correct with new global styles
   - Footer unchanged
3. Check both `/cs/` and `/en/` versions
4. Verify mobile responsiveness (hamburger menu colors updated, hero stacks properly)

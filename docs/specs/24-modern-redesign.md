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

## Target State (Final)

### Global Changes

**Typography**
- Replace Saira with Outfit (Google Fonts, weights 100–700)
- Page headers: 2.25rem, weight 800
- Body: 18px (1rem), weight 400
- Overall aesthetic: thin/light weights used throughout for a modern, airy feel

**Navbar**
- Background: white (#ffffff)
- Bottom border: 2px solid #ff6501
- Logo/brand text: #ff6501
- Nav links: #1a1a1a (active), #64748b (inactive)
- Language switch: #64748b text, #e5e5e5 border
- Hover: subtle background highlight (rgba(0,0,0,0.04))
- Mobile hamburger: CSS-only toggle, dark bars (#1a1a1a), white dropdown background

**Color palette** — unchanged (--color-primary: #ff6501, etc.)

**Footer** — no changes

### Homepage

**Hero section** (full-width, outside `.container` via `precontent` block)
- Background: stock photo (bales of recycled cardboard, Pexels, free license) with light gradient overlay: `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)`
- Inner layout: CSS Grid, two columns (`1fr auto`), items vertically centered
- Left column:
  - Label: "Profesionální servis" (uppercase, weight 300, 0.6 opacity)
  - Headline: large (2.5rem), thin weight (300), text-shadow for readability
  - Subtitle: 0.95rem, weight 300, 0.7 opacity, text-shadow
- Right column — opening hours card:
  - Gray semi-transparent background (rgba(100,100,100,0.4)), no border, subtle rounded corners (4px), dark text-shadow for readability
  - Heading: uppercase, ultra-thin (weight 100), 1.05rem, white
  - Description text: small (0.7rem), weight 300, white (0.8 opacity), centered
  - Hours: 0.8rem, white text, day labels right-aligned, hours left-aligned, grid centered
  - No row separator lines
  - Contact phone number at the bottom as clickable `tel:` link, separated by thin border-top
  - Max-width: 14rem
- Mobile: single column, hours card below the headline

**Intro section** (inside `.container`, before service cards)
- Original company description text restored as a light intro
- Centered, 0.85rem, weight 200, secondary text color, max-width 40rem

**Services section**
- Heading: "Nabízíme firmám, institucím i soukromým osobám" (centered, weight 400)
- Fixed 3-column CSS Grid (`repeat(3, 1fr)`) — clean 3+3 layout for 6 cards
- Single column on mobile
- Each card: Lucide inline SVG icon (orange stroke), bold title, one-line description
- Cards:
  1. Výkup papíru — Nákup a zpracování sběrového papíru
  2. Odvoz zdarma — Pravidelný svoz z vašeho objektu
  3. Školy a školky — Bleskové sběry a výkup
  4. Fólie — Výkup plastových fólií
  5. Smlouvy — Dlouhodobé výhodné podmínky
  6. Přesné vážení — Kalibrovaná mostní váha

**Parking alert** — stays at the bottom, no changes

**English homepage** — mirrors all structural changes with translated content

### About Page

- Global styling only (Outfit font, white navbar)
- Text broken into 5 shorter paragraphs for improved readability
- No structural changes

### Contact Page

- Global styling only
- No structural changes

### Contest Page

- Global styling only
- No structural changes

## Files Changed

| File | Change |
|------|--------|
| `layouts/_default/baseof.html` | Replace Saira with Outfit, add `precontent` block |
| `assets/css/main.css` | Font variable, navbar restyle, hero styles, service card styles, intro text styles, heading sizes, mobile updates |
| `layouts/index.html` | Hero section (precontent) + intro text + service cards grid with Lucide SVGs |
| `layouts/partials/header.html` | No markup changes (CSS-only restyle) |
| `content/cs/_index.md` | Remove prose body, add hero/services/intro/contact frontmatter |
| `content/en/_index.md` | Mirror Czech changes in English |
| `content/cs/about.md` | Break paragraphs into shorter ones |
| `content/en/about.md` | Break paragraphs into shorter ones |
| `i18n/cs.toml` | Add `hero_label` and `services_heading` strings |
| `i18n/en.toml` | Add `hero_label` and `services_heading` strings |
| `static/images/hero.jpg` | Stock photo from Pexels (Alex Fu, free license) |

## Validation

1. `hugo --minify` succeeds with no errors
2. Visual verification:
   - White navbar with orange accent line on all pages
   - Outfit font renders correctly everywhere
   - Homepage hero with dark overlay, readable white text, opening hours card with phone number
   - Centered intro text between hero and service cards
   - 6 service cards in 3+3 grid with SVG icons
   - About pages have improved paragraph spacing
   - Footer, Contact, Contest pages unchanged structurally
3. Both `/cs/` and `/en/` versions verified
4. Mobile: hamburger dark bars, hero stacks, cards single column

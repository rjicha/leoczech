# Spec: Opening Hours Box Redesign

## Goal

Replace the semi-transparent gray opening hours box on the hero section with a clean, readable solid white card. The current overlay is hard to read and looks dated.

## Current State

- `.hero-hours` uses `background: rgba(100, 100, 100, 0.4)` — a semi-transparent gray over the hero image
- All text is white/semi-transparent white with `text-shadow` for readability
- Border radius is `4px`, no shadow
- Contact link uses muted white (`rgba(255, 255, 255, 0.7)`)
- Colors are hardcoded rgba values, not CSS custom properties

## Target State

- Solid white card (`#ffffff`) with `border-radius: 8px` and `box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15)`
- Heading ("Drobný výkup") in brand orange (`--color-primary`), small uppercase, weight 600
- Description text in `--color-text-secondary`
- Day names in `--color-text` (weight 500), hours in `--color-text-secondary`
- Phone link in `--color-primary`, hover darkens to `--color-primary-dark`
- Divider line uses `--color-border` instead of semi-transparent white
- No `text-shadow` needed (dark text on white background)

## Files to Change

### 1. `assets/css/main.css`

Update `.hero-hours` and all child selectors (lines 284–348):

| Selector | Property | Old | New |
|---|---|---|---|
| `.hero-hours` | background | `rgba(100, 100, 100, 0.4)` | `#ffffff` |
| `.hero-hours` | border-radius | `4px` | `8px` |
| `.hero-hours` | box-shadow | none | `0 4px 24px rgba(0, 0, 0, 0.15)` |
| `.hero-hours` | text-shadow | `0 1px 3px rgba(0, 0, 0, 0.5)` | removed |
| `.hero-hours` | border | `none` | removed |
| `.hero-hours h2` | color | `#fff` | `var(--color-primary)` |
| `.hero-hours h2` | font-weight | `100` | `600` |
| `.hero-hours h2` | font-size | `1.05rem` | `0.75rem` |
| `.hero-hours-desc` | color | `rgba(255, 255, 255, 0.8)` | `var(--color-text-secondary)` |
| `.hero-hours-contact` | border-top color | `rgba(255, 255, 255, 0.15)` | `var(--color-border)` |
| `.hero-hours-contact a` | color | `rgba(255, 255, 255, 0.7)` | `var(--color-primary)` |
| `.hero-hours-contact a:hover` | color | `#fff` | `var(--color-primary-dark)` |
| `.hero-hours dt, dd` | color | `rgba(255, 255, 255, 0.85)` | `var(--color-text-secondary)` |
| `.hero-hours dt` | color | `#fff` | `var(--color-text)` |
| `.hero-hours dt` | font-weight | `400` | `500` |

No template or content changes needed — only CSS.

## Validation

1. `hugo --minify` builds without errors
2. Opening hours card is clearly readable on the hero image
3. All three language versions (CS, EN, DE) display correctly
4. Mobile layout at 768px breakpoint still works (card stacks below headline)
5. Phone link is visible and clickable with proper hover state

# Spec: Consistent font weights across pages (#33)

## Goal

Align inner page typography with the light, elegant feel of the homepage. The homepage uses Outfit at weights 100–300 for most text; inner pages used 400–800, creating a jarring contrast when navigating between them.

## Current State

The homepage sets explicit light weights on all visible elements (hero: 100–300, intro text: 200, services heading: 400). Inner pages rely on the browser default body weight (400) and use 600–800 for headings, making them feel noticeably heavier.

## Target State

Reduce font weights on inner pages to match the homepage aesthetic:

| Selector | Before | After | Rationale |
|----------|--------|-------|-----------|
| `body` | _(none, defaults to 400)_ | 300 | Base weight matching homepage text |
| `.page-header` | 800 | 300 | Match hero headline weight |
| `.prose h2` | 600 | 400 | Match services heading weight |
| `.card h2` | 600 | 400 | Consistent with prose h2 |
| `.contact-group h2` | 600 | 400 | Consistent with other section headings |

Elements with intentionally distinct weights (navbar brand 700, service card titles 600, prize places 700) are unchanged.

## Files to Change

- `assets/css/main.css` — all changes are in this file

## Validation

1. `hugo --minify` builds without errors
2. Homepage looks unchanged
3. Inner pages (about, contact, contest) feel typographically consistent with the homepage
4. Check both Czech and English versions

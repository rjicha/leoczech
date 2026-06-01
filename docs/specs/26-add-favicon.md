# Add Favicon Using the Mini-Logo

## Goal

Add a favicon to the website so the orange lion logo appears in browser tabs, bookmarks, and mobile home screens.

## Current State

- The site has no favicon — browsers show a generic blank icon
- The mini-logo exists at `static/images/logo.gif` (70x70 orange lion on orange background)
- `layouts/_default/baseof.html` has no `<link rel="icon">` tags

## Target State

Favicon files served from `static/`:
- `favicon-16x16.png` — 16x16 for browser tabs
- `favicon-32x32.png` — 32x32 for higher-DPI tabs
- `apple-touch-icon.png` — 180x180 for iOS bookmarks

`<link>` tags in `<head>` of `baseof.html` pointing to each file.

## Files to Change

| File | Change |
|------|--------|
| `static/favicon-16x16.png` | Create — 16x16 PNG from logo.gif |
| `static/favicon-32x32.png` | Create — 32x32 PNG from logo.gif |
| `static/apple-touch-icon.png` | Create — 180x180 PNG from logo.gif |
| `layouts/_default/baseof.html` | Add `<link rel="icon">` and `<link rel="apple-touch-icon">` tags in `<head>` |

## Validation

1. `hugo --minify` builds without errors
2. `hugo server -D` — favicon visible in browser tab
3. Check `/favicon-32x32.png` loads directly in browser

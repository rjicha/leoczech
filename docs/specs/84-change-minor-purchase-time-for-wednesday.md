# Spec: Change minor purchase time for Wednesday

## Goal

Update the minor purchase (drobný výkup) opening hours for Wednesday at the Hostín u Vojkovic facility from `7:00 – 15:00` to `7:30 – 15:00`, per request from Petr Badáň (issue #84).

## Current State

The minor purchase hours are stored in the `opening_hours` frontmatter list of each language's homepage. The list is rendered by `layouts/partials/opening-hours.html` and `layouts/index.html` under the "Drobný výkup" / "small-scale buyback" heading.

Wednesday is currently:

- `content/cs/_index.md` → `Středa` → `7:00 – 15:00`
- `content/en/_index.md` → `Wednesday` → `7:00 – 15:00`
- `content/de/_index.md` → `Mittwoch` → `7:00 – 15:00`

## Target State

Wednesday hours updated to `7:30 – 15:00` in all three languages, keeping the existing en-dash (`–`) format used by the other days:

- `content/cs/_index.md` → `Středa` → `7:30 – 15:00`
- `content/en/_index.md` → `Wednesday` → `7:30 – 15:00`
- `content/de/_index.md` → `Mittwoch` → `7:30 – 15:00`

## Files to Change

### 1. `content/cs/_index.md`
- Change `Středa` hours from `7:00 – 15:00` to `7:30 – 15:00`

### 2. `content/en/_index.md`
- Change `Wednesday` hours from `7:00 – 15:00` to `7:30 – 15:00`

### 3. `content/de/_index.md`
- Change `Mittwoch` hours from `7:00 – 15:00` to `7:30 – 15:00`

## Validation

1. `hugo --minify` succeeds with no errors
2. Homepage opening-hours block shows Wednesday as `7:30 – 15:00` in Czech, English, and German
3. Other days' hours remain unchanged

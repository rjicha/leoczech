# Spec: Fix incorrect English translations

## Goal

Issue #41 reports that the English version of the site is poorly translated in places.
Audit the English content against the Czech source (the primary language) and correct the
translation errors so the English mirrors the Czech meaning accurately and reads naturally.

## Current State

The English content (`content/en/`) and shared UI strings (`i18n/en.toml`) are mostly
accurate, but a focused audit against the Czech source surfaced four genuine errors:

1. **`content/en/contest.md`** — 1st-place prize is `"Notebook"`. This is a false-friend
   mistranslation: the Czech `"Notebook"` means a **laptop computer**, not a paper notebook.
   As the top prize (ranked above a mobile phone), the English reads incorrectly.
2. **`content/en/_index.md`** — the service titled `"Školy a školky"` in Czech is translated
   as `"Schools"`, dropping *školky* (nurseries / kindergartens / preschools).
3. **`i18n/en.toml`** — `parking_warning` renders the Czech `"Pro všechny automobily platí"`
   as `"For all vehicles"`, dropping the verb *platí* ("applies"). The string is concatenated
   with a bold ban notice, so the result is an ungrammatical fragment.
4. **`content/en/about.md`** — *zájmové organizace* is rendered as `"interest organizations"`,
   a non-idiomatic calque.

## Target State

| File | Czech source | Before (EN) | After (EN) |
|------|--------------|-------------|------------|
| `content/en/contest.md` | `Notebook` (= laptop) | `Notebook` | `Laptop` |
| `content/en/_index.md` | `Školy a školky` | `Schools` | `Schools and nurseries` |
| `i18n/en.toml` | `Pro všechny automobily platí` | `For all vehicles` | `The following applies to all vehicles:` |
| `content/en/about.md` | `zájmové organizace` | `interest organizations` | `special-interest organizations` |

After the parking change, the notice renders as:
> The following applies to all vehicles: **Strict parking ban in the village of Hostín u Vojkovic**, outside the LeoCzech company premises.

## Files to Change

### 1. `content/en/contest.md`
- Change 1st-place prize `prize: "Notebook"` → `prize: "Laptop"`.

### 2. `content/en/_index.md`
- Change the school service `title: "Schools"` → `title: "Schools and nurseries"`.

### 3. `i18n/en.toml`
- Change `parking_warning` value `"For all vehicles"` → `"The following applies to all vehicles:"`.

### 4. `content/en/about.md`
- Change `interest organizations` → `special-interest organizations`.

## Validation

1. `hugo --minify` succeeds with no errors.
2. English home page (`/en/`): the school service card reads "Schools and nurseries"; the
   parking notice on the page reads as a complete sentence.
3. English contest page (`/en/contest/`): the 1st-place prize reads "Laptop".
4. English about page (`/en/about/`): reads "special-interest organizations".
5. Czech content is unchanged.

# #20 — Vylepšit vzhled sekce otevíracích hodin

## Goal

Zlepšit přehlednost a čitelnost sekce otevíracích hodin v kartě drobného výkupu na hlavní stránce. Změny musí být jemné — zachovat svěží, lehký dojem, žádný vizuální přetlak.

## Current State

- `dl/dt/dd` grid se slabým kontrastem (font-weight 400 vs 300)
- Malý vertikální gap (0.25rem) — řádky splývají
- Dny zarovnané doprava, hodiny doleva
- Žádné vizuální oddělení řádků

## Target State

- Jemný spodní border (`var(--color-border)`) mezi řádky — ne pod posledním
- Větší gap (0.5rem) pro vzdušnější pocit
- Dny se silnějším fontem (500) pro lepší orientaci, oba sloupce doleva
- Lehký padding na řádcích pro prostor kolem borderů

## Files to Change

| File | Change |
|------|--------|
| `assets/css/main.css` | Upravit `.opening-hours` styly (řádky 238–253) |

Šablona `layouts/partials/opening-hours.html` zůstává beze změny — dl/dt/dd markup je sémanticky správný.

## Validation

1. `hugo --minify` bez chyb
2. Vizuální kontrola v prohlížeči — čitelné oddělení dnů, lehký dojem
3. Česká i anglická verze vypadají stejně

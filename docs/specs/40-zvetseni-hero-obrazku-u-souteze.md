# Spec: Zvětšení hero obrázku u soutěže

## Goal

Hero obrázek na stránce soutěže (`/soutez/`, "Papírový lev") má na šířkových (desktop) rozlišeních useknuté hlavy dětí. Cílem je obrázek zobrazit tak, aby byly děti i jejich hlavy plně viditelné.

## Current State

- Stránka soutěže používá layout `layouts/_default/contest.html`, který vykresluje `hero_image` z frontmatteru `content/cs/contest.md` (`/images/papirovy-lev-hero.jpg`).
- Obrázek má rozměry **1024 × 559 px** (poměr stran ≈ 1,83 : 1).
- CSS pravidlo `.contest-hero img` v `assets/css/main.css`:
  ```css
  .contest-hero img {
    width: 100%;
    max-height: 360px;
    object-fit: cover;
    display: block;
  }
  ```
- Při šířce obsahu až ~1068 px (`--max-width: 1100px` minus padding) by plná výška obrázku byla ~583 px, ale `max-height: 360px` ji ořízne. Kombinace s `object-fit: cover` ořízne horní i dolní část — useknou se hlavy dětí nahoře.

## Target State

- Na desktopu se zobrazí celý obrázek bez svislého ořezu (žádné useknuté hlavy).
- Pokud na nějaké šířce přesto k ořezu dojde, ořez upřednostní horní část obrázku (kde jsou hlavy dětí).
- Na mobilu zůstává chování beze změny (obrázek je tam přirozeně nižší, žádný ořez nevzniká).

## Files to Change

### 1. `assets/css/main.css`
- V pravidle `.contest-hero img` zvětšit `max-height` z `360px` na `600px`, aby se na desktopu vešla plná výška obrázku (~583 px) bez ořezu.
- Přidat `object-position: center top`, aby případný zbytkový ořez ponechal viditelné hlavy dětí (horní část obrázku).

## Validation

How to verify the change works:

1. `hugo --minify` proběhne bez chyb.
2. `hugo server -D` — na stránce `/soutez/` v širokém okně prohlížeče jsou vidět celé hlavy všech dětí, obrázek není svisle useknutý.
3. Při zúžení okna (mobilní šířka) hero obrázek vypadá rozumně a není deformovaný.

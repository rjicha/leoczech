# Spec: Contact Page Grouped Layout

## Goal

Restructure the contact page to display personnel grouped by department/category, with each contact showing a title (role) and an optional short description in smaller grayed text.

## Current State

- Flat list of 9 personnel entries (name, role, phone, email)
- No grouping, no descriptions
- Template renders a simple `<ul>` with all contacts
- Two-column layout: contacts left, company card right

## Target State

### Data Structure

Each contact gains two new optional fields: `description` (short description text) and `group` (category key). Groups are rendered in order with a heading. Contacts without a group appear before all groups.

**Front matter schema per person:**
```yaml
- name: "string"
  role: "string"
  phone: "string (optional)"
  email: "string (optional)"
  description: "string (optional)"  # NEW - smaller gray text below role
  group: "string (optional)"        # NEW - groups contacts under a heading
```

**Groups** are defined as a separate front matter list to control order and allow localized group titles:
```yaml
groups:
  - key: "obchod"
    title: "Obchod"           # cs version; "Sales" in en
  - key: "vyroba"
    title: "Výroba"           # cs version; "Production" in en
    subtitle: "Středisko Hostín u Vojkovic"  # optional subtitle
  - key: "finance"
    title: "Finance"          # cs version; "Finance" in en
```

### Personnel (CS version)

**Ungrouped:**
| Name | Role | Phone | Email | Description |
|---|---|---|---|---|
| Bc. Lenka Jíchová | jednatelka | - | lenka.jichova@huhtamaki.com | - |

**Obchod:**
| Name | Role | Phone | Email | Description |
|---|---|---|---|---|
| Ing. Petr Badáň | obchodní ředitel | +420 734 353 674 | petr.badan@huhtamaki.com | - |
| Alena Vimrová | obchodní zástupce | - | alena.vimrova@huhtamaki.com | nákup na středisko Hostín |
| Ivana Petržílková | obchodní asistentka | +420 602 134 770 | ivana.petrzilkova@huhtamaki.com | fakturace, evidence odpadů, vnitřní logistika |
| Bedřich Vališ | hlavní logistik | +420 602 100 053 | bedrich.valis@huhtamaki.com | přepravy vnitrostátní i mezinárodní |
| Tomáš Sikora | logistik střediska Hostín | +420 724 170 545 | tomas.sikora@huhtamaki.com | - |

**Výroba (Středisko Hostín u Vojkovic):**
| Name | Role | Phone | Email | Description |
|---|---|---|---|---|
| Miloš Pečený | facility manager | +420 602 435 159 | milos.peceny@huhtamaki.com | BOZP, provoz, údržba a obnova zařízení, nákup technologií |
| Pavel Bína | vedoucí provozu | +420 724 203 732 | - | - |
| Radek Müller | zástupce vedoucího provozu | +420 606 729 868 | - | - |

**Finance:**
| Name | Role | Phone | Email | Description |
|---|---|---|---|---|
| Ing. Pavel Botur | controlling | +420 608 374 526 | pavel.botur@huhtamaki.com | - |
| Dana Kalašová | účetnictví, mzdy | +420 602 391 584 | dana.kalasova@huhtamaki.com | - |

### Personnel (EN version)

Same structure with translated roles:

**Ungrouped:** Lenka Jíchová - Director

**Sales:** Petr Badáň (Sales Director), Alena Vimrová (Sales Representative, desc: purchasing for the Hostín facility), Ivana Petržílková (Sales Assistant, desc: invoicing, waste records, internal logistics), Bedřich Vališ (Head of Logistics, desc: domestic and international transport), Tomáš Sikora (Hostín Facility Logistics)

**Production (Hostín u Vojkovic Facility):** Miloš Pečený (Facility Manager, desc: health & safety, operations, equipment maintenance and renewal, technology procurement), Pavel Bína (Production Manager), Radek Müller (Deputy Production Manager)

**Finance:** Pavel Botur (Controlling), Dana Kalašová (Accounting, Payroll)

## Files to Change

### 1. `content/cs/contact.md`
- Add `groups` list with keys, titles, and optional subtitles
- Update personnel entries with new `group` and `description` fields
- Update roles to match spec (e.g., "sales manager" -> "obchodní ředitel")
- Add new contacts: Pavel Bína, Radek Müller
- Add email for Lenka Jíchová
- Remove email from Alena Vimrová's current entry (she now has one)

### 2. `content/en/contact.md`
- Same structural changes with English translations

### 3. `layouts/_default/contact.html`
- Render ungrouped contacts first (those without a `group` field)
- Then iterate over `groups`, rendering a heading (h2) for each, with optional subtitle
- Under each group heading, render only the contacts matching that group's key
- Add `description` rendering below the role as a `<span class="description">`

### 4. `assets/css/main.css`
- Add `.contact-group` styles for group headings
- Add `.contact-group-subtitle` for the optional subtitle (e.g., "Středisko Hostín u Vojkovic")
- Add `.contact-list .description` style (smaller, gray, below role line)
- Ensure spacing between groups

## Visual Layout

```
Kontakt
─────────────────────────────────────────

Bc. Lenka Jíchová  jednatelka           ┃  ┌──────────────────┐
lenka.jichova@huhtamaki.com             ┃  │ LeoCzech s.r.o.  │
                                         ┃  │ Hostín u Vojkovic│
Obchod                                   ┃  │ č.p. 64 ...      │
─────────                                ┃  │                  │
Ing. Petr Badáň  obchodní ředitel       ┃  │ IČO: 47052163    │
Tel: +420 734 353 674                    ┃  └──────────────────┘
petr.badan@huhtamaki.com                ┃
                                         ┃  ┌──────────────────┐
Alena Vimrová  obchodní zástupce        ┃  │ Parking warning  │
nákup na středisko Hostín                ┃  └──────────────────┘
alena.vimrova@huhtamaki.com             ┃
                                         ┃
Ivana Petržílková  obchodní asistentka  ┃
fakturace, evidence odpadů, ...          ┃
Tel: +420 602 134 770                    ┃
ivana.petrzilkova@huhtamaki.com         ┃
...                                      ┃
```

## Notes

- Lenka Jíchová: email only (no phone), no group heading above her
- Pavel Bína: phone only (no email)
- Radek Müller: phone only (no email), note the umlaut (ü)
- The description line appears between the role and the contact details
- Group headings use `<h2>` to maintain heading hierarchy under the page `<h1>`

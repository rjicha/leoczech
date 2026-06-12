# Spec: Přidání osoby v sekci Finance

## Goal

Add a new contact, **Pepa Novák** (fakturant / invoicing clerk), to the Finance section of the contact page so visitors can reach the new team member.

## Current State

The contact page personnel live in frontmatter in `content/cs/contact.md` and `content/en/contact.md`. The `finance` group currently has two people: Ing. Pavel Botur and Dana Kalašová. The `contact` layout renders each `personnel` entry under its `group`.

## Target State

A third entry appears in the Finance group in both language versions:

- **Name:** Pepa Novák
- **Role (cs):** fakturant
- **Role (en):** Invoicing Clerk
- **Phone:** +420 625 258 459
- **Email:** pepa.novak@huhtamaki.com
- **Group:** finance

## Files to Change

### 1. `content/cs/contact.md`
- Append a new `personnel` entry for Pepa Novák with role `fakturant`, group `finance`.

### 2. `content/en/contact.md`
- Append the mirrored `personnel` entry for Pepa Novák with role `Invoicing Clerk`, group `finance`.

## Validation

How to verify the change works:

1. `hugo --minify` succeeds with no errors
2. Pepa Novák appears under the Finance group on both `/kontakt` and `/contact`
3. Phone and email render with correct `tel:` / `mailto:` links

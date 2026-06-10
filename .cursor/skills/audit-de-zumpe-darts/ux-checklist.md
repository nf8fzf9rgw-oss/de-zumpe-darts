# UX/UI audit-checklist

Gebruik bij Prioriteit 2. Noteer bevindingen en fix direct waar de oplossing duidelijk is.

## 1. Homepage / Dashboard (`/`)

- [ ] Hero/header: clubnaam en doel direct duidelijk
- [ ] Eerste indruk: professioneel, niet leeg of rommelig
- [ ] `DashboardCards`: belangrijkste cijfers bovenaan (spelers, borden, wedstrijden)
- [ ] `QuickActions`: opslaan, nieuwe avond, print bereikbaar zonder scroll
- [ ] `SpeelavondPanel`: status huidige avond helder
- [ ] Lege staat: duidelijke CTA ("Selecteer leden", "Start competitie")
- [ ] Laadtijd en perceived performance

## 2. Dashboard — informatiehiërarchie

- [ ] Meest urgente info boven de vouw (mobiel)
- [ ] Statistieken scanbaar in 3 seconden
- [ ] Geen dubbele informatie tussen panels
- [ ] Consistente terminologie (bord, speelavond, wedstrijd)

## 3. Competitiebeheer (`/competitie`)

- [ ] Bordindeling visueel per kolom/kaart
- [ ] Spelersverdeling begrijpelijk (aantal per bord)
- [ ] Wedstrijdschema leesbaar per bord
- [ ] Resultaatregistratie (indien aanwezig) intuïtief
- [ ] Gastspelers apart van leden
- [ ] Acties voor wedstrijdleiding: print, herberekenen, aanpassen

## 4. Ledenbeheer (`/leden`)

- [ ] Zoeken op naam
- [ ] Filter (aanwezig/afwezig indien van toepassing)
- [ ] Toevoegen nieuw lid
- [ ] Bewerken bestaand lid
- [ ] Bulk-selectie (alle leden aan/uit)
- [ ] Foutafhandeling bij lege of dubbele namen

## 5. Mobiele ervaring (<1024px)

- [ ] `BottomNav`: 5 items, min 44px touch targets
- [ ] Geen overlap bottom nav + content (`padding-bottom` op main)
- [ ] Eén-hand bediening: primaire acties onderaan of centraal
- [ ] Geen hover-only interacties
- [ ] DartCounter-achtig: snelle score/status updates waar relevant
- [ ] Horizontale scroll vermijden op kleine schermen
- [ ] Safe area insets (`env(safe-area-inset-bottom)`)

## 6. Desktop ervaring (≥1024px)

- [ ] `Sidebar` fixed, volledige navigatie
- [ ] Breed scherm: competitie in kolommen (meerdere borden naast elkaar)
- [ ] Werkruimte wedstrijdleiding: competitie + quick actions zichtbaar
- [ ] Header niet te dominant t.o.v. content
- [ ] `lg:ml-64` main offset correct

## 7. Algemene UX

- [ ] Nederlandse copy consistent en professioneel
- [ ] Focus states en toegankelijkheid (keyboard, aria-labels op knoppen)
- [ ] Loading/error states bij opslaan
- [ ] Bevestiging bij destructieve acties (nieuwe avond)
- [ ] Visuele feedback na opslaan (`laatsteOpslagLabel`)

## 8. Visuele professionaliteit

- [ ] Consistent kleurgebruik (zumpe-red accent)
- [ ] Typografie-hiërarchie (h1/h2/body)
- [ ] Voldoende contrast (WCAG waar haalbaar)
- [ ] Geen broken layouts op tablet (768px)

## Snelle verbeter-ideeën (pas toe indien passend)

- Grotere touch targets op mobiele knoppen (`min-h-11`, `py-3`)
- Sticky actiebalk op competitiepagina
- Zoekveld met `type="search"` en clear-knop
- Skeleton/placeholder bij lege statistieken
- Breadcrumbs of paginatitel in `Header` per route

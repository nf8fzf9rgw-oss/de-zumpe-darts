---
name: audit-de-zumpe-darts
description: Voert een volledige audit uit van het Next.js project Dart Vereniging De Zumpe, past verbeteringen direct toe in de code, en levert minimaal 50 concrete verbeterpunten. Gebruik bij volledige projectaudit, printverbetering speelschema, UX/UI-review, dartsfuncties, technische audit, of wanneer de gebruiker vraagt om de app professioneler te maken (DartCounter, Tournify, KNVB Team-app niveau).
---

# Audit De Zumpe Darts

Voer een volledige audit uit van mijn Next.js project "Dart Vereniging De Zumpe" en verbeter de applicatie direct waar mogelijk.

**BELANGRIJK:** Dit is geen analyse-opdracht alleen. Voer verbeteringen daadwerkelijk uit in de code.

## Projectdoel

De website moet aanvoelen als een professionele combinatie van:

- DartCounter
- Tournify
- KNVB Team-app
- Moderne sportvereniging software

## Projectkaart

Lees [reference.md](reference.md) voor bestandslocaties, routes en bestaande patronen.

| Gebied | Belangrijkste bestanden |
|--------|-------------------------|
| Print | `components/PrintCompetition.tsx`, `app/globals.css`, `context/SpeelavondContext.tsx` (`printSchema`) |
| Layout/nav | `components/AppShell.tsx`, `Sidebar.tsx`, `BottomNav.tsx`, `Header.tsx`, `lib/navigation.ts` |
| Competitie | `app/competitie/page.tsx`, `CompetitionBoard.tsx`, `CompetitionColumn.tsx`, `lib/competition.ts` |
| Leden | `app/leden/page.tsx`, `MembersPanel.tsx`, `lib/leden.ts` |
| Statistieken | `app/statistieken/page.tsx`, `lib/statistics.ts`, `StatisticsPanel.tsx` |
| Data | `context/SpeelavondContext.tsx`, `lib/storage.ts`, `lib/services/speelavond.service.ts` |
| Types | `types/competition.ts` |

Routes: `/`, `/competitie`, `/leden`, `/statistieken`, `/instellingen`

## Uitvoeringsvolgorde

```
Fase 1: Print (Prioriteit 1) — direct implementeren
Fase 2: Technische baseline — build/lint/tsc, blokkerende fixes
Fase 3: UX/UI — homepage, dashboard, competitie, leden, mobiel, desktop
Fase 4: Dartsfuncties — ontbrekende features waar haalbaar
Fase 5: Rapport — 50+ verbeterpunten + overzicht wijzigingen
Fase 6: Verificatie — build, routes, mobiel, print
```

Werk in kleine, gerichte commits van wijzigingen. Hergebruik bestaande componenten en conventies. Lees `node_modules/next/dist/docs/` bij Next.js API-wijzigingen (zie `AGENTS.md`).

---

## Prioriteit 1 – Printfunctionaliteit

Controleer en verbeter de volledige printf flow.

### Audit-checklist print

- [ ] Welke componenten worden geprint (`PrintCompetition`, `print-only`, `no-print`)
- [ ] Welke informatie ontbreekt (datum, clubnaam, titel, bordnummers)
- [ ] Alle borden correct weergegeven
- [ ] Alle spelers correct weergegeven (geen afkapping)
- [ ] Alle wedstrijden correct weergegeven
- [ ] A4-layout (`@page`, marges, font-size)
- [ ] Meerdere borden netjes over pagina's (`break-inside-avoid`, page-break)
- [ ] Wedstrijden niet over pagina's breken
- [ ] Kleuren omgezet naar zwart-wit (`print-color-adjust`, geen donkere achtergronden)
- [ ] Geen overbodige UI (sidebar, header, bottom nav verborgen via `no-print`)

### Vereiste verbeteringen

- Maak een aparte professionele printweergave
- Gebruik print-specifieke CSS in `app/globals.css` of `styles/print.css`
- Voeg automatisch datum toe
- Voeg clubnaam toe: **Dart Vereniging De Zumpe**
- Voeg titel toe: **Speelschema Vrijdagavond**
- Bordnummers duidelijk tonen
- Spelerslijst en wedstrijdschema duidelijk structureren
- Document direct geschikt voor uitprinten en opslaan als PDF (browser Print → Save as PDF)
- Printresultaat moet eruitzien alsof het door een officiële dartbond wordt gebruikt

### Technische aanpak print

1. Audit `PrintCompetition.tsx` en `window.print()` in `SpeelavondContext`
2. Voeg `@media print` regels toe: `@page { size: A4; margin: 15mm; }`, `break-inside: avoid` op wedstrijdregels en bordsecties
3. Gebruik tabellen voor wedstrijden (officiële uitstraling, stabiele paginering)
4. Vervang emoji's in print door tekst/iconen die in zwart-wit leesbaar zijn
5. Test met meerdere borden (4–8) en lange spelersnamen

---

## Prioriteit 2 – UX/UI audit

Analyseer en verbeter waar mogelijk. Zie [ux-checklist.md](ux-checklist.md).

| Gebied | Focus |
|--------|-------|
| Homepage | Eerste indruk, duidelijkheid, professionele uitstraling |
| Dashboard | Overzicht, snelle acties, statistieken (`DashboardCards`, `QuickActions`) |
| Competitiebeheer | Bordindeling, spelersverdeling, schema's, resultaten |
| Ledenbeheer | Zoeken, filteren, toevoegen, bewerken |
| Mobiel | Eén-hand gebruik, grote touch targets, bottom nav, DartCounter-achtig |
| Desktop | Sidebar, breed scherm, werkruimte wedstrijdleiding |

---

## Prioriteit 3 – Dartsfuncties

Controleer ontbrekende functies en implementeer waar mogelijk:

- Ranglijst
- Seizoenen
- Historie speelavonden
- Statistieken / winpercentages / gespeelde wedstrijden
- Bordhistorie
- Spelerprofielen
- Resultaatregistratie
- Export naar PDF
- Export naar Excel

Start bij bestaande code: `lib/statistics.ts`, `lib/storage.ts`, `SpeelavondContext`. Voeg geen zware dependencies toe zonder noodzaak; gebruik browser-export of lichte libraries.

---

## Prioriteit 4 – Technische audit

1. `npm run build` — alle build errors oplossen
2. `npm run lint` — ESLint waarschuwingen beoordelen en fixen waar zinvol
3. `npx tsc --noEmit` — TypeScript strict errors
4. Componentstructuur, herbruikbaarheid, state (`SpeelavondContext`)
5. Performance en mobiele prestaties (onnodige re-renders, grote bundles)
6. Vercel-compatibiliteit (geen Node-only APIs in client components, env vars)

Bij compileerfouten: gebruik skill `analyseer-nextjs-project` als aanvulling.

---

## Rapportformaat (verplicht)

Lever **minimaal 50 concrete verbeterpunten**, gesorteerd op impact:

### 1. Hoge impact
### 2. Middel impact
### 3. Lage impact

Per verbeterpunt:

| Veld | Inhoud |
|------|--------|
| **Probleem** | Wat is er mis of ontbreekt |
| **Waarom belangrijk** | Impact op wedstrijdleiding, bestuur of spelers |
| **Oplossing** | Gewenste eindtoestand |
| **Technische aanpak** | Bestanden, componenten, APIs |
| **Status** | `Uitgevoerd` / `Gepland` / `Niet haalbaar in sessie` |

Markeer uitgevoerde punten als `Uitgevoerd` met bestandsreferenties.

---

## Afsluiting (verplicht)

Na de audit:

1. **Gewijzigde bestanden** — lijst met korte beschrijving per bestand
2. **Uitgevoerde verbeteringen** — samenvatting per prioriteit
3. **`npm run build`** — moet slagen; output vermelden
4. **Routes** — controleer `/`, `/competitie`, `/leden`, `/statistieken`, `/instellingen`
5. **Mobiele weergave** — viewport ≤1024px, bottom nav, touch targets
6. **Printfunctionaliteit** — visuele/controle checklist afvinken

Gebruik browser MCP of `npm run dev` + snapshot voor route- en mobielcontrole.

## Principes bij wijzigingen

- Minimale scope: alleen wat de audit vereist
- Match bestaande stijl (donker thema, Tailwind 4, Nederlandse copy)
- Geen commits tenzij de gebruiker dat vraagt
- Geen nieuwe markdown-docs buiten de skill zelf

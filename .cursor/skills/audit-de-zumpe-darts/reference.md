# Projectreferentie — De Zumpe Darts

## Stack

- Next.js 16 (App Router) — `app/`
- React 19, TypeScript strict
- Tailwind CSS 4 — `app/globals.css` met `@import "tailwindcss"`
- Prisma 7 — `prisma.config.ts` (database optioneel/uitbreidbaar)
- State: `context/SpeelavondContext.tsx` + `lib/storage.ts` (localStorage)

## Dataflow competitie

```
Leden (lib/leden.ts) + gasten → aanwezigen
       ↓
genereerBorden / verdeelSpelers (lib/competition.ts)
       ↓
Bord[] met spelers + wedstrijden (types/competition.ts)
       ↓
SpeelavondContext → opslaan (lib/storage.ts, speelavond.service.ts)
       ↓
PrintCompetition (print-only) + window.print()
```

## Print-architectuur (huidig)

| Onderdeel | Rol |
|-----------|-----|
| `PrintCompetition` | Verborgen op scherm (`hidden`), zichtbaar bij print (`print-only`) |
| `globals.css @media print` | Verbergt `no-print`, toont `print-only`, witte achtergrond |
| `printSchema()` | Roept `window.print()` aan |
| Layout | `PrintCompetition` in `app/layout.tsx` naast `{children}` |

## Bekende print-issues om te auditen

- Titel is "Vrijdagavond Competitie" i.p.v. "Speelschema Vrijdagavond"
- Spelers als `join(" · ")` — risico op afkapping op smalle print
- Emoji in bordkop (`🎯`) — slecht in zwart-wit
- Geen expliciete `@page` A4-regels
- Geen tabelformaat voor wedstrijden
- Datum alleen via `laatsteOpslagLabel`, niet altijd actuele speelavond-datum
- Geen bordnummer (alleen `bord.naam`)

## Componenten per pagina

### `/` — Dashboard
- `app/page.tsx`
- `DashboardCards`, `DashboardStatisticsPanel`, `SpeelavondPanel`, `QuickActions`

### `/competitie`
- `CompetitionBoard`, `CompetitionColumn`, `CompetitionSummary`
- `GuestsPanel` voor gastspelers

### `/leden`
- `MembersPanel`, `lib/leden.ts`

### `/statistieken`
- `StatisticsPanel`, `lib/statistics.ts`

### `/instellingen`
- Opslaan, nieuwe avond, print-knop

## Navigatie

`lib/navigation.ts` — `NAV_ITEMS` met icons; mobiel via `BottomNav`, desktop via `Sidebar`.

Breakpoints: `lg:` (1024px) scheiding mobiel/desktop; classes `desktop-only`, `mobile-only`.

## Stylingconventies

- Clubkleur: `--zumpe-red: #b91c1c`
- Donkere UI: `bg-black`, `bg-zinc-950`, `border-zinc-800`
- Knoppen: `rounded-xl`, `font-semibold`, rode/blauwe accenten
- Print: witte achtergrond, zwarte tekst

## Dartsfuncties — huidige dekking

| Functie | Status (baseline) |
|---------|-------------------|
| Bordindeling | `lib/competition.ts` |
| Wedstrijdschema | Per bord in `Bord.wedstrijden` |
| Ledenbeheer | `lib/leden.ts`, localStorage |
| Basisstatistieken | `lib/statistics.ts`, dashboard panels |
| Speelavond opslaan | `SpeelavondContext.opslaan` |
| Print | `PrintCompetition` + `window.print` |
| Ranglijst | Waarschijnlijk ontbreekt of beperkt |
| Seizoenen | Waarschijnlijk ontbreekt |
| Historie | `lib/storage.ts` — controleren |
| Resultaatregistratie | Controleren in competition components |
| PDF/Excel export | Niet naast browser-print |

## Verificatiecommando's

```bash
npm run build
npm run lint
npx tsc --noEmit
npm run dev
```

## Browsercontrole routes

Start dev server, bezoek elk pad, controleer:
- Geen console errors
- Data uit context zichtbaar na interactie
- Mobiel: bottom nav actief, geen horizontale scroll
- Print: Ctrl+P / `printSchema()` — alleen speelschema zichtbaar

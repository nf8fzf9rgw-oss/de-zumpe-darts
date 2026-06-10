---
name: analyseer-nextjs-project
description: Analyseert een volledig Next.js project op TypeScript- en JSX-fouten, repareert build errors en verifieert dat npm run dev zonder fouten start. Gebruik bij Next.js projecten met compileerfouten, TypeScript strict errors, kapotte JSX-structuur, of wanneer de gebruiker vraagt om build/dev errors op te lossen.
---

# Analyseer Next.js Project

Analyseer mijn volledige Next.js project.

Zoek alle TypeScript fouten.
Zoek alle JSX fouten.
Repareer alle build errors.
Zorg dat npm run dev zonder fouten start.

Voer wijzigingen direct uit in de bestanden.

## Workflow

1. **Project lokaliseren** — zoek `package.json` met `next` dependency; verplaats naar projectroot.
2. **Alle bronbestanden scannen** — `app/`, `pages/`, `components/`, `lib/`, root `*.ts`/`*.tsx`.
3. **Fouten verzamelen**:
   - TypeScript: `npx tsc --noEmit` en/of `npm run build`
   - JSX: parse errors in `.next/dev/logs/next-development.log` of build output
   - ESLint: `npm run lint`
4. **Veelvoorkomende fixes**:
   - Ontbrekende sluitende `}` / `)` in JSX
   - Verkeerd geneste `.map()` callbacks
   - `const arr = []` onder `strict: true` → expliciet type (`Bord[]`)
   - `useState<any[]>` → concreet type
   - Hooks buiten component-body → correct indenteren binnen functie
5. **Repareer direct** in de bronbestanden — geen uitleg zonder actie.
6. **Verifieer**:
   - `npm run build` moet slagen
   - `npm run dev` moet starten zonder errors in de output

## Checklist

```
- [ ] TypeScript fouten gevonden en opgelost
- [ ] JSX fouten gevonden en opgelost
- [ ] npm run build geslaagd
- [ ] npm run dev start zonder fouten
```

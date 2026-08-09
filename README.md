# EduFlow

EduFlow is een platform voor onderwijsprofessionals die omkomen in de administratie.

`docs/EduFlow - Product Bible v1.0.md` is de enige normatieve bron. Spreekt de code dat
document tegen, dan wint het document. Oudere architectuurdocumenten staan in
`docs/archief/` en zijn niet meer leidend.

## Aan de slag

Vereist: Node.js 20.9 of nieuwer. De pakketbeheerder is **pnpm**; de versie staat in het veld
`packageManager` van `package.json` en komt uit corepack, dat bij Node zit.

```bash
corepack enable
pnpm install
pnpm dev
```

De app draait daarna op [http://localhost:3000](http://localhost:3000).

## Commando's

De zes commando's uit §20.5 van de Product Bible:

```bash
pnpm dev           # ontwikkelserver
pnpm lint          # ESLint, inclusief de importregels uit §10.2
pnpm typecheck     # tsc --noEmit
pnpm test          # eenheids- en componenttoetsen (Vitest)
pnpm test:golden   # de gouden testset zonder netwerk (§12.9)
pnpm e2e           # schermtoetsen met axe-core (Playwright)
```

Daarnaast:

```bash
pnpm build         # productiebouw
pnpm start         # productiebouw draaien
pnpm gates         # de elf poorten uit §16.9, met hun stand
```

Voor `pnpm e2e` zijn de browsers van Playwright nodig:

```bash
pnpm exec playwright install --with-deps chromium
```

## De bouwstraat

§16.9 van de Product Bible schrijft elf controles voor. Elke controle heeft precies één van
twee standen. **Actief** betekent dat hij nu draait en de bouw kan laten falen. **Wacht**
betekent dat het onderdeel dat hij bewaakt pas bij een latere implementatiestap ontstaat.

`pnpm gates` toont die stand:

| # | Controle | Stand | Waar |
|---|---|---|---|
| 1 | Geen persoonsgegevens naar een logfunctie (DR-44) | wacht op stap 3 | typegebaseerd; vier van de zes typen bestaan nog niet |
| 2 | Geen Dexie buiten `StorageService` (DR-13) | actief | `pnpm lint` |
| 3 | Geen import uit een andere `modules/`-map (§10.2) | actief | `pnpm lint` |
| 4 | Geen verwijzing naar een verzendeindpunt (DR-42) | actief | `pnpm gates` |
| 5 | Geen sleutel in de broncode (DR-36) | actief | `pnpm gates` |
| 6 | Geen kritieke kwetsbaarheid (§16.8) | actief | `pnpm gates` |
| 7 | `axe-core` op elk scherm (NFR-30) | actief | `pnpm e2e` |
| 8 | Bundelomvang binnen §11.8 (T-31) | actief | `pnpm gates`, na `pnpm build` |
| 9 | `restore(pseudonymise(t)) === t` (INV-30) | wacht op stap 8 | `PrivacyService` bestaat nog niet in deze vorm |
| 10 | Gouden testset zonder netwerk (§12.9) | wacht op stap 16 | er is nog geen `PromptService` |
| 11 | Gouden testset met netwerk (§12.9) | wacht op stap 16 | er is nog geen provider |

Een wachtende poort is een grendel en geen belofte: zodra het onderdeel dat hij bewaakt
bestaat, **faalt** de poort met de melding dat hij nu geïmplementeerd moet worden. Zo kan een
controle niet stilzwijgend blijven wachten nadat zijn onderwerp is gebouwd.

De poorten draaien in GitHub Actions bij elke wijziging; de kwetsbaarhedencontrole en de
gouden testset met netwerk draaien daarnaast wekelijks. Zie `.github/workflows/ci.yml`.

## Techniek

Next.js (App Router), React, TypeScript, Tailwind CSS, Base UI (T-39), Lucide Icons.
Hoofdstuk 10 en 11 van de Product Bible beschrijven de architectuur en de mappenstructuur;
T-45 legt vast welke afhankelijkheden zijn toegestaan.

De codebase volgt die architectuur nog niet volledig. De implementatievolgorde staat in de
architectuurreview bij §19.5; `idb` en `jspdf` zijn tijdelijk en verdwijnen bij respectievelijk
stap 4 en stap 13.

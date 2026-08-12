# D01 — StorageService, BaseRecord en het schema

**Fase:** doorloop v0.1 · **Duur:** 1 dagdeel · **Blokkeert:** alles

## Doel

Een documentatie overleeft een herstart van de browser.

## Lees dit, en niet meer

- `docs/08-datamodel.md` — §8.1 uitgangspunten, §8.2 opslaglagen, §8.3 het schema
  (alleen `Documentation`, `Student`, `Group`, `Membership`, `Series`, `Page`), §8.6 migraties
- `docs/10-service-architectuur.md` — §10.2 mappenstructuur, §10.3 het patroon van een service
- `docs/20-ontwikkelregels.md`

## Eisen die je raakt

| Nummer | Wat |
|---|---|
| `T-01` | Alles met persoonsgegevens naar IndexedDB. `localStorage` alleen voor regio, standaardtoon, provider, laatst gekozen weergave, back-updatum en de eenmalige vragen |
| `T-11` | Elke entiteit erft van `BaseRecord` met `rev`, `origin` en `schemaVersion` |
| `DR-13` | Niemand buiten `services/storage/` importeert Dexie of raakt `db` aan |
| `DR-23` | Elk record dat de opslag in of uit gaat, gaat door zijn Zod-schema — ook bij lezen |
| `DR-25` | `BaseRecord` op elke entiteit, ook al synchroniseert er nog niets |
| `DR-26` | Verwijderen is `deletedAt` zetten. Nergens een `delete` op een record |
| `NFR-24` | Een mislukte schrijfactie gooit niets weg |

## Bestanden die je mag aanraken

```
src/services/storage/db.ts
src/services/storage/StorageService.ts
src/services/storage/migrations.ts
src/domain/types/base.ts
src/domain/types/{documentation,student,group,membership,series,page}.ts
src/domain/schemas/*.ts
src/lib/{uuid,dates,result}.ts
```

## Wat je bouwt

1. `BaseRecord`: `id`, `createdAt`, `updatedAt`, `deletedAt`, `rev`, `origin`,
   `schemaVersion`. Elk domeintype erft hiervan (DR-25).
2. Zod-schema's voor de zes entiteiten hierboven, met `strict`. Eén plek waar een
   schema staat — niet één in `domain/` en nog een in de service (fout 2 uit §20.6).
3. `db.ts`: de Dexie-declaratie met de indexen uit §8.5 die deze zes nodig hebben.
4. `StorageService`: `get`, `list`, `put`, `softDelete`, `transaction`. Elke methode
   valideert bij lezen én schrijven (DR-23) en geeft een `Result`, geen throw.
5. Het migratiemechanisme uit §8.6, met migratie 1 (leeg) erin, zodat de tweede migratie
   later geen uitvinding is.
6. Een hook `useLiveRecords` in `services/storage/` die `useLiveQuery` inpakt, zodat
   `modules/` nooit Dexie zelf aanraakt (DR-13, U-02).

## Wat je bewust niet bouwt

Foto's en blobs (D05). `MailMessage`, `MailDraft`, `AgendaItem`, `AIInteraction`. Zoeken
(D07). Back-up (sprint 1). `SyncService` — laat de interface leeg zoals §10.2 zegt.

## Klaar als

- [ ] Een `Documentation` wegschrijven, de tab sluiten, opnieuw openen en hem terugzien
- [ ] Een record met een onbekend veld wordt geweigerd bij het lezen, niet genegeerd
- [ ] `softDelete` zet `deletedAt` en `list` laat het record daarna weg
- [ ] Toetsen `T-11` en `DR-23` slagen, zonder browser (DR-12)
- [ ] `pnpm lint` en `pnpm typecheck` zijn schoon

## Val niet in deze kuil

**Een tweede kopie van de gegevens in een Zustand-store.** §11.2 is expliciet: `useLiveQuery`
is de bron van waarheid voor opgeslagen gegevens, Zustand alleen voor schermtoestand. Een
store die records spiegelt loopt uit elkaar en niemand merkt wanneer (fout 2 uit §20.6).

**`updatedAt` zetten in het scherm.** Dat hoort in `StorageService.put`, op één plek.

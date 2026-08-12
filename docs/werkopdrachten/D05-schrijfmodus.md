# D05 — Schrijfmodus: velden, autosave, foto's

**Fase:** doorloop v0.1 · **Duur:** 2 dagdelen · **Blokkeert:** D06, D08

## Doel

Je kunt een documentatie maken met tekst en foto's, en hem morgen terugvinden.

## Lees dit, en niet meer

- `docs/06-1-modules-documentaties.md` — §6.1, alleen de delen over het schrijfscherm,
  autosave en foto's (`FR-DOC-01` t/m `FR-DOC-54`). Sla de AI-delen over, die zijn D06
- `docs/05-ontwerpfilosofie.md` — §5.2 het raster, §5.10 het ontwerp van de documentatiepagina
- `docs/11-ui-architectuur.md` — §11.2 vier soorten toestand, §11.5 componenthiërarchie
- `docs/20-ontwikkelregels.md`

## Eisen die je raakt

| Nummer | Wat |
|---|---|
| `FR-DOC-01` | Ontstaat pas bij de eerste inhoud — leeg openen en weggaan laat niets achter |
| `FR-DOC-02` / `-03` | Datum verplicht en standaard vandaag; titel optioneel |
| `FR-DOC-05` / `-06` | Reeks is een verwijzing; meerdere leerlingen en groepen |
| `FR-DOC-08` | De notitie voor jezelf gaat nooit naar export of AI |
| `FR-DOC-29` / `-30` | Drie kolommen op de laptop, één op de telefoon zonder verlies |
| `FR-DOC-31` t/m `-36` | Autosave na één seconde stilte, bij het verlaten van het scherm, met tekstuele indicator |
| `FR-DOC-37` / `-38` | Geen opmaakbalk; dictaat werkt onaangetast |
| `FR-DOC-40` | Grens aan de tekstlengte (waarschuwing bij 20.000, grens bij 50.000) |
| `FR-DOC-41` | Vier manieren om een foto toe te voegen |
| `FR-DOC-45` | Maximaal twintig foto's |
| `FR-DOC-46` | Herordenen met pijlknoppen |
| `FR-DOC-52` | Locatiegegevens worden verwijderd |
| `NFR-18` | Maximaal één seconde werk verlies |

## Bestanden die je mag aanraken

```
src/modules/documentaties/DocumentationEditor.tsx
src/modules/documentaties/hooks/useDocumentationEditor.ts
src/services/documentation/DocumentationService.ts
src/services/photo/PhotoService.ts
src/app/(app)/documentaties/[id]/page.tsx
src/ui/{TextArea,Field,PhotoGrid,Chip,SaveIndicator}.tsx
```

## Wat je bouwt

1. Het schrijfscherm op het raster uit §5.2: rail 240px, leeskolom `--measure-read`
   (kolom 1–7), fotostrook op kolom 8–12. Onder 768px één kolom, zonder dat er iets
   verdwijnt (`FR-DOC-30`).
2. Velden: titel (120 tekens, optioneel), datum met snelknoppen Vandaag en Gisteren,
   koppelingen aan reeks, leerlingen en groepen, tekstvlak **zonder opmaakbalk**, en de
   notitie voor jezelf (2.000 tekens) die zichtbaar apart staat.
3. Autosave met rem: schrijven na 1.000 ms stilte, plus altijd bij `visibilitychange` en
   `pagehide` (`FR-DOC-33`, `NFR-19`). De indicator toont **tekst**, geen icoontje
   (`FR-DOC-34`).
4. `PhotoService`: toevoegen via bestandskiezer, slepen, plakken en camera. Verkleinen
   naar 3300 px op de lange zijde (`T-02`), **EXIF volledig verwijderen inclusief GPS**
   (`FR-DOC-52`), `DateTimeOriginal` alleen bewaren als datumsuggestie. Eén variant in de
   doorloop; de drie varianten komen in sprint 1.
5. Herordenen met pijlknoppen. Slepen komt later — pijlknoppen zijn de toegankelijke
   route en die is niet optioneel (B-38, NFR-35).

## Wat je bewust niet bouwt

De AI-knop en het controlescherm (D06). Citaten (`FR-DOC-55` t/m `-60`, sprint 2).
Pagina's en layouts (`FR-DOC-61` t/m `-70`, sprint 2). Bijsnijden en draaien
(`FR-DOC-50`). Drie fotovarianten. Slepen om te herordenen (`FR-DOC-47`).
Datum overnemen uit de foto's (`FR-DOC-39`).

## Klaar als

- [ ] Een schrijfscherm openen en weggaan zonder te typen laat geen lege regel achter
- [ ] Typen, tab sluiten, terugkomen: de tekst staat er en de cursor staat op dezelfde plek
- [ ] Zes foto's toevoegen blokkeert het typen niet
- [ ] Een foto met GPS erin komt er zonder GPS uit — controleer met `exiftool`
- [ ] Op 390px breed is alles bereikbaar en is niets weggelaten
- [ ] Dicteren met de microfoonknop van het toetsenbord werkt in het tekstvlak

## Val niet in deze kuil

**Een slim invoerveld.** Automatisch aanvullen, tags, een editor met opmaak — alle drie
slopen dictaat (`FR-DOC-38`), en dictaat is de manier waarop Fatima werkt. Het tekstvlak
moet saai zijn. Dat is een ontwerpbesluit, geen gemakzucht.

**Bij elke toetsaanslag naar IndexedDB schrijven.** Dat haalt `NFR-05` niet (invoervertraging
≤50 ms bij 20.000 tekens) en het slijt de opslag.

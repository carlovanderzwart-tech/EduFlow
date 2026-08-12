# Handboek EduFlow — wegwijzer

De Product Bible v1.0 (7 augustus 2026) is hier gesplitst in hoofdstukken, zodat een
werkopdracht kan verwijzen naar 300 regels in plaats van 9.115. De inhoud is
ongewijzigd; `product-bible-volledig.md` is de archiefkopie voor mensen, niet voor
AI-programmeurs.

## Leesvolgorde

| Wie je bent | Begin bij |
|---|---|
| Nieuw in dit project | `01`, `02`, daarna `06-*` |
| Je gaat code schrijven | `20`, daarna `08`, `09`, `10` |
| Je bouwt aan de AI-kant | `03`, daarna `12` |
| Je ontwerpt schermen | `04`, `05`, daarna `07`, `11` |
| Je beoordeelt de privacy | `15`, daarna `16` en `12` §12.13 |
| Je wilt weten waarom iets zo is | `19` |

## De bestanden

| Bestand | Regels | Waarover |
|---|---:|---|
| `00-leeswijzer.md` | 485 | Nummering, verwijzingen, inhoudsopgave |
| `01-missie-en-visie.md` | 287 | Probleem, missie, doelgroep, nulmeting, faalscenario's |
| `02-productfilosofie.md` | 255 | De tien uitgangspunten `U-`, scope-discipline, kostentoets |
| `03-ai-filosofie.md` | 660 | De vijf AI-wetten, wat AI wel en niet herschrijft, leren zonder trainen |
| `04-ux-principes.md` | 430 | De tien UX-principes, lege toestanden, fouten, toegankelijkheid |
| `05-ontwerpfilosofie.md` | 572 | Raster, ruimte, typografie, kleur, **ontwerptekens**, componenten |
| `06-0-modules-inleiding.md` | 6 | Hoe hoofdstuk 6 gelezen wordt |
| `06-1-modules-documentaties.md` | 1080 | `FR-DOC-01` t/m `FR-DOC-124` |
| `06-2-modules-agenda.md` | 199 | `FR-AGE-01` t/m `FR-AGE-26` |
| `06-3-modules-mail.md` | 194 | `FR-MAI-01` t/m `FR-MAI-26` |
| `06-4-modules-dashboard.md` | 56 | `FR-DAS-01` t/m `FR-DAS-08` |
| `06-5-modules-instellingen.md` | 176 | `FR-INS-01` t/m `FR-INS-45` |
| `07-gebruikersflows.md` | 964 | `F-01` t/m `F-24` met foutpaden |
| `08-datamodel.md` | 862 | Schema, opslaglagen, indexen, migraties, back-upbestand |
| `09-domeinmodel.md` | 771 | Begrippen, aggregaten, invarianten `INV-`, gebeurtenissen `DE-` |
| `10-service-architectuur.md` | 268 | **§10.2 mappenstructuur en importregels** |
| `11-ui-architectuur.md` | 157 | Renderstrategie, vier soorten toestand, schermenregister `S-` |
| `12-ai-architectuur.md` | 414 | De keten, opdracht, **§12.5 pseudonimisatie**, providers, gouden testset |
| `13-integraties.md` | 105 | Wat er koppelt, wat er is afgewezen en waarom |
| `14-rollen-en-rechten.md` | 124 | Project- en applicatierollen, toegangscode |
| `15-privacy-en-avg.md` | 181 | Verantwoordelijkheid, AI-verordening, DPIA en FRIA |
| `16-logging-en-security.md` | 151 | Verantwoordingslogboek, dreigingsmodel, maatregelen |
| `17-niet-functionele-eisen.md` | 147 | `NFR-01` t/m `NFR-61`, referentieapparaten |
| `18-roadmap.md` | 102 | Fasen, sprints, Definition of Done |
| `19-besluitenregister.md` | 230 | `B-` en `T-`besluiten met datum en reden |
| `20-ontwikkelregels.md` | 174 | `DR-01` t/m `DR-57`. Altijd lezen |
| `A-testgegevens.md` | 66 | Groep 4 — De Regenboog, de reeksen, de groepen |
| `BESLUITEN.md` | — | Nieuwe besluiten sinds 7 augustus. Voegt toe aan hoofdstuk 19 |
| `werkopdrachten/` | — | Eén A4 per bouwstap. Dit is wat Claude Code leest |

## Regels voor dit handboek

1. **Eén waarheid.** Wijzigt een besluit de inhoud, dan wijzig je het hoofdstuk én zet
   je de reden in `BESLUITEN.md`. Nooit alleen het een of het ander.
2. **`product-bible-volledig.md` wordt niet bijgewerkt** tijdens de bouw. Hij wordt aan
   het eind van elke fase opnieuw samengesteld uit de hoofdstukken. Wie hem tussentijds
   bewerkt, maakt twee waarheden — precies de tweede van de vijf fouten uit §20.6.
3. **Geen nieuwe hoofddocumenten.** Wat erbij komt is een werkopdracht van één A4 of een
   regel in `BESLUITEN.md`.

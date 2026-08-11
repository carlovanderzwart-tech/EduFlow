<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

## Bijlage A — Testgegevens

Alle voorbeelden, toetsen en demonstraties in dit handboek gebruiken deze verzonnen
gegevens. Er komt nooit de naam van een echt kind in een voorbeeld, een test, een
schermafbeelding of een commit-boodschap (DR-33, §15.6).

### A.1 De groep

**Groep 4 — De Regenboog**, schooljaar 2026-2027, stamgroep, twintig leerlingen:

| | | | |
|---|---|---|---|
| Aya | Bram | Cato | Dani |
| Elin | Fenna | Guus | Hanae |
| Imre | Jasper | Kjeld | Lieve |
| Mees | Noa B. | Noa V. | Otis |
| Pippa | Quinten | Roos | Sam |

Deze twintig namen zijn niet willekeurig gekozen. Elke naam dekt een geval dat
`PrivacyService` moet aankunnen (§12.5):

| Naam | Waarom hij in de lijst staat |
|---|---|
| **Noa B.** en **Noa V.** | dubbele voornaam; elk een eigen code, en het geval waarin de app niet kan zien welke bedoeld is (B-76) |
| **Roos** | is ook een gewoon Nederlands woord; "de rozen in de schooltuin" mag niet worden vervangen |
| **Sam** | zit als deelwoord in "samenwerken" en "samen"; de woordgrenzen moeten kloppen |
| **Kjeld** | Nederlandse verbuigingen: "Kjelds idee", "Kjeldje", "KJELD" |
| **Hanae** | wordt soms als "Hanaë" geschreven; diakrieten moeten matchen |
| **Cato**, **Imre**, **Otis** | korte namen die als lettergreep in andere woorden voorkomen |
| **Bram**, **Guus**, **Mees** | gewone namen zonder bijzonderheden, als vergelijkingsmateriaal |

### A.2 De reeksen

| Reeks | Delen | Waarvoor in de toetsen |
|---|---|---|
| **Kunstwerk Dok** | 4 | de vervolgzin op basis van eerdere delen (B-04, §6.1.9); meer dan drie delen, dus de afkapregel uit B-68 |
| **ONDERZOEK Natuur** | 3 | reeksweergave, volgorde, een reeks verwijderen |
| **Start van het jaar** | 2 | het kleinste geval waarin de vervolgzin bestaat |

### A.3 Groepen naast de stamgroep

Om meerdere groepen per leerling te toetsen (U-07, B-16, B-63):

| Groep | Type | Leden | Periode |
|---|---|---|---|
| Groep 4 — De Regenboog | stamgroep | alle twintig | 24 augustus 2026 - 17 juli 2027 |
| Techniekclub | projectgroep | Kjeld, Mees, Noa V., Quinten, Aya | 3 november 2026 - 12 februari 2027 |
| Leesgroepje dinsdag | zorggroep | Dani, Otis, Pippa | 8 september 2026 - open |

Noa V. begint pas op 3 november en zit dan meteen in twee groepen. Dat is het geval
uit flow F-22.

### A.4 Wat er nog aangeleverd moet worden

De stijlvoorbeelden (O-01 in §19.5) zijn geen technisch testmateriaal maar de norm
waaraan de AI wordt gemeten. Ze bestaan uit drie of vier paren, elk met een ruwe
notitie zoals de maker die maakt, de documentatie zoals die zou moeten worden, en een
te ver doorgeschoten versie met de reden waarom die fout is (§12.9, FR-INS-16).
Zonder deze voorbeelden is niet vast te stellen of de AI het goed doet, en dan is de
Definition of Done op dit punt niet in te vullen.

---

*EduFlow Product Bible, versie 1.0. Vastgesteld op 7 augustus 2026.
Wijzigingen op dit document lopen via het besluitenregister in hoofdstuk 19.*

<!-- Onderdeel van de EduFlow Product Bible v1.0 (7 augustus 2026).
     Bindend. Volledig document: docs/product-bible-volledig.md
     Wijzigingen lopen via docs/19-besluitenregister.md -->

## 14. Rollen en rechten

Dit hoofdstuk gaat over twee soorten rollen die makkelijk door elkaar lopen: de rollen in het **project** (wie beslist wat er gebouwd wordt) en de rollen in de **applicatie** (wie mag wat zien en doen). De review wees erop dat het eerste in de oorspronkelijke documenten scheef stond (B11r): er waren drie projectrollen met code review en een producttest, terwijl er één persoon is.

### 14.1 Projectrollen

**Er is één persoon met drie petten** (B-44). Dat is geen probleem zolang het expliciet is; het wordt een probleem zodra de kwaliteitspoorten doen alsof er drie mensen zijn.

| Pet | Beslist over | Vraagt zich af |
|---|---|---|
| **Producteigenaar** | wat er gebouwd wordt en in welke volgorde; scope; wanneer iets af is voor de gebruiker | "Zou ik dit zelf gebruiken op een donderdagmiddag?" |
| **Architect** | hoe het gebouwd wordt; datamodel; welke afhankelijkheden erin komen; wat er niet in mag | "Kan ik dit over twee jaar nog uitleggen en vervangen?" |
| **Ontwikkelaar** | de uitvoering; wanneer iets technisch af is | "Is dit getoetst, en werkt het ook als er iets misgaat?" |

De overlap die de review aanwees — prioriteiten bij de producteigenaar, roadmap bij de architect — wordt opgelost door één regel: **de roadmap is een productbesluit.** De architect bepaalt wat er technisch eerst moet (bijvoorbeeld: `StorageService` vóór alles), maar de volgorde van functionaliteit is aan de producteigenaar.

**De zelfcontrolepoorten** (B-44). Omdat er niemand is die meeleest, worden de poorten expliciet en gedateerd. Ze staan in een checklijst per opgeleverde functionaliteit:

| Poort | Wat er gebeurt | Bewijs |
|---|---|---|
| Ontwerp | De functionaliteit staat in dit document met een eisnummer | verwijzing naar `FR-…` |
| Bouw | Alle geautomatiseerde toetsen slagen, inclusief de gouden testset | uitvoer van de bouwstraat |
| Zelfreview | Minimaal 24 uur na het schrijven, met verse blik; drie vragen: klopt het met de eis, is er dubbele logica ontstaan, wat gebeurt er bij een fout | aantekening met datum |
| Producttest | De functionaliteit is één werkdag echt gebruikt met de verzonnen groep | aantekening met datum en bevinding |
| Privacy | Als er een nieuwe gegevensstroom is: opgenomen in het overzicht van hoofdstuk 15 | verwijzing |

De regel achter de derde poort is de belangrijkste: **niet dezelfde dag reviewen als bouwen.** Dat is de goedkoopste manier om een tweede paar ogen te benaderen als je er maar één hebt.

### 14.2 Applicatierollen in versie 1.0

Versie 1.0 heeft **één gebruiker per apparaat en geen accounts** (B-21). Er is dus feitelijk één rol. Dat is geen reden om het rechtenmodel over te slaan, wel om het niet te bouwen: het model staat hier beschreven, en `SettingsService` kent één rol met alle rechten. De rest komt in fase 2 (§18.4).

| Rol | Bestaat in | Kort |
|---|---|---|
| `professional` | 1.0 | de leerkracht of pedagogisch medewerker; ziet en doet alles op haar eigen apparaat |
| `meelezer` | fase 2 | een duo-collega die documentaties van dezelfde groep mag lezen en becommentariëren |
| `ib` | fase 2 | intern begeleider; leest over groepen heen, maakt zelf niets |
| `beheerder` | fase 2 | ICT of directie; beheert toegangscodes, providerkeuze en apparaten; ziet geen inhoud |
| `functionaris` | fase 2 | functionaris gegevensbescherming; ziet uitsluitend het logboek en de gegevensstromen, nooit inhoud |

Twee ontwerpbesluiten die de moeite waard zijn om nu al vast te leggen, omdat ze later niet meer om te draaien zijn:

**De beheerder ziet geen inhoud.** Een beheerder die documentaties kan lezen, is een beheerder die de vertrouwelijkheid van het instrument breekt. Wat hij nodig heeft — wie heeft toegang, welke provider staat er, is er iets misgegaan — staat allemaal in het logboek en in de instellingen, niet in de inhoud.

**De functionaris ziet nooit inhoud, ook niet op verzoek.** Zijn werk is toetsen of de stromen kloppen, niet meelezen. Het logboek uit hoofdstuk 16 is daarvoor ingericht: het bevat handelingen, tellingen en bestemmingen, en geen enkele zin uit een documentatie.

### 14.3 Rechtenmatrix

De matrix voor fase 2, zoals hij ontworpen wordt. In versie 1.0 heeft `professional` alle rechten uit de eerste kolom en bestaan de andere kolommen niet.

| Handeling | professional | meelezer | ib | beheerder | functionaris |
|---|---|---|---|---|---|
| Documentatie lezen (eigen) | ja | — | — | nee | nee |
| Documentatie lezen (gedeeld met haar) | ja | ja | ja | nee | nee |
| Documentatie maken en wijzigen | ja | nee | nee | nee | nee |
| Documentatie exporteren | ja | nee | nee | nee | nee |
| Opmerking plaatsen bij een documentatie | ja | ja | ja | nee | nee |
| Leerlingen en groepen beheren | ja | nee | nee | nee | nee |
| Leerling over groepen heen bekijken | ja | nee | ja | nee | nee |
| Agenda beheren | ja | nee | nee | nee | nee |
| Postbus koppelen en lezen | ja | nee | nee | nee | nee |
| Mailconcept maken | ja | nee | nee | nee | nee |
| Stijlprofiel bekijken en wijzigen | ja | nee | nee | nee | nee |
| AI-provider kiezen | ja | nee | nee | ja | nee |
| Toegangscodes en apparaten beheren | ja | nee | nee | ja | nee |
| Back-up maken en terugzetten | ja | nee | nee | nee | nee |
| Logboek inzien | ja | nee | nee | ja | ja |
| Gegevensstromen inzien | ja | ja | ja | ja | ja |
| Alles wissen | ja | nee | nee | nee | nee |

De regel die uit deze matrix volgt en die in code komt te staan: **niemand behalve de professional zelf schrijft ooit aan haar documentaties.** Delen is lezen plus opmerkingen, nooit meeschrijven. Dat sluit de hele klasse van samenwerkingsproblemen uit die in §7.27 als "bewust niet" staat.

### 14.4 Delen in fase 2

Delen wordt per documentatie, expliciet, en met een einddatum:

```typescript
interface Share {
  documentationId: Uuid;
  withUserId: Uuid;
  permission: "read" | "read-comment";
  grantedAt: IsoDateTime;
  expiresAt: IsoDateTime;      // standaard einde schooljaar
  revokedAt: IsoDateTime | null;
}
```

Drie regels die nu al vastliggen omdat ze het ontwerp raken:

1. **Delen heeft altijd een einddatum**, standaard de laatste schooldag van het lopende schooljaar. Een toegang zonder einde is een toegang die niemand ooit intrekt.
2. **Delen is per documentatie, niet per groep.** "Iedereen die bij groep 4 hoort mag alles zien" is een regel die een jaar later niet meer klopt en die niemand herziet.
3. **Intrekken werkt met terugwerkende kracht op toegang, niet op wat al gelezen is.** De app zegt dat eerlijk: "Toegang ingetrokken. Wat al gelezen of gedownload is, kan niet worden teruggehaald."

### 14.5 De toegangscode

In versie 1.0 is de toegangscode het enige slot (T-05). Wat hij is en wat hij niet is:

**Wat hij is.** Een gedeeld geheim dat voorkomt dat een willekeurige bezoeker van het webadres de AI-route kan gebruiken op rekening van de maker, en dat een terloopse bezoeker geen documentaties ziet als een laptop openstaat.

**Wat hij niet is.** Geen authenticatie van een persoon, geen bescherming tegen iemand die fysiek toegang tot het apparaat heeft, en geen scheiding tussen gebruikers. Dat moet in de communicatie eerlijk staan, want een toegangscode die als "beveiligd" wordt gepresenteerd, wekt een verwachting die hij niet waarmaakt.

| Eigenschap | Waarde |
|---|---|
| Lengte | 12 tekens, willekeurig uit een alfabet zonder verwarrende tekens |
| Opslag op de server | alleen als hash (Argon2id) |
| Opslag op het apparaat | een ondertekende cookie, `httpOnly`, `Secure`, `SameSite=Lax`, 365 dagen |
| Wijzigen | door de beheerder; alle apparaten moeten daarna opnieuw invoeren |
| Intrekken per apparaat | ja, via de apparatenlijst (FR-INS-38) |
| Pogingen | 5 per uur per IP-adres, daarna een uur wachten |

De echte bescherming van de gegevens in versie 1.0 is niet de toegangscode maar het feit dat de gegevens het apparaat niet verlaten. Dat hoort zo in het gesprek met de functionaris te staan (hoofdstuk 15).

### 14.6 Rollen en de AI-verordening

Twee begrippen uit de AI-verordening zijn hier van belang omdat ze rollen toewijzen die niets met inloggen te maken hebben.

**Aanbieder en gebruiksverantwoordelijke.** EduFlow als product heeft een aanbieder: de maker, en op termijn de organisatie die het uitgeeft. De school die het gebruikt is gebruiksverantwoordelijke. Het SIVON-kader wijst erop dat een school die een AI-toepassing wezenlijk aanpast, zélf aanbieder wordt — met alle verplichtingen van dien.

Daarom een ontwerpbesluit dat in dit hoofdstuk thuishoort: **de school past EduFlow niet aan op systeemniveau.** Wat een school kan instellen — provider, toon, stijlprofiel, sjablonen — zijn invoerparameters binnen een vastgesteld systeem, geen wijziging van het systeem zelf. Er is geen mogelijkheid om systeeminstructies te bewerken, geen mogelijkheid om een eigen model aan te sluiten, en geen mogelijkheid om de veiligheidsgrenzen uit §12.13 te verzetten. Dat is een beperking van de vrijheid van de school, en hij is er om te voorkomen dat de school ongemerkt aanbieder wordt.

**AI-geletterdheid.** De verordening verplicht organisaties ervoor te zorgen dat wie met AI werkt daar voldoende van begrijpt. Voor EduFlow betekent dat een concrete verplichting aan het product zelf: de eerste-keer-ervaring legt in vier schermen uit wat AI hier doet, wat er weggaat, wat er blijft, en waar je het terugziet (§7.1, B-49). Dat is geen marketing maar het invullen van een verplichting die anders bij de school alleen komt te liggen.

---

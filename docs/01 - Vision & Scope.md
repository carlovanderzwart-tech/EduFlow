# Vision & Scope

## Projectnaam

EduFlow

---

# Visie

EduFlow is een werkplatform dat een leerkracht in het basisonderwijs helpt bij het administratieve deel van het werk: documentatie schrijven, mails opstellen en het schooljaar overzien.

Het doel is tijd besparen op wat herhaalt, zodat er meer tijd overblijft voor de kinderen.

EduFlow vervangt geen bestaande systemen. Het staat ernaast.

---

# Missie

Een eigen digitale werkplek waarin AI meeschrijft in plaats van in een apart venster te wachten.

Geen losse chatbot waar je je vraag naartoe kopieert, maar hulp op de plek waar het werk gebeurt.

---

# Probleem

Het werk verspreidt zich over veel systemen: Outlook, Teams, OneDrive, Momento, Word, en daarnaast losse AI-tools.

Daardoor bestaat een groot deel van de dag uit:

- dezelfde soort teksten opnieuw schrijven;
- gegevens van het ene naar het andere systeem overzetten;
- steeds opnieuw dezelfde instructies aan AI geven;
- documentatie opmaken die er elke keer anders uitziet.

Dat kost meer tijd dan nodig.

---

# Oplossing

EduFlow brengt de terugkerende taken samen in één omgeving, met AI die de context al kent: de schrijfstijl, de groep, de lopende projecten.

**EduFlow koppelt niet met andere systemen.** Het produceert tekst die je zelf verplaatst. Dat is een bewuste keuze, geen tekortkoming — zie *Randvoorwaarden*.

---

# Randvoorwaarden

Twee dingen bepalen wat er wel en niet gebouwd kan worden.

## Geen toegang tot Microsoft 365

Een koppeling met Outlook of de agenda vereist een app-registratie in de Entra ID van de school. Die toestemming is aangevraagd en niet verleend, en dat verandert voorlopig niet.

Gevolg: EduFlow leest geen mail, verstuurt geen mail en synchroniseert geen agenda. De mailmodule stelt concepten op die je zelf kopieert. De agenda is zelfstandig.

Dit is geen tijdelijke workaround waar later omheen gebouwd wordt. Het is het uitgangspunt.

## Verwerking van gegevens van kinderen

Documentatie gaat over minderjarigen. Namen staan in de lopende tekst, foto's horen bij het werk.

Daarom geldt:

- Foto's gaan nooit naar een AI-dienst. Dit is absoluut: de AI-laag accepteert geen binaire data.
- Voornamen uit de eigen namenlijst worden vervangen door codes voordat tekst wordt verstuurd.
- De gebruiker kan altijd zien wat er wordt verstuurd — volledig, dus inclusief het stijlvoorbeeld, de instructie aan de AI en eerdere documentaties uit dezelfde reeks.
- Documentaties en foto's worden alleen op het eigen apparaat opgeslagen. Er is geen server-opslag en geen account.

## Wat dit níét is

Twee dingen moeten eerlijk staan, want anders klopt het gesprek met de functionaris gegevensbescherming niet.

**De namenlijst is een vangnet, geen garantie.** Een lijst is nooit compleet: een naam die er niet in staat gaat gewoon mee. Daarom staat de controlelink er altijd naast, en daarom is die de laatste zekerheid en niet de eerste.

**Tekst die naar een AI-provider gaat, gaat het apparaat af.** Hoe lang die daar blijft hangt af van de provider en van de gemaakte afspraken. Vervangen van namen maakt tekst gepseudonimiseerd, niet anoniem — en gepseudonimiseerde gegevens blijven persoonsgegevens.

Daaruit volgt:

- er wordt een provider gekozen die niet traint op ingevoerde data en die binnen de EU verwerkt;
- de verwerkingsverantwoordelijke is het schoolbestuur, niet de individuele leerkracht. Een verwerkersovereenkomst loopt dus via het bestuur;
- tot dat geregeld is, gaat er geen enkel gegeven van een echt kind naar een AI-provider. Er wordt gebouwd en getest met een verzonnen groep.

**Voordat EduFlow met echte gegevens wordt gebruikt, wordt de opzet voorgelegd aan de functionaris gegevensbescherming van het schoolbestuur.** Dat is een harde voorwaarde en hij staat als zodanig in doc 00.

---

# Doelgroep

## Fase 1

Eén gebruiker: de leerkracht die dit bouwt. Geen accounts, geen rollen, geen delen.

## Fase 2

Collega's binnen dezelfde school. Dit vraagt om accounts en gedeelde opslag, en dus om een gesprek met ICT en de privacyfunctionaris.

## Fase 3

Breder onderwijs en kinderopvang.

De architectuur moet uitbreiding toestaan, maar er wordt niets voor fase 2 of 3 gebouwd zolang fase 1 niet af is.

## Fase en versie zijn niet hetzelfde

Een **fase** gaat over wie het gebruikt. Een **versie** gaat over wat de software kan.

Ze lopen niet gelijk op: versie 1 en 2 zijn allebei voor fase 1 — één gebruiker, één apparaat. Fase 2 begint pas bij versie 3, want collega's betekent accounts, gedeelde opslag en synchronisatie, en dat is een ander product dan wat hier beschreven staat.

---

# Kernwaarden

## AI schrijft mee, niet over

AI stelt voor. De gebruiker beslist. Eigen tekst wordt nooit vervangen zonder handeling.

## Zo min mogelijk klikken

Iedere workflow moet uit zo weinig mogelijk handelingen bestaan.

## Werkt op telefoon en laptop

Beide zijn even belangrijk. Ieder scherm wordt eerst voor een smal scherm ontworpen.

Wel met één beperking die uit de opslagkeuze volgt: **gegevens staan op het apparaat waar je ze invoert, en apparaten synchroniseren niet.** Een documentatie begin je en maak je af op hetzelfde apparaat. Overzetten kan met een exportbestand. Zie doc 05, besluit B-01.

## Modulair

Nieuwe onderdelen toevoegen zonder bestaande te wijzigen.

## Privacy by design

Zo min mogelijk gegevens verwerken, en zichtbaar maken wat er wél wordt verwerkt.

---

# Scope versie 1

- Dashboard
- Documentatie
- Mail
- Agenda
- Instellingen

---

# Scope versie 2

- Kennisbank: eigen documenten als context voor AI
- Meer mailsjablonen
- Meer opmaaktemplates voor documentatie
- Losse AI-chat
- Donkere modus
- Titel laten voorstellen door AI
- Mail inkorten, uitbreiden, samenvatten en achteraf van toon wisselen
- Centrale logging in plaats van alleen de browserconsole

---

# Scope versie 3

- Ondersteuning voor meerdere gebruikers
- Delen met collega's
- Synchronisatie tussen apparaten, met server-opslag

Momento staat niet op de planning. Er is geen koppeling zonder browserautomatisering, en die is uitgesloten. Komt daar een echte koppelmogelijkheid, dan wordt het opnieuw bekeken.

---

# Buiten scope

EduFlow is geen:

- leerlingvolgsysteem;
- administratiesysteem;
- vervanging van Momento;
- vervanging van Microsoft 365;
- mailprogramma.

En EduFlow doet niet:

- mail lezen of versturen;
- agenda's synchroniseren;
- browserautomatisering van systemen van derden.

---

# Succescriteria

EduFlow is geslaagd wanneer:

- een documentatie sneller klaar is dan nu;
- de documentaties er consistenter uitzien zonder dat de opmaak elke keer opnieuw bedacht moet worden;
- een mail opstellen minder tijd kost dan hem zelf schrijven;
- het schooljaar in één overzicht past;
- er niets misgaat met gegevens van kinderen.


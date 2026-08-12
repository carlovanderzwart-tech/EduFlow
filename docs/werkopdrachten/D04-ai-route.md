# D04 — /api/ai, AIService en PromptService

**Fase:** doorloop v0.1 · **Duur:** 1 dagdeel · **Blokkeert:** D06

## Doel

Een testtekst gaat gepseudonimiseerd heen en komt hersteld terug, via één EU-provider.

## Lees dit, en niet meer

- `docs/12-ai-architectuur.md` — §12.1 de keten, §12.2 taken, §12.3 de opdracht,
  §12.6 de serverroute, §12.7 providers, §12.11 fouten, §12.13 wat er nooit heen gaat
- `docs/16-logging-en-security.md` — §16.4 wat er nooit in een logboek komt
- `docs/20-ontwikkelregels.md`

## Eisen die je raakt

| Nummer | Wat |
|---|---|
| `T-05` | Eigen webadres met snelheidslimiet en een toegangscode per apparaat |
| `T-06` | Standaardprovider met verwerking binnen de EU (`openai-eu`) |
| `DR-16` | Alleen `AIService` roept `/api/ai` aan |
| `DR-24` | Elk verzoek dat de server binnenkomt gaat door een Zod-schema met `strict`; onbekende velden worden geweigerd |
| `DR-31` | Er vertrekt geen aanroep die niet door `PrivacyService.pseudonymise()` ging |
| `DR-32` | Er gaat nooit een beeldgegeven naar `/api/ai` — niet als bestand, base64, naam of hash |
| `DR-36` | Geheimen komen uitsluitend uit de omgeving. Een sleutel in de broncode faalt de bouwstraat |
| `DR-44` | Geef nooit een heel record aan een logfunctie |

## Bestanden die je mag aanraken

```
src/app/api/ai/route.ts
src/app/api/health/route.ts
src/services/ai/AIService.ts
src/services/ai/PromptService.ts
src/services/ai/adapters/openai-eu.ts
src/services/ai/AIService.test.ts
src/domain/schemas/aiRequest.ts
.env.example
```

## Wat je bouwt

1. **De keten in de vaste volgorde** uit §12.1, en geen andere:
   `AIService` → `PrivacyService.gate()` → `pseudonymise()` → `PromptService` →
   *(hier komt in D06 het controlescherm)* → `/api/ai` → provider → stroom terug →
   `restore()`.
2. `PromptService` bouwt de opdracht uit vijf blokken (§12.3), zodat D06 die blokken
   één op één kan tonen. **De opdracht wordt op één plek samengesteld** — niet half in de
   service en half in de route.
3. `/api/ai`: Zod met `strict` (DR-24), toegangscode uit een cookie, snelheidslimiet,
   en een controle die het verzoek weigert als er een veld in zit dat op beeld lijkt
   (DR-32). Streaming door naar de client.
4. Adapter `openai-eu` als standaard. De adapter kiest het model; de app vraagt een taak
   plus niveau `snel` of `zorgvuldig` (§12.7).
5. `AIInteraction` wordt vastgelegd met **tellingen, geen inhoud** (§12.1, DR-44).
6. Nette time-outs en één keer opnieuw proberen bij een netwerkfout (§12.11), met
   Nederlandse foutteksten die zeggen wat de volgende stap is (DR-43).

## Wat je bewust niet bouwt

De andere twee adapters (`vertex-eu`, `bedrock-eu`). Het controlescherm (D06).
`StyleService` en de voorbeeldselectie (sprint 3). Kostenweergave (`FR-INS-24`).
Het verantwoordingslogboek (sprint 6).

## Klaar als

- [ ] Een testtekst met "Kjeld" erin gaat als code de deur uit en komt als "Kjeld" terug
- [ ] Een aanroep zonder toegangscode wordt geweigerd
- [ ] Een verzoek met een onbekend veld wordt geweigerd, niet genegeerd (DR-24)
- [ ] Een verzoek met een base64-blok wordt geweigerd (DR-32)
- [ ] Er staat geen sleutel in de broncode; `.env.example` beschrijft wat er nodig is
- [ ] `AIInteraction` bevat geen tekstinhoud
- [ ] Een toets bewijst dat `AIService` de enige aanroeper van `/api/ai` is (DR-16)

## Val niet in deze kuil

**De poort omzeilen "even voor het testen".** DR-31 kent geen uitzondering, ook niet voor
verzonnen namen. Wie hier één keer omheen bouwt, laat een pad achter dat later niemand
meer terugvindt.

**De opdracht op twee plekken samenstellen.** Dan toont het controlescherm in D06 iets
anders dan wat er verstuurd wordt, en is de belofte uit §4 van het handboek gebroken —
op precies de plek waar Karin gaat kijken.

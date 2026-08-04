# Services

Logica die door meer dan één module wordt gebruikt, staat hier. Zie
`docs/03 - Technical Architecture.md`, hoofdstuk *Services*.

Componenten bevatten geen businesslogica — die zit in services. Modules mogen
elkaar niet direct aanroepen; alle communicatie loopt via een gedeelde service.

Verwachte services (nog te bouwen, geen van allen hoort in Sprint 1):

| Service | Verantwoordelijkheid |
|---|---|
| `AIService` | Enige toegang tot AI. Roept altijd eerst `PrivacyService` aan. |
| `PrivacyService` | Namen vervangen door codes en terugzetten. Levert de inhoud van het controlescherm. |
| `StorageService` | De enige laag die IndexedDB en localStorage aanraakt. |
| `DocumentService` | Documentaties en foto's opslaan, ophalen, verwijderen, zoeken. |
| `RenderService` | Een documentatie omzetten naar pagina's volgens het gekozen template. |
| `ExportService` | Print-PDF en deelbare afbeelding genereren, delen en kopiëren. |
| `BackupService` | Alle gegevens exporteren naar één bestand en terugzetten. |
| `MailService` | Sjablonen, concepten en zoeken in concepten. |
| `AgendaService` | Vakantiedata, eigen afspraken, aangepaste vakantiedatums. |
| `SettingsService` | Instellingen, namenlijst, reeksen. |

Deze map is in Sprint 1 (fundering) bewust leeg: er is nog geen opslag, geen AI
en geen database. Zie `docs/05 - Besluiten.md`.

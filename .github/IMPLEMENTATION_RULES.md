# EduFlow – Implementation Rules

> **GROTENDEELS ACHTERHAALD — zie `docs/EduFlow - Product Bible v1.0.md`**
>
> Dit bestand is geschreven onder de architectuur van vóór 8 augustus 2026. De Product
> Bible v1.0 is sindsdien de enige normatieve bron; hoofdstuk 20 daarvan bevat de
> geldende ontwikkelregels (DR-01 t/m DR-57).
>
> Twee delen hieronder spreken de Bible tegen en gelden **niet** meer:
> de paragraaf *Architecture Freeze*, die nieuwe services, entiteiten en abstracties
> verbiedt — versie 1.0 vraagt er vijftien respectievelijk zeventien — en de
> verwijzing naar `ARCHITECTURE_FREEZE.md`, dat nu in `docs/archief/` staat.
>
> Wat hieronder wél blijft gelden, staat ook in hoofdstuk 20 en is daar leidend:
> één issue per pull request, poorten groen vóór oplevering, geen drive-by refactors.
>
> Of dit bestand blijft bestaan of naar `docs/archief/` verhuist, is een openstaand
> punt uit de architectuurreview van 8 augustus 2026.

## Status

The architecture has been finalized and approved.

The project is now in the implementation phase.

The objective is to implement the approved architecture, not redesign it.

---

## Documentation is Leading

The documentation is the single source of truth.

When code and documentation differ:

1. explain the inconsistency;
2. do not invent a new architecture;
3. wait for approval before changing the documentation.

---

## Architecture Freeze

See also: docs/archief/ARCHITECTURE_FREEZE.md (historisch, niet meer leidend)

Do not introduce:

- new services
- new repositories
- new architectural patterns
- new abstractions
- speculative optimizations
- future-proofing
- new entities

unless:

- implementation is impossible with the current architecture;
- the documentation contains a demonstrable error;
- the Product Owner explicitly requests an architectural change.

---

## Scope

Work only on the GitHub Issue that is currently assigned.

Do not solve unrelated problems.

Do not perform drive-by refactors.

Keep Pull Requests focused.

---

## Pull Requests

Every Pull Request must:

- implement exactly one Issue;
- remain within the documented architecture;
- build successfully;
- pass lint;
- pass TypeScript;
- pass all automated tests.

---

## Code Reviews

Review only:

- correctness;
- bugs;
- regressions;
- performance;
- accessibility;
- privacy;
- consistency with the documentation.

Do not propose architectural improvements unless implementation is impossible.

---

## Development Philosophy

Prefer:

- simple code;
- explicit code;
- readable code;
- maintainable code.

Avoid unnecessary abstraction.

Finished software is more valuable than speculative improvements.

---

## Decision Rule

Before suggesting any change, ask:

"Is this necessary to implement the approved architecture?"

If the answer is **no**, do not suggest it.

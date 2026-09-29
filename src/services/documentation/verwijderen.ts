/**
 * Een documentatie weggooien, terugzetten en definitief wissen (B-135).
 *
 * `FR-DOC-121` t/m `FR-DOC-123` stonden sinds het handboek in §6.1.13 en waren
 * niet gebouwd: er was geen enkele manier om een documentatie kwijt te raken. Dat
 * bleek bij de tweede eigen test.
 *
 * Apart van `DocumentationService` omdat dat bestand al tegen de 400 regels van
 * DR-53 aan zat, en omdat dit een eigen onderwerp is met een eigen bewaartermijn
 * uit §8.8. `DocumentationService` geeft ze door, zodat een scherm maar één plek
 * hoeft te kennen.
 *
 * **Een documentatie en haar pagina's gaan samen.** Beide handelingen lopen via
 * `schrijfAggregaat`: één transactie, één journaalregel op de wortel (§9.4 regel A).
 * Zou het halverwege stoppen, dan stond er een documentatie in de prullenbak
 * waarvan de pagina's nog leefden.
 */

import { ongeldig, type Result } from "@/lib/result";
import type { Uuid } from "@/lib/uuid";
import type { Documentation } from "@/domain/types";

import type { Clock, StorageService } from "../storage/StorageService";
import { prullenbak as sorteer, verlopen, type Prullenbakregel } from "./prullenbak";

/** De pagina's van deze documentatie, inclusief de al verwijderde. */
async function paginasleutels(
  storage: StorageService,
  documentationId: Uuid,
  ookVerwijderde: boolean,
): Promise<Result<Uuid[]>> {
  const alle = ookVerwijderde ? await storage.listDeleted("pages") : await storage.list("pages");
  if (!alle.ok) return alle;

  return {
    ok: true,
    value: alle.value
      .filter((pagina) => pagina.documentationId === documentationId)
      .map((pagina) => pagina.id),
  };
}

/**
 * Naar de prullenbak (`FR-DOC-121`).
 *
 * Geen `purge`: verwijderen is markeren (§8.1.6, T-11). Wat hier gebeurt is
 * omkeerbaar, en dertig dagen lang.
 */
export async function verwijder(
  storage: StorageService,
  id: Uuid,
): Promise<Result<Documentation>> {
  const huidig = await storage.read("documentations", id);
  if (!huidig.ok) return huidig;
  if (!huidig.value) return ongeldig("Deze documentatie bestaat niet meer.");

  const paginas = await paginasleutels(storage, id, false);
  if (!paginas.ok) return paginas;

  return storage.schrijfAggregaat("documentations", ["pages"], async (schrijver) => {
    for (const paginaId of paginas.value) await schrijver.verwijder("pages", paginaId);
    return schrijver.verwijder("documentations", id);
  });
}

/**
 * Terug uit de prullenbak, met pagina's, foto's en koppelingen (`FR-DOC-121`).
 *
 * De foto's en koppelingen komen vanzelf mee: foto's hangen als blok in een
 * pagina en de koppelingen staan als velden op de documentatie zelf. Er is dus
 * niets aparts te herstellen — dat is precies de winst van markeren boven wissen.
 */
export async function herstel(storage: StorageService, id: Uuid): Promise<Result<Documentation>> {
  const paginas = await paginasleutels(storage, id, true);
  if (!paginas.ok) return paginas;

  return storage.schrijfAggregaat("documentations", ["pages"], async (schrijver) => {
    for (const paginaId of paginas.value) await schrijver.herstel("pages", paginaId);
    return schrijver.herstel("documentations", id);
  });
}

/** Wat er in de prullenbak staat, met de resterende dagen (`FR-DOC-121`). */
export async function prullenbak(
  storage: StorageService,
  clock: Clock,
): Promise<Result<Prullenbakregel<Documentation>[]>> {
  const alle = await storage.listDeleted("documentations");
  if (!alle.ok) return alle;

  return { ok: true, value: sorteer(alle.value, clock.now()) };
}

/** Wat een leegmaken of opruimen heeft opgeleverd. */
export interface Opruimuitkomst {
  documentaties: number;
  paginas: number;
}

/**
 * Definitief wissen (`FR-DOC-122`, `FR-DOC-123`).
 *
 * De enige plek buiten de opruimtaak waar `purge` wordt aangeroepen, en dat is de
 * reden dat het scherm er één bevestiging voor vraagt (`FR-DOC-123`): hierna is het
 * weg, ook op het andere apparaat zodra dat synchroniseert.
 *
 * Pagina's eerst. Zou de documentatie als eerste verdwijnen en daarna iets
 * misgaan, dan blijven er pagina's over die naar niets meer verwijzen en die
 * niemand nog kan vinden om op te ruimen.
 */
async function wisDefinitief(
  storage: StorageService,
  documentaties: readonly Documentation[],
): Promise<Result<Opruimuitkomst>> {
  let paginas = 0;

  for (const documentatie of documentaties) {
    const sleutels = await paginasleutels(storage, documentatie.id, true);
    if (!sleutels.ok) return sleutels;

    for (const paginaId of sleutels.value) {
      const weg = await storage.purge("pages", paginaId);
      if (!weg.ok) return weg;
      paginas += 1;
    }

    const weg = await storage.purge("documentations", documentatie.id);
    if (!weg.ok) return weg;
  }

  return { ok: true, value: { documentaties: documentaties.length, paginas } };
}

/** De prullenbak in één handeling legen (`FR-DOC-123`). */
export async function leegPrullenbak(storage: StorageService): Promise<Result<Opruimuitkomst>> {
  const alle = await storage.listDeleted("documentations");
  if (!alle.ok) return alle;

  return wisDefinitief(storage, alle.value);
}

/**
 * De opruimronde bij het opstarten (`FR-DOC-122`, §8.8).
 *
 * Dertig dagen, en geen dag eerder. Hij draait bij elke start en niet op een
 * tijdklok: een app die je één keer per week opent hoort geen achtergrondtaak te
 * hebben die draait terwijl niemand kijkt.
 *
 * Een mislukking is hier geen fout voor de gebruiker. Lukt het opruimen niet, dan
 * staat er iets langer iets in de prullenbak dat er weg had gemogen; dat is geen
 * bericht waar iemand iets mee kan (§4.6).
 */
export async function ruimOp(
  storage: StorageService,
  clock: Clock,
): Promise<Result<Opruimuitkomst>> {
  const alle = await storage.listDeleted("documentations");
  if (!alle.ok) return alle;

  return wisDefinitief(storage, verlopen(alle.value, clock.now()));
}

/**
 * Archiveren (`FR-DOC-120`, B-144).
 *
 * **Archiveren is geen derde status.** B-13 is daar stellig over: *"de statussen
 * heten concept en gedeeld"*, en meer zijn het er niet. Een gearchiveerde
 * documentatie is nog steeds een concept of nog steeds gedeeld — hij is alleen uit
 * beeld. Daarom draagt `archivedAt` het, net zoals `deletedAt` het verwijderen
 * draagt (§8.1.6), en niet een waarde in `status`.
 *
 * Het veld stond al in §8.3.5 en in het type; het werd alleen nooit gezet of
 * gelezen. Dit is dus geen uitbreiding van het model maar het inlossen ervan.
 *
 * **Archiveren tegenover verwijderen.** Verwijderen zegt: dit had er niet moeten
 * staan. Archiveren zegt: dit is af. Het eerste gaat naar de prullenbak en is na
 * dertig dagen weg; het tweede blijft bestaan, blijft vindbaar, en komt alleen niet
 * meer tussen je lopende werk te staan.
 */

import { toIsoDateTime } from "@/lib/dates";
import { ongeldig, type Result } from "@/lib/result";
import type { Uuid } from "@/lib/uuid";
import type { Documentation } from "@/domain/types";

import type { Clock, StorageService } from "../storage/StorageService";

/** Is deze documentatie gearchiveerd? Eén plek, zodat de vraag overal hetzelfde heet. */
export function isGearchiveerd(documentatie: Pick<Documentation, "archivedAt">): boolean {
  return documentatie.archivedAt !== null;
}

/**
 * Uit beeld halen (`FR-DOC-120`).
 *
 * Een tweede keer archiveren laat de oorspronkelijke datum staan: hij zegt wanneer
 * je het werk hebt afgesloten, en dat verandert niet doordat je er nog eens op drukt.
 */
export async function archiveer(
  storage: StorageService,
  clock: Clock,
  id: Uuid,
): Promise<Result<Documentation>> {
  const huidig = await storage.read("documentations", id);
  if (!huidig.ok) return huidig;
  if (!huidig.value) return ongeldig("Deze documentatie bestaat niet meer.");
  if (huidig.value.archivedAt) return { ok: true, value: huidig.value };

  return storage.update("documentations", id, { archivedAt: toIsoDateTime(clock.now()) });
}

/** Terug tussen het lopende werk (`FR-DOC-120`). */
export async function haalUitArchief(
  storage: StorageService,
  id: Uuid,
): Promise<Result<Documentation>> {
  return storage.update("documentations", id, { archivedAt: null });
}

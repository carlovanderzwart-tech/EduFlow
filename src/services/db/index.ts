import { openDB, type IDBPDatabase } from "idb";

import { serviceError, toServiceError } from "../ServiceError";
import { DB_VERSION, MIGRATIONS } from "./migrations";

/**
 * Bezit de verbinding, de schemaversie en de migraties (doc 03, *De
 * repositorylaag*). De repositories gebruiken deze module; niets anders raakt
 * IndexedDB aan.
 */

const DB_NAME = "eduflow";

/* eslint-disable @typescript-eslint/no-explicit-any -- de stores worden per
   repository getypeerd; hier is alleen de verbinding aan de orde. */
type EduFlowDB = any;

let dbPromise: Promise<IDBPDatabase<EduFlowDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<EduFlowDB>> {
  // Bewust lui: op de server bestaat IndexedDB niet, en de routes van EduFlow
  // worden statisch voorgerenderd.
  if (typeof indexedDB === "undefined") {
    return Promise.reject(serviceError("storage-unavailable"));
  }

  dbPromise ??= openDB<EduFlowDB>(DB_NAME, DB_VERSION, {
    async upgrade(db, oldVersion, _newVersion, tx) {
      // Alle stappen boven de huidige versie, op volgorde. Eén pad, of je van
      // niets komt of van een oudere versie (besluit T-20).
      for (const migration of MIGRATIONS) {
        if (migration.version > oldVersion) {
          await migration.run(db, tx);
        }
      }
    },
  }).catch((error) => {
    // Niet cachen wat mislukt is, anders blijft een tijdelijke fout hangen.
    dbPromise = null;
    throw toServiceError(error);
  });

  return dbPromise;
}

/** Voert een bewerking uit en normaliseert elke fout naar een `ServiceError`. */
export async function withDb<T>(
  operation: (db: IDBPDatabase<EduFlowDB>) => Promise<T>,
): Promise<T> {
  try {
    const db = await getDb();
    return await operation(db);
  } catch (error) {
    throw toServiceError(error);
  }
}

/**
 * Opent een transactie over meerdere stores. Nodig voor handelingen die twee
 * entiteiten in één keer raken — een documentatie met haar foto's verwijderen,
 * of een import die leerlingen en groepen samen wegschrijft. Zonder deze plek
 * zou de ene repository de andere aanroepen en is de laag rond.
 */
export function withTransaction<T>(
  stores: string[],
  operation: (tx: any) => Promise<T>,
): Promise<T> {
  return withDb(async (db) => {
    const tx = db.transaction(stores, "readwrite");
    const result = await operation(tx);
    await tx.done;
    return result;
  });
}

/**
 * Hoeveel opslag in gebruik is. Nodig omdat Safari sinds versie 17 niets meer
 * meldt als het vol raakt (doc 03, *Opslaglimiet*): er komt een
 * `QuotaExceededError` en verder niets.
 */
export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  ratio: number;
} | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return null;

  try {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    if (quota === 0) return null;
    return { usage, quota, ratio: usage / quota };
  } catch {
    return null;
  }
}

/** Alleen voor tests: dwingt een nieuwe verbinding bij de volgende aanroep. */
export function resetDbForTests(): void {
  dbPromise = null;
}

export { DB_VERSION };

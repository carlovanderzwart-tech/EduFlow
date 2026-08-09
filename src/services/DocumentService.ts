import type { Documentation, DocumentFilter, Photo } from "@/types/documentation";
import { isWorthSaving } from "@/types/documentation";
import { todayISO } from "@/utils/date";
import { createId } from "@/utils/id";
import { resizeImageToJpeg } from "@/utils/image";
import { normalizeForSearch } from "@/utils/text";

import { AuditService } from "./AuditService";
import { documentRepository } from "./repositories/documentRepository";
import { photoRepository } from "./repositories/photoRepository";
import { serviceError, toServiceError } from "./ServiceError";

/**
 * Documentaties en foto's opslaan, ophalen, verwijderen en zoeken (docs/archief/03).
 *
 * Zoeken loopt via een index in het geheugen die één keer wordt opgebouwd
 * (besluit T-09): IndexedDB kan niet in tekst zoeken, en bij een paar honderd
 * documentaties is een index in het geheugen direct.
 */

/** Documentaties in het geheugen, plus per documentatie de zoektekst. */
let cache: Map<string, Documentation> | null = null;
const searchIndex = new Map<string, string>();

function buildSearchText(doc: Documentation): string {
  // Zoeken doorzoekt titel, tekst en citaten (docs/archief/02).
  return normalizeForSearch([doc.title, doc.text, ...doc.quotes.map((q) => q.text)].join(" "));
}

function putInCache(doc: Documentation): void {
  cache?.set(doc.id, doc);
  searchIndex.set(doc.id, buildSearchText(doc));
}

function removeFromCache(id: string): void {
  cache?.delete(id);
  searchIndex.delete(id);
}

async function ensureLoaded(): Promise<Map<string, Documentation>> {
  if (cache) return cache;

  const docs = await documentRepository.getAll();
  cache = new Map();
  searchIndex.clear();
  for (const doc of docs) putInCache(doc);

  return cache;
}

/** Schrijft weg, werkt de index bij en geeft terug wat is opgeslagen. */
async function persist(doc: Documentation): Promise<Documentation> {
  const next: Documentation = { ...doc, updatedAt: new Date().toISOString() };
  await documentRepository.put(next);
  putInCache(next);
  return next;
}

/** Nieuwste eerst op de dag waarop het gebeurde; bij gelijke datum het laatst gewijzigde. */
function byNewestFirst(a: Documentation, b: Documentation): number {
  return b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt);
}

function matches(doc: Documentation, filter: DocumentFilter): boolean {
  if (filter.seriesId && doc.seriesId !== filter.seriesId) return false;
  if (filter.groupId && doc.groupId !== filter.groupId) return false;
  if (filter.studentId && !doc.studentIds.includes(filter.studentId)) return false;
  if (filter.from && doc.date < filter.from) return false;
  if (filter.to && doc.date > filter.to) return false;

  const query = normalizeForSearch(filter.search ?? "");
  if (query && !(searchIndex.get(doc.id) ?? "").includes(query)) return false;

  return true;
}

export const DocumentService = {
  async list(filter: DocumentFilter = {}): Promise<Documentation[]> {
    const loaded = await ensureLoaded();
    return [...loaded.values()].filter((doc) => matches(doc, filter)).sort(byNewestFirst);
  },

  async get(id: string): Promise<Documentation | undefined> {
    const loaded = await ensureLoaded();
    return loaded.get(id);
  },

  /** Een nieuwe, nog niet opgeslagen documentatie. */
  create(defaults: Partial<Documentation> = {}): Documentation {
    const now = new Date().toISOString();
    return {
      id: createId(),
      title: "",
      studentIds: [],
      date: todayISO(),
      text: "",
      quotes: [],
      photoIds: [],
      createdAt: now,
      updatedAt: now,
      ...defaults,
    };
  },

  /**
   * Slaat op en geeft terug wat is opgeslagen.
   *
   * Een documentatie zonder tekst én zonder foto's wordt niet bewaard (docs/archief/02).
   * Bestaat hij al, dan blijft hij staan: leegmaken is geen manier om te
   * verwijderen, want dat zou werk kunnen weggooien zonder dat erom gevraagd is.
   */
  async save(doc: Documentation): Promise<{ saved: boolean; doc: Documentation }> {
    const loaded = await ensureLoaded();
    const existed = loaded.has(doc.id);

    if (!isWorthSaving(doc) && !existed) {
      return { saved: false, doc };
    }

    return { saved: true, doc: await persist(doc) };
  },

  async remove(id: string): Promise<void> {
    await ensureLoaded();
    await documentRepository.deleteWithPhotos(id);
    removeFromCache(id);

    await AuditService.record("documentation-deleted", { entityId: id });
  },

  /** Kopieert een documentatie inclusief de foto's; de kopie is weer concept. */
  async duplicate(id: string): Promise<Documentation> {
    const loaded = await ensureLoaded();
    const original = loaded.get(id);
    if (!original) throw serviceError("not-found");

    const now = new Date().toISOString();
    const copy: Documentation = {
      ...original,
      id: createId(),
      title: original.title ? `${original.title} (kopie)` : "",
      photoIds: [],
      exportedAt: undefined,
      photoConsentConfirmedAt: undefined,
      createdAt: now,
      updatedAt: now,
    };

    try {
      for (const photoId of original.photoIds) {
        const photo = await photoRepository.get(photoId);
        if (!photo) continue;

        const duplicated: Photo = {
          ...photo,
          id: createId(),
          documentId: copy.id,
          createdAt: now,
          updatedAt: now,
        };
        await photoRepository.put(duplicated);
        copy.photoIds.push(duplicated.id);
      }

      await documentRepository.put(copy);
      putInCache(copy);
      return copy;
    } catch (error) {
      // Halverwege mislukt: de al gekopieerde foto's opruimen, anders blijven
      // er blobs achter waar niets naar verwijst.
      await Promise.all(copy.photoIds.map((photoId) => photoRepository.delete(photoId)));
      throw toServiceError(error);
    }
  },

  // ---- Foto's -------------------------------------------------------------

  /**
   * Verkleint de foto en voegt hem toe. Het origineel wordt niet bewaard
   * (docs/archief/03) — verkleinen gebeurt bij het toevoegen, niet bij het tonen.
   *
   * Neemt de documentatie zelf mee, niet alleen een id. Twee redenen: de nog
   * niet opgeslagen tekst uit de editor gaat dan in dezelfde schrijfactie mee,
   * en een nieuwe documentatie waarvan de foto het eerste onderdeel is bestaat
   * nog niet in de opslag.
   */
  async addPhoto(doc: Documentation, file: Blob): Promise<Documentation> {
    await ensureLoaded();

    const resized = await resizeImageToJpeg(file);
    const now = new Date().toISOString();

    const photo: Photo = {
      id: createId(),
      documentId: doc.id,
      blob: resized.blob,
      width: resized.width,
      height: resized.height,
      createdAt: now,
      updatedAt: now,
    };

    await photoRepository.put(photo);
    return persist({ ...doc, photoIds: [...doc.photoIds, photo.id] });
  },

  async removePhoto(doc: Documentation, photoId: string): Promise<Documentation> {
    await ensureLoaded();
    await photoRepository.delete(photoId);

    return persist({ ...doc, photoIds: doc.photoIds.filter((id) => id !== photoId) });
  },

  /** Zet de volgorde van de foto's. De volgorde is betekenisvol voor de opmaak. */
  async reorderPhotos(doc: Documentation, photoIds: string[]): Promise<Documentation> {
    await ensureLoaded();
    return persist({ ...doc, photoIds });
  },

  getPhoto(photoId: string): Promise<Photo | undefined> {
    return photoRepository.get(photoId);
  },
};

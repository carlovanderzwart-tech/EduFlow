import type { IDBPDatabase, IDBPTransaction } from "idb";

/**
 * Migraties als losse, genummerde stappen die op volgorde draaien. Geen groeiende
 * functie met vertakkingen: een apparaat dat lang niet is geopend springt van
 * versie 1 naar de laatste, en dan is er maar één pad. Dezelfde werkwijze staat in
 * §8.6 van de Bible.
 *
 * Deze migraties horen bij de ontwikkeldatabase `eduflow`. Versie 1.0 begint op
 * `eduflow-v1` en krijgt geen migratieketen vanaf dit model (T-40); wat hier staat
 * blijft alleen om een bestaande ontwikkeldatabase te kunnen uitlezen.
 *
 * **Een migratie roept nooit een service aan**. Alleen de
 * gegevens en zijn eigen code. Services veranderen mee met de app; een migratie
 * moet doen wat hij deed toen hij geschreven werd, ook over drie jaar. Daarom
 * staan de sleutels en velden hieronder als letterlijke tekst en niet als
 * verwijzing naar een type dat later kan wijzigen.
 */

/* eslint-disable @typescript-eslint/no-explicit-any -- een migratie werkt op de
   vorm die de gegevens toen hadden, niet op de huidige types. Die vorm typeren
   zou hem laten meeveranderen met de app, en dat is precies wat deze regel verbiedt. */

export interface Migration {
  /** De versie die deze stap oplevert. */
  version: number;
  description: string;
  run: (db: IDBPDatabase<any>, tx: IDBPTransaction<any, any, "versionchange">) => Promise<void>;
}

function nowIso(existing?: unknown): string {
  return typeof existing === "string" && existing ? existing : new Date().toISOString();
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: "Documentaties, foto's, reeksen en instellingen",
    async run(db) {
      if (!db.objectStoreNames.contains("documentations")) {
        const documentations = db.createObjectStore("documentations", { keyPath: "id" });
        documentations.createIndex("by-updated", "updatedAt");
        documentations.createIndex("by-series", "seriesId");
      }
      if (!db.objectStoreNames.contains("photos")) {
        const photos = db.createObjectStore("photos", { keyPath: "id" });
        photos.createIndex("by-document", "documentId");
      }
      if (!db.objectStoreNames.contains("series")) {
        db.createObjectStore("series", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings");
      }
    },
  },
  {
    version: 2,
    description: "Leerlingen, groepen en het logboek; namenlijst en vrije-tekstgroep omzetten",
    async run(db, tx) {
      if (!db.objectStoreNames.contains("groups")) {
        const groups = db.createObjectStore("groups", { keyPath: "id" });
        groups.createIndex("by-archived", "archived");
      }
      if (!db.objectStoreNames.contains("students")) {
        const students = db.createObjectStore("students", { keyPath: "id" });
        students.createIndex("by-group", "groupId");
        students.createIndex("by-active", "active");
      }
      if (!db.objectStoreNames.contains("auditLog")) {
        const audit = db.createObjectStore("auditLog", { keyPath: "id" });
        audit.createIndex("by-at", "at");
      }

      const settingsStore = tx.objectStore("settings");
      const documentationsStore = tx.objectStore("documentations");
      const groupsStore = tx.objectStore("groups");
      const studentsStore = tx.objectStore("students");

      const settings = (await settingsStore.get("settings")) as Record<string, unknown> | undefined;
      const documentations = (await documentationsStore.getAll()) as Record<string, unknown>[];

      // Groepen afleiden uit de vrije tekst die er stond. Hoofdletterongevoelig
      // ontdubbelen, anders leveren "groep geel" en "Groep Geel" twee groepen op.
      const groupIdByName = new Map<string, string>();
      const schoolYear = "";

      const ensureGroup = async (rawName: unknown): Promise<string | undefined> => {
        const name = typeof rawName === "string" ? rawName.trim() : "";
        if (!name) return undefined;

        const key = name.toLowerCase();
        const known = groupIdByName.get(key);
        if (known) return known;

        const id = crypto.randomUUID();
        const at = new Date().toISOString();
        await groupsStore.put({
          id,
          name,
          schoolYear,
          archived: false,
          createdAt: at,
          updatedAt: at,
        });
        groupIdByName.set(key, id);
        return id;
      };

      const defaultGroupId = await ensureGroup(settings?.defaultStudents);

      // Documentaties: het vrije tekstveld wordt een groepsverwijzing. Leeg
      // blijft leeg — er valt geen groep te verzinnen.
      for (const doc of documentations) {
        const groupId = await ensureGroup(doc.students);

        const next: Record<string, unknown> = {
          ...doc,
          groupId,
          studentIds: Array.isArray(doc.studentIds) ? doc.studentIds : [],
          createdAt: nowIso(doc.createdAt),
          updatedAt: nowIso(doc.updatedAt),
        };
        delete next.students;

        await documentationsStore.put(next);
      }

      // Foto's krijgen de gedeelde velden die ze nog niet hadden.
      const photosStore = tx.objectStore("photos");
      for (const photo of (await photosStore.getAll()) as Record<string, unknown>[]) {
        await photosStore.put({
          ...photo,
          createdAt: nowIso(photo.createdAt),
          updatedAt: nowIso(photo.updatedAt),
        });
      }

      const seriesStore = tx.objectStore("series");
      for (const series of (await seriesStore.getAll()) as Record<string, unknown>[]) {
        await seriesStore.put({
          ...series,
          createdAt: nowIso(series.createdAt),
          updatedAt: nowIso(series.updatedAt),
        });
      }

      // De namenlijst wordt het leerlingenregister. Groep en geboortedatum zijn
      // niet af te leiden; die blijven leeg en worden in het scherm gemarkeerd.
      const legacyNames = Array.isArray(settings?.names) ? (settings.names as unknown[]) : [];
      for (const rawName of legacyNames) {
        const firstName = typeof rawName === "string" ? rawName.trim() : "";
        if (!firstName) continue;

        const at = new Date().toISOString();
        await studentsStore.put({
          id: crypto.randomUUID(),
          firstName,
          groupId: defaultGroupId,
          active: true,
          createdAt: at,
          updatedAt: at,
        });
      }

      // De oude namenlijst blijft staan tot er een back-up bestaat: dit is een
      // eenmalige, onomkeerbare omzetting en `BackupService` is er nog niet.
      // Opruimen gebeurt in een latere versie.
      await settingsStore.put(
        {
          styleExample: typeof settings?.styleExample === "string" ? settings.styleExample : "",
          defaultGroupId,
          legacyNames,
        },
        "settings",
      );
    },
  },
];

export const DB_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;

import { openDB } from "idb";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { DB_VERSION, MIGRATIONS } from "./migrations";

/**
 * docs/archief/03 (*Migraties*) eist een test die van versie 1 naar de laatste migreert.
 * Een apparaat dat lang niet is geopend springt die versies in één keer door, en
 * dat pad is met de hand niet te controleren.
 */

const DB_NAME = "eduflow-migration-test";

/** Opent de database op een gegeven versie en draait alle stappen daarboven. */
async function openAtVersion(version: number) {
  return openDB(DB_NAME, version, {
    async upgrade(db, oldVersion, _newVersion, tx) {
      for (const migration of MIGRATIONS) {
        if (migration.version > oldVersion && migration.version <= version) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- testopzet spiegelt de db-module
          await migration.run(db as any, tx as any);
        }
      }
    },
  });
}

beforeEach(async () => {
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
});

afterEach(async () => {
  await new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
});

describe("migraties", () => {
  it("levert op een leeg apparaat alle stores op", async () => {
    const db = await openAtVersion(DB_VERSION);

    expect([...db.objectStoreNames].sort()).toEqual(
      ["auditLog", "documentations", "groups", "photos", "series", "settings", "students"].sort(),
    );

    db.close();
  });

  it("is een aaneengesloten reeks zonder gaten of dubbelingen", () => {
    const versions = MIGRATIONS.map((migration) => migration.version);

    expect(versions).toEqual([...versions].sort((a, b) => a - b));
    expect(new Set(versions).size).toBe(versions.length);
    expect(versions[0]).toBe(1);
  });

  it("zet de namenlijst om naar leerlingen en de vrije tekst naar een groep", async () => {
    // Eerst versie 1 opzetten zoals die bij de Product Owner op het apparaat staat.
    const v1 = await openAtVersion(1);
    await v1.put(
      "settings",
      { names: ["Kjeld", "Roos"], defaultStudents: "groep geel", styleExample: "Een voorbeeld." },
      "settings",
    );
    await v1.put("documentations", {
      id: "d1",
      title: "Bouwen met blokken",
      students: "groep geel",
      date: "2026-08-05",
      text: "Vanmorgen bouwden we een toren.",
      quotes: [],
      photoIds: [],
    });
    await v1.put("documentations", {
      id: "d2",
      title: "Zonder groep",
      students: "",
      date: "2026-08-04",
      text: "Geen groep ingevuld.",
      quotes: [],
      photoIds: [],
    });
    v1.close();

    // Dan doormigreren naar de laatste versie.
    const db = await openAtVersion(DB_VERSION);

    const students = await db.getAll("students");
    expect(students.map((student) => student.firstName).sort()).toEqual(["Kjeld", "Roos"]);
    // Groep en geboortedatum zijn niet af te leiden; de groep valt terug op de
    // standaardgroep, de geboortedatum blijft leeg.
    expect(students.every((student) => student.dateOfBirth === undefined)).toBe(true);
    expect(students.every((student) => student.active)).toBe(true);

    const groups = await db.getAll("groups");
    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe("groep geel");
    expect(groups[0].archived).toBe(false);

    // Elke leerling hangt aan die ene groep.
    expect(new Set(students.map((student) => student.groupId))).toEqual(new Set([groups[0].id]));

    const withGroup = await db.get("documentations", "d1");
    expect(withGroup.groupId).toBe(groups[0].id);
    expect(withGroup.studentIds).toEqual([]);
    expect(withGroup.students).toBeUndefined();
    expect(typeof withGroup.createdAt).toBe("string");
    expect(typeof withGroup.updatedAt).toBe("string");

    // Een documentatie zonder groep krijgt er geen verzonnen groep bij.
    const withoutGroup = await db.get("documentations", "d2");
    expect(withoutGroup.groupId).toBeUndefined();

    const settings = await db.get("settings", "settings");
    expect(settings.defaultGroupId).toBe(groups[0].id);
    expect(settings.styleExample).toBe("Een voorbeeld.");
    // De oude lijst blijft staan tot er een back-up bestaat: dit is een
    // eenmalige, onomkeerbare omzetting.
    expect(settings.legacyNames).toEqual(["Kjeld", "Roos"]);

    db.close();
  });

  it("ontdubbelt groepen hoofdletterongevoelig", async () => {
    const v1 = await openAtVersion(1);
    await v1.put("settings", { names: [], defaultStudents: "groep geel" }, "settings");
    await v1.put("documentations", {
      id: "d1",
      title: "A",
      students: "Groep Geel",
      date: "2026-08-05",
      text: "x",
      quotes: [],
      photoIds: [],
    });
    await v1.put("documentations", {
      id: "d2",
      title: "B",
      students: "groep geel",
      date: "2026-08-05",
      text: "y",
      quotes: [],
      photoIds: [],
    });
    v1.close();

    const db = await openAtVersion(DB_VERSION);

    // "groep geel" en "Groep Geel" leveren één groep op, niet twee.
    const groups = await db.getAll("groups");
    expect(groups).toHaveLength(1);

    const a = await db.get("documentations", "d1");
    const b = await db.get("documentations", "d2");
    expect(a.groupId).toBe(b.groupId);

    db.close();
  });

  it("verwerkt een leeg apparaat zonder instellingen", async () => {
    const db = await openAtVersion(DB_VERSION);

    expect(await db.getAll("students")).toEqual([]);
    expect(await db.getAll("groups")).toEqual([]);

    db.close();
  });
});

/**
 * Toetsen bij de back-up (`FR-INS-28` t/m `FR-INS-32`, §8.7, B-143).
 *
 * De toets die het meest waard is, is de heen-en-weer: maak een back-up, gooi alles
 * weg, zet hem terug, en kijk of je werk er weer staat. Alles eromheen — het zout,
 * het manifest, de botsingsregel — is pas iets waard als die ene klopt.
 *
 * De keten draait **zonder browser**: de opslag is een echte IndexedDB uit
 * `fake-indexeddb` en de klok staat stil (DR-12). WebCrypto komt uit Node.
 */

import { beforeEach, describe, expect, it } from "vitest";

import { crc32, leesZip, schrijfZip, type Bytes } from "@/lib/zip";
import { newId } from "@/lib/uuid";

import { createBackupService, type BackupService } from "./backup/BackupService";
import { bestandsnaam, bezwaarTegen, samenvatting, type Manifest } from "./backup/manifest";
import {
  createDocumentationService,
  type DocumentationService,
} from "./documentation/DocumentationService";
import { createStudentService, type StudentService } from "./students/StudentService";
import { maakDatabase } from "./storage/db";
import { createStorageService, type StorageService } from "./storage/StorageService";

const APPARAAT = newId();
const NU = "2026-10-04T10:00:00.000Z";

let storage: StorageService;
let backup: BackupService;
let documentation: DocumentationService;
let students: StudentService;
let klok: { now: () => Date; verzet: (naar: string) => void };

function stilstaandeKlok(start: string) {
  let moment = new Date(start);
  return { now: () => moment, verzet: (naar: string) => void (moment = new Date(naar)) };
}

beforeEach(() => {
  const db = maakDatabase(`toets-${newId()}`);
  klok = stilstaandeKlok(NU);
  storage = createStorageService({ db, clock: klok, origin: APPARAAT });
  documentation = createDocumentationService({ storage, clock: klok });
  students = createStudentService({ storage });
  backup = createBackupService({ storage, clock: klok, appVersion: "0.1.0", dbVersion: 1 });
});

function waarde<T>(uitkomst: { ok: boolean; value?: T; error?: unknown }): T {
  if (!uitkomst.ok) throw new Error(`hoort te slagen: ${JSON.stringify(uitkomst.error)}`);
  return uitkomst.value as T;
}

function fout(uitkomst: { ok: boolean; error?: { message: string } }): string {
  if (uitkomst.ok) throw new Error("hoort te falen");
  return uitkomst.error!.message;
}

async function vulDeOpslag() {
  const leerling = waarde(await students.voegToe({ firstName: "Kjeld" }));
  const doc = waarde(
    await documentation.maak({
      title: "De winkelhoek",
      date: "2026-10-01",
      studentIds: [leerling.id],
      text: "Twee kinderen maakten prijskaartjes bij het zoutdeeg.",
    }),
  ).documentatie;
  return { leerling, doc };
}

describe("de zip uit §8.7", () => {
  const bytesVan = (tekst: string): Bytes => {
    const uit = new Uint8Array(new TextEncoder().encode(tekst));
    return uit;
  };

  it("leest terug wat hij schrijft", async () => {
    const heen = [
      { pad: "manifest.json", bytes: bytesVan('{"format":"eduflow-backup"}') },
      { pad: "data/students.json", bytes: bytesVan("[]") },
    ];

    const terug = leesZip(new Uint8Array(await schrijfZip(heen).arrayBuffer()));

    expect(terug.map((deel) => deel.pad)).toEqual(["manifest.json", "data/students.json"]);
    expect(new TextDecoder().decode(terug[1]!.bytes)).toBe("[]");
  });

  it("merkt een beschadigd bestand op in plaats van onzin terug te geven", async () => {
    const bytes = new Uint8Array(
      await schrijfZip([{ pad: "data/students.json", bytes: bytesVan("[1,2,3]") }]).arrayBuffer(),
    );
    // Eén byte in de inhoud omdraaien; de CRC-32 hoort dat te zien. De inhoud
    // begint na de lokale kop van 30 bytes plus de naam van 18 tekens.
    const inhoud = 30 + "data/students.json".length;
    bytes[inhoud] = bytes[inhoud]! ^ 0xff;

    expect(() => leesZip(bytes)).toThrow(/beschadigd/u);
  });

  it("rekent de CRC-32 uit zoals de zip hem wil", () => {
    // De bekende waarde voor "123456789"; elke zip-lezer controleert hiertegen.
    expect(crc32(bytesVan("123456789"))).toBe(0xcbf43926);
  });

  it("weigert iets wat geen zip is", () => {
    expect(() => leesZip(bytesVan("dit is geen zip"))).toThrow(/geen zip/u);
  });
});

describe("een back-up bevat alles — FR-INS-28", () => {
  it("telt per soort wat erin zit (FR-INS-28, §8.7)", async () => {
    await vulDeOpslag();

    const uit = waarde(await backup.maak({ wachtwoord: "", apparaatnaam: "pc-carlo" }));

    expect(uit.manifest.counts.students).toBe(1);
    expect(uit.manifest.counts.documentations).toBe(1);
    expect(uit.manifest.counts.pages).toBe(1);
  });

  it("laat de mailcache en het AI-logboek eruit (FR-INS-28)", async () => {
    const uit = waarde(await backup.maak({ wachtwoord: "", apparaatnaam: "pc-carlo" }));

    expect(uit.manifest.counts.mailMessages).toBeUndefined();
    expect(uit.manifest.counts.aiInteractions).toBeUndefined();
  });

  it("noemt het bestand naar de dag en het apparaat (§8.7)", async () => {
    const uit = waarde(await backup.maak({ wachtwoord: "", apparaatnaam: "pc carlo" }));

    expect(uit.naam).toBe("eduflow-backup-2026-10-04-pc-carlo-onversleuteld.zip");
  });

  it("zegt in de bestandsnaam dat hij onversleuteld is (FR-INS-29)", async () => {
    const open = waarde(await backup.maak({ wachtwoord: "", apparaatnaam: "pc" }));
    const dicht = waarde(await backup.maak({ wachtwoord: "geheim", apparaatnaam: "pc" }));

    expect(open.naam).toContain("onversleuteld");
    expect(dicht.naam).not.toContain("onversleuteld");
  });
});

describe("heen en weer — FR-INS-30", () => {
  it("zet een leeggegooide opslag weer terug (FR-INS-30)", async () => {
    const { doc } = await vulDeOpslag();
    const bestand = waarde(await backup.maak({ wachtwoord: "", apparaatnaam: "pc" }));

    // Alles weg, zoals een geleegd browserprofiel.
    for (const rij of waarde(await documentation.lijst())) {
      waarde(await storage.purge("documentations", rij.id));
    }
    for (const rij of waarde(await storage.list("pages"))) {
      waarde(await storage.purge("pages", rij.id));
    }
    for (const rij of waarde(await students.lijst())) {
      waarde(await storage.purge("students", rij.id));
    }
    expect(waarde(await documentation.lijst())).toHaveLength(0);

    const gelezen = waarde(await backup.lees(bestand.blob, ""));
    waarde(await backup.zetTerug(gelezen, "samenvoegen"));

    const terug = waarde(await documentation.open(doc.id));
    expect(terug).not.toBeNull();
    expect(terug!.documentatie.title).toBe("De winkelhoek");
    expect(documentation.tekstVan(terug!)).toContain("prijskaartjes");
    expect(waarde(await students.lijst()).map((l) => l.firstName)).toEqual(["Kjeld"]);
  });

  it("doet hetzelfde door een wachtwoord heen (FR-INS-29)", async () => {
    const { doc } = await vulDeOpslag();
    const bestand = waarde(await backup.maak({ wachtwoord: "zoutdeeg", apparaatnaam: "pc" }));

    waarde(await storage.purge("documentations", doc.id));

    const gelezen = waarde(await backup.lees(bestand.blob, "zoutdeeg"));
    waarde(await backup.zetTerug(gelezen, "samenvoegen"));

    expect(waarde(await documentation.lijst()).map((d) => d.title)).toEqual(["De winkelhoek"]);
  });

  it("laat het manifest leesbaar, ook bij een versleutelde back-up (FR-INS-30)", async () => {
    await vulDeOpslag();
    const bestand = waarde(await backup.maak({ wachtwoord: "zoutdeeg", apparaatnaam: "pc" }));

    // Zonder wachtwoord: je hoort te kunnen zien wélk bestand je in handen hebt.
    const zonder = await backup.lees(bestand.blob, "");

    expect(zonder.ok).toBe(false);
    expect(fout(zonder)).toContain("versleuteld");

    const onderdelen = leesZip(new Uint8Array(await bestand.blob.arrayBuffer()));
    const manifest = JSON.parse(
      new TextDecoder().decode(onderdelen.find((d) => d.pad === "manifest.json")!.bytes),
    ) as Manifest;

    expect(manifest.counts.documentations).toBe(1);
    expect(manifest.encryption?.iterations).toBe(600_000);
  });

  it("weigert een verkeerd wachtwoord in plaats van onzin terug te zetten (FR-INS-29)", async () => {
    await vulDeOpslag();
    const bestand = waarde(await backup.maak({ wachtwoord: "zoutdeeg", apparaatnaam: "pc" }));

    expect(fout(await backup.lees(bestand.blob, "verkeerd"))).toContain("opent de back-up niet");
  });
});

describe("bij samenvoegen wint de nieuwste bewerking — FR-INS-31", () => {
  it("laat staan wat hier nieuwer is (FR-INS-31)", async () => {
    const { doc } = await vulDeOpslag();
    const bestand = waarde(await backup.maak({ wachtwoord: "", apparaatnaam: "pc" }));

    // Hier wordt verder gewerkt nadat de back-up is gemaakt.
    klok.verzet("2026-10-05T10:00:00.000Z");
    waarde(await storage.update("documentations", doc.id, { title: "De winkelhoek, deel 2" }));

    const gelezen = waarde(await backup.lees(bestand.blob, ""));
    const uit = waarde(await backup.zetTerug(gelezen, "samenvoegen"));

    expect(waarde(await storage.read("documentations", doc.id))!.title).toBe(
      "De winkelhoek, deel 2",
    );
    expect(uit.overgeslagen).toBeGreaterThan(0);
  });

  it("zet terug wat daar nieuwer is (FR-INS-31)", async () => {
    // De documentatie ontstaat op 1 oktober, zodat er later een geldige stand
    // tússen ontstaan en back-up in past: `createdAt` mag nooit ná `updatedAt`
    // liggen, en het schema houdt dat tegen — terecht.
    klok.verzet("2026-10-01T10:00:00.000Z");
    const { doc } = await vulDeOpslag();

    klok.verzet("2026-10-05T10:00:00.000Z");
    waarde(await storage.update("documentations", doc.id, { title: "In de back-up" }));
    const bestand = waarde(await backup.maak({ wachtwoord: "", apparaatnaam: "pc" }));

    // En daarna een óudere stand in de opslag zetten.
    waarde(
      await storage.zetTerug("documentations", {
        ...waarde(await storage.read("documentations", doc.id))!,
        title: "Ouder",
        updatedAt: "2026-10-03T10:00:00.000Z",
      }),
    );

    const gelezen = waarde(await backup.lees(bestand.blob, ""));
    waarde(await backup.zetTerug(gelezen, "samenvoegen"));

    expect(waarde(await storage.read("documentations", doc.id))!.title).toBe("In de back-up");
  });

  it("gooit bij vervangen eerst weg wat er staat (FR-INS-30)", async () => {
    await vulDeOpslag();
    const bestand = waarde(await backup.maak({ wachtwoord: "", apparaatnaam: "pc" }));

    const extra = waarde(
      await documentation.maak({
        title: "Na de back-up",
        date: "2026-10-03",
        studentIds: [],
        text: "Deze stond niet in het bestand.",
      }),
    ).documentatie;

    const gelezen = waarde(await backup.lees(bestand.blob, ""));
    waarde(await backup.zetTerug(gelezen, "vervangen"));

    const titels = waarde(await documentation.lijst()).map((d) => d.title);
    expect(titels).toEqual(["De winkelhoek"]);
    expect(waarde(await storage.read("documentations", extra.id))).toBeNull();
  });
});

describe("het manifest — §8.7", () => {
  const basis: Manifest = {
    format: "eduflow-backup",
    formatVersion: 2,
    createdAt: NU,
    appVersion: "0.1.0",
    dbVersion: 1,
    device: { id: "", name: "pc-carlo" },
    encryption: null,
    counts: { documentations: 212, students: 20, photos: 1240 },
    bytes: { data: 10, blobs: 20 },
    checksum: { algorithm: "SHA-256", value: "abc" },
  };

  it("herkent een bestand dat geen back-up is", () => {
    expect(bezwaarTegen({ format: "iets anders" })).toContain("geen back-up");
    expect(bezwaarTegen(null)).toContain("geen back-up");
  });

  it("weigert een formaat dat deze versie niet kent", () => {
    expect(bezwaarTegen({ ...basis, formatVersion: 99 })).toContain("formaat 99");
  });

  it("laat een geldig manifest door", () => {
    expect(bezwaarTegen(basis)).toBeNull();
  });

  it("vat samen wat erin zit, in schermtaal (FR-INS-30)", () => {
    expect(samenvatting(basis)).toEqual(["212 documentaties", "1240 foto's", "20 leerlingen"]);
  });

  it("noemt één documentatie in het enkelvoud", () => {
    expect(samenvatting({ ...basis, counts: { documentations: 1 } })).toEqual(["1 documentatie"]);
  });

  it("maakt een bestandsnaam zonder tekens die een map aanmaken (§8.7)", () => {
    expect(bestandsnaam({ ...basis, device: { id: "", name: "pc/carlo thuis" } })).toBe(
      "eduflow-backup-2026-10-04-pc-carlo-thuis-onversleuteld.zip",
    );
  });
});

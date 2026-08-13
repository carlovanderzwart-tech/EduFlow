/**
 * Toetsen bij werkopdracht D04 — de keten, de opdracht en de poorten.
 *
 * Alles zonder netwerk: `fetch` komt als afhankelijkheid binnen en levert een
 * stroom uit het geheugen (DR-12). Dat is niet alleen een toetstruc — het is de
 * reden dat de adapter en de service zonder sleutel te controleren zijn, en dus
 * dat DR-36 geen belemmering is voor de bouwstraat.
 *
 * De namen komen uit bijlage A en zijn verzonnen (§15.6, DR-33).
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { newId } from "@/lib/uuid";
import type { Student } from "@/domain/types";
import { bevatBeeldgegeven, zAiRequest } from "@/domain/schemas/aiRequest";
import { restore } from "@/services/privacy/PrivacyService";
import { GROEP_4 } from "@/test/fixtures/testgegevens";

import { maakDatabase } from "../storage/db";
import { createStorageService, type StorageService } from "../storage/StorageService";

import { createAIService, maakBrokvertaler, type AIService } from "./AIService";
import { createPromptService, TAKEN } from "./PromptService";
import { naarBerichten } from "./adapters/openai-eu";

const APPARAAT = newId();
const NU = "2026-08-13T10:00:00.000Z";

function leerling(voornaam: string, seed: number): Student {
  const [eerste = "", ...rest] = voornaam.split(" ");
  return {
    id: newId(),
    createdAt: NU,
    updatedAt: NU,
    deletedAt: null,
    rev: 1,
    origin: APPARAAT,
    schemaVersion: 1,
    firstName: eerste,
    firstNameLower: eerste.toLowerCase(),
    lastNameInitial: rest.join(" "),
    birthDay: null,
    birthMonth: null,
    birthYear: null,
    note: "",
    pseudonymSeed: seed,
  };
}

const GROEP: Student[] = GROEP_4.map((kind, plaats) => leerling(kind.voornaam, plaats + 1));

/** Een `fetch` die een stroom uit het geheugen teruggeeft, in brokken. */
function stroomVan(brokken: readonly string[], kop: Record<string, string> = {}) {
  // De parameters staan er zodat een toets kan nakijken wélk eindpunt is
  // aangeroepen; dat is de toets op DR-16.
  return vi.fn(async (_url: string, _init?: RequestInit) => {
    const encoder = new TextEncoder();
    let plaats = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (plaats >= brokken.length) return controller.close();
        controller.enqueue(encoder.encode(brokken[plaats]!));
        plaats += 1;
      },
    });
    return new Response(body, {
      status: 200,
      headers: { "x-eduflow-model": "gpt-4o", "x-eduflow-region": "EU", ...kop },
    });
  });
}

let storage: StorageService;

function maakDienst(fetchNep: typeof globalThis.fetch): AIService {
  return createAIService({
    storage,
    prompts: createPromptService(),
    clock: { now: () => new Date(NU) },
    fetch: fetchNep,
    provider: "openai-eu",
  });
}

beforeEach(() => {
  const db = maakDatabase(`toets-${newId()}`);
  storage = createStorageService({ db, clock: { now: () => new Date(NU) }, origin: APPARAAT });
});

function waarde<T>(uitkomst: { ok: boolean; value?: T; error?: unknown }): T {
  if (!uitkomst.ok) throw new Error(`hoort te slagen: ${JSON.stringify(uitkomst.error)}`);
  return uitkomst.value as T;
}

async function alles(stroom: AsyncGenerator<string, void>): Promise<string> {
  let uit = "";
  for await (const brok of stroom) uit += brok;
  return uit;
}

/* ------------------------------------------------------------------ */

describe("de keten — §12.1, DR-31", () => {
  it("stuurt geen enkele naam de deur uit en zet hem hersteld terug (DR-31)", async () => {
    // De AI krijgt codes en geeft codes terug; dat is wat de opdracht hem opdraagt.
    const fetchNep = stroomVan(["[LEERLING-11] bouwde", " met [LEERLING-13] aan de brug."]);
    const dienst = maakDienst(fetchNep as unknown as typeof globalThis.fetch);

    const voorbereiding = waarde(
      await dienst.bereidVoor({
        task: "doc.write",
        tekst: "Kjeld bouwde met Mees aan de brug.",
        leerlingen: GROEP,
      }),
    );

    // Wat er de deur uit gaat, bevat geen naam (INV-38).
    const verstuurd = JSON.stringify(voorbereiding.opdracht);
    expect(verstuurd).not.toContain("Kjeld");
    expect(verstuurd).not.toContain("Mees");
    expect(voorbereiding.opdracht.invoer).toBe("[LEERLING-11] bouwde met [LEERLING-13] aan de brug.");

    // En wat er terugkomt, draagt de namen weer (§12.5 stap 8).
    const stroom = waarde(await dienst.verstuur(voorbereiding));
    expect(await alles(stroom)).toBe("Kjeld bouwde met Mees aan de brug.");
  });

  it("blokkeert bij een lege leerlingenlijst vóór er iets vertrekt (T-08, FR-INS-20)", async () => {
    const fetchNep = stroomVan(["mag niet gebeuren"]);
    const dienst = maakDienst(fetchNep as unknown as typeof globalThis.fetch);

    const uitkomst = await dienst.bereidVoor({
      task: "doc.write",
      tekst: "Kjeld bouwde een brug.",
      leerlingen: [],
    });

    expect(uitkomst.ok).toBe(false);
    if (uitkomst.ok) return;
    expect(uitkomst.error.code).toBe("PRIVACY_GATE");
    // De poort staat vóór het netwerk: er is niets aangeroepen.
    expect(fetchNep).not.toHaveBeenCalled();
  });

  it("laat door na de eenmalige bevestiging (T-08)", async () => {
    const dienst = maakDienst(stroomVan(["ok"]) as unknown as typeof globalThis.fetch);

    const uitkomst = await dienst.bereidVoor({
      task: "doc.write",
      tekst: "Er werd gebouwd aan de brug.",
      leerlingen: [],
      legeLijstBevestigdOp: NU,
    });

    expect(uitkomst.ok).toBe(true);
  });

  it("roept precies één eindpunt aan, en dat is /api/ai (DR-16)", async () => {
    const fetchNep = stroomVan(["klaar"]);
    const dienst = maakDienst(fetchNep as unknown as typeof globalThis.fetch);

    const voorbereiding = waarde(
      await dienst.bereidVoor({ task: "doc.write", tekst: "Bram bouwde.", leerlingen: GROEP }),
    );
    await alles(waarde(await dienst.verstuur(voorbereiding)));

    expect(fetchNep).toHaveBeenCalledTimes(1);
    expect(fetchNep.mock.calls[0]![0]).toBe("/api/ai");
  });
});

describe("het logboek — §12.1, DR-44, §16.4, FR-PRV-08", () => {
  it("legt tellingen vast en geen inhoud", async () => {
    const dienst = maakDienst(stroomVan(["[LEERLING-2] bouwde."]) as unknown as typeof globalThis.fetch);

    const voorbereiding = waarde(
      await dienst.bereidVoor({
        task: "doc.write",
        tekst: "Bram bouwde een toren van negen blokken.",
        leerlingen: GROEP,
      }),
    );
    await alles(waarde(await dienst.verstuur(voorbereiding)));

    const regels = waarde(await storage.list("aiInteractions"));
    expect(regels).toHaveLength(1);

    const regel = regels[0]!;
    expect(regel.task).toBe("doc.write");
    expect(regel.provider).toBe("openai-eu");
    expect(regel.model).toBe("gpt-4o");
    expect(regel.pseudonymCount).toBe(1);
    expect(regel.charsOut).toBeGreaterThan(0);
    expect(regel.outcome).toBe("accepted");

    // Nergens in de regel staat een naam of een zin (§16.4).
    const alsTekst = JSON.stringify(regel);
    expect(alsTekst).not.toContain("Bram");
    expect(alsTekst).not.toContain("toren");
    expect(alsTekst).not.toContain("schrijfhulp");
  });

  it("laat een mislukte aanroep niet stil verdwijnen (§12.11)", async () => {
    const stuk = vi.fn(async () => new Response("nee", { status: 500 }));
    const dienst = maakDienst(stuk as unknown as typeof globalThis.fetch);

    const voorbereiding = waarde(
      await dienst.bereidVoor({ task: "doc.write", tekst: "Bram bouwde.", leerlingen: GROEP }),
    );
    const uitkomst = await dienst.verstuur(voorbereiding);

    expect(uitkomst.ok).toBe(false);
    const regels = waarde(await storage.list("aiInteractions"));
    expect(regels[0]!.outcome).toBe("failed");
  });

  it("probeert hoogstens één keer opnieuw (§12.11)", async () => {
    const stuk = vi.fn(async () => new Response("nee", { status: 500 }));
    const dienst = maakDienst(stuk as unknown as typeof globalThis.fetch);

    const voorbereiding = waarde(
      await dienst.bereidVoor({ task: "doc.write", tekst: "Bram bouwde.", leerlingen: GROEP }),
    );
    await dienst.verstuur(voorbereiding);

    expect(stuk).toHaveBeenCalledTimes(2);
  }, 10_000);
});

describe("terugvertalen op brokken — §12.10", () => {
  it("houdt een code bij elkaar die over twee brokken valt", () => {
    const kaart = new Map([["[LEERLING-11]", { kind: "leerling" as const, forms: ["Kjeld"] }]]);
    const vertaler = maakBrokvertaler(kaart);

    // De code wordt middenin doorgesneden.
    expect(vertaler.brok("Toen kwam [LEERL")).toBe("Toen kwam ");
    expect(vertaler.brok("ING-11] binnen.")).toBe("Kjeld binnen.");
    expect(vertaler.rest()).toBe("");
  });

  it("laat een gewone blokhaak niet eeuwig wachten", () => {
    const vertaler = maakBrokvertaler(new Map());

    // Zodra er méér dan een code lang achter de haak staat, is het geen code meer
    // en gaat hij meteen naar buiten in plaats van de stroom op te houden.
    const eerste = vertaler.brok("Een lijst [met van alles erin dat langer is dan een code");

    expect(eerste).toContain("[met van alles");
    expect(vertaler.rest()).toBe("");
  });

  it("houdt wél vast zolang het nog een code kan worden", () => {
    const vertaler = maakBrokvertaler(new Map());

    // Kort genoeg om nog een code te kunnen zijn: dit deel blijft wachten.
    expect(vertaler.brok("Toen kwam [LEERL")).toBe("Toen kwam ");
    expect(vertaler.rest()).toBe("[LEERL");
  });
});

describe("PromptService — §12.3, INV-43", () => {
  it("levert de vijf blokken in de volgorde van §12.3", () => {
    const opdracht = waarde(
      createPromptService().build({ task: "doc.write", tekst: "[LEERLING-2] bouwde." }),
    ).opdracht;

    expect(Object.keys(opdracht)).toEqual([
      "systeeminstructie",
      "schrijfstijl",
      "voorbeelden",
      "context",
      "invoer",
    ]);
  });

  it("draagt de regel over de codes woordelijk mee (§12.3)", () => {
    const opdracht = waarde(
      createPromptService().build({ task: "doc.write", tekst: "[LEERLING-2] bouwde." }),
    ).opdracht;

    expect(opdracht.systeeminstructie).toContain(
      "Je verandert de codes tussen blokhaken niet. [LEERLING-1] blijft [LEERLING-1].",
    );
    expect(opdracht.systeeminstructie).toContain("Je gebruikt geen oordelen");
  });

  it("kent geen veld waarin een foto past (INV-39, DR-32)", () => {
    const opdracht = waarde(
      createPromptService().build({ task: "doc.write", tekst: "[LEERLING-2] bouwde." }),
    ).opdracht;

    expect(Object.keys(opdracht)).not.toContain("image");
    expect(Object.keys(opdracht)).not.toContain("photoIds");
  });

  it("weigert een tekst die langer is dan de taak toestaat", () => {
    const taak = TAKEN["doc.write"]!;
    const uitkomst = createPromptService().build({
      task: "doc.write",
      tekst: "a".repeat(taak.maxInputChars + 1),
    });

    expect(uitkomst.ok).toBe(false);
  });

  it("stuurt niet meer voorbeelden mee dan de taak toestaat (§12.4)", () => {
    const veel = Array.from({ length: 5 }, (_, i) => ({ invoer: `in ${i}`, uitkomst: `uit ${i}` }));
    const opdracht = waarde(
      createPromptService().build({ task: "doc.write", tekst: "[LEERLING-2] bouwde.", voorbeelden: veel }),
    ).opdracht;

    expect(opdracht.voorbeelden).toHaveLength(TAKEN["doc.write"]!.exampleCount);
  });
});

describe("het draadformaat — DR-24, DR-32, T-29", () => {
  function geldig() {
    return {
      task: "doc.write" as const,
      level: "zorgvuldig" as const,
      provider: "openai-eu" as const,
      opdracht: {
        systeeminstructie: "Je bent een schrijfhulp.",
        schrijfstijl: "",
        voorbeelden: [],
        context: "",
        invoer: "[LEERLING-2] bouwde.",
      },
    };
  }

  it("laat een geldig verzoek door", () => {
    expect(zAiRequest.safeParse(geldig()).success).toBe(true);
  });

  it("weigert een onbekend veld in plaats van het te negeren (DR-24)", () => {
    const metExtra = { ...geldig(), image: "iets" };

    expect(zAiRequest.safeParse(metExtra).success).toBe(false);
  });

  it("weigert een onbekend veld binnen de opdracht (DR-24)", () => {
    const basis = geldig();
    const metExtra = { ...basis, opdracht: { ...basis.opdracht, photoId: "abc" } };

    expect(zAiRequest.safeParse(metExtra).success).toBe(false);
  });

  it.each([
    ["een data-URI", "data:image/png;base64,iVBORw0KGgo="],
    ["een MIME-aanduiding", "de bijlage is image/jpeg"],
    ["een base64-blok van meer dan 512 tekens", "A".repeat(600)],
  ])("herkent %s als beeldgegeven (DR-32, T-29)", (_naam, verdacht) => {
    const basis = geldig();

    expect(bevatBeeldgegeven({ ...basis, opdracht: { ...basis.opdracht, invoer: verdacht } })).toBe(
      true,
    );
  });

  it("houdt gewone tekst voor gewone tekst", () => {
    expect(bevatBeeldgegeven(geldig())).toBe(false);
  });
});

describe("de adapter — §12.7", () => {
  it("zet de schrijfstijl bij de systeeminstructie, want die verwijst ernaar", () => {
    const berichten = naarBerichten({
      systeeminstructie: "Je bent een schrijfhulp.",
      schrijfstijl: "Zinnen: gemiddeld 14 woorden.",
      voorbeelden: [],
      context: "",
      invoer: "[LEERLING-2] bouwde.",
    });

    expect(berichten[0]!.role).toBe("system");
    expect(berichten[0]!.content).toContain("Je bent een schrijfhulp.");
    expect(berichten[0]!.content).toContain("Zinnen: gemiddeld 14 woorden.");
  });

  it("maakt van elk voorbeeld een paar invoer en uitkomst (§12.3 blok 3)", () => {
    const berichten = naarBerichten({
      systeeminstructie: "Je bent een schrijfhulp.",
      schrijfstijl: "",
      voorbeelden: [{ invoer: "losse notitie", uitkomst: "lopende tekst" }],
      context: "",
      invoer: "[LEERLING-2] bouwde.",
    });

    expect(berichten.map((b) => b.role)).toEqual(["system", "user", "assistant", "user"]);
    expect(berichten[1]!.content).toBe("losse notitie");
    expect(berichten[2]!.content).toBe("lopende tekst");
  });

  it("zet de eigen tekst als laatste, zodat het model daarop antwoordt", () => {
    const berichten = naarBerichten({
      systeeminstructie: "Je bent een schrijfhulp.",
      schrijfstijl: "",
      voorbeelden: [],
      context: "Dit is deel 2 van de reeks.",
      invoer: "[LEERLING-2] bouwde.",
    });

    const laatste = berichten[berichten.length - 1]!;
    expect(laatste.role).toBe("user");
    expect(laatste.content).toContain("Dit is deel 2 van de reeks.");
    expect(laatste.content.endsWith("[LEERLING-2] bouwde.")).toBe(true);
  });
});

describe("de rondgang over de hele keten — INV-57", () => {
  it("levert exact de oorspronkelijke namen terug bij een antwoord dat de codes bewaart", async () => {
    const zin = "Noa B. en Noa V. werkten aan hetzelfde bouwwerk.";
    const dienst = maakDienst(stroomVan(["x"]) as unknown as typeof globalThis.fetch);

    const voorbereiding = waarde(
      await dienst.bereidVoor({ task: "doc.write", tekst: zin, leerlingen: GROEP }),
    );

    // Het model geeft de opdracht ongewijzigd terug: dan is de rondgang exact.
    expect(restore(voorbereiding.opdracht.invoer, voorbereiding.kaart)).toBe(zin);
  });
});

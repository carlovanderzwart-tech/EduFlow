/**
 * Het schrijfpad van een documentatie (§10.7, §9.4.1, INV-07, INV-08).
 *
 * Maken, bewaren en openen. Alle drie raken ze het **hele aggregaat**: een
 * documentatie en haar pagina's gaan samen de opslag in of helemaal niet. Daarom
 * staan ze bij elkaar en los van de kleine leesacties in `DocumentationService`.
 *
 * Elke functie krijgt de opslag en de klok mee in plaats van ze als afsluiting te
 * dragen. Dat is wat `createDocumentationService` onder de zestig regels van DR-53
 * bracht, en het maakt elke functie op zichzelf te lezen.
 *
 * Van de drie grenzen van INV-16 handhaaft `datumbezwaar` er twee: de zevendagen-
 * grens uit B-70 met de geïnjecteerde klok, en de grens van het oudste schooljaar in
 * de opslag. De ondergrens 2015-08-01 is absoluut en staat in het schema.
 */

import type { IsoDate } from "@/lib/dates";
import { ongeldig, type Result } from "@/lib/result";
import type { Uuid } from "@/lib/uuid";

import type { Clock, StorageService } from "../storage/StorageService";
import {
  blokkenVan,
  dagenLater,
  isFotoblok,
  isTekstblok,
  kalenderdag,
  MAX_DAGEN_VOORUIT,
  tekstbezwaar,
} from "./blokken";
import type { Documentatieinvoer, GeopendeDocumentatie } from "./DocumentationService";

/**
 * De twee grenzen van INV-16 die om iets buiten het record vragen.
 *
 * Geeft de melding uit §9.5.3 terug, niet een boolean: de service die de regel
 * kent, schrijft de tekst (§10.3).
 */
export async function datumbezwaar(
  storage: StorageService,
  clock: Clock,
  date: IsoDate,
): Promise<string | null> {
  const vandaag = kalenderdag(clock.now());
  if (date > dagenLater(vandaag, MAX_DAGEN_VOORUIT)) {
    return "Deze datum ligt meer dan een week vooruit. Je documenteert wat gebeurd is.";
  }

  const jaren = await storage.list("schoolYears");
  if (jaren.ok && jaren.value.length > 0) {
    const oudste = jaren.value.reduce(
      (vroegste, jaar) => (jaar.firstSchoolDay < vroegste ? jaar.firstSchoolDay : vroegste),
      jaren.value[0]!.firstSchoolDay,
    );

    // B-126: de ondergrens is het vroegste van tweeën. Begint je schooljaar over een
    // week, dan mag je vandaag nog steeds documenteren — dat is precies de week
    // waarin je je jaar klaarzet (F-16). INV-16 is er tegen een datum die vóór je
    // opslag ligt, niet tegen vandaag.
    const grens = oudste < vandaag ? oudste : vandaag;
    if (date < grens) {
      return "Deze datum ligt vóór het oudste schooljaar in je opslag. Kies een latere datum.";
    }
  }

  return null;
}

/**
 * Maakt een documentatie met haar eerste pagina (INV-07, INV-08, INV-22).
 *
 * INV-07: leeg openen en weggaan laat niets achter. Zonder titel, zonder tekst en
 * zonder koppeling is er geen inhoud, en dan wordt er niets geschreven.
 */
export async function maak(
  storage: StorageService,
  clock: Clock,
  invoer: Documentatieinvoer,
): Promise<Result<GeopendeDocumentatie>> {
  const title = invoer.title.trim();
  const text = invoer.text.trim();
  const photoIds = invoer.photoIds ?? [];

  // FR-DOC-01: pas een record zodra er titel, tekst, een foto of een koppeling is.
  const leeg =
    !title &&
    !text &&
    photoIds.length === 0 &&
    invoer.studentIds.length === 0 &&
    (invoer.groupIds ?? []).length === 0 &&
    !invoer.seriesId;
  if (leeg) {
    return ongeldig("Er is nog niets om op te slaan. Typ een titel of een stukje tekst.");
  }

  const grens = tekstbezwaar(text, photoIds);
  if (grens) return ongeldig(grens);

  const bezwaar = await datumbezwaar(storage, clock, invoer.date);
  if (bezwaar) return ongeldig(bezwaar);

  return storage.schrijfAggregaat("documentations", ["pages"], async (schrijver) => {
    // De sleutel van de documentatie is vooraf nodig: de pagina draagt de
    // eigendom (INV-09) en de documentatie de volgorde (§8.4). Beide bestaan
    // alleen samen, en daarom staan ze in één transactie.
    const documentationId = schrijver.sleutel();
    const pagina = await schrijver.maak("pages", {
      documentationId,
      // INV-11: de volgnummers lopen aaneengesloten vanaf 1.
      order: 1,
      // INV-22: een eerste pagina is nooit `E-vervolg`.
      layoutId: "B-verhaal",
      autoCreated: false,
      blocks: blokkenVan(text, photoIds),
    });

    const documentatie = await schrijver.maak(
      "documentations",
      {
        title,
        date: invoer.date,
        seriesId: invoer.seriesId ?? null,
        studentIds: invoer.studentIds,
        groupIds: invoer.groupIds ?? [],
        pageIds: [pagina.id],
        privateNote: (invoer.privateNote ?? "").trim(),
        // INV-15: de status is afgeleid en wordt nooit door de gebruiker gezet.
        status: "concept",
        firstExportedAt: null,
        archivedAt: null,
        imageConsentAt: null,
      },
      documentationId,
    );

    return { documentatie, paginas: [pagina] };
  });
}

/**
 * Bewaart een wijziging in het hele aggregaat (§10.7).
 *
 * De wortel wordt altijd bijgewerkt, ook als alleen de tekst op de pagina
 * wijzigde: zijn `rev` is de versie van het geheel, en daar leunt §10.8 op als
 * dezelfde documentatie in twee tabbladen open staat.
 */
export async function bewaar(
  storage: StorageService,
  clock: Clock,
  id: Uuid,
  invoer: Documentatieinvoer,
): Promise<Result<GeopendeDocumentatie>> {
  const geopend = await open(storage, id);
  if (!geopend.ok) return geopend;

  const huidig = geopend.value;
  if (!huidig) return ongeldig("Deze documentatie bestaat niet meer.");

  const bezwaar = await datumbezwaar(storage, clock, invoer.date);
  if (bezwaar) return ongeldig(bezwaar);

  const eerste = huidig.paginas[0];
  if (!eerste) throw new Error(`Documentatie ${id} heeft geen pagina; INV-08 is geschonden`);

  const text = invoer.text.trim();
  const photoIds = invoer.photoIds ?? [];

  const grens = tekstbezwaar(text, photoIds);
  if (grens) return ongeldig(grens);

  return storage.schrijfAggregaat("documentations", ["pages"], async (schrijver) => {
    // Tekst en foto's worden opnieuw opgebouwd; wat er verder op de pagina staat —
    // citaten, koppen — blijft staan zodat een latere editor het terugvindt.
    const overige = eerste.blocks.filter((blok) => !isTekstblok(blok) && !isFotoblok(blok));

    const pagina = await schrijver.wijzig("pages", eerste.id, {
      blocks: [...blokkenVan(text, photoIds), ...overige],
    });
    const documentatie = await schrijver.wijzig("documentations", id, {
      title: invoer.title.trim(),
      date: invoer.date,
      seriesId: invoer.seriesId ?? null,
      studentIds: invoer.studentIds,
      groupIds: invoer.groupIds ?? [],
      privateNote: (invoer.privateNote ?? "").trim(),
    });

    return { documentatie, paginas: [pagina, ...huidig.paginas.slice(1)] };
  });
}

/** Het hele aggregaat in één keer; het schrijfscherm laadt het volledig (§9.4.1). */
export async function open(
  storage: StorageService,
  id: Uuid,
): Promise<Result<GeopendeDocumentatie | null>> {
  const documentatie = await storage.read("documentations", id);
  if (!documentatie.ok) return documentatie;
  if (!documentatie.value) return { ok: true, value: null };

  const alle = await storage.list("pages");
  if (!alle.ok) return alle;

  const paginas = alle.value
    .filter((pagina) => pagina.documentationId === id)
    .sort((a, b) => a.order - b.order);

  return { ok: true, value: { documentatie: documentatie.value, paginas } };
}

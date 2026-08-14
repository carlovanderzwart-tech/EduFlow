"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { leesBeeld } from "@/lib/doek";
import type { Uuid } from "@/lib/uuid";
import { diensten, type Diensten } from "@/services/diensten";
import type { Exportinhoud, Exportplan } from "@/services/documentation/LayoutService";
import type { Beeld } from "@/services/render/doek";
import { initialenkaart, vervangNamen } from "@/services/render/initialen";
import { bestandsnaam } from "@/services/render/RenderService";

/** Eén klaargemaakte pagina: het bestand zoals het verstuurd wordt (§5.12). */
export interface Exportpagina {
  nummer: number;
  bestand: File;
  /** Om te tonen; het is exact dezelfde afbeelding als het bestand (FR-DOC-113). */
  url: string;
}

export interface Exportstand {
  bezig: boolean;
  fout: string | null;
  plan: Exportplan | null;
  paginas: Exportpagina[];
  /** Waar de documentatie nu staat; het paneel meldt de overgang na het delen. */
  gedeeld: boolean;
  toestemmingGegeven: boolean;
}

const LEEG: Exportstand = {
  bezig: true,
  fout: null,
  plan: null,
  paginas: [],
  gedeeld: false,
  toestemmingGegeven: false,
};

/**
 * Alles wat het exportpaneel nodig heeft (D08, §5.12).
 *
 * **Het voorbeeld ís het bestand** (`FR-DOC-113`, DoD-punt 2). Er wordt één keer
 * gerenderd, op ware grootte, en die uitkomst wordt zowel getoond als verstuurd.
 * Een voorbeeld dat apart wordt getekend kan uit de pas lopen met wat er in de mail
 * belandt; deze kan dat niet, want het is hetzelfde bestand.
 *
 * Dat kost bij elke wijziging een render van 2480 px. Dat is de prijs voor een eis
 * die anders niet te bewijzen is, en bij twintig foto's is het een paar honderd
 * milliseconden — merkbaar, maar niet in de weg.
 */
export function useExport(documentId: string, initialen: boolean, open: boolean) {
  const [stand, setStand] = useState<Exportstand>(LEEG);
  const [ronde, setRonde] = useState(0);

  /** De adressen van de vorige ronde, zodat het geheugen niet volloopt. */
  const vorigeUrls = useRef<string[]>([]);

  // Dezelfde vorm als `useDienst`: het werk staat in een gesloten functie in het
  // effect, met een merker die het laat zwijgen als het paneel al dicht is. Een
  // render die na het sluiten binnenkomt zet anders stand op een dood scherm.
  //
  // `open` staat in de afhankelijkheden en dat is geen detail. Het paneel hangt in
  // de boom zodra de documentatie een sleutel heeft, dus zonder deze regel wordt er
  // gerenderd op het moment van *ophangen* en niet op het moment van *openen* — en
  // dan zie je de documentatie zoals hij was voordat je je tekst typte. Het scheelt
  // bovendien een doek van 2480 px voor een paneel dat dicht is.
  useEffect(() => {
    if (!open) return;
    let actief = true;

    void (async () => {
      const alles = await diensten();
      if (!actief) return;
      setStand((huidig) => ({ ...huidig, bezig: true, fout: null }));

      const verzameld = await verzamel(alles, documentId, initialen);
      if (!actief) return;
      if (!verzameld) {
        setStand({ ...LEEG, bezig: false, fout: "Deze documentatie kon niet worden gelezen." });
        return;
      }

      const plan = alles.layout.plan(verzameld.inhoud);
      const paginas = await maakPaginas(alles, plan, verzameld);
      if (!actief) {
        for (const pagina of paginas) URL.revokeObjectURL(pagina.url);
        return;
      }

      for (const url of vorigeUrls.current) URL.revokeObjectURL(url);
      vorigeUrls.current = paginas.map((pagina) => pagina.url);

      setStand({
        bezig: false,
        fout: null,
        plan,
        paginas,
        gedeeld: verzameld.status === "gedeeld",
        toestemmingGegeven: verzameld.toestemming,
      });
    })();

    return () => {
      actief = false;
    };
  }, [documentId, initialen, ronde, open]);

  // De laatste ronde opruimen bij het sluiten van het paneel.
  useEffect(
    () => () => {
      for (const url of vorigeUrls.current) URL.revokeObjectURL(url);
    },
    [],
  );

  /** Opnieuw bouwen gebeurt door de teller te verhogen, net als in `useDienst`. */
  const herbouw = useCallback(() => setRonde((vorig) => vorig + 1), []);

  return { stand, setStand, herbouw };
}

interface Verzameld {
  inhoud: Exportinhoud;
  beelden: ReadonlyMap<string, Beeld>;
  status: string;
  toestemming: boolean;
}

/** Zet de documentatie om in wat de layout nodig heeft, met de namen erbij. */
async function verzamel(
  alles: Diensten,
  documentId: string,
  initialen: boolean,
): Promise<Verzameld | null> {
  const { documentation, photos, students, groups, series } = alles;

  const geopend = await documentation.open(documentId);
  if (!geopend.ok || !geopend.value) return null;

  const [leerlingen, groepen, reeksen] = await Promise.all([
    students.lijst(),
    groups.lijst(),
    series.lijst(),
  ]);
  if (!leerlingen.ok || !groepen.ok || !reeksen.ok) return null;

  const { documentatie } = geopend.value;

  // De roepnaam met de achternaamletter erachter, zoals hij ook in de tekst staat:
  // "Noa B." Zonder die letter zijn twee Noa's niet uit elkaar te houden.
  const namen = documentatie.studentIds
    .map((id) => leerlingen.value.find((leerling) => leerling.id === id))
    .filter((leerling) => leerling !== undefined)
    .map((leerling) =>
      [leerling.firstName, leerling.lastNameInitial ? `${leerling.lastNameInitial}.` : ""]
        .filter(Boolean)
        .join(" "),
    );

  const kaart = initialenkaart(namen);
  const vervang = (tekst: string) => (initialen ? vervangNamen(tekst, kaart) : tekst);
  const photoIds = documentation.fotosVan(geopend.value);

  return {
    inhoud: {
      titel: vervang(documentatie.title),
      reeks: reeksen.value.find((reeks) => reeks.id === documentatie.seriesId)?.name ?? "",
      datum: documentatie.date,
      tekst: vervang(documentation.tekstVan(geopend.value)),
      fotos: photoIds.map((photoId) => ({ photoId, bijschrift: "" })),
      groep: documentatie.groupIds
        .map((id) => groepen.value.find((groep) => groep.id === id)?.name)
        .filter(Boolean)
        .join(", "),
      legenda: initialen ? kaart.legenda : "",
    },
    beelden: await leesBeelden(photoIds, photos.blobVan),
    status: documentatie.status,
    toestemming: documentatie.imageConsentAt !== null,
  };
}

/** Elke pagina één keer renderen; wat je ziet is wat je verstuurt (FR-DOC-113). */
async function maakPaginas(
  alles: Diensten,
  plan: Exportplan,
  verzameld: Verzameld,
): Promise<Exportpagina[]> {
  return Promise.all(
    plan.paginas.map(async (pagina) => {
      const blob = await alles.render.jpeg({ plan: pagina, beelden: verzameld.beelden });
      const naam = bestandsnaam(
        verzameld.inhoud.datum,
        verzameld.inhoud.titel,
        pagina.nummer,
        plan.paginas.length,
      );
      return {
        nummer: pagina.nummer,
        bestand: new File([blob], naam, { type: "image/jpeg" }),
        url: URL.createObjectURL(blob),
      };
    }),
  );
}

/** De foto's als tekenbare bronnen. Een foto die ontbreekt laat zijn slot leeg. */
async function leesBeelden(
  photoIds: readonly Uuid[],
  blobVan: (id: Uuid) => Promise<{ ok: boolean; value?: Blob | null }>,
): Promise<ReadonlyMap<string, Beeld>> {
  const beelden = new Map<string, Beeld>();
  for (const photoId of photoIds) {
    const blob = await blobVan(photoId);
    if (!blob.ok || !blob.value) continue;
    beelden.set(photoId, await leesBeeld(blob.value));
  }
  return beelden;
}

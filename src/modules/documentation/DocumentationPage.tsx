"use client";

import { NotebookPen, Plus, SearchX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { EmptyState } from "@/ui/EmptyState";
import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/ui/item";
import { Skeleton } from "@/ui/skeleton";
import { useDienst } from "@/app/providers/useDienst";
import { datumKort } from "@/lib/weergave";
import { diensten, type Diensten } from "@/services/diensten";
import type { Sortering, Treffer } from "@/services/search/SearchService";

import { FilterBar, LEGE_STAND, type Zoekstand } from "./FilterBar";

/** FR-DOC-14: in blokken van vijftig, met een knop — geen oneindig scrollen. */
const BLOK = 50;

/**
 * Het overzicht van documentaties (§6.1.2, F-15).
 *
 * **Zoeken loopt via de index in het geheugen** (T-09). Rechtstreeks over IndexedDB
 * zoeken werkt tot ongeveer honderd documentaties en wordt daarna traag op een
 * manier die je pas in maart merkt.
 *
 * **De sortering staat standaard op de inhoudelijke datum** (FR-DOC-11) en de keuze
 * wordt onthouden in `localStorage` (FR-DOC-12, T-01). Wat de gebruiker met
 * "wanneer was dat" bedoelt is de dag waarop het gebeurde, niet het moment waarop
 * hij er een typefout uit haalde.
 *
 * **Laden in blokken van vijftig met een knop** (FR-DOC-14). Geen oneindig
 * scrollen: dat maakt de voettekst onbereikbaar en je positie onthoudbaar.
 */
export function DocumentationPage() {
  const router = useRouter();
  const [stand, setStand] = useState<Zoekstand>(LEGE_STAND);
  const [getoond, setGetoond] = useState(BLOK);

  const laad = useCallback(async ({ search, series, groups, students, agenda, settings }: Diensten) => {
    const gevuld = await search.vul();
    if (!gevuld.ok) return gevuld;

    const reeksen = await series.lijst();
    if (!reeksen.ok) return reeksen;
    const groepen = await groups.lijst();
    if (!groepen.ok) return groepen;
    const leerlingen = await students.lijst();
    if (!leerlingen.ok) return leerlingen;
    const jaar = await agenda.huidigSchooljaar();
    if (!jaar.ok) return jaar;

    return {
      ok: true as const,
      value: {
        reeksen: reeksen.value,
        groepen: groepen.value,
        leerlingen: leerlingen.value,
        schooljaarVan: jaar.value?.firstSchoolDay ?? null,
        // De laatst gekozen sortering staat in `localStorage` (§8.2.2, T-01).
        onthouden: (settings.voorkeur("lastView").view === "bewerkt" ? "bewerkt" : "datum") as Sortering,
        zoek: search.zoek,
      },
    };
  }, []);

  const { waarde, fout, bezig } = useDienst(laad);

  // FR-DOC-12: zolang de gebruiker niets koos, geldt wat er onthouden is. Afgeleid
  // en niet in de toestand gekopieerd, want dat zou een effect vragen dat tijdens
  // het renderen nog een keer `setState` doet.
  const sortering: Sortering = stand.sortering ?? waarde?.onthouden ?? "datum";

  function wijzig(nieuw: Zoekstand) {
    setStand(nieuw);
    // Terug naar het eerste blok: anders staat er "meer laden" onder een lijst die
    // door het nieuwe filter al helemaal past.
    setGetoond(BLOK);

    void (async () => {
      const { settings } = await diensten();
      // Alleen onthouden wat de gebruiker zélf koos; `null` is "nog niets gekozen".
      if (nieuw.sortering) {
        settings.zetVoorkeur("lastView", { module: "documentaties", view: nieuw.sortering });
      }
    })();
  }

  if (fout) {
    return (
      <div className="mx-auto max-w-5xl p-4 md:p-6">
        <ErrorMessage message={fout.message} nextStep="Vernieuw de pagina." />
      </div>
    );
  }

  if (bezig && !waarde) {
    return (
      <div className="mx-auto max-w-5xl space-y-2 p-4 md:p-6">
        <Skeleton className="h-24" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  const treffers: Treffer[] = waarde ? waarde.zoek(stand.term, stand.filters, sortering) : [];
  const zichtbaar = treffers.slice(0, getoond);
  const zoektIets = stand.term !== "" || Object.keys(stand.filters).length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
      <div className="flex justify-end">
        <Button onClick={() => router.push("/documentation/nieuw")}>
          <Plus aria-hidden="true" />
          Nieuwe documentatie
        </Button>
      </div>

      {waarde ? (
        <FilterBar
          stand={{ ...stand, sortering }}
          reeksen={waarde.reeksen}
          groepen={waarde.groepen}
          leerlingen={waarde.leerlingen}
          schooljaarVan={waarde.schooljaarVan}
          onWijzig={wijzig}
        />
      ) : null}

      {/* §4.6: een lege toestand zegt wat je nú kunt doen, niet "geen resultaten". */}
      {treffers.length === 0 && !zoektIets ? (
        <EmptyState
          icon={NotebookPen}
          title="Nog geen documentaties"
          description="Leg vast wat er vandaag gebeurde. Een titel en een paar regels zijn genoeg om te beginnen."
          action={{ label: "Nieuwe documentatie", onClick: () => router.push("/documentation/nieuw") }}
        />
      ) : null}

      {treffers.length === 0 && zoektIets ? (
        <EmptyState
          icon={SearchX}
          title="Niets gevonden met deze zoekopdracht"
          description="Probeer één woord in plaats van twee, of zet een filter uit. De notitie voor jezelf wordt niet doorzocht."
          action={{ label: "Alles wissen", onClick: () => wijzig(LEGE_STAND) }}
        />
      ) : null}

      {treffers.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            {treffers.length === 1 ? "Eén documentatie" : `${treffers.length} documentaties`}
          </p>

          <ul className="space-y-2">
            {zichtbaar.map(({ documentatie, fragment }) => (
              <li key={documentatie.id}>
                <Item variant="outline" className="relative">
                  <ItemContent>
                    <ItemTitle>
                      <Link
                        href={`/documentation/${documentatie.id}`}
                        className="after:absolute after:inset-0 after:content-['']"
                      >
                        {documentatie.title || "Zonder titel"}
                      </Link>
                    </ItemTitle>
                    <ItemDescription>
                      {datumKort(documentatie.date)}
                      {documentatie.studentIds.length > 0
                        ? ` · ${documentatie.studentIds.length} leerling${documentatie.studentIds.length === 1 ? "" : "en"}`
                        : ""}
                      {documentatie.status === "gedeeld" ? " · gedeeld" : ""}
                    </ItemDescription>
                    {fragment ? (
                      <ItemDescription className="italic">{fragment}</ItemDescription>
                    ) : null}
                  </ItemContent>
                </Item>
              </li>
            ))}
          </ul>

          {getoond < treffers.length ? (
            <Button variant="outline" onClick={() => setGetoond((nu) => nu + BLOK)}>
              Meer laden ({treffers.length - getoond} te gaan)
            </Button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

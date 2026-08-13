"use client";

import { X } from "lucide-react";

import { SearchField } from "@/ui/SearchField";
import { Button } from "@/ui/button";
import { Field, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { NativeSelect, NativeSelectOption } from "@/ui/native-select";
import type { Group, Series, Student } from "@/domain/types";
import type { Filters, Sortering } from "@/services/search/SearchService";
import { weergavenaam } from "@/services/students/StudentService";

export interface Zoekstand {
  term: string;
  filters: Filters;
  /**
   * `null` betekent: de gebruiker heeft nog niets gekozen, dus geldt wat er in
   * `localStorage` is onthouden (FR-DOC-12). Zo hoeft de onthouden waarde niet in
   * de toestand gekopieerd te worden zodra hij binnenkomt.
   */
  sortering: Sortering | null;
}

export const LEGE_STAND: Zoekstand = { term: "", filters: {}, sortering: null };

/**
 * De filterbalk (FR-DOC-25, FR-DOC-26, FR-DOC-28).
 *
 * **Binnen een filter geldt *of*, tussen filters geldt *en*** (FR-DOC-25). Twee
 * reeksen aanvinken geeft de som, een reeks plus een periode de doorsnede. Die
 * regel staat in `SearchService` en niet hier: dit scherm verzamelt keuzes en
 * bedenkt er niets bij (DR-15).
 *
 * De drie snelkeuzes bij Periode zijn wat FR-DOC-26 vraagt naast de vrije range.
 * Ze zetten alleen de twee datumvelden; er is geen aparte "periode-modus" die
 * onthouden moet worden.
 */
export function FilterBar({
  stand,
  reeksen,
  groepen,
  leerlingen,
  schooljaarVan,
  onWijzig,
}: {
  stand: Zoekstand;
  reeksen: Series[];
  groepen: Group[];
  leerlingen: Student[];
  schooljaarVan: string | null;
  onWijzig: (stand: Zoekstand) => void;
}) {
  function zetFilter(deel: Partial<Filters>) {
    onWijzig({ ...stand, filters: { ...stand.filters, ...deel } });
  }

  /** Eén waarde of geen: een keuzelijst drukt "of" uit met meerdere selecties. */
  function alsLijst(waarde: string): string[] | undefined {
    return waarde ? [waarde] : undefined;
  }

  const heeftIets =
    stand.term !== "" ||
    Object.values(stand.filters).some((waarde) =>
      Array.isArray(waarde) ? waarde.length > 0 : Boolean(waarde),
    );

  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      <SearchField
        value={stand.term}
        onValueChange={(term) => onWijzig({ ...stand, term })}
        label="Zoeken in documentaties"
        placeholder="Zoek in titels, teksten, citaten en namen"
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field>
          <FieldLabel htmlFor="filter-reeks">Reeks</FieldLabel>
          <NativeSelect
            id="filter-reeks"
            value={stand.filters.seriesIds?.[0] ?? ""}
            onChange={(g) => zetFilter({ seriesIds: alsLijst(g.target.value) })}
          >
            <NativeSelectOption value="">Alle reeksen</NativeSelectOption>
            {reeksen.map((reeks) => (
              <NativeSelectOption key={reeks.id} value={reeks.id}>
                {reeks.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>

        <Field>
          <FieldLabel htmlFor="filter-groep">Groep</FieldLabel>
          <NativeSelect
            id="filter-groep"
            value={stand.filters.groupIds?.[0] ?? ""}
            onChange={(g) => zetFilter({ groupIds: alsLijst(g.target.value) })}
          >
            <NativeSelectOption value="">Alle groepen</NativeSelectOption>
            {groepen.map((groep) => (
              <NativeSelectOption key={groep.id} value={groep.id}>
                {groep.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>

        <Field>
          <FieldLabel htmlFor="filter-leerling">Leerling</FieldLabel>
          <NativeSelect
            id="filter-leerling"
            value={stand.filters.studentIds?.[0] ?? ""}
            onChange={(g) => zetFilter({ studentIds: alsLijst(g.target.value) })}
          >
            <NativeSelectOption value="">Alle leerlingen</NativeSelectOption>
            {leerlingen.map((kind) => (
              <NativeSelectOption key={kind.id} value={kind.id}>
                {weergavenaam(kind)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>

        <Field>
          <FieldLabel htmlFor="filter-status">Status</FieldLabel>
          <NativeSelect
            id="filter-status"
            value={stand.filters.status?.[0] ?? ""}
            onChange={(g) =>
              zetFilter({ status: g.target.value ? [g.target.value as "concept" | "gedeeld"] : undefined })
            }
          >
            <NativeSelectOption value="">Alle</NativeSelectOption>
            <NativeSelectOption value="concept">Concept</NativeSelectOption>
            <NativeSelectOption value="gedeeld">Gedeeld</NativeSelectOption>
          </NativeSelect>
        </Field>

        <Field>
          <FieldLabel htmlFor="filter-van">Van</FieldLabel>
          <Input
            id="filter-van"
            type="date"
            value={stand.filters.van ?? ""}
            onChange={(g) => zetFilter({ van: g.target.value || undefined })}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="filter-tot">Tot en met</FieldLabel>
          <Input
            id="filter-tot"
            type="date"
            value={stand.filters.tot ?? ""}
            onChange={(g) => zetFilter({ tot: g.target.value || undefined })}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Periode:</span>
        <Button variant="outline" size="sm" onClick={() => zetFilter(laatsteDagen(7))}>
          Deze week
        </Button>
        <Button variant="outline" size="sm" onClick={() => zetFilter(laatsteDagen(30))}>
          Deze maand
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!schooljaarVan}
          onClick={() => zetFilter({ van: schooljaarVan ?? undefined, tot: undefined })}
        >
          Dit schooljaar
        </Button>

        <NativeSelect
          aria-label="Sorteren"
          className="ml-auto w-44"
          value={stand.sortering ?? "datum"}
          onChange={(g) => onWijzig({ ...stand, sortering: g.target.value as Sortering })}
        >
          <NativeSelectOption value="datum">Op datum</NativeSelectOption>
          <NativeSelectOption value="bewerkt">Laatst bewerkt</NativeSelectOption>
        </NativeSelect>

        {heeftIets ? (
          <Button variant="ghost" size="sm" onClick={() => onWijzig(LEGE_STAND)}>
            <X aria-hidden="true" />
            Alles wissen
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/** De twee snelkeuzes die geen schooljaar nodig hebben. */
function laatsteDagen(dagen: number): Pick<Filters, "van" | "tot"> {
  const eind = new Date();
  const begin = new Date();
  begin.setDate(begin.getDate() - dagen);
  const alsDag = (moment: Date) => moment.toISOString().slice(0, 10);
  return { van: alsDag(begin), tot: alsDag(eind) };
}

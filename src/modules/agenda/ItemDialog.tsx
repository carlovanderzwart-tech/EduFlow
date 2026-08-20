"use client";

import { useState } from "react";

import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { NativeSelect, NativeSelectOption } from "@/ui/native-select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/ui/sheet";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";
import type { IsoDate } from "@/lib/dates";
import {
  naarLokaleInvoer,
  opDag,
  plusMinuten,
  vandaag,
  vanLokaleInvoer,
  volgendHalfUur,
} from "@/lib/weergave";
import type { CalendarEvent, Recurrence, Student } from "@/domain/types";
import {
  EIGEN_SOORTEN,
  HELE_DAG_STANDAARD,
  SOORTNAMEN,
  type EigenSoort,
} from "@/services/agenda/AgendaService";
import {
  isVerschijning,
  reeksVan,
  type Reikwijdte,
} from "@/services/agenda/RecurrenceService";
import { diensten } from "@/services/diensten";

import { Herhaalvelden } from "./Herhaalvelden";

/**
 * Eén item maken of wijzigen (§6.2.5, `FR-AGE-04`, `FR-AGE-16`).
 *
 * Zes soorten, want `verjaardag` wordt afgeleid en `vakantie` komt uit het bestand
 * (§6.2.2, kolom Bron). Het oudergesprek verplicht **precies één** leerling en zegt
 * dat ook, want het gesprek gaat over één kind en de koppeling stuurt de mail.
 *
 * **De eindtijd schuift mee** in plaats van ongeldig te worden (`FR-AGE-03`). Wie
 * een begintijd naar later zet, bedoelt zelden dat het item negatief lang wordt.
 */
interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Het item dat wordt gewijzigd, of `null` voor een nieuw item. */
  item: CalendarEvent | null;
  /** De dag waarop een nieuw item begint. */
  dag: IsoDate;
  leerlingen: readonly Student[];
  onKlaar: () => void;
}

/** De beginwaarden: die van het item, of die van een leeg formulier op deze dag. */
function beginstand(item: CalendarEvent | null, dag: IsoDate) {
  if (!item) {
    // Het eerstvolgende halve uur, maar dan op de dag die je bekijkt. Anders maak
    // je vanuit de week van september een afspraak die vandaag blijkt te staan.
    const van = opDag(dag, volgendHalfUur());
    return {
      kind: "afspraak" as EigenSoort,
      title: "",
      note: "",
      location: "",
      heleDag: HELE_DAG_STANDAARD.afspraak,
      dagVan: dag,
      dagTot: dag,
      van,
      tot: plusMinuten(van, 30),
      studentId: "",
      recurrence: null as Recurrence | null,
    };
  }

  return {
    kind: item.kind as EigenSoort,
    title: item.title,
    note: item.note,
    location: item.location,
    heleDag: item.allDay,
    dagVan: item.allDay ? item.start : dag,
    dagTot: item.allDay ? item.end : dag,
    van: item.allDay ? opDag(dag, volgendHalfUur()) : item.start,
    tot: item.allDay ? plusMinuten(opDag(dag, volgendHalfUur()), 30) : item.end,
    studentId: item.studentIds[0] ?? "",
    recurrence: item.recurrence,
  };
}

export function ItemDialog({ open, onOpenChange, item, dag, leerlingen, onKlaar }: ItemDialogProps) {
  const [stand, setStand] = useState(() => beginstand(item, dag));
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const [vraagReikwijdte, setVraagReikwijdte] = useState(false);

  function wijzig(deel: Partial<typeof stand>) {
    setStand((huidig) => ({ ...huidig, ...deel }));
  }

  /** De soort bepaalt of het standaard een hele dag is (§6.2.2, kolom "Hele dag"). */
  function kiesSoort(nieuw: EigenSoort) {
    wijzig({ kind: nieuw, heleDag: HELE_DAG_STANDAARD[nieuw] });
  }

  /** Wat er wordt opgeslagen, in de vorm die `AgendaService` verwacht (INV-31). */
  function invoerVan() {
    const gemeenschappelijk = {
      title: stand.title,
      kind: stand.kind,
      note: stand.note,
      location: stand.location,
      studentIds: stand.studentId ? [stand.studentId] : [],
      recurrence: stand.recurrence,
    };

    return stand.heleDag
      ? ({ ...gemeenschappelijk, allDay: true, start: stand.dagVan, end: stand.dagTot } as const)
      : ({ ...gemeenschappelijk, allDay: false, start: stand.van, end: stand.tot } as const);
  }

  /**
   * Hoort dit item bij een reeks?
   *
   * Twee gevallen: het opgeslagen record met de regel erop, of een uitgerekende
   * verschijning ervan. Beide vragen om de reikwijdtevraag van `FR-AGE-15`.
   */
  const uitReeks = Boolean(item && (item.recurrence || isVerschijning(item.id)));

  async function bewaar(reikwijdte?: Reikwijdte) {
    setBezig(true);
    setFout(null);

    const { agenda } = await diensten();
    const invoer = invoerVan();

    const uitkomst =
      item && reikwijdte
        ? await agenda.wijzigReeks(reeksVan(item.id), dagVan(item), reikwijdte, invoer)
        : item
          ? await agenda.wijzig(item.id, invoer)
          : await agenda.maak(invoer);
    setBezig(false);

    if (!uitkomst.ok) return setFout(uitkomst.error.message);
    onKlaar();
  }

  function begin() {
    // FR-AGE-15: bij een reeks eerst de vraag, met "Alleen deze" als voorselectie.
    if (uitReeks) setVraagReikwijdte(true);
    else void bewaar();
  }

  async function verwijder() {
    if (!item) return;
    const { agenda } = await diensten();
    const uitkomst = await agenda.verwijder(item.id);
    if (!uitkomst.ok) return setFout(uitkomst.error.message);
    onKlaar();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-(--size-panel) gap-0 overflow-y-auto sm:max-w-(--size-panel)">
        <SheetHeader>
          <SheetTitle>{item ? "Item wijzigen" : "Nieuw item"}</SheetTitle>
          <SheetDescription>Wat er in je agenda staat, staat alleen op dit apparaat.</SheetDescription>
        </SheetHeader>

        <form
          className="space-y-4 px-4 pb-6"
          onSubmit={(gebeurtenis) => {
            gebeurtenis.preventDefault();
            begin();
          }}
        >
          <Field>
            <FieldLabel htmlFor="soort">Soort</FieldLabel>
            <NativeSelect
              id="soort"
              value={stand.kind}
              onChange={(gebeurtenis) => kiesSoort(gebeurtenis.target.value as EigenSoort)}
            >
              {EIGEN_SOORTEN.map((soort) => (
                <NativeSelectOption key={soort} value={soort}>
                  {SOORTNAMEN[soort]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>

          <Field>
            <FieldLabel htmlFor="item-titel">Titel</FieldLabel>
            <Input
              id="item-titel"
              value={stand.title}
              maxLength={120}
              autoComplete="off"
              onChange={(gebeurtenis) => wijzig({ title: gebeurtenis.target.value })}
            />
          </Field>

          {stand.kind === "oudergesprek" ? (
            <Leerlingkeuze
              waarde={stand.studentId}
              leerlingen={leerlingen}
              onWijzig={(studentId) => wijzig({ studentId })}
            />
          ) : null}

          <Field orientation="horizontal">
            <Switch
              id="hele-dag"
              checked={stand.heleDag}
              onCheckedChange={(heleDag) => wijzig({ heleDag })}
            />
            <Label htmlFor="hele-dag">Hele dag</Label>
          </Field>

          {stand.heleDag ? (
            <Dagvelden stand={stand} onWijzig={wijzig} />
          ) : (
            <Tijdvelden stand={stand} onWijzig={wijzig} />
          )}

          <Herhaalvelden
            waarde={stand.recurrence}
            begin={stand.heleDag ? stand.dagVan : stand.van.slice(0, 10)}
            onWijzig={(recurrence) => wijzig({ recurrence })}
          />

          <Field>
            <FieldLabel htmlFor="item-notitie">Notitie</FieldLabel>
            <Textarea
              id="item-notitie"
              rows={3}
              maxLength={2_000}
              value={stand.note}
              onChange={(gebeurtenis) => wijzig({ note: gebeurtenis.target.value })}
            />
          </Field>

          {fout ? <ErrorMessage message={fout} nextStep="Pas het aan en probeer het opnieuw." /> : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={bezig || !stand.title.trim()}>
              Opslaan
            </Button>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            {item ? (
              <Button type="button" variant="ghost" className="ms-auto" onClick={() => void verwijder()}>
                Verwijderen
              </Button>
            ) : null}
          </div>
        </form>

        {vraagReikwijdte ? (
          <Reikwijdtevraag
            onKies={(reikwijdte) => {
              setVraagReikwijdte(false);
              void bewaar(reikwijdte);
            }}
            onAfbreken={() => setVraagReikwijdte(false)}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

/**
 * "Alleen deze, of alle volgende?" (`FR-AGE-15`).
 *
 * **"Alleen deze" staat voorgeselecteerd** en staat daarom eerst. Dat is wat de eis
 * vraagt, en het is de veilige kant: één dag verzetten is terug te draaien, een hele
 * reeks omgooien is dat veel minder.
 */
function Reikwijdtevraag({
  onKies,
  onAfbreken,
}: {
  onKies: (reikwijdte: Reikwijdte) => void;
  onAfbreken: () => void;
}) {
  return (
    <div className="bg-background border-t px-4 py-3">
      <p className="pb-2 text-sm font-medium">Dit item hoort bij een herhaling.</p>
      <p className="text-muted-foreground pb-3 text-sm">Alleen deze, of alle volgende?</p>
      <div className="flex flex-wrap gap-2">
        <Button autoFocus onClick={() => onKies("deze")}>
          Alleen deze
        </Button>
        <Button variant="outline" onClick={() => onKies("volgende")}>
          Alle volgende
        </Button>
        <Button variant="ghost" onClick={onAfbreken}>
          Annuleren
        </Button>
      </div>
    </div>
  );
}

/** De dag waarop deze verschijning valt; die bepaalt waar de reeks wordt geknipt. */
function dagVan(item: CalendarEvent): IsoDate {
  return item.allDay ? item.start : vandaag(new Date(item.start));
}

/** `FR-AGE-04`: precies één leerling, en het scherm zegt waarom. */
function Leerlingkeuze({
  waarde,
  leerlingen,
  onWijzig,
}: {
  waarde: string;
  leerlingen: readonly Student[];
  onWijzig: (studentId: string) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor="leerling">Leerling</FieldLabel>
      <FieldDescription>
        Een oudergesprek gaat over precies één kind. De koppeling gebruikt dat straks voor de mail.
      </FieldDescription>
      <NativeSelect
        id="leerling"
        value={waarde}
        onChange={(gebeurtenis) => onWijzig(gebeurtenis.target.value)}
      >
        <NativeSelectOption value="">Kies een leerling</NativeSelectOption>
        {leerlingen.map((leerling) => (
          <NativeSelectOption key={leerling.id} value={leerling.id}>
            {[leerling.firstName, leerling.lastNameInitial].filter(Boolean).join(" ")}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {leerlingen.length === 0 ? (
        <FieldDescription>
          Je hebt nog geen leerlingen. Voeg ze toe bij Instellingen.
        </FieldDescription>
      ) : null}
    </Field>
  );
}

type Stand = ReturnType<typeof beginstand>;

function Dagvelden({ stand, onWijzig }: { stand: Stand; onWijzig: (deel: Partial<Stand>) => void }) {
  return (
    <div className="flex flex-wrap gap-4">
      <Field className="w-40">
        <FieldLabel htmlFor="dag-van">Van</FieldLabel>
        <Input
          id="dag-van"
          type="date"
          value={stand.dagVan}
          onChange={(gebeurtenis) => {
            const dagVan = gebeurtenis.target.value;
            // FR-AGE-03: het einde schuift mee in plaats van ongeldig te worden.
            onWijzig({ dagVan, ...(dagVan > stand.dagTot ? { dagTot: dagVan } : {}) });
          }}
        />
      </Field>
      <Field className="w-40">
        <FieldLabel htmlFor="dag-tot">Tot en met</FieldLabel>
        <Input
          id="dag-tot"
          type="date"
          value={stand.dagTot}
          onChange={(gebeurtenis) => onWijzig({ dagTot: gebeurtenis.target.value })}
        />
      </Field>
    </div>
  );
}

function Tijdvelden({ stand, onWijzig }: { stand: Stand; onWijzig: (deel: Partial<Stand>) => void }) {
  return (
    <div className="flex flex-wrap gap-4">
      <Field className="w-52">
        <FieldLabel htmlFor="tijd-van">Van</FieldLabel>
        <Input
          id="tijd-van"
          type="datetime-local"
          value={naarLokaleInvoer(stand.van)}
          onChange={(gebeurtenis) => {
            const van = vanLokaleInvoer(gebeurtenis.target.value);
            if (!van) return;
            // FR-AGE-03: de eindtijd schuift mee met de oorspronkelijke duur.
            onWijzig({ van, ...(van > stand.tot ? { tot: plusMinuten(van, 30) } : {}) });
          }}
        />
      </Field>
      <Field className="w-52">
        <FieldLabel htmlFor="tijd-tot">Tot</FieldLabel>
        <Input
          id="tijd-tot"
          type="datetime-local"
          value={naarLokaleInvoer(stand.tot)}
          onChange={(gebeurtenis) => {
            const tot = vanLokaleInvoer(gebeurtenis.target.value);
            if (tot) onWijzig({ tot });
          }}
        />
      </Field>
    </div>
  );
}

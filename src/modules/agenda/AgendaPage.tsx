"use client";

import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

import { EmptyState } from "@/ui/EmptyState";
import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/ui/item";
import { Label } from "@/ui/label";
import { NativeSelect, NativeSelectOption } from "@/ui/native-select";
import { Skeleton } from "@/ui/skeleton";
import { Switch } from "@/ui/switch";
import { useDienst } from "@/app/providers/useDienst";
import {
  datumKort,
  naarLokaleInvoer,
  plusMinuten,
  tijdstipKort,
  vandaag,
  vanLokaleInvoer,
  volgendHalfUur,
} from "@/lib/weergave";
import type { CalendarEvent } from "@/domain/types";
import {
  EIGEN_SOORTEN,
  HELE_DAG_STANDAARD,
  SOORTNAMEN,
  type EigenSoort,
} from "@/services/agenda/AgendaService";
import { diensten, type Diensten } from "@/services/diensten";

/**
 * De agenda (§6.2).
 *
 * Eén lijst en één formulier. De vier weergaven van FR-AGE-01 — jaar, maand, week,
 * dag — komen later, net als het snelveld (FR-AGE-13), slepen, de vakantiedata en de
 * basisweek (§6.2.11). Een lijst die werkt is meer waard dan vier weergaven die nog
 * niets tonen.
 *
 * De soortenlijst komt uit `AgendaService`: `verjaardag` en `vakantie` zitten er niet
 * in, want de eerste wordt afgeleid uit de leerlingenlijst (FR-AGE-05) en de tweede
 * komt uit het vakantiebestand (§6.2.2).
 */
export function AgendaPage() {
  const [open, setOpen] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const laad = useCallback(({ agenda }: Diensten) => agenda.lijst(), []);
  const { waarde: items, fout: laadfout, bezig, herlaad } = useDienst(laad);

  async function verwijder(id: string) {
    const { agenda } = await diensten();
    const uitkomst = await agenda.verwijder(id);
    if (!uitkomst.ok) {
      setFout(uitkomst.error.message);
      return;
    }
    herlaad();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      {open ? (
        <NieuwItem
          onKlaar={() => {
            setOpen(false);
            herlaad();
          }}
          onAfbreken={() => setOpen(false)}
        />
      ) : (
        <div className="flex justify-end">
          <Button onClick={() => setOpen(true)}>
            <Plus aria-hidden="true" />
            Nieuw item
          </Button>
        </div>
      )}

      {fout ? <ErrorMessage message={fout} nextStep="Probeer het opnieuw." /> : null}
      {laadfout ? (
        <ErrorMessage message={laadfout.message} nextStep="Vernieuw de pagina." />
      ) : null}

      {bezig && !items ? <Skeleton className="h-20" /> : null}

      {items && items.length === 0 && !open ? (
        <EmptyState
          icon={CalendarDays}
          title="Nog niets in je agenda"
          description="Zet je studiedagen, oudergesprekken en afspraken hier neer, zodat je ze naast je documentaties ziet."
          action={{ label: "Nieuw item", onClick: () => setOpen(true) }}
        />
      ) : null}

      {items && items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Item variant="outline">
                <ItemContent>
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemDescription>{wanneer(item)}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`${item.title} verwijderen`}
                    onClick={() => void verwijder(item.id)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </ItemActions>
              </Item>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Wanneer een item is, in de vorm die bij zijn variant past (T-48). */
function wanneer(item: CalendarEvent): string {
  const soort = SOORTNAMEN[item.kind as EigenSoort] ?? item.kind;

  if (item.allDay) {
    return item.start === item.end
      ? `${soort} · ${datumKort(item.start)}`
      : `${soort} · ${datumKort(item.start)} tot ${datumKort(item.end)}`;
  }

  return `${soort} · ${tijdstipKort(item.start)} tot ${tijdstipKort(item.end)}`;
}

function NieuwItem({ onKlaar, onAfbreken }: { onKlaar: () => void; onAfbreken: () => void }) {
  const [kind, setKind] = useState<EigenSoort>("afspraak");
  const [title, setTitle] = useState("");
  const [heleDag, setHeleDag] = useState(HELE_DAG_STANDAARD.afspraak);
  const [dagVan, setDagVan] = useState(vandaag());
  const [dagTot, setDagTot] = useState(vandaag());
  const [van, setVan] = useState(volgendHalfUur());
  const [tot, setTot] = useState(plusMinuten(volgendHalfUur(), 30));
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  /** De soort bepaalt of het standaard een hele dag is (§6.2.2, kolom "Hele dag"). */
  function kiesSoort(nieuw: EigenSoort) {
    setKind(nieuw);
    setHeleDag(HELE_DAG_STANDAARD[nieuw]);
  }

  async function bewaar() {
    setBezig(true);
    setFout(null);

    const { agenda } = await diensten();
    const uitkomst = await agenda.maak(
      heleDag
        ? { title, kind, allDay: true, start: dagVan, end: dagTot }
        : { title, kind, allDay: false, start: van, end: tot },
    );
    setBezig(false);

    if (!uitkomst.ok) {
      setFout(uitkomst.error.message);
      return;
    }
    onKlaar();
  }

  return (
    <form
      className="space-y-4 rounded-lg border p-4"
      onSubmit={(gebeurtenis) => {
        gebeurtenis.preventDefault();
        void bewaar();
      }}
    >
      <Field>
        <FieldLabel htmlFor="soort">Soort</FieldLabel>
        <NativeSelect
          id="soort"
          value={kind}
          onChange={(gebeurtenis) => kiesSoort(gebeurtenis.target.value as EigenSoort)}
        >
          {EIGEN_SOORTEN.map((soort) => (
            <NativeSelectOption key={soort} value={soort}>
              {SOORTNAMEN[soort]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        {kind === "oudergesprek" ? (
          <FieldDescription>
            Een oudergesprek hoort bij precies één leerling. Die koppeling komt in een volgende
            stap; tot dan is dit soort nog niet op te slaan.
          </FieldDescription>
        ) : null}
      </Field>

      <Field>
        <FieldLabel htmlFor="item-titel">Titel</FieldLabel>
        <Input
          id="item-titel"
          value={title}
          maxLength={120}
          autoComplete="off"
          onChange={(gebeurtenis) => setTitle(gebeurtenis.target.value)}
        />
      </Field>

      <Field orientation="horizontal">
        <Switch id="hele-dag" checked={heleDag} onCheckedChange={setHeleDag} />
        <Label htmlFor="hele-dag">Hele dag</Label>
      </Field>

      {heleDag ? (
        <div className="flex flex-wrap gap-4">
          <Field className="w-44">
            <FieldLabel htmlFor="dag-van">Van</FieldLabel>
            <Input
              id="dag-van"
              type="date"
              value={dagVan}
              onChange={(gebeurtenis) => {
                setDagVan(gebeurtenis.target.value);
                // FR-AGE-03: het einde schuift mee in plaats van ongeldig te worden.
                if (gebeurtenis.target.value > dagTot) setDagTot(gebeurtenis.target.value);
              }}
            />
          </Field>
          <Field className="w-44">
            <FieldLabel htmlFor="dag-tot">Tot en met</FieldLabel>
            <Input
              id="dag-tot"
              type="date"
              value={dagTot}
              onChange={(gebeurtenis) => setDagTot(gebeurtenis.target.value)}
            />
          </Field>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          <Field className="w-56">
            <FieldLabel htmlFor="tijd-van">Van</FieldLabel>
            <Input
              id="tijd-van"
              type="datetime-local"
              value={naarLokaleInvoer(van)}
              onChange={(gebeurtenis) => {
                const nieuw = vanLokaleInvoer(gebeurtenis.target.value);
                if (!nieuw) return;
                setVan(nieuw);
                // FR-AGE-03: de eindtijd schuift mee met de oorspronkelijke duur.
                if (nieuw > tot) setTot(plusMinuten(nieuw, 30));
              }}
            />
          </Field>
          <Field className="w-56">
            <FieldLabel htmlFor="tijd-tot">Tot</FieldLabel>
            <Input
              id="tijd-tot"
              type="datetime-local"
              value={naarLokaleInvoer(tot)}
              onChange={(gebeurtenis) => {
                const nieuw = vanLokaleInvoer(gebeurtenis.target.value);
                if (nieuw) setTot(nieuw);
              }}
            />
          </Field>
        </div>
      )}

      {fout ? <ErrorMessage message={fout} nextStep="Pas het aan en probeer het opnieuw." /> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={bezig || !title.trim()}>
          Opslaan
        </Button>
        <Button type="button" variant="ghost" onClick={onAfbreken}>
          Annuleren
        </Button>
      </div>
    </form>
  );
}

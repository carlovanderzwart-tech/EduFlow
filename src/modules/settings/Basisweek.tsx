"use client";

import { CalendarClock, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { EmptyState } from "@/ui/EmptyState";
import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { Field, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/ui/item";
import { NativeSelect, NativeSelectOption } from "@/ui/native-select";
import { Skeleton } from "@/ui/skeleton";
import { useDienst } from "@/app/providers/useDienst";
import type { CalendarEvent } from "@/domain/types";
import { diensten, type Diensten } from "@/services/diensten";
import {
  alsAgendainvoer,
  basisweekVan,
  gecontroleerd,
  WEEKDAGEN,
  type Basisonderdeel,
} from "@/services/agenda/basisweek";

/** Een schooldag begint vroeg; half negen is de meest ingevulde begintijd. */
const STANDAARD: Basisonderdeel = { weekdag: 1, van: "08:30", tot: "09:15", title: "" };

/**
 * De basisweek (`FR-AGE-29` t/m `FR-AGE-31`, B-115, B-146).
 *
 * Je vult je vaste week één keer in — gym, muziek, de bouwvergadering — en de app
 * maakt er wekelijks herhalende agenda-items van, tot de laatste schooldag.
 *
 * **Wat je hier ziet is de agenda zelf.** Er wordt niets aparts bewaard: de lijst is
 * een vraag aan de agenda naar wekelijkse items met herkomst "basisweek". Daarom kan
 * deze lijst nooit uit de pas lopen met wat er in je agenda staat.
 *
 * **Wijzigen doe je in de agenda en niet hier** (`FR-AGE-30`). Een gegenereerd item
 * is een gewoon item: klik het in de agenda aan en je krijgt dezelfde vraag "alleen
 * deze, of alle volgende?" als bij elk ander. Dit scherm doet er twee dingen mee —
 * toevoegen en helemaal weghalen — want alles daartussenin kan de agenda al beter.
 */
export function Basisweek() {
  const week = useBasisweek();

  if (week.laadfout) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <ErrorMessage message={week.laadfout.message} nextStep="Vernieuw de pagina." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <p className="text-sm text-muted-foreground">
        Je vaste week: gym, muziek, de bouwvergadering. Wat je hier invult komt elke week in
        je agenda te staan, tot de laatste schooldag. Daarna is het een gewoon agenda-item —
        verplaatsen en wijzigen doe je in de agenda zelf.
      </p>

      {week.waarde && !week.waarde.jaar ? (
        <ErrorMessage
          message="Er is nog geen schooljaar ingesteld."
          nextStep="Vul bij Instellingen eerst de eerste en laatste schooldag in."
        />
      ) : null}

      <Invulveld
        onderdeel={week.onderdeel}
        kan={Boolean(week.waarde?.jaar)}
        onWijzig={week.wijzig}
        onVoegToe={() => void week.voegToe()}
      />

      {week.fout ? (
        <ErrorMessage message={week.fout} nextStep="Pas het aan en probeer het opnieuw." />
      ) : null}

      {week.bezig && !week.waarde ? <Skeleton className="h-20" /> : null}

      <Weeklijst items={week.waarde?.week} onVerwijder={week.setTeVerwijderen} />

      <ConfirmDialog
        open={week.teVerwijderen !== null}
        onOpenChange={(open) => !open && week.setTeVerwijderen(null)}
        title={`${week.teVerwijderen?.title ?? "Dit onderdeel"} uit je basisweek halen?`}
        description="Alle resterende keren verdwijnen uit je agenda. Keren die je eerder los hebt gemaakt blijven staan."
        confirmLabel="Uit de basisweek halen"
        onConfirm={() => void week.verwijder()}
      />
    </div>
  );
}

/** Alles wat het scherm doet, los van hoe het eruitziet (DR-53, DR-15). */
function useBasisweek() {
  const [onderdeel, setOnderdeel] = useState<Basisonderdeel>(STANDAARD);
  const [fout, setFout] = useState<string | null>(null);
  const [teVerwijderen, setTeVerwijderen] = useState<CalendarEvent | null>(null);

  const laad = useCallback(async ({ agenda }: Diensten) => {
    const items = await agenda.lijst();
    if (!items.ok) return items;
    const jaar = await agenda.huidigSchooljaar();
    if (!jaar.ok) return jaar;

    return { ok: true as const, value: { week: basisweekVan(items.value), jaar: jaar.value } };
  }, []);

  const { waarde, fout: laadfout, bezig, herlaad } = useDienst(laad);

  async function voegToe() {
    const gekeurd = gecontroleerd(onderdeel, waarde?.jaar ?? null);
    if (!gekeurd.ok) return setFout(gekeurd.error.message);

    const { agenda } = await diensten();
    const uitkomst = await agenda.maak(alsAgendainvoer(onderdeel, gekeurd.value));
    if (!uitkomst.ok) return setFout(uitkomst.error.message);

    // Dag en tijd blijven staan: wie twee onderdelen op dinsdagochtend invult, wil
    // die keuzes niet twee keer maken.
    setOnderdeel({ ...onderdeel, title: "" });
    setFout(null);
    herlaad();
  }

  async function verwijder() {
    if (!teVerwijderen) return;
    const { agenda } = await diensten();
    const uitkomst = await agenda.verwijder(teVerwijderen.id);
    setTeVerwijderen(null);
    if (!uitkomst.ok) return setFout(uitkomst.error.message);
    setFout(null);
    herlaad();
  }

  return {
    onderdeel,
    wijzig: (deel: Partial<Basisonderdeel>) => setOnderdeel((nu) => ({ ...nu, ...deel })),
    waarde,
    laadfout,
    bezig,
    fout,
    teVerwijderen,
    setTeVerwijderen,
    voegToe,
    verwijder,
  };
}

/** Het invulveld: wat je toevoegt. */
function Invulveld({
  onderdeel,
  kan,
  onWijzig,
  onVoegToe,
}: {
  onderdeel: Basisonderdeel;
  kan: boolean;
  onWijzig: (deel: Partial<Basisonderdeel>) => void;
  onVoegToe: () => void;
}) {
  return (
    <form
      className="space-y-3 rounded-md border border-border p-3"
      onSubmit={(gebeurtenis) => {
        gebeurtenis.preventDefault();
        onVoegToe();
      }}
    >
      <Field>
        <FieldLabel htmlFor="basisweek-naam">Wat is het?</FieldLabel>
        <Input
          id="basisweek-naam"
          maxLength={120}
          autoComplete="off"
          placeholder="Gym, muziek, bouwvergadering"
          value={onderdeel.title}
          onChange={(gebeurtenis) => onWijzig({ title: gebeurtenis.target.value })}
        />
      </Field>

      <Tijdvelden onderdeel={onderdeel} onWijzig={onWijzig} />

      <Button type="submit" disabled={!kan || !onderdeel.title.trim()}>
        In mijn week zetten
      </Button>
    </form>
  );
}

/** Dag, begintijd en eindtijd naast elkaar; onder 640px onder elkaar (FR-DOC-30). */
function Tijdvelden({
  onderdeel,
  onWijzig,
}: {
  onderdeel: Basisonderdeel;
  onWijzig: (deel: Partial<Basisonderdeel>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Field>
        <FieldLabel htmlFor="basisweek-dag">Dag</FieldLabel>
        <NativeSelect
          id="basisweek-dag"
          value={String(onderdeel.weekdag)}
          onChange={(gebeurtenis) => onWijzig({ weekdag: Number(gebeurtenis.target.value) })}
        >
          {WEEKDAGEN.map((dag) => (
            <NativeSelectOption key={dag.nummer} value={String(dag.nummer)}>
              {dag.naam}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>

      <Field>
        <FieldLabel htmlFor="basisweek-van">Van</FieldLabel>
        <Input
          id="basisweek-van"
          type="time"
          value={onderdeel.van}
          onChange={(gebeurtenis) => onWijzig({ van: gebeurtenis.target.value })}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="basisweek-tot">Tot</FieldLabel>
        <Input
          id="basisweek-tot"
          type="time"
          value={onderdeel.tot}
          onChange={(gebeurtenis) => onWijzig({ tot: gebeurtenis.target.value })}
        />
      </Field>
    </div>
  );
}

/** De week zoals hij nu in de agenda staat, of de lege toestand (§4.6). */
function Weeklijst({
  items,
  onVerwijder,
}: {
  items: CalendarEvent[] | undefined;
  onVerwijder: (item: CalendarEvent) => void;
}) {
  if (!items) return null;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Je basisweek is nog leeg"
        description="Vul hierboven je eerste vaste onderdeel in. Eén keer invullen is genoeg voor het hele schooljaar."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <Regel item={item} onVerwijder={() => onVerwijder(item)} />
        </li>
      ))}
    </ul>
  );
}

/** Eén regel van de basisweek. */
function Regel({ item, onVerwijder }: { item: CalendarEvent; onVerwijder: () => void }) {
  const dag = WEEKDAGEN.find((optie) => optie.nummer === weekdagVan(item.start))?.naam ?? "";

  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle>{item.title}</ItemTitle>
        <ItemDescription>
          {dag} · {klok(item.start)}–{klok(item.end)} · elke week
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`${item.title} uit de basisweek halen`}
          onClick={onVerwijder}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </ItemActions>
    </Item>
  );
}

/** De weekdag van een opgeslagen tijdstip, lokaal gelezen. */
function weekdagVan(tijdstip: string): number {
  return new Date(tijdstip).getDay() || 7;
}

/** `08:30` uit een opgeslagen tijdstip, in de tijdzone van de gebruiker. */
function klok(tijdstip: string): string {
  return new Intl.DateTimeFormat("nl-NL", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(tijdstip),
  );
}

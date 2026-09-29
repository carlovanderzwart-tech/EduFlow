"use client";

import { Trash2, Undo2 } from "lucide-react";
import { useCallback, useState } from "react";

import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/ui/item";
import { useDienst } from "@/app/providers/useDienst";
import { datumKort } from "@/lib/weergave";
import { diensten, type Diensten } from "@/services/diensten";
import { BEWAARTERMIJN_DAGEN } from "@/services/documentation/prullenbak";

/**
 * De prullenbak (`FR-DOC-121`, `FR-DOC-123`, B-135).
 *
 * Staat onder het overzicht en niet op een eigen scherm: je opent hem omdat je
 * iets terugzoekt dat je net weggooide, en dan wil je niet eerst ergens anders
 * heen. Hij is dicht zolang je hem niet opent, want een lege prullenbak die altijd
 * open staat is een lege plek op elk scherm.
 *
 * **Elke regel zegt hoeveel dagen hij nog heeft.** Dat is wat `FR-DOC-121` vraagt,
 * en het is ook het enige wat de keuze stuurt: een documentatie met nog 29 dagen
 * laat je staan, een met nog 1 dag zet je nú terug.
 */
export function Prullenbak({ onHersteld }: { onHersteld: () => void }) {
  const [open, setOpen] = useState(false);
  const [vraagLegen, setVraagLegen] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const laad = useCallback(({ documentation }: Diensten) => documentation.prullenbak(), []);
  const { waarde, fout: laadfout, herlaad } = useDienst(laad);

  const aantal = waarde?.length ?? 0;

  async function herstel(id: string) {
    const { documentation } = await diensten();
    const uitkomst = await documentation.herstel(id);
    if (!uitkomst.ok) return setFout(uitkomst.error.message);

    setFout(null);
    herlaad();
    onHersteld();
  }

  async function leeg() {
    const { documentation } = await diensten();
    const uitkomst = await documentation.leegPrullenbak();
    if (!uitkomst.ok) return setFout(uitkomst.error.message);

    setFout(null);
    herlaad();
  }

  if (laadfout) {
    return <ErrorMessage message={laadfout.message} nextStep="Vernieuw de pagina." />;
  }

  // Een knop naar een lege prullenbak is een knop naar een leeg scherm.
  if (aantal === 0 && !open) return null;

  return (
    <section className="border-border space-y-3 border-t pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => setOpen((aan) => !aan)}>
          <Trash2 aria-hidden="true" />
          Prullenbak ({aantal})
        </Button>

        {open && aantal > 0 ? (
          <Button variant="outline" onClick={() => setVraagLegen(true)}>
            Leeg de prullenbak
          </Button>
        ) : null}
      </div>

      {open ? <Inhoud regels={waarde ?? []} onHerstel={(id) => void herstel(id)} /> : null}

      {fout ? <ErrorMessage message={fout} nextStep="Vernieuw de pagina en probeer het opnieuw." /> : null}

      <ConfirmDialog
        open={vraagLegen}
        onOpenChange={setVraagLegen}
        title="De prullenbak legen?"
        description={beschrijfLegen(aantal)}
        confirmLabel="Definitief verwijderen"
        destructive
        onConfirm={() => void leeg()}
      />
    </section>
  );
}

/** Wat er verdwijnt, met zoveel woorden (`FR-DOC-123`, §4.9). */
function beschrijfLegen(aantal: number): string {
  const wat = aantal === 1 ? "Eén documentatie" : `${aantal} documentaties`;
  return `${wat} met alle pagina's worden definitief verwijderd. Dit is niet terug te draaien.`;
}

interface Regel {
  record: { id: string; title: string; date: string };
  dagenResterend: number;
}

function Inhoud({ regels, onHerstel }: { regels: Regel[]; onHerstel: (id: string) => void }) {
  if (regels.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        De prullenbak is leeg. Wat je verwijdert staat hier {BEWAARTERMIJN_DAGEN} dagen.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {regels.map(({ record, dagenResterend }) => (
        <li key={record.id}>
          <Item variant="outline">
            <ItemContent>
              <ItemTitle>{record.title || "Zonder titel"}</ItemTitle>
              <ItemDescription>
                {datumKort(record.date)} · nog {dagenResterend}{" "}
                {dagenResterend === 1 ? "dag" : "dagen"}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                variant="outline"
                size="sm"
                aria-label={`${record.title || "Zonder titel"} terugzetten`}
                onClick={() => onHerstel(record.id)}
              >
                <Undo2 aria-hidden="true" />
                Terugzetten
              </Button>
            </ItemActions>
          </Item>
        </li>
      ))}
    </ul>
  );
}

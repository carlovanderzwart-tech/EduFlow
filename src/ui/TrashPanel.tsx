"use client";

import { Trash2, Undo2 } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { Button } from "@/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/ui/item";

/**
 * De prullenbak als vorm (B-138).
 *
 * Documentaties, groepen en reeksen gebruiken hem alle drie. Hij haalt niets op en
 * weet van geen enkel record iets af: hij krijgt regels binnen en geeft klikken
 * terug. Daarom mag hij in `ui/` staan — een component hier haalt geen gegevens op
 * (§10.2).
 *
 * **Dicht zolang je hem niet opent**, en helemaal weg zolang hij leeg is. Een lege
 * prullenbak die altijd open staat is een lege plek op elk scherm.
 */
export interface Prullenbakrij {
  id: string;
  titel: string;
  /** Wat eronder staat: een datum, een soort, of wat dit record herkenbaar maakt. */
  bijschrift?: string;
  dagenResterend: number;
}

export function TrashPanel({
  rijen,
  wat,
  bewaartermijnDagen,
  onHerstel,
  onLeeg,
}: {
  rijen: Prullenbakrij[];
  /** Enkelvoud en meervoud van wat hier in zit: `["documentatie", "documentaties"]`. */
  wat: readonly [string, string];
  bewaartermijnDagen: number;
  onHerstel: (id: string) => void;
  onLeeg: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [vraagLegen, setVraagLegen] = useState(false);

  // Een knop naar een lege prullenbak is een knop naar een leeg scherm.
  if (rijen.length === 0 && !open) return null;

  return (
    <section className="border-border space-y-3 border-t pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => setOpen((aan) => !aan)}>
          <Trash2 aria-hidden="true" />
          Prullenbak ({rijen.length})
        </Button>

        {open && rijen.length > 0 ? (
          <Button variant="outline" onClick={() => setVraagLegen(true)}>
            Leeg de prullenbak
          </Button>
        ) : null}
      </div>

      {open ? (
        <Inhoud rijen={rijen} wat={wat} bewaartermijnDagen={bewaartermijnDagen} onHerstel={onHerstel} />
      ) : null}

      <ConfirmDialog
        open={vraagLegen}
        onOpenChange={setVraagLegen}
        title="De prullenbak legen?"
        description={beschrijfLegen(rijen.length, wat)}
        confirmLabel="Definitief verwijderen"
        destructive
        onConfirm={onLeeg}
      />
    </section>
  );
}

/** Wat er verdwijnt, met zoveel woorden (`FR-DOC-123`, §4.9). */
function beschrijfLegen(aantal: number, [enkel, meervoud]: readonly [string, string]): string {
  const wat = aantal === 1 ? `Eén ${enkel}` : `${aantal} ${meervoud}`;
  return `${wat} wordt definitief verwijderd. Dit is niet terug te draaien.`;
}

function Inhoud({
  rijen,
  wat,
  bewaartermijnDagen,
  onHerstel,
}: {
  rijen: Prullenbakrij[];
  wat: readonly [string, string];
  bewaartermijnDagen: number;
  onHerstel: (id: string) => void;
}) {
  if (rijen.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        De prullenbak is leeg. Wat je verwijdert staat hier {bewaartermijnDagen} dagen.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {rijen.map((rij) => (
        <li key={rij.id}>
          <Item variant="outline">
            <ItemContent>
              <ItemTitle>{rij.titel || `Naamloze ${wat[0]}`}</ItemTitle>
              <ItemDescription>
                {rij.bijschrift ? `${rij.bijschrift} · ` : ""}nog {rij.dagenResterend}{" "}
                {rij.dagenResterend === 1 ? "dag" : "dagen"}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                variant="outline"
                size="sm"
                aria-label={`${rij.titel || `Naamloze ${wat[0]}`} terugzetten`}
                onClick={() => onHerstel(rij.id)}
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

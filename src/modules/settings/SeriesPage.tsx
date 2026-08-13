"use client";

import { Layers, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";

import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { EmptyState } from "@/ui/EmptyState";
import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/ui/item";
import { Skeleton } from "@/ui/skeleton";
import { Textarea } from "@/ui/textarea";
import { useDienst } from "@/app/providers/useDienst";
import type { Series } from "@/domain/types";
import { diensten, type Diensten } from "@/services/diensten";
import type { Colour } from "@/domain/types";
import { PALET, REEKSNAAM_MAX, volgendeKleur } from "@/services/series/SeriesService";

/**
 * Reeksen (§6.5.3).
 *
 * Verwijderen vraagt eerst hoeveel documentaties hun verwijzing kwijtraken
 * (FR-INS-12). Dat getal komt uit `SeriesService` en niet uit een telling hier: één
 * vraag, één plek (U-03).
 *
 * De beschrijving is geen sierveld. Hij gaat als context mee bij de vervolgzin
 * (B-04), en daarom staat er onder het veld wat hij doet en niet hoe hij werkt
 * (FR-INS-44).
 */
export function SeriesPage() {
  const [naam, setNaam] = useState("");
  const [beschrijving, setBeschrijving] = useState("");
  const [kleur, setKleur] = useState<Colour | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [teVerwijderen, setTeVerwijderen] = useState<{ reeks: Series; aantal: number } | null>(null);

  const laad = useCallback(({ series }: Diensten) => series.lijst(), []);
  const { waarde: reeksen, fout: laadfout, bezig, herlaad } = useDienst(laad);

  // FR-INS-11 laat je kiezen; de eerstvolgende vrije kleur staat alvast aan, zodat
  // je niets hóéft te kiezen om een reeks te kunnen maken (§4.4: geen lege keuze).
  const gekozen = kleur ?? volgendeKleur(reeksen?.length ?? 0);

  async function maak() {
    const { series } = await diensten();
    const uitkomst = await series.maak({ name: naam, colour: gekozen, description: beschrijving });

    if (!uitkomst.ok) return setFout(uitkomst.error.message);
    setNaam("");
    setBeschrijving("");
    setKleur(null);
    setFout(null);
    herlaad();
  }

  async function vraagVerwijderen(reeks: Series) {
    const { series } = await diensten();
    const aantal = await series.aantalDocumentaties(reeks.id);
    if (!aantal.ok) return setFout(aantal.error.message);
    setTeVerwijderen({ reeks, aantal: aantal.value });
  }

  async function verwijder() {
    if (!teVerwijderen) return;
    const { series } = await diensten();
    const uitkomst = await series.verwijder(teVerwijderen.reeks.id);
    setTeVerwijderen(null);
    if (!uitkomst.ok) return setFout(uitkomst.error.message);
    setFout(null);
    herlaad();
  }

  if (laadfout) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <ErrorMessage message={laadfout.message} nextStep="Vernieuw de pagina." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <form
        className="space-y-3"
        onSubmit={(gebeurtenis) => {
          gebeurtenis.preventDefault();
          void maak();
        }}
      >
        <Input
          aria-label="Naam van de reeks"
          placeholder="Naam van de reeks"
          maxLength={REEKSNAAM_MAX}
          value={naam}
          onChange={(gebeurtenis) => setNaam(gebeurtenis.target.value)}
        />
        <Textarea
          aria-label="Beschrijving van de reeks"
          placeholder="Waar gaat deze reeks over? Deze zin helpt de AI bij een vervolgdeel."
          rows={2}
          value={beschrijving}
          onChange={(gebeurtenis) => setBeschrijving(gebeurtenis.target.value)}
        />

        {/* De acht van §5.5. Kleur is de enige eigenschap die je in het overzicht
            terugziet zonder te lezen, dus je kiest hem zelf (FR-INS-11). */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Kleur</legend>
          <div className="flex flex-wrap gap-2">
            {PALET.map((optie) => (
              <button
                key={optie}
                type="button"
                aria-label={`Kleur ${optie.replace("series-", "")}`}
                aria-pressed={optie === gekozen}
                onClick={() => setKleur(optie)}
                className={`size-8 rounded-full border-2 ${
                  optie === gekozen ? "border-foreground" : "border-transparent"
                }`}
                style={{ backgroundColor: `var(--palette-${optie})` }}
              />
            ))}
          </div>
        </fieldset>

        <Button type="submit" disabled={!naam.trim()}>
          Reeks toevoegen
        </Button>
      </form>

      {fout ? <ErrorMessage message={fout} nextStep="Pas de naam aan en probeer het opnieuw." /> : null}

      {bezig && !reeksen ? <Skeleton className="h-20" /> : null}

      {reeksen && reeksen.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Nog geen reeksen"
          description="Een reeks bundelt documentaties die bij elkaar horen, zoals vier delen over hetzelfde kunstwerk."
        />
      ) : null}

      <ul className="space-y-2">
        {reeksen?.map((reeks) => (
          <li key={reeks.id}>
            <Item variant="outline">
              {/* Een kleur die je kiest maar nergens terugziet, is geen kleur. */}
              <span
                aria-hidden="true"
                className="size-4 shrink-0 rounded-full"
                style={{ backgroundColor: `var(--palette-${reeks.colour})` }}
              />
              <ItemContent>
                <ItemTitle>{reeks.name}</ItemTitle>
                {reeks.description ? (
                  <ItemDescription>{reeks.description}</ItemDescription>
                ) : null}
              </ItemContent>
              <ItemActions>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`${reeks.name} verwijderen`}
                  onClick={() => void vraagVerwijderen(reeks)}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </ItemActions>
            </Item>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={teVerwijderen !== null}
        onOpenChange={(open) => {
          if (!open) setTeVerwijderen(null);
        }}
        title={`${teVerwijderen?.reeks.name ?? ""} verwijderen?`}
        description={beschrijfGevolg(teVerwijderen?.aantal ?? 0)}
        confirmLabel="Verwijderen"
        destructive
        onConfirm={() => void verwijder()}
      />
    </div>
  );
}

/** Wat er met de documentaties gebeurt (FR-INS-12, INV-20). De app zegt het vooraf. */
function beschrijfGevolg(aantal: number): string {
  if (aantal === 0) return "Er hangt geen documentatie aan deze reeks. Er gaat niets verloren.";
  const wat = aantal === 1 ? "Eén documentatie hoort" : `${aantal} documentaties horen`;
  return `${wat} bij deze reeks. Ze blijven bestaan en verliezen alleen hun verwijzing naar de reeks.`;
}

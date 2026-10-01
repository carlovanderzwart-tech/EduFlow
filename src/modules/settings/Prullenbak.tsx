"use client";

import { useCallback, useEffect, useState } from "react";

import { ErrorMessage } from "@/ui/ErrorMessage";
import { TrashPanel, type Prullenbakrij } from "@/ui/TrashPanel";
import { useDienst } from "@/app/providers/useDienst";
import type { Result } from "@/lib/result";
import { BEWAARTERMIJN_DAGEN } from "@/services/prullenbak";
import { diensten, type Diensten } from "@/services/diensten";

/**
 * De prullenbak van groepen en van reeksen (`FR-INS-47`, B-138).
 *
 * Eén component voor allebei, want ze doen hetzelfde en staan op schermen die op
 * elkaar lijken. `soort` kiest welke dienst er wordt aangeroepen; de vorm komt uit
 * `ui/TrashPanel`, dezelfde die het documentatieoverzicht gebruikt.
 *
 * Hij staat onderaan het scherm waar je verwijderde — je zoekt hier iets terug dat
 * je net weggooide, en dan wil je niet eerst ergens anders heen.
 */
export type Prullenbaksoort = "groepen" | "reeksen";

const WOORDEN: Record<Prullenbaksoort, readonly [string, string]> = {
  groepen: ["groep", "groepen"],
  reeksen: ["reeks", "reeksen"],
};

export function Prullenbak({
  soort,
  ronde,
  onHersteld,
}: {
  soort: Prullenbaksoort;
  /**
   * Gaat omhoog zodra het scherm erboven iets heeft verwijderd.
   *
   * Zonder dit haalt `useDienst` zijn lijst één keer op bij het ophangen, en dan
   * blijft de prullenbak leeg terwijl je er net iets in hebt gegooid — het scherm
   * blijft immers staan. Dezelfde vorm als `useAgenda`, die zijn periode in de
   * afhankelijkheden zet.
   */
  ronde: number;
  onHersteld: () => void;
}) {
  const [fout, setFout] = useState<string | null>(null);

  const laad = useCallback((alles: Diensten) => haalOp(alles, soort), [soort]);
  const { waarde, fout: laadfout, herlaad } = useDienst(laad);

  // Het scherm erboven heeft net iets verwijderd; deze lijst weet dat niet uit
  // zichzelf, want hij wordt niet opnieuw opgehangen.
  useEffect(() => {
    if (ronde > 0) herlaad();
  }, [ronde, herlaad]);

  async function dienst() {
    const alles = await diensten();
    return soort === "groepen" ? alles.groups : alles.series;
  }

  async function herstel(id: string) {
    const uitkomst = await (await dienst()).herstel(id);
    if (!uitkomst.ok) return setFout(uitkomst.error.message);

    setFout(null);
    herlaad();
    onHersteld();
  }

  async function leeg() {
    const uitkomst = await (await dienst()).leegPrullenbak();
    if (!uitkomst.ok) return setFout(uitkomst.error.message);

    setFout(null);
    herlaad();
  }

  if (laadfout) {
    return <ErrorMessage message={laadfout.message} nextStep="Vernieuw de pagina." />;
  }

  return (
    <>
      <TrashPanel
        rijen={waarde ?? []}
        wat={WOORDEN[soort]}
        bewaartermijnDagen={BEWAARTERMIJN_DAGEN}
        onHerstel={(id) => void herstel(id)}
        onLeeg={() => void leeg()}
      />

      {fout ? (
        <ErrorMessage message={fout} nextStep="Vernieuw de pagina en probeer het opnieuw." />
      ) : null}
    </>
  );
}

/**
 * De prullenbak van één soort, naar één vorm gebracht.
 *
 * Een groep en een reeks hebben allebei een naam, en verder heeft dit scherm niets
 * van ze nodig. Het omvormen staat hier en niet in de weergave, zodat `TrashPanel`
 * van geen van beide iets hoeft te weten.
 */
async function haalOp(
  { groups, series }: Diensten,
  soort: Prullenbaksoort,
): Promise<Result<Prullenbakrij[]>> {
  const uitkomst = soort === "groepen" ? await groups.prullenbak() : await series.prullenbak();
  if (!uitkomst.ok) return uitkomst;

  return {
    ok: true,
    value: uitkomst.value.map(({ record, dagenResterend }) => ({
      id: record.id,
      titel: record.name,
      dagenResterend,
    })),
  };
}

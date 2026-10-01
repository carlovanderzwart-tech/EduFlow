"use client";

import { useCallback, useState } from "react";

import { ErrorMessage } from "@/ui/ErrorMessage";
import { TrashPanel } from "@/ui/TrashPanel";
import { useDienst } from "@/app/providers/useDienst";
import { datumKort } from "@/lib/weergave";
import { diensten, type Diensten } from "@/services/diensten";
import { BEWAARTERMIJN_DAGEN } from "@/services/prullenbak";

/**
 * De prullenbak van documentaties (`FR-DOC-121`, `FR-DOC-123`, B-135, B-138).
 *
 * Staat onder het overzicht en niet op een eigen scherm: je opent hem omdat je iets
 * terugzoekt dat je net weggooide, en dan wil je niet eerst ergens anders heen.
 *
 * De vorm komt uit `ui/TrashPanel`, dezelfde die Instellingen voor groepen en
 * reeksen gebruikt. Hier staat alleen wat eigen is: welke dienst het ophaalt, en
 * dat het bijschrift de inhoudelijke datum is — dat is waarmee je een documentatie
 * herkent, niet de dag waarop je hem weggooide.
 */
export function Prullenbak({ onHersteld }: { onHersteld: () => void }) {
  const [fout, setFout] = useState<string | null>(null);

  const laad = useCallback(({ documentation }: Diensten) => documentation.prullenbak(), []);
  const { waarde, fout: laadfout, herlaad } = useDienst(laad);

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

  return (
    <>
      <TrashPanel
        rijen={(waarde ?? []).map(({ record, dagenResterend }) => ({
          id: record.id,
          titel: record.title,
          bijschrift: datumKort(record.date),
          dagenResterend,
        }))}
        wat={["documentatie", "documentaties"]}
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

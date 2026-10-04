"use client";

import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { SaveStatus, type SaveState } from "@/ui/SaveStatus";
import { Button } from "@/ui/button";
import { diensten } from "@/services/diensten";

import { ExportPanel } from "./ExportPanel";

/**
 * De balk boven het schrijfscherm: wat je met deze documentatie kunt doen.
 *
 * Apart van `DocumentEditor` omdat die anders over de vierhonderd regels gaat
 * (DR-53), en omdat het een eigen onderwerp is: het schrijfscherm gaat over de
 * inhoud, deze balk over wat er daarna met het geheel gebeurt.
 *
 * **Drie van de vier knoppen hangen aan een sleutel.** Een documentatie die nog
 * niet bestaat valt niet te exporteren, te archiveren of weg te gooien (FR-DOC-01).
 */
export function Werkbalk({
  sleutel,
  state,
  gearchiveerd,
  onGearchiveerd,
  onFout,
}: {
  sleutel: string | null;
  state: SaveState;
  gearchiveerd: boolean;
  onGearchiveerd: (aan: boolean) => void;
  onFout: (melding: string) => void;
}) {
  const router = useRouter();
  const [exporteren, setExporteren] = useState(false);
  const [vraagWeg, setVraagWeg] = useState(false);

  /** FR-DOC-121: naar de prullenbak, en daarna terug naar het overzicht. */
  async function verwijder() {
    if (!sleutel) return;
    const { documentation } = await diensten();
    const uitkomst = await documentation.verwijder(sleutel);
    if (!uitkomst.ok) return onFout(uitkomst.error.message);

    router.push("/documentation");
  }

  /**
   * `FR-DOC-120`: uit beeld, of terug tussen het lopende werk.
   *
   * Geen bevestiging. Archiveren gooit niets weg en de knop ernaast draait het
   * meteen terug; een dialoog zou hier alleen in de weg staan.
   */
  async function wisselArchief() {
    if (!sleutel) return;
    const { documentation } = await diensten();
    const uitkomst = gearchiveerd
      ? await documentation.haalUitArchief(sleutel)
      : await documentation.archiveer(sleutel);
    if (!uitkomst.ok) return onFout(uitkomst.error.message);

    onGearchiveerd(!gearchiveerd);
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 pb-4">
        <SaveStatus state={state} />
        <Knoppen
          sleutel={sleutel}
          gearchiveerd={gearchiveerd}
          onExporteer={() => setExporteren(true)}
          onArchief={() => void wisselArchief()}
          onVerwijder={() => setVraagWeg(true)}
        />
      </div>

      {/* Alleen in de boom zolang het paneel open staat. Daardoor begint elke keer
          met een schone lei — geen melding van de vorige export die er nog staat —
          en wordt er niet gerenderd voor een paneel dat niemand ziet. */}
      {sleutel && exporteren ? (
        <ExportPanel documentId={sleutel} open onOpenChange={setExporteren} />
      ) : null}

      <ConfirmDialog
        open={vraagWeg}
        onOpenChange={setVraagWeg}
        title="Deze documentatie verwijderen?"
        description="Hij gaat naar de prullenbak en staat daar dertig dagen. Tot die tijd kun je hem terugzetten met pagina's, foto's en koppelingen."
        confirmLabel="Naar de prullenbak"
        onConfirm={() => void verwijder()}
      />
    </>
  );
}

/** De vier knoppen zelf, los zodat `Werkbalk` onder de zestig regels blijft (DR-53). */
function Knoppen({
  sleutel,
  gearchiveerd,
  onExporteer,
  onArchief,
  onVerwijder,
}: {
  sleutel: string | null;
  gearchiveerd: boolean;
  onExporteer: () => void;
  onArchief: () => void;
  onVerwijder: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      {/* Exporteren kan pas als er iets bewaard is; een documentatie zonder
          sleutel valt niet te openen in het paneel (FR-DOC-01). */}
      <Button variant="outline" disabled={!sleutel} onClick={onExporteer}>
        Exporteren
      </Button>
      {/* `FR-DOC-120`: archiveren is niet verwijderen. Daarom staat hij hier naast
          Exporteren en niet bij de prullenbak — het hoort bij "dit is af". */}
      <Button variant="ghost" disabled={!sleutel} onClick={onArchief}>
        {gearchiveerd ? <ArchiveRestore aria-hidden="true" /> : <Archive aria-hidden="true" />}
        {gearchiveerd ? "Uit archief halen" : "Archiveren"}
      </Button>
      {/* `FR-DOC-121`, B-135: naar de prullenbak en niet weg. Daarom geen
          `destructive`-knop — dit is omkeerbaar, en dertig dagen lang. */}
      <Button variant="ghost" disabled={!sleutel} onClick={onVerwijder}>
        <Trash2 aria-hidden="true" />
        Verwijderen
      </Button>
      <Button variant="ghost" onClick={() => router.push("/documentation")}>
        Naar het overzicht
      </Button>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ErrorMessage } from "@/ui/ErrorMessage";
import { SaveStatus } from "@/ui/SaveStatus";
import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Skeleton } from "@/ui/skeleton";
import { Textarea } from "@/ui/textarea";
import { useDienst } from "@/app/providers/useDienst";
import { vandaag } from "@/lib/weergave";
import { diensten, type Diensten } from "@/services/diensten";
import { MAX_TEKST, WAARSCHUW_VANAF } from "@/services/documentation/DocumentationService";

import { ExportPanel } from "./ExportPanel";
import { useAutosave } from "./hooks/useAutosave";
import { Koppelingen } from "./Koppelingen";
import { PhotoStrip } from "./PhotoStrip";

/** De sleutel in de URL van een documentatie die nog niet bestaat. */
export const NIEUW = "nieuw";

interface Formulier {
  title: string;
  date: string;
  seriesId: string;
  studentIds: string[];
  groupIds: string[];
  text: string;
  privateNote: string;
  photoIds: string[];
}

/**
 * Het schrijfscherm (§6.1.1, §5.2, §5.10).
 *
 * **Drie kolommen op de laptop, één op de telefoon zonder verlies** (FR-DOC-29,
 * FR-DOC-30). De leeskolom draagt titel, datum en de tekst; de rechterkolom de
 * koppelingen, de foto's en de notitie voor jezelf. Onder 768px staan ze onder
 * elkaar en verdwijnt er niets — dat laatste is de eis, niet het aantal kolommen.
 *
 * **Er is geen opslaanknop** (FR-DOC-31 t/m FR-DOC-34). Er wordt opgeslagen na een
 * seconde stilte, bij het verlaten van het scherm en bij het wegleggen van het
 * tabblad. De indicator gebruikt **woorden** en niet alleen een kleurtje, want een
 * kleur is geen mededeling voor wie hem niet ziet.
 *
 * **Het tekstvlak is saai, en dat is een besluit** (FR-DOC-37, FR-DOC-38). Geen
 * opmaakbalk, geen automatisch aanvullen, geen tags. Alle drie slopen dictaat, en
 * dictaat is hoe een deel van de doelgroep werkt.
 */
export function DocumentEditor({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [fout, setFout] = useState<string | null>(null);
  const [exporteren, setExporteren] = useState(false);
  /** De sleutel die het aanmaken opleverde; houdt een tweede opslag bij dezelfde. */
  const gemaakt = useRef<string | null>(null);
  /**
   * Dezelfde sleutel, maar als stand.
   *
   * De verwijzing hierboven overleeft het opnieuw tekenen en is daarom wat de
   * autosave gebruikt; hij laat het scherm alleen niet opnieuw tekenen. De knop
   * Exporteren moet wél aangaan zodra de documentatie bestaat, en daar is een
   * stand voor nodig.
   */
  const [sleutel, setSleutel] = useState<string | null>(documentId === NIEUW ? null : documentId);

  const laad = useCallback(
    async ({ documentation, students, groups, series }: Diensten) => {
      const leerlingen = await students.lijst();
      if (!leerlingen.ok) return leerlingen;
      const groepen = await groups.lijst();
      if (!groepen.ok) return groepen;
      const reeksen = await series.lijst();
      if (!reeksen.ok) return reeksen;

      const leeg: Formulier = {
        title: "",
        date: vandaag(),
        seriesId: "",
        studentIds: [],
        groupIds: [],
        text: "",
        privateNote: "",
        photoIds: [],
      };

      if (documentId === NIEUW) {
        return { ok: true as const, value: { leerlingen: leerlingen.value, groepen: groepen.value, reeksen: reeksen.value, formulier: leeg } };
      }

      const geopend = await documentation.open(documentId);
      if (!geopend.ok) return geopend;
      if (!geopend.value) return { ok: true as const, value: null };

      const { documentatie } = geopend.value;
      return {
        ok: true as const,
        value: {
          leerlingen: leerlingen.value,
          groepen: groepen.value,
          reeksen: reeksen.value,
          formulier: {
            title: documentatie.title,
            date: documentatie.date,
            seriesId: documentatie.seriesId ?? "",
            studentIds: documentatie.studentIds,
            groupIds: documentatie.groupIds,
            text: documentation.tekstVan(geopend.value),
            privateNote: documentatie.privateNote,
            photoIds: documentation.fotosVan(geopend.value),
          } satisfies Formulier,
        },
      };
    },
    [documentId],
  );

  const { waarde, fout: laadfout, bezig } = useDienst(laad);
  const [concept, setConcept] = useState<Formulier | null>(null);
  const formulier = concept ?? waarde?.formulier ?? null;

  const bewaar = useCallback(async (huidig: Formulier) => {
    const sleutel = gemaakt.current ?? documentId;
    const { documentation } = await diensten();

    const invoer = {
      ...huidig,
      seriesId: huidig.seriesId === "" ? null : huidig.seriesId,
    };

    const uitkomst =
      sleutel === NIEUW
        ? await documentation.maak(invoer)
        : await documentation.bewaar(sleutel, invoer);

    if (!uitkomst.ok) {
      setFout(uitkomst.error.message);
      // Werpen, zodat `useAutosave` de indicator niet op "Opgeslagen." zet.
      throw new Error(uitkomst.error.message);
    }

    setFout(null);
    if (sleutel === NIEUW) {
      const nieuweSleutel = uitkomst.value.documentatie.id;
      gemaakt.current = nieuweSleutel;
      setSleutel(nieuweSleutel);
      // Rechtstreeks via de geschiedenis: `router.replace` monteert dit scherm
      // opnieuw en dan verdwijnt de melding vóór je haar hebt gezien.
      window.history.replaceState(null, "", `/documentation/${nieuweSleutel}`);
    }
  }, [documentId]);

  // FR-DOC-01: pas opslaan zodra er inhoud is. Een leeg scherm openen en weggaan
  // laat niets achter, omdat de autosave dan uit staat.
  const heeftInhoud = Boolean(
    formulier &&
      (formulier.title.trim() ||
        formulier.text.trim() ||
        formulier.photoIds.length > 0 ||
        formulier.studentIds.length > 0 ||
        formulier.groupIds.length > 0 ||
        formulier.seriesId),
  );

  const { state } = useAutosave({
    value: formulier ?? ({} as Formulier),
    onSave: bewaar,
    enabled: Boolean(formulier) && heeftInhoud,
  });

  function wijzig(deel: Partial<Formulier>) {
    if (!formulier) return;
    setConcept({ ...formulier, ...deel });
  }

  // FR-DOC-35: alleen waarschuwen bij het sluiten als er werkelijk werk open staat.
  useEffect(() => {
    if (state !== "saving") return;
    const waarschuw = (gebeurtenis: BeforeUnloadEvent) => gebeurtenis.preventDefault();
    window.addEventListener("beforeunload", waarschuw);
    return () => window.removeEventListener("beforeunload", waarschuw);
  }, [state]);

  if (laadfout) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <ErrorMessage message={laadfout.message} nextStep="Vernieuw de pagina." />
      </div>
    );
  }

  if (bezig && !formulier) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
        <Skeleton className="h-10" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!formulier || !waarde) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <ErrorMessage
          message="Deze documentatie bestaat niet meer."
          nextStep="Ga terug naar het overzicht."
          action={{ label: "Naar het overzicht", onClick: () => router.push("/documentation") }}
        />
      </div>
    );
  }

  const tekens = formulier.text.length;

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <div className="flex items-center justify-between gap-4 pb-4">
        <SaveStatus state={state} />
        <div className="flex items-center gap-2">
          {/* Exporteren kan pas als er iets bewaard is; een documentatie zonder
              sleutel valt niet te openen in het paneel (FR-DOC-01). */}
          <Button variant="outline" disabled={!sleutel} onClick={() => setExporteren(true)}>
            Exporteren
          </Button>
          <Button variant="ghost" onClick={() => router.push("/documentation")}>
            Naar het overzicht
          </Button>
        </div>
      </div>

      {/* Alleen in de boom zolang het paneel open staat. Daardoor begint elke keer
          met een schone lei — geen melding van de vorige export die er nog staat —
          en wordt er niet gerenderd voor een paneel dat niemand ziet. */}
      {sleutel && exporteren ? (
        <ExportPanel documentId={sleutel} open onOpenChange={setExporteren} />
      ) : null}

      {fout ? <ErrorMessage message={fout} nextStep="Pas het aan; je tekst blijft staan." /> : null}

      {/* FR-DOC-29: op de laptop de leeskolom naast de rail. Onder 768px één kolom. */}
      <div className="grid gap-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="space-y-6">
          <Field>
            <FieldLabel htmlFor="titel">Titel</FieldLabel>
            <FieldDescription>Mag leeg blijven.</FieldDescription>
            <Input
              id="titel"
              value={formulier.title}
              maxLength={120}
              autoComplete="off"
              placeholder="Waar ging het over?"
              onChange={(gebeurtenis) => wijzig({ title: gebeurtenis.target.value })}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="datum">Datum</FieldLabel>
            <FieldDescription>De dag waarop het gebeurde. Hoogstens een week vooruit.</FieldDescription>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="datum"
                type="date"
                className="max-w-44"
                value={formulier.date}
                onChange={(gebeurtenis) => wijzig({ date: gebeurtenis.target.value })}
              />
              <Button variant="outline" size="sm" onClick={() => wijzig({ date: vandaag() })}>
                Vandaag
              </Button>
              <Button variant="outline" size="sm" onClick={() => wijzig({ date: gisteren() })}>
                Gisteren
              </Button>
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="tekst">Tekst</FieldLabel>
            <Textarea
              id="tekst"
              rows={16}
              value={formulier.text}
              maxLength={MAX_TEKST}
              placeholder="Wat gebeurde er? Wat viel je op?"
              onChange={(gebeurtenis) => wijzig({ text: gebeurtenis.target.value })}
            />
            {tekens >= WAARSCHUW_VANAF ? (
              <FieldDescription>
                {tekens.toLocaleString("nl-NL")} tekens. Boven de {MAX_TEKST.toLocaleString("nl-NL")}{" "}
                kun je niet verder typen; splits hem dan in twee documentaties.
              </FieldDescription>
            ) : null}
          </Field>
        </div>

        <div className="space-y-6">
          <Koppelingen
            formulier={formulier}
            leerlingen={waarde.leerlingen}
            groepen={waarde.groepen}
            reeksen={waarde.reeksen}
            onWijzig={wijzig}
          />

          <PhotoStrip
            photoIds={formulier.photoIds}
            onWijzig={(photoIds) => wijzig({ photoIds })}
            onFout={setFout}
            onDatumsuggestie={(datum) => {
              // Alleen invullen zolang de gebruiker de datum niet zelf heeft gezet.
              if (formulier.date === vandaag()) wijzig({ date: datum });
            }}
          />

          <Field>
            <FieldLabel htmlFor="notitie">Notitie voor jezelf</FieldLabel>
            <FieldDescription>
              Blijft binnen: staat niet in een export en gaat nooit mee naar de AI.
            </FieldDescription>
            <Textarea
              id="notitie"
              rows={3}
              maxLength={2_000}
              value={formulier.privateNote}
              onChange={(gebeurtenis) => wijzig({ privateNote: gebeurtenis.target.value })}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

/** De dag vóór vandaag, als snelknop naast Vandaag. */
function gisteren(): string {
  const moment = new Date();
  moment.setDate(moment.getDate() - 1);
  return vandaag(moment);
}

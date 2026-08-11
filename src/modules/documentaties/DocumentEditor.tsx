"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { ErrorMessage } from "@/ui/ErrorMessage";
import { SaveStatus, type SaveState } from "@/ui/SaveStatus";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from "@/ui/field";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Skeleton } from "@/ui/skeleton";
import { Textarea } from "@/ui/textarea";
import { useDienst } from "@/hooks/useDienst";
import { vandaag } from "@/lib/weergave";
import { diensten, type Diensten } from "@/services/diensten";
import { weergavenaam } from "@/services/students/StudentService";

/** De sleutel in de URL van een documentatie die nog niet bestaat. */
export const NIEUW = "nieuw";

interface DocumentEditorProps {
  documentId: string;
}

/**
 * Het schrijfscherm (§6.1.1).
 *
 * Vier velden: titel, datum, leerlingen en de tekst. Dat is wat INV-07 "inhoud"
 * noemt, en genoeg om een documentatie te laten bestaan.
 *
 * **Opslaan gebeurt met een knop en niet automatisch.** §10.7 schrijft autosave voor
 * met een timer van 1.000 ms; die komt met `useAutosave` en de opslagindicator met
 * drie standen. Zolang dat er niet is, is een knop eerlijker dan een indicator die
 * doet alsof er iets bewaard wordt.
 *
 * Wat er verder nog niet is: pagina's, foto's, citaten, reeksen, koppelingen aan
 * groepen, de gespreksmodus, AI en exporteren. Alle acht staan in §6.1 en hebben hun
 * eigen service in §10.4.
 */
export function DocumentEditor({ documentId }: DocumentEditorProps) {
  const router = useRouter();

  const [status, setStatus] = useState<SaveState>("idle");
  const [fout, setFout] = useState<string | null>(null);
  /** De sleutel die het aanmaken opleverde. Houdt een tweede keer opslaan bij dezelfde. */
  const [gemaakt, setGemaakt] = useState<string | null>(null);

  const laad = useCallback(
    async ({ documentation, students }: Diensten) => {
      const leerlingen = await students.lijst();
      if (!leerlingen.ok) return leerlingen;

      if (documentId === NIEUW) {
        return {
          ok: true as const,
          value: {
            leerlingen: leerlingen.value,
            formulier: { title: "", date: vandaag(), studentIds: [] as string[], text: "" },
          },
        };
      }

      const geopend = await documentation.open(documentId);
      if (!geopend.ok) return geopend;
      if (!geopend.value) return { ok: true as const, value: null };

      const { documentatie } = geopend.value;
      return {
        ok: true as const,
        value: {
          leerlingen: leerlingen.value,
          formulier: {
            title: documentatie.title,
            date: documentatie.date,
            studentIds: documentatie.studentIds,
            text: documentation.tekstVan(geopend.value),
          },
        },
      };
    },
    [documentId],
  );

  const { waarde, fout: laadfout, bezig } = useDienst(laad);
  const [concept, setConcept] = useState<{
    title: string;
    date: string;
    studentIds: string[];
    text: string;
  } | null>(null);

  const formulier = concept ?? waarde?.formulier ?? null;

  function wijzig(deel: Partial<NonNullable<typeof formulier>>) {
    if (!formulier) return;
    setConcept({ ...formulier, ...deel });
    setStatus("idle");
  }

  function zetLeerling(id: string, aan: boolean) {
    if (!formulier) return;
    wijzig({
      studentIds: aan
        ? [...formulier.studentIds, id]
        : formulier.studentIds.filter((sleutel) => sleutel !== id),
    });
  }

  async function bewaar() {
    if (!formulier) return;
    setStatus("saving");
    setFout(null);

    const sleutel = gemaakt ?? documentId;
    const { documentation } = await diensten();
    const uitkomst =
      sleutel === NIEUW
        ? await documentation.maak(formulier)
        : await documentation.bewaar(sleutel, formulier);

    if (!uitkomst.ok) {
      setStatus("idle");
      setFout(uitkomst.error.message);
      return;
    }

    setStatus("saved");

    // Na het aanmaken staat de documentatie op zijn eigen adres, zodat vernieuwen
    // hem terugvindt in plaats van een tweede aan te maken.
    //
    // Rechtstreeks via de geschiedenis en niet met `router.replace`: die laatste
    // wisselt het routesegment, waardoor dit scherm opnieuw wordt gemonteerd en de
    // melding "Opgeslagen." verdwijnt vóór je haar hebt gezien.
    if (sleutel === NIEUW) {
      const nieuweSleutel = uitkomst.value.documentatie.id;
      setGemaakt(nieuweSleutel);
      window.history.replaceState(null, "", `/documentaties/${nieuweSleutel}`);
    }
  }

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

  if (!formulier) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <ErrorMessage
          message="Deze documentatie bestaat niet meer."
          nextStep="Ga terug naar het overzicht."
          action={{ label: "Naar het overzicht", onClick: () => router.push("/documentaties") }}
        />
      </div>
    );
  }

  return (
    <form
      className="mx-auto max-w-3xl space-y-6 p-4 md:p-6"
      onSubmit={(gebeurtenis) => {
        gebeurtenis.preventDefault();
        void bewaar();
      }}
    >
      <Field>
        <FieldLabel htmlFor="titel">Titel</FieldLabel>
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
        <Input
          id="datum"
          type="date"
          className="max-w-44"
          value={formulier.date}
          onChange={(gebeurtenis) => wijzig({ date: gebeurtenis.target.value })}
        />
      </Field>

      {waarde && waarde.leerlingen.length > 0 ? (
        <FieldSet>
          <FieldLegend variant="label">Leerlingen</FieldLegend>
          <FieldDescription>Over wie gaat deze documentatie?</FieldDescription>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {waarde.leerlingen.map((leerling) => (
              <div key={leerling.id} className="flex items-center gap-2">
                <Checkbox
                  id={`leerling-${leerling.id}`}
                  checked={formulier.studentIds.includes(leerling.id)}
                  onCheckedChange={(aan) => zetLeerling(leerling.id, aan === true)}
                />
                <Label htmlFor={`leerling-${leerling.id}`}>{weergavenaam(leerling)}</Label>
              </div>
            ))}
          </div>
        </FieldSet>
      ) : (
        <FieldDescription>
          Je hebt nog geen leerlingen. Voeg ze toe bij Instellingen om ze hier te kunnen kiezen.
        </FieldDescription>
      )}

      <Field>
        <FieldLabel htmlFor="tekst">Tekst</FieldLabel>
        <Textarea
          id="tekst"
          rows={10}
          value={formulier.text}
          placeholder="Wat gebeurde er? Wat viel je op?"
          onChange={(gebeurtenis) => wijzig({ text: gebeurtenis.target.value })}
        />
      </Field>

      {fout ? <ErrorMessage message={fout} nextStep="Pas het aan en probeer het opnieuw." /> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={status === "saving"}>
          Opslaan
        </Button>
        <SaveStatus state={status} />
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";

import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { FieldDescription } from "@/ui/field";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import type { Colour, Series } from "@/domain/types";
import { diensten } from "@/services/diensten";
import { PALET, REEKSNAAM_MAX, volgendeKleur } from "@/services/series/SeriesService";

/**
 * Een reeks maken op de plek waar je hem nodig hebt (`FR-DOC-125`, `FR-DOC-126`, B-127).
 *
 * §6.1 vraagt dit al voor het schrijfscherm: *"Reeks is een keuzeveld met zoeken,
 * met onderaan altijd de regel «Nieuwe reeks maken…»"*. Tot B-127 stond het maken
 * alleen in Instellingen, en dan is de weg: opslaan, wegnavigeren, reeks maken,
 * terug, en hopen dat je concept er nog staat. Dat is vier handelingen voor iets
 * wat er één hoort te zijn (§4.2).
 *
 * **Inline en geen venster.** Een overlay boven een formulier waar je net in typte
 * legt je eigen tekst weg achter een tweede laag. Dit blok komt op de plek van het
 * keuzeveld te staan en verdwijnt weer, met de nieuwe reeks alvast gekozen.
 *
 * De regels blijven van `SeriesService`: naam 1-60 tekens, kleur uit de acht van
 * §5.5. Er wordt hier niets nagerekend wat daar al staat (U-03).
 */
export function NieuweReeks({
  aantalBestaand,
  onGemaakt,
  onAnnuleer,
}: {
  /** Bepaalt welke kleur alvast aanstaat; dezelfde volgorde als in Instellingen. */
  aantalBestaand: number;
  onGemaakt: (reeks: Series) => void;
  onAnnuleer: () => void;
}) {
  const [naam, setNaam] = useState("");
  const [beschrijving, setBeschrijving] = useState("");
  const [kleur, setKleur] = useState<Colour | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  const gekozen = kleur ?? volgendeKleur(aantalBestaand);
  const kanMaken = naam.trim() !== "" && !bezig;

  async function maak() {
    setBezig(true);
    const { series } = await diensten();
    const uitkomst = await series.maak({ name: naam, colour: gekozen, description: beschrijving });
    setBezig(false);

    if (!uitkomst.ok) return setFout(uitkomst.error.message);
    onGemaakt(uitkomst.value);
  }

  return (
    <div className="border-border space-y-3 rounded-md border p-3">
      <Input
        autoFocus
        aria-label="Naam van de nieuwe reeks"
        placeholder="Naam van de reeks"
        maxLength={REEKSNAAM_MAX}
        value={naam}
        onChange={(gebeurtenis) => setNaam(gebeurtenis.target.value)}
        onKeyDown={(gebeurtenis) => {
          // Enter in een tekstveld binnen het schrijfscherm zou anders het
          // omliggende formulier verzenden; hier hoort hij de reeks te maken.
          if (gebeurtenis.key !== "Enter") return;
          gebeurtenis.preventDefault();
          if (kanMaken) void maak();
        }}
      />
      <Textarea
        aria-label="Beschrijving van de nieuwe reeks"
        placeholder="Waar gaat deze reeks over? Deze zin helpt de AI bij een vervolgdeel."
        rows={2}
        value={beschrijving}
        onChange={(gebeurtenis) => setBeschrijving(gebeurtenis.target.value)}
      />

      <Kleurkiezer gekozen={gekozen} onKies={setKleur} />

      <Knoppen kanMaken={kanMaken} onMaak={() => void maak()} onAnnuleer={onAnnuleer} />

      {fout ? <ErrorMessage message={fout} nextStep="Pas de naam aan en probeer het opnieuw." /> : null}
    </div>
  );
}

/** De twee knoppen, met eronder waar de reeks straks nog meer staat. */
function Knoppen({
  kanMaken,
  onMaak,
  onAnnuleer,
}: {
  kanMaken: boolean;
  onMaak: () => void;
  onAnnuleer: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={!kanMaken} onClick={onMaak}>
          Reeks toevoegen
        </Button>
        <Button type="button" variant="ghost" onClick={onAnnuleer}>
          Annuleren
        </Button>
      </div>
      <FieldDescription>
        De reeks komt ook in Instellingen te staan. Verwijderen kan daar.
      </FieldDescription>
    </div>
  );
}

/** De acht van §5.5. Dezelfde volgorde en dezelfde standaard als in Instellingen (U-03). */
function Kleurkiezer({ gekozen, onKies }: { gekozen: Colour; onKies: (kleur: Colour) => void }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">Kleur</legend>
      <div className="flex flex-wrap gap-2">
        {PALET.map((optie) => (
          <button
            key={optie}
            type="button"
            aria-label={`Kleur ${optie.replace("series-", "")}`}
            aria-pressed={optie === gekozen}
            onClick={() => onKies(optie)}
            className={`size-8 rounded-full border-2 ${
              optie === gekozen ? "border-foreground" : "border-transparent"
            }`}
            style={{ backgroundColor: `var(--palette-${optie})` }}
          />
        ))}
      </div>
    </fieldset>
  );
}

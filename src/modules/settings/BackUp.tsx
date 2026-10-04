"use client";

import { Download, Upload } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/ui/ConfirmDialog";
import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { downloadBestand } from "@/lib/delen";
import { diensten } from "@/services/diensten";
import { samenvatting } from "@/services/backup/manifest";
import type { Gelezenbackup, Terugzetwijze } from "@/services/backup/BackupService";

/**
 * Back-up maken en terugzetten (§6.5.9, `FR-INS-28` t/m `FR-INS-31`, B-143).
 *
 * Twee helften op één scherm, want het is één onderwerp: je werk het apparaat uit
 * krijgen, en weer terug. Het dashboard verwees hier al naar met een knop die
 * nergens heen ging (`FR-DAS-03`).
 *
 * **De waarschuwing staat vóór het aanmaken en niet erna** (`FR-INS-29`). Een
 * vergeten wachtwoord maakt het bestand onbruikbaar en er is geen herstelroute; dat
 * is iets om te lezen terwijl je het wachtwoord bedenkt, niet terwijl je het
 * terugzoekt.
 */
export function BackUp({ documentaties }: { documentaties: number }) {
  return (
    <section className="border-border space-y-6 border-t pt-6">
      <div>
        <h3 className="text-sm font-medium">Back-up</h3>
        <FieldDescription className="pt-1">
          Alles wat je hebt gemaakt staat in deze browser, op dit apparaat. Een back-up is
          de enige manier om het ergens anders te bewaren.
        </FieldDescription>
      </div>

      <Maken />
      <Terugzetten documentaties={documentaties} />
    </section>
  );
}

function Maken() {
  const [wachtwoord, setWachtwoord] = useState("");
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  async function maak() {
    setBezig(true);
    setMelding(null);
    setFout(null);

    const { backup, settings } = await diensten();
    const uitkomst = await backup.maak({ wachtwoord, apparaatnaam: apparaatnaam() });
    setBezig(false);

    if (!uitkomst.ok) return setFout(uitkomst.error.message);

    downloadBestand(new File([uitkomst.value.blob], uitkomst.value.naam, { type: "application/zip" }));
    // Pas ná het downloaden: het dashboard mag niet denken dat er een back-up is
    // terwijl het bestand nergens staat (dezelfde volgorde als `FR-DOC-118`).
    settings.zetVoorkeur("lastBackupAt", new Date().toISOString() as never);

    setMelding(`${uitkomst.value.naam} staat in je map Downloads.`);
  }

  return (
    <div className="space-y-3">
      <Field className="max-w-sm">
        <FieldLabel htmlFor="backup-wachtwoord">Wachtwoord</FieldLabel>
        <FieldDescription>
          Met een wachtwoord is de back-up versleuteld. <strong>Vergeet je het, dan is het
          bestand onbruikbaar</strong> — er is geen herstelroute. Leeg laten mag; dan staat
          er <code>onversleuteld</code> in de bestandsnaam.
        </FieldDescription>
        <Input
          id="backup-wachtwoord"
          type="password"
          autoComplete="new-password"
          placeholder="Leeg laten mag"
          value={wachtwoord}
          onChange={(gebeurtenis) => setWachtwoord(gebeurtenis.target.value)}
        />
      </Field>

      <Button disabled={bezig} onClick={() => void maak()}>
        <Download aria-hidden="true" />
        {bezig ? "Bezig…" : "Back-up maken"}
      </Button>

      {melding ? (
        <p role="status" className="text-success text-sm">
          {melding}
        </p>
      ) : null}
      {fout ? <ErrorMessage message={fout} nextStep="Probeer het opnieuw." /> : null}
    </div>
  );
}

/**
 * Terugzetten, in twee stappen (`FR-INS-30`).
 *
 * Eerst kijken wat erin zit, dan pas kiezen. Andersom kies je blind tussen
 * samenvoegen en vervangen, en dat is precies de keuze waarin mensen hun werk
 * kwijtraken.
 */
function Terugzetten({ documentaties }: { documentaties: number }) {
  const [wachtwoord, setWachtwoord] = useState("");
  const [gelezen, setGelezen] = useState<Gelezenbackup | null>(null);
  const [vraagVervangen, setVraagVervangen] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  async function kies(bestand: File) {
    setBezig(true);
    setMelding(null);
    setFout(null);

    const { backup } = await diensten();
    const uitkomst = await backup.lees(bestand, wachtwoord);
    setBezig(false);

    if (!uitkomst.ok) {
      setGelezen(null);
      return setFout(uitkomst.error.message);
    }

    setGelezen(uitkomst.value);
  }

  async function zetTerug(wijze: Terugzetwijze) {
    if (!gelezen) return;

    setBezig(true);
    const { backup } = await diensten();
    const uitkomst = await backup.zetTerug(gelezen, wijze);
    setBezig(false);

    if (!uitkomst.ok) return setFout(uitkomst.error.message);

    const { teruggezet, overgeslagen } = uitkomst.value;
    setGelezen(null);
    setMelding(
      `${teruggezet} onderdelen teruggezet${overgeslagen > 0 ? `, ${overgeslagen} overgeslagen omdat wat er stond nieuwer was` : ""}. Vernieuw de pagina om alles te zien.`,
    );
  }

  return (
    <div className="space-y-3">
      <Kiezen
        wachtwoord={wachtwoord}
        onWachtwoord={setWachtwoord}
        onBestand={(bestand) => void kies(bestand)}
      />

      {gelezen ? (
        <Inhoud
          gelezen={gelezen}
          bezig={bezig}
          onSamenvoegen={() => void zetTerug("samenvoegen")}
          onVervangen={() => setVraagVervangen(true)}
        />
      ) : null}

      {melding ? (
        <p role="status" className="text-sm">
          {melding}
        </p>
      ) : null}
      {fout ? <ErrorMessage message={fout} nextStep="Controleer het bestand en het wachtwoord." /> : null}

      <ConfirmDialog
        open={vraagVervangen}
        onOpenChange={setVraagVervangen}
        title="Alles vervangen?"
        description={beschrijfVervangen(documentaties)}
        confirmLabel="Ja, alles vervangen"
        destructive
        onConfirm={() => void zetTerug("vervangen")}
      />
    </div>
  );
}

/**
 * Het wachtwoord en het bestand, in die volgorde (`FR-INS-29`).
 *
 * Een eigen veld en niet dat van het maken: dat staat in de andere helft van dit
 * scherm en hoort bij een ander bestand. Het staat vóór de bestandskiezer, want het
 * lezen begint zodra je een bestand kiest — daarna invullen is te laat.
 */
function Kiezen({
  wachtwoord,
  onWachtwoord,
  onBestand,
}: {
  wachtwoord: string;
  onWachtwoord: (waarde: string) => void;
  onBestand: (bestand: File) => void;
}) {
  return (
    <>
      <Field className="max-w-sm">
        <FieldLabel htmlFor="terugzet-wachtwoord">Wachtwoord van de back-up</FieldLabel>
        <FieldDescription>
          Alleen nodig als er een wachtwoord op stond. Staat er <code>onversleuteld</code>
          {" "}in de bestandsnaam, laat dit dan leeg.
        </FieldDescription>
        <Input
          id="terugzet-wachtwoord"
          type="password"
          autoComplete="off"
          value={wachtwoord}
          onChange={(gebeurtenis) => onWachtwoord(gebeurtenis.target.value)}
        />
      </Field>

      <Field className="max-w-sm">
        <FieldLabel htmlFor="terugzet-bestand">Back-upbestand</FieldLabel>
        <FieldDescription>
          De app laat eerst zien wat erin zit; je kiest daarna pas wat ermee gebeurt.
        </FieldDescription>
        <Input
          id="terugzet-bestand"
          type="file"
          accept=".zip,application/zip"
          onChange={(gebeurtenis) => {
            const bestand = gebeurtenis.target.files?.[0];
            if (bestand) onBestand(bestand);
          }}
        />
      </Field>
    </>
  );
}

/**
 * De tweede bevestiging van `FR-INS-30`, met het huidige aantal erin.
 *
 * Het getal staat er met opzet: "alles vervangen" is abstract, "je 212 documentaties
 * gaan weg" is dat niet.
 */
function beschrijfVervangen(documentaties: number): string {
  const wat =
    documentaties === 0
      ? "Er staat nu geen documentatie in de app"
      : `Je ${documentaties === 1 ? "ene documentatie" : `${documentaties} documentaties`} ${documentaties === 1 ? "verdwijnt" : "verdwijnen"} definitief`;

  return `${wat}, samen met alles wat eraan hangt. Daarna staat alleen wat er in de back-up zit. Dit gaat niet naar de prullenbak en is niet terug te draaien.`;
}

function Inhoud({
  gelezen,
  bezig,
  onSamenvoegen,
  onVervangen,
}: {
  gelezen: Gelezenbackup;
  bezig: boolean;
  onSamenvoegen: () => void;
  onVervangen: () => void;
}) {
  const gemaakt = new Date(gelezen.manifest.createdAt);

  return (
    <div className="border-border space-y-3 rounded-md border p-3">
      <p className="text-sm">
        Back-up van{" "}
        <strong>{gemaakt.toLocaleDateString("nl-NL", { dateStyle: "long" })}</strong>
        {gelezen.manifest.device.name ? ` op ${gelezen.manifest.device.name}` : ""}.
      </p>
      <ul className="text-muted-foreground list-inside list-disc text-sm">
        {samenvatting(gelezen.manifest).map((regel) => (
          <li key={regel}>{regel}</li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={bezig} onClick={onSamenvoegen}>
          <Upload aria-hidden="true" />
          Samenvoegen met wat er nu staat
        </Button>
        <Button variant="ghost" disabled={bezig} onClick={onVervangen}>
          Alles vervangen
        </Button>
      </div>
      <FieldDescription>
        Bij samenvoegen blijft per onderdeel de nieuwste bewerking staan.
      </FieldDescription>
    </div>
  );
}

/**
 * Een naam voor dit apparaat, voor in de bestandsnaam (§8.7).
 *
 * Geraden uit de browser en niet gevraagd: de naam dient om twee back-ups uit elkaar
 * te houden, en daar is "pc" of "telefoon" genoeg voor. Een veld erbij zou een vraag
 * stellen waar niemand op zit te wachten.
 */
function apparaatnaam(): string {
  if (typeof navigator === "undefined") return "";
  return /Android|iPhone|iPad/u.test(navigator.userAgent) ? "telefoon" : "pc";
}

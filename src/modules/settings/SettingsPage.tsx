"use client";

import { Layers, Sparkles, Users, UsersRound } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/ui/item";
import { Skeleton } from "@/ui/skeleton";
import { useDienst } from "@/app/providers/useDienst";
import { diensten, type Diensten } from "@/services/diensten";

import { BackUp } from "./BackUp";
import { Meldingen } from "./Meldingen";
import { SchoolYearForm } from "./SchoolYearForm";
import { SettingsForm } from "./SettingsForm";

/**
 * Instellingen (§6.5).
 *
 * Drie deuren en vier instellingen. De deuren zijn de drie schermen waar §6.5 mee
 * begint — leerlingen, groepen, reeksen — want zonder die drie doet de rest van de
 * app niets: zonder leerlingenlijst doet de afscherming stilzwijgend niets, en dat
 * is het scenario waar dit product tegen beschermt (A7 uit de review, FR-INS-18).
 *
 * De back-up staat er sinds B-143 (§6.5.9): alles staat in deze browser, en zonder
 * back-up is een geleegd profiel het werk van een schooljaar.
 *
 * De detectoren, het stijlprofiel, het logboek en wissen staan in §6.5 en komen
 * later. Ze staan hier niet als lege knop: een knop die niets doet is erger dan een
 * knop die er nog niet is.
 */
export function SettingsPage() {
  // Een inline functie, want de lintregel van React wil dat zien; het werk staat in
  // `haalOp` zodat dit bestand onder de zestig regels van DR-53 blijft.
  const laad = useCallback((alles: Diensten) => haalOp(alles), []);

  const { waarde, fout: laadfout, bezig: laden, herlaad } = useDienst(laad);

  if (laadfout) {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-6">
        <ErrorMessage message={laadfout.message} nextStep="Vernieuw de pagina." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <ul className="space-y-2">
        <Deur
          href="/settings/students"
          icon={Users}
          titel="Leerlingen"
          uitleg="Wie er in je groep zitten. EduFlow gebruikt deze namen om ze af te schermen voordat er tekst naar AI gaat."
        />
        <Deur
          href="/settings/groups"
          icon={UsersRound}
          titel="Groepen"
          uitleg="Een kind zit niet ín een groep maar heeft een lidmaatschap met een looptijd. Zo kan het tegelijk in twee groepen zitten."
        />
        <Deur
          href="/settings/series"
          icon={Layers}
          titel="Reeksen"
          uitleg="Bundelt documentaties die bij elkaar horen. De beschrijving helpt de AI bij een vervolgdeel."
        />
      </ul>

      {laden && !waarde ? (
        <div className="space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : null}

      {waarde ? <SettingsForm begin={waarde.instellingen} /> : null}

      {waarde ? (
        <SchoolYearForm
          begin={waarde.schooljaar}
          region={waarde.instellingen.region}
          onOpgeslagen={herlaad}
        />
      ) : null}

      {/* §6.2.9: de uitleg hoort bij de functie, niet als voetnoot eronder. */}
      {waarde ? <Meldingen toestemming={waarde.meldingen} /> : null}

      {/* §6.5.9: het dashboard verwees hier al naar met `FR-DAS-03`. */}
      {waarde ? <BackUp documentaties={waarde.documentaties} /> : null}

      <VerzonnenGroep />
    </div>
  );
}

/**
 * Alles wat dit scherm toont, in één keer opgehaald (§10.10).
 *
 * Buiten de component, zodat `useCallback` er een stabiele verwijzing naar heeft en
 * dit bestand niet opnieuw over de zestig regels van DR-53 gaat.
 */
async function haalOp({ settings, agenda, notifications, documentation }: Diensten) {
  const record = await settings.lees();
  if (!record.ok) return record;

  const jaar = await agenda.huidigSchooljaar();
  if (!jaar.ok) return jaar;

  // `FR-INS-30`: de tweede bevestiging bij "alles vervangen" noemt dit getal.
  const documentaties = await documentation.lijst();
  if (!documentaties.ok) return documentaties;

  return {
    ok: true as const,
    value: {
      instellingen: {
        pupilNoun: record.value.pupilNoun,
        attentionThresholdDays: record.value.attentionThresholdDays,
        showAttention: record.value.showAttention,
        showOutgoingRequest: record.value.showOutgoingRequest,
        region: settings.voorkeur("region"),
      },
      schooljaar: {
        name: jaar.value?.name ?? "",
        firstSchoolDay: jaar.value?.firstSchoolDay ?? "",
        lastSchoolDay: jaar.value?.lastSchoolDay ?? "",
      },
      // FR-AGE-28: alleen uitlezen. Vragen gebeurt pas na een klik.
      meldingen: notifications.toestemming(),
      documentaties: documentaties.value.length,
    },
  };
}

/** Doorloopgereedschap (werkopdracht D02); gaat eruit vóór v1.0. */
function VerzonnenGroep() {
  const [melding, setMelding] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  async function vul() {
    setBezig(true);
    setFout(null);

    const { sampleData } = await diensten();
    const uitkomst = await sampleData.vulVerzonnenGroep();
    setBezig(false);

    if (!uitkomst.ok) {
      setMelding(null);
      return setFout(uitkomst.error.message);
    }

    const { leerlingen, groepen, lidmaatschappen, reeksen } = uitkomst.value;
    setMelding(
      `Klaar: ${leerlingen} leerlingen, ${groepen} groepen met ${lidmaatschappen} lidmaatschappen en ${reeksen} reeksen.`,
    );
  }

  return (
    <div className="border-border space-y-3 border-t pt-6">
      <p className="text-muted-foreground text-sm">
        Twintig verzonnen namen, drie groepen en drie reeksen om de app mee uit te proberen. Er
        komt nooit de naam van een echt kind in.
      </p>
      <Button variant="outline" disabled={bezig} onClick={() => void vul()}>
        <Sparkles aria-hidden="true" />
        Vul de verzonnen groep
      </Button>
      {melding ? (
        <p role="status" className="text-sm">
          {melding}
        </p>
      ) : null}
      {fout ? (
        <ErrorMessage message={fout} nextStep="Verwijder eerst de bestaande leerlingen." />
      ) : null}
    </div>
  );
}

function Deur({
  href,
  icon: Icoon,
  titel,
  uitleg,
}: {
  href: string;
  icon: typeof Users;
  titel: string;
  uitleg: string;
}) {
  return (
    <li>
      <Item variant="outline" className="relative">
        <ItemContent>
          <ItemTitle>
            <Link href={href} className="after:absolute after:inset-0 after:content-['']">
              {titel}
            </Link>
          </ItemTitle>
          <ItemDescription>{uitleg}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Icoon aria-hidden="true" className="size-4 text-muted-foreground" />
        </ItemActions>
      </Item>
    </li>
  );
}

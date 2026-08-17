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
 * De AI-provider, de detectoren, het stijlprofiel, het logboek, de back-up en
 * wissen staan in §6.5 en komen later. Ze staan hier niet als lege knop: een knop
 * die niets doet is erger dan een knop die er nog niet is.
 */
export function SettingsPage() {
  const [melding, setMelding] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  const laad = useCallback(async ({ settings, agenda, notifications }: Diensten) => {
    const record = await settings.lees();
    if (!record.ok) return record;

    const jaar = await agenda.huidigSchooljaar();
    if (!jaar.ok) return jaar;

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
      },
    };
  }, []);

  const { waarde, fout: laadfout, bezig: laden, herlaad } = useDienst(laad);

  async function vulVerzonnenGroep() {
    setBezig(true);
    setFout(null);

    const { sampleData } = await diensten();
    const uitkomst = await sampleData.vulVerzonnenGroep();
    setBezig(false);

    if (!uitkomst.ok) {
      setMelding(null);
      setFout(uitkomst.error.message);
      return;
    }

    const { leerlingen, groepen, lidmaatschappen, reeksen } = uitkomst.value;
    setMelding(
      `Klaar: ${leerlingen} leerlingen, ${groepen} groepen met ${lidmaatschappen} lidmaatschappen en ${reeksen} reeksen.`,
    );
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

      <div className="space-y-3 border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          Twintig verzonnen namen, drie groepen en drie reeksen om de app mee uit te proberen. Er
          komt nooit de naam van een echt kind in.
        </p>
        <Button variant="outline" disabled={bezig} onClick={() => void vulVerzonnenGroep()}>
          <Sparkles aria-hidden="true" />
          Vul de verzonnen groep
        </Button>
        {melding ? (
          <p role="status" className="text-sm">
            {melding}
          </p>
        ) : null}
        {fout ? <ErrorMessage message={fout} nextStep="Verwijder eerst de bestaande leerlingen." /> : null}
      </div>
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

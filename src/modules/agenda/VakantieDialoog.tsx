"use client";

import { useState } from "react";

import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/ui/sheet";
import { datumLang } from "@/lib/weergave";
import type { Vakantie } from "@/services/agenda/HolidayService";
import { diensten } from "@/services/diensten";

/**
 * Eén vakantie bekijken en, als het mag, aanpassen (`FR-AGE-09`, `FR-AGE-10`).
 *
 * **Kerst en zomer liggen landelijk vast** en tonen daarom geen velden maar de
 * uitleg waarom. De drie adviesvakanties zijn wel aan te passen; dat schrijft een
 * `HolidayOverride` naast het bronbestand in plaats van erin, zodat een update van
 * het bestand jouw datums niet overschrijft (`FR-AGE-11`).
 */
interface VakantieDialoogProps {
  vakantie: Vakantie;
  onOpenChange: (open: boolean) => void;
  onKlaar: () => void;
}

export function VakantieDialoog({ vakantie, onOpenChange, onKlaar }: VakantieDialoogProps) {
  const [van, setVan] = useState(vakantie.from);
  const [tot, setTot] = useState(vakantie.to);
  const [fout, setFout] = useState<string | null>(null);

  async function bewaar() {
    const { holidays } = await diensten();
    const uitkomst = await holidays.pasAan(
      vakantie.schoolYearName,
      vakantie.region,
      vakantie.holidayKey,
      van,
      tot,
    );
    if (!uitkomst.ok) return setFout(uitkomst.error.message);
    onKlaar();
  }

  async function herstel() {
    const { holidays } = await diensten();
    const uitkomst = await holidays.herstel(
      vakantie.schoolYearName,
      vakantie.region,
      vakantie.holidayKey,
    );
    if (!uitkomst.ok) return setFout(uitkomst.error.message);
    onKlaar();
  }

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-(--size-panel) gap-0 overflow-y-auto sm:max-w-(--size-panel)">
        <SheetHeader>
          <SheetTitle>{vakantie.name}</SheetTitle>
          <SheetDescription>
            {datumLang(vakantie.from)} tot en met {datumLang(vakantie.to)}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          {vakantie.fixed ? (
            <p className="text-muted-foreground text-sm">
              Kerst- en zomervakantie liggen landelijk vast.
            </p>
          ) : (
            <>
              <FieldDescription>
                Wat je hier invult, blijft staan als het vakantiebestand wordt vervangen.
              </FieldDescription>

              <div className="flex flex-wrap gap-4">
                <Field className="w-40">
                  <FieldLabel htmlFor="vak-van">Van</FieldLabel>
                  <Input
                    id="vak-van"
                    type="date"
                    value={van}
                    onChange={(gebeurtenis) => {
                      const nieuw = gebeurtenis.target.value;
                      setVan(nieuw);
                      if (nieuw > tot) setTot(nieuw);
                    }}
                  />
                </Field>
                <Field className="w-40">
                  <FieldLabel htmlFor="vak-tot">Tot en met</FieldLabel>
                  <Input
                    id="vak-tot"
                    type="date"
                    value={tot}
                    onChange={(gebeurtenis) => setTot(gebeurtenis.target.value)}
                  />
                </Field>
              </div>

              {vakantie.landelijk ? (
                <p className="text-muted-foreground text-sm">
                  Landelijk: {datumLang(vakantie.landelijk.from)} tot en met{" "}
                  {datumLang(vakantie.landelijk.to)}.
                </p>
              ) : null}

              {fout ? <ErrorMessage message={fout} nextStep="Pas de datums aan." /> : null}

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void bewaar()}>Opslaan</Button>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Annuleren
                </Button>
                {vakantie.aangepast ? (
                  <Button variant="ghost" className="ms-auto" onClick={() => void herstel()}>
                    Landelijke datums
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

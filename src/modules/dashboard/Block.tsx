"use client";

import type { ReactNode } from "react";

import { Button } from "@/ui/button";
import { cn } from "@/lib/utils";

/**
 * De vorm die alle blokken delen (§6.4.1).
 *
 * Een kop, hoogstens vijf regels en **één** knop. Geen grafieken, geen tellers, geen
 * prestatie-indicatoren: iemand die om kwart voor acht inlogt wil weten wat er vandaag
 * gebeurt en waar zij gebleven was.
 *
 * Dat "één knop" is een grens en geen suggestie. Twee knoppen betekent dat het blok
 * twee dingen doet, en dan hoort het er twee te zijn.
 */
interface BlockProps {
  kop: string;
  /** De enige knop. Zonder knop is het blok een mededeling. */
  knop?: { label: string; onClick: () => void };
  /** `FR-DAS-03`: een dringende rand in plaats van een uitroepteken. */
  dringend?: boolean;
  /** De regel onder de inhoud, zoals de verplichte regel van `FR-DAS-06`. */
  voetregel?: string;
  className?: string;
  children: ReactNode;
}

export function Block({ kop, knop, dringend, voetregel, className, children }: BlockProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-lg border p-4",
        dringend && "border-warning",
        className,
      )}
    >
      <h2 className="text-sm font-medium">{kop}</h2>

      <div className="min-h-0 flex-1 text-sm">{children}</div>

      {voetregel ? <p className="text-muted-foreground text-xs">{voetregel}</p> : null}

      {knop ? (
        <Button variant="outline" size="sm" className="self-start" onClick={knop.onClick}>
          {knop.label}
        </Button>
      ) : null}
    </section>
  );
}

/** Eén regel in een blok. Hoogstens vijf per blok (§6.4.1). */
export function Regel({
  children,
  gemarkeerd,
  onClick,
}: {
  children: ReactNode;
  /** `FR-DAS-05`: de studiedag van vandaag valt op. */
  gemarkeerd?: boolean;
  onClick?: () => void;
}) {
  const inhoud = <span className={cn("block truncate", gemarkeerd && "font-medium")}>{children}</span>;

  if (!onClick) return <li className="py-0.5">{inhoud}</li>;

  return (
    <li>
      <button type="button" onClick={onClick} className="hover:text-accent block w-full py-0.5 text-left">
        {inhoud}
      </button>
    </li>
  );
}

/** Wat er staat als een blok niets heeft. Alleen Back-up toont dit (§6.4.5). */
export function Leeg({ tekst }: { tekst: string }) {
  return <p className="text-muted-foreground">{tekst}</p>;
}

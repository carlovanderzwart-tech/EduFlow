import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  /** In gewone taal. Geen foutcodes. */
  message: string;
  /** Wat de gebruiker nu kan doen. Verplicht. */
  nextStep: string;
  /** Optionele knop die de vervolgstap uitvoert. */
  action?: { label: string; onClick: () => void };
  className?: string;
}

/**
 * Foutmelding in gewone taal, met altijd een vervolgstap.
 *
 * docs/archief/04 (*Gedeelde patronen*): *"Fouten. Altijd in gewone taal, altijd met een
 * vervolgstap. Niet: 'Error 500.'"* Die vervolgstap is hier een **verplichte**
 * prop: een melding zonder vervolgstap is met dit component niet te maken.
 *
 * `role="alert"` zodat een schermlezer de melding voorleest zodra hij verschijnt.
 */
export function ErrorMessage({ message, nextStep, action, className }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm",
        className,
      )}
    >
      <div className="flex gap-2">
        <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="space-y-1">
          <p className="font-medium text-foreground">{message}</p>
          <p className="text-muted-foreground">{nextStep}</p>
        </div>
      </div>
      {action ? (
        <Button variant="outline" size="sm" className="self-start" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
}

/**
 * Gedeeld patroon voor lege schermen (zie `docs/04 - Product Blueprint.md`,
 * *Gedeelde patronen*): nooit alleen leegte, altijd één zin uitleg en
 * hooguit één knop.
 */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <Icon aria-hidden="true" className="size-10 text-muted-foreground" />
      <div className="space-y-1">
        <h1 className="text-base font-medium text-foreground">{title}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action ? (
        <Button size="sm" onClick={action.onClick} className="mt-1">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

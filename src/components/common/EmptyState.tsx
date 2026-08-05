import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  /** Eén zin die uitlegt wat hier komt te staan. */
  description: string;
  /** Hooguit één knop. */
  action?: EmptyStateAction;
}

/**
 * Preset boven de `Empty`-primitive.
 *
 * Doc 04 (*Gedeelde patronen*) schrijft voor lege schermen een vaste vorm voor:
 * *"Nooit alleen leegte. Altijd één zin die uitlegt wat hier komt te staan,
 * plus één knop."* De primitive is vrij samen te stellen; deze wrapper legt die
 * vorm vast zodat elk leeg scherm in EduFlow er hetzelfde uitziet.
 */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Empty className="min-h-[50vh]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action ? (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </Empty>
  );
}

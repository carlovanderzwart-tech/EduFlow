"use client";

import { Copy, MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DocumentActionsMenuProps {
  title: string;
  onOpen: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

/**
 * Acties per documentatie (docs/archief/04, scherm 2): openen, dupliceren, verwijderen.
 *
 * Exporteren staat hier nog niet: dat komt met de exportlaag. Lang indrukken —
 * de tweede manier die docs/archief/04 noemt — is niet gebouwd; een menu-icoon is op
 * beide apparaten te gebruiken en lang indrukken botst op de telefoon met
 * tekstselectie en scrollen.
 */
export function DocumentActionsMenu({
  title,
  onOpen,
  onDuplicate,
  onDelete,
}: DocumentActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label={`Acties voor ${title}`}>
            <MoreVertical aria-hidden="true" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onOpen}>
          <Pencil aria-hidden="true" />
          Openen
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy aria-hidden="true" />
          Dupliceren
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 aria-hidden="true" />
          Verwijderen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

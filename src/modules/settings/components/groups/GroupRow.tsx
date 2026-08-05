"use client";

import { Archive, ArchiveRestore, MoreVertical, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { cn } from "@/lib/utils";
import type { Group } from "@/types/group";

interface GroupRowProps {
  group: Group;
  studentCount: number;
  onRename: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onRemove: () => void;
}

/**
 * Eén groep in de lijst (doc 04, scherm 7): naam, schooljaar en hoeveel
 * leerlingen erin zitten.
 *
 * Gearchiveerde groepen staan gedempt en hebben één knop om ze terug te halen;
 * de overige acties horen bij een groep die in gebruik is.
 */
export function GroupRow({
  group,
  studentCount,
  onRename,
  onArchive,
  onUnarchive,
  onRemove,
}: GroupRowProps) {
  const students = studentCount === 1 ? "1 leerling" : `${studentCount} leerlingen`;
  const meta = [group.schoolYear, students].filter(Boolean);

  return (
    <Item variant="outline" className={cn(group.archived && "opacity-60")}>
      <ItemContent>
        <ItemTitle>{group.name}</ItemTitle>
        <ItemDescription>{meta.join(" · ")}</ItemDescription>
      </ItemContent>

      <ItemActions>
        {group.archived ? (
          <Button variant="outline" size="sm" onClick={onUnarchive}>
            <ArchiveRestore aria-hidden="true" />
            Terughalen
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label={`Acties voor ${group.name}`}>
                  <MoreVertical aria-hidden="true" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onRename}>
                <Pencil aria-hidden="true" />
                Hernoemen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onArchive}>
                <Archive aria-hidden="true" />
                Archiveren
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onRemove}>
                <Trash2 aria-hidden="true" />
                Opruimen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </ItemActions>
    </Item>
  );
}

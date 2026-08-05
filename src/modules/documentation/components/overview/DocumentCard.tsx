"use client";

import { ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { type Documentation, getDocumentStatus } from "@/types/documentation";
import { formatDateShort } from "@/utils/date";

import { DocumentActionsMenu } from "./DocumentActionsMenu";
import { DocumentStatusBadge } from "./DocumentStatusBadge";

interface DocumentCardProps {
  document: Documentation;
  /** Leeg wanneer de documentatie niet bij een reeks hoort. */
  seriesName?: string;
  /** Leeg wanneer de groep is opgeruimd; de documentatie blijft dan zichtbaar. */
  groupName?: string;
  onDuplicate: () => void;
  onDelete: () => void;
}

/**
 * Eén regel in het overzicht (doc 04, scherm 2): titel, reeks, datum, groep,
 * of er foto's bij zitten, en de status.
 *
 * De titel is een link die over de hele regel uitrekt, zodat de hele regel een
 * raakvlak is op de telefoon. Het actiemenu ligt daar met `z-10` bovenop; zo
 * blijft de opmaak geldig zonder een knop binnen een link te zetten.
 */
export function DocumentCard({
  document,
  seriesName,
  groupName,
  onDuplicate,
  onDelete,
}: DocumentCardProps) {
  const router = useRouter();
  const title = document.title.trim() || "Zonder titel";
  const status = getDocumentStatus(document);

  const meta = [seriesName, formatDateShort(document.date), groupName].filter(Boolean);

  return (
    <Item variant="outline" className="relative">
      <ItemContent>
        <ItemTitle>
          <Link
            href={`/documentation/${document.id}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {title}
          </Link>
        </ItemTitle>
        <ItemDescription>{meta.join(" · ")}</ItemDescription>
      </ItemContent>

      <ItemActions className="relative z-10">
        {document.photoIds.length > 0 ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <ImageIcon aria-hidden="true" className="size-3.5" />
            {document.photoIds.length}
            <span className="sr-only">foto&apos;s</span>
          </span>
        ) : null}
        <DocumentStatusBadge status={status} />
        <DocumentActionsMenu
          title={title}
          onOpen={() => router.push(`/documentation/${document.id}`)}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </ItemActions>
    </Item>
  );
}

"use client";

import { ItemGroup } from "@/components/ui/item";
import type { Documentation, Series } from "@/types/documentation";
import type { Group } from "@/types/group";

import { DocumentCard } from "./DocumentCard";

interface DocumentListProps {
  documents: Documentation[];
  series: Series[];
  groups: Group[];
  onDuplicate: (id: string) => void;
  onDelete: (doc: Documentation) => void;
}

/** De platte lijst, nieuwste eerst. Sorteren gebeurt in `DocumentService`. */
export function DocumentList({
  documents,
  series,
  groups,
  onDuplicate,
  onDelete,
}: DocumentListProps) {
  return (
    <ItemGroup className="gap-2">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          seriesName={series.find((entry) => entry.id === doc.seriesId)?.name}
          groupName={groups.find((entry) => entry.id === doc.groupId)?.name}
          onDuplicate={() => onDuplicate(doc.id)}
          onDelete={() => onDelete(doc)}
        />
      ))}
    </ItemGroup>
  );
}

"use client";

import { ItemGroup } from "@/components/ui/item";
import type { Documentation, Series } from "@/types/documentation";
import type { Group } from "@/types/group";

import { DocumentCard } from "./DocumentCard";

interface SeriesGroupListProps {
  documents: Documentation[];
  series: Series[];
  groups: Group[];
  onDuplicate: (id: string) => void;
  onDelete: (doc: Documentation) => void;
}

const WITHOUT_SERIES = "__zonder_reeks__";

/**
 * Gegroepeerd per reeks, met de documentaties in tijdsvolgorde eronder, zodat je
 * een project van begin tot eind ziet (docs/archief/04, *Reeksen*).
 *
 * Documentaties zonder reeks komen onderaan onder één kopje. Een reeks die is
 * opgeruimd terwijl documentaties er nog naar verwijzen valt daar ook onder; die
 * documentaties blijven dus zichtbaar in plaats van uit het overzicht te
 * verdwijnen (docs/archief/03: verwijzingen mogen doodlopen).
 */
export function SeriesGroupList({
  documents,
  series,
  groups,
  onDuplicate,
  onDelete,
}: SeriesGroupListProps) {
  const knownSeriesIds = new Set(series.map((entry) => entry.id));

  const grouped = new Map<string, Documentation[]>();
  for (const doc of documents) {
    const key = doc.seriesId && knownSeriesIds.has(doc.seriesId) ? doc.seriesId : WITHOUT_SERIES;
    const existing = grouped.get(key);
    if (existing) existing.push(doc);
    else grouped.set(key, [doc]);
  }

  // Reeksen in de volgorde van de lijst, daarna de losse documentaties.
  const orderedKeys = [
    ...series.filter((entry) => grouped.has(entry.id)).map((entry) => entry.id),
    ...(grouped.has(WITHOUT_SERIES) ? [WITHOUT_SERIES] : []),
  ];

  return (
    <div className="space-y-5">
      {orderedKeys.map((key) => {
        const groupDocuments = grouped.get(key) ?? [];
        const name =
          key === WITHOUT_SERIES
            ? "Zonder reeks"
            : (series.find((entry) => entry.id === key)?.name ?? "Zonder reeks");

        return (
          <section key={key} className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">
              {name}{" "}
              <span className="font-normal text-muted-foreground">({groupDocuments.length})</span>
            </h2>
            <ItemGroup className="gap-2">
              {/* Binnen een reeks oudste eerst: een project leest van begin naar eind. */}
              {[...groupDocuments].reverse().map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  groupName={groups.find((entry) => entry.id === doc.groupId)?.name}
                  onDuplicate={() => onDuplicate(doc.id)}
                  onDelete={() => onDelete(doc)}
                />
              ))}
            </ItemGroup>
          </section>
        );
      })}
    </div>
  );
}

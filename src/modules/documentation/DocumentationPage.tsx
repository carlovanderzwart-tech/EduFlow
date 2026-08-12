"use client";

import { NotebookPen, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { EmptyState } from "@/ui/EmptyState";
import { ErrorMessage } from "@/ui/ErrorMessage";
import { Button } from "@/ui/button";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/ui/item";
import { Skeleton } from "@/ui/skeleton";
import { useDienst } from "@/hooks/useDienst";
import { datumKort } from "@/lib/weergave";
import type { Diensten } from "@/services/diensten";

/**
 * Het overzicht van documentaties (§6.1.2).
 *
 * Nieuwste eerst, want dat is waar je verder werkt. De volgorde komt uit
 * `DocumentationService` en niet uit dit scherm: een tweede sortering zou een tweede
 * plek zijn waar dezelfde regel staat (U-03).
 *
 * Wat er nog niet is: filteren op groep, leerling, reeks en periode, de reeksweergave,
 * de statusbadge en het exporteren. Die staan in §6.1.2 en §6.1.6.
 */
export function DocumentationPage() {
  const router = useRouter();

  const laad = useCallback(({ documentation }: Diensten) => documentation.lijst(), []);
  const { waarde: documentaties, fout, bezig } = useDienst(laad);

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      {documentaties && documentaties.length > 0 ? (
        <div className="flex justify-end">
          <Button onClick={() => router.push("/documentation/nieuw")}>
            <Plus aria-hidden="true" />
            Nieuwe documentatie
          </Button>
        </div>
      ) : null}

      {fout ? <ErrorMessage message={fout.message} nextStep="Vernieuw de pagina." /> : null}

      {bezig && !documentaties ? (
        <div className="space-y-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : null}

      {documentaties && documentaties.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="Nog geen documentaties"
          description="Leg vast wat er vandaag gebeurde. Een titel en een paar regels zijn genoeg om te beginnen."
          action={{ label: "Nieuwe documentatie", onClick: () => router.push("/documentation/nieuw") }}
        />
      ) : null}

      {documentaties && documentaties.length > 0 ? (
        <ul className="space-y-2">
          {documentaties.map((documentatie) => (
            <li key={documentatie.id}>
              <Item variant="outline" className="relative">
                <ItemContent>
                  <ItemTitle>
                    <Link
                      href={`/documentation/${documentatie.id}`}
                      className="after:absolute after:inset-0 after:content-['']"
                    >
                      {documentatie.title || "Zonder titel"}
                    </Link>
                  </ItemTitle>
                  <ItemDescription>
                    {datumKort(documentatie.date)}
                    {documentatie.studentIds.length > 0
                      ? ` · ${documentatie.studentIds.length} leerling${documentatie.studentIds.length === 1 ? "" : "en"}`
                      : ""}
                  </ItemDescription>
                </ItemContent>
              </Item>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from "@/types/documentation";

/**
 * Concept of afgerond. Wordt niet met de hand gezet: afgerond volgt uit een
 * export (besluit B-13). Zolang de exportlaag nog niet bestaat, is alles dus
 * concept — dat is verwacht en geen fout.
 */
export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <Badge variant={status === "afgerond" ? "default" : "secondary"}>
      {status === "afgerond" ? "Afgerond" : "Concept"}
    </Badge>
  );
}

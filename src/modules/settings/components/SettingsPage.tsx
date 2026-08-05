import { Users } from "lucide-react";
import Link from "next/link";

import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";

/**
 * Instellingen (doc 04, scherm 6). Leerlingen en groepen zijn hiervandaan
 * bereikbaar en hebben bewust geen eigen plek in de hoofdnavigatie: dat beheer
 * je een paar keer per jaar, en de balk onderaan blijft op vijf.
 *
 * De overige instellingen — reeksen, vakantieregio en de AI-provider — volgen
 * in een latere sprint.
 */
export function SettingsPage() {
  return (
    // Geen eigen kop: de Topbar toont de naam van het scherm al.
    <div className="mx-auto max-w-3xl space-y-4 p-4 md:p-6">
      <Item variant="outline" className="relative">
        <ItemContent>
          <ItemTitle>
            <Link
              href="/settings/students"
              className="after:absolute after:inset-0 after:content-['']"
            >
              Leerlingen en groepen
            </Link>
          </ItemTitle>
          <ItemDescription>
            Wie er in je groepen zitten. EduFlow gebruikt deze namen om ze af te schermen voordat
            er tekst naar AI gaat.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Users aria-hidden="true" className="size-4 text-muted-foreground" />
        </ItemActions>
      </Item>

      <p className="text-sm text-muted-foreground">
        Reeksen, vakantieregio en je AI-provider komen in een volgende sprint.
      </p>
    </div>
  );
}

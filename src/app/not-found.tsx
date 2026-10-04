"use client";

import { Compass } from "lucide-react";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/ui/EmptyState";

/**
 * Het scherm voor een adres dat niet bestaat (DR-51, §4.6).
 *
 * **Dit scherm ontstond met B-145.** Mail is uit de navigatie gehaald, en wie nog
 * een bladwijzer naar `/mail` had kreeg de Engelse standaardpagina van Next: *"404
 * — This page could not be found."* Geen Nederlands, geen uitleg, geen weg terug.
 *
 * §4.6 vraagt van elk leeg scherm één zin die zegt wat hier komt te staan plus één
 * knop. Een verdwenen adres is daar een geval van: de zin zegt wat er aan de hand
 * is, de knop brengt je ergens waar wél iets staat.
 */
export default function NietGevonden() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <EmptyState
        icon={Compass}
        title="Deze pagina bestaat niet"
        description="Misschien is het adres veranderd of staat er een typefout in. Vanaf het dashboard vind je alles terug."
        action={{ label: "Naar het dashboard", onClick: () => router.push("/") }}
      />
    </div>
  );
}

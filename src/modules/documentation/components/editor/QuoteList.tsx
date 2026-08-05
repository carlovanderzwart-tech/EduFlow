"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Quote } from "@/types/documentation";
import { createId } from "@/utils/id";

interface QuoteListProps {
  quotes: Quote[];
  onChange: (quotes: Quote[]) => void;
}

/**
 * Citaten van kinderen. Apart van de lopende tekst, omdat ze in de opmaak een
 * eigen plek krijgen (doc 04, scherm 3).
 */
export function QuoteList({ quotes, onChange }: QuoteListProps) {
  const [draft, setDraft] = useState("");
  const trimmed = draft.trim();

  function addQuote() {
    if (!trimmed) return;
    onChange([...quotes, { id: createId(), text: trimmed }]);
    setDraft("");
  }

  return (
    <Field>
      <FieldLabel htmlFor="new-quote">Citaten</FieldLabel>
      <FieldDescription>Optioneel. Losse uitspraken van kinderen.</FieldDescription>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          addQuote();
        }}
      >
        <Input
          id="new-quote"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Laten we een huis maken!"
        />
        <Button type="submit" size="icon" aria-label="Citaat toevoegen" disabled={!trimmed}>
          <Plus aria-hidden="true" />
        </Button>
      </form>

      {quotes.length > 0 ? (
        <ul className="space-y-1.5" aria-label="Citaten">
          {quotes.map((quote) => (
            <li
              key={quote.id}
              className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-sm"
            >
              <span className="flex-1 italic">&ldquo;{quote.text}&rdquo;</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Citaat "${quote.text}" verwijderen`}
                onClick={() => onChange(quotes.filter((entry) => entry.id !== quote.id))}
              >
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </Field>
  );
}

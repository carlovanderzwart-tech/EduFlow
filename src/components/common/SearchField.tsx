"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { cn } from "@/lib/utils";

interface SearchFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Wordt het toegankelijke label; er staat geen zichtbaar kopje boven. */
  label: string;
  placeholder?: string;
  className?: string;
}

/**
 * Zoekveld met wisknop.
 *
 * Gedeeld omdat docs/archief/02 zoeken eist in documentaties én in mailconcepten — twee
 * modules, en modules mogen niet van elkaar lenen (docs/archief/03).
 *
 * Een gewoon tekstveld zonder eigen toetsenbordafhandeling, zodat de
 * dicteerknop blijft werken (docs/archief/03, *Invoervelden blijven saai*).
 */
export function SearchField({
  value,
  onValueChange,
  label,
  placeholder,
  className,
}: SearchFieldProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className="pr-9 pl-8"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Zoekopdracht wissen"
          onClick={() => onValueChange("")}
          className="absolute top-1/2 right-1 -translate-y-1/2"
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}

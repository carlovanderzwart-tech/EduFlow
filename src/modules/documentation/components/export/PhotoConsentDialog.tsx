"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface PhotoConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/**
 * Toestemming beeldgebruik, eenmalig per documentatie (besluit B-08).
 *
 * De vraag gaat over de foto's, en die verschillen per documentatie. Elke keer
 * vragen leidt tot wegklikken zonder lezen; één keer ooit is als controle
 * waardeloos. Daarom precies één keer per documentatie.
 *
 * De tekst staat letterlijk zo in docs/archief/04 (*Exporteren*).
 */
export function PhotoConsentDialog({ open, onOpenChange, onConfirm }: PhotoConsentDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Deze documentatie wordt buiten school gedeeld"
      description="Controleer of alle kinderen op de foto's toestemming hebben voor beeldgebruik."
      confirmLabel="Ja, doorgaan"
      onConfirm={onConfirm}
    />
  );
}

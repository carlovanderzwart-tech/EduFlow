/**
 * De browserkant van de meldingen (§6.2.9, B-108, DR-12).
 *
 * `NotificationService` kent geen `Notification`; hij kent een `Melder`. Dezelfde
 * afspraak als bij het doek en de hertekenaar: het gereedschap woont in `lib/`, de
 * regel woont in `services/`, en daardoor is de regel te toetsen zonder browser.
 *
 * **Er wordt hier niets uit zichzelf gevraagd.** `vraag()` opent de browservraag en
 * hoort alleen vanuit een klik van de gebruiker te worden aangeroepen (`FR-AGE-28`).
 */

/** Zonder Notification API is de stand `denied`: er komt niets, en dat is eerlijk. */
export function browserMelder() {
  const beschikbaar = typeof window !== "undefined" && "Notification" in window;

  return {
    toestemming: () => (beschikbaar ? Notification.permission : ("denied" as const)),
    vraag: async () => (beschikbaar ? Notification.requestPermission() : ("denied" as const)),
    toon: (titel: string, tekst: string) => {
      if (!beschikbaar || Notification.permission !== "granted") return;
      // `tag` op de titel: twee meldingen over hetzelfde item stapelen niet op.
      new Notification(titel, { body: tekst, tag: `eduflow-${titel}` });
    },
  };
}

/** Kan deze browser überhaupt meldingen tonen? Het scherm zegt het als het niet kan. */
export function kanMelden(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

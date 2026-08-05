/**
 * Gestandaardiseerde fout uit een service (doc 03, *Error Handling*).
 *
 * Doc 02 eist dat elke foutmelding in gewone taal is en **altijd een
 * vervolgstap noemt**. Daarom is `nextStep` verplicht: een fout maken zonder
 * vervolgstap kan hier niet. Technische details gaan naar de console.
 */
export type ServiceErrorCode =
  | "storage-unavailable"
  | "quota-exceeded"
  | "not-found"
  | "unknown";

export class ServiceError extends Error {
  readonly code: ServiceErrorCode;
  /** Wat de gebruiker nu kan doen. Verplicht. */
  readonly nextStep: string;

  constructor(code: ServiceErrorCode, message: string, nextStep: string, cause?: unknown) {
    super(message, { cause });
    this.name = "ServiceError";
    this.code = code;
    this.nextStep = nextStep;
  }
}

const FALLBACK: Record<ServiceErrorCode, { message: string; nextStep: string }> = {
  "storage-unavailable": {
    message: "EduFlow kan de opslag op dit apparaat niet gebruiken.",
    nextStep: "Open EduFlow in een gewoon venster in plaats van een privévenster.",
  },
  "quota-exceeded": {
    message: "De opslag op dit apparaat is vol.",
    nextStep: "Ruim documentaties op die je niet meer nodig hebt.",
  },
  "not-found": {
    message: "Dit onderdeel bestaat niet meer.",
    nextStep: "Ga terug naar het overzicht.",
  },
  unknown: {
    message: "Er ging iets mis.",
    nextStep: "Probeer het zo nog eens. Je werk is bewaard.",
  },
};

/**
 * Zet een onbekende fout om naar een `ServiceError`. Herkent de
 * `QuotaExceededError` die Safari sinds versie 17 zonder eigen melding gooit
 * (doc 03, *Opslaglimiet*).
 */
export function toServiceError(error: unknown): ServiceError {
  if (error instanceof ServiceError) return error;

  const code: ServiceErrorCode =
    error instanceof DOMException && error.name === "QuotaExceededError"
      ? "quota-exceeded"
      : "unknown";

  console.error("[EduFlow] service error", error);

  const { message, nextStep } = FALLBACK[code];
  return new ServiceError(code, message, nextStep, error);
}

/** Maakt een `ServiceError` met de standaardtekst voor die code. */
export function serviceError(code: ServiceErrorCode, cause?: unknown): ServiceError {
  const { message, nextStep } = FALLBACK[code];
  return new ServiceError(code, message, nextStep, cause);
}

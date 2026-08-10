/**
 * Het basisschema van elk opgeslagen record (§8.1.5).
 *
 * **Waarom §8.1.5 en niet §8.3.** Het handboek geeft dit schema twee keer, en de
 * twee versies verschillen op vier punten: §8.3 laat een UUIDv4 door
 * (`z.string().uuid()`), staat `rev: 0` toe (`nonnegative()`), maakt van `origin`
 * een vrije tekenreeks en zet geen bovengrens op `schemaVersion`. §8.1.5 doet dat
 * alle vier wel. De strengere is gekozen omdat hij de invarianten waarmaakt die
 * de losse versie stilzwijgend laat lopen: INV-01 eist een UUIDv7, §8.1.4 eist
 * dat `rev` op 1 begint, en §8.1.4 zegt dat `origin` een apparaat-id is, wat een
 * UUIDv7 is.
 *
 * **Waarom `strictObject` overal.** INV-23 vraagt uitdrukkelijk om `strict` op
 * `Student`: "het veld is niet toe te voegen zonder dit hoofdstuk te wijzigen;
 * het schema weigert het". Die bescherming werkt alleen als het basisschema
 * streng is, want een losse basis maakt elk erfgenaam-schema los. Onbekende
 * velden worden dus overal geweigerd, niet genegeerd (DR-24).
 *
 * **Waarom de controles uit `lib/` komen.** `zUuid`, `zIsoDateTime` en `zIsoDate`
 * staan in §8.1.5 als drie losse reguliere uitdrukkingen. Diezelfde controles
 * staan sinds implementatiestap 2 in `lib/`, met echte kalendervalidatie erbij:
 * `2026-02-31` past wel in het patroon van §8.1.5 maar bestaat niet. Ze hier
 * overschrijven zou een tweede waarheid opleveren (U-02, U-03).
 */

import { z } from "zod";

import { isIsoDate, isIsoDateTime, isLocalTime } from "@/lib/dates";
import { UUID_V7 } from "@/lib/uuid";

export const zUuid = z.string().regex(UUID_V7, "Geen geldige UUIDv7");
export const zIsoDateTime = z
  .string()
  .refine(isIsoDateTime, "Verwacht een tijdstip in UTC met milliseconden");
export const zIsoDate = z.string().refine(isIsoDate, "Verwacht JJJJ-MM-DD");
/** Wandkloktijd zonder dag (T-46). */
export const zLocalTime = z.string().refine(isLocalTime, "Verwacht UU:MM");

/**
 * De schemaversie waarin versie 1.0 begint (T-47).
 *
 * Eén en niet zeven. §8.1.5 gaf 7, maar T-40 en §8.6 zeggen dat versie 1.0 op de
 * database `eduflow-v1` begint en "telt vanaf schemaversie 1 van dat schema".
 * Beginnen op 7 zou zes migraties veronderstellen die nooit hebben bestaan, en
 * §8.6 eist dat elke migratie omkeerbaar beschreven wordt. Bij de eerste echte
 * migratie wordt dit 2.
 */
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * De zes velden die elk opgeslagen record draagt.
 *
 * Uitgevoerd naar buiten zodat een tabel die géén enkel object is — `calendarEvents`
 * is een unie van twee varianten (T-48) — dezelfde basis kan gebruiken zonder
 * `recordSchema`, dat een verfijnd schema oplevert en daarom niet in een
 * gediscrimineerde unie past.
 */
export const BASISVELDEN = {
  id: zUuid,
  createdAt: zIsoDateTime,
  updatedAt: zIsoDateTime,
  deletedAt: zIsoDateTime.nullable(),
  rev: z.number().int().min(1),
  origin: zUuid,
  schemaVersion: z.number().int().min(1).max(CURRENT_SCHEMA_VERSION),
};

const CHRONOLOGIE = {
  message: "createdAt ligt na updatedAt",
  path: ["updatedAt"],
};

export const zBaseRecord = z.strictObject(BASISVELDEN).refine(isChronologisch, CHRONOLOGIE);

/**
 * Bouwt het schema van één tabel: de zes basisvelden plus de eigen velden.
 *
 * In §8.3 staat `...zBaseRecord.shape` niet telkens uitgeschreven; elke
 * `z.object({ ... })` daar is in werkelijkheid `zBaseRecord.extend({ ... })`.
 * Deze functie is die zin, één keer.
 *
 * Hij bouwt op `BASISVELDEN` en niet op `zBaseRecord`, omdat die laatste de
 * verfijning al draagt en een verfijnd schema niet uit te breiden is. Zo dragen
 * beide dezelfde regel en kan er geen versie ontstaan die hem mist.
 *
 * De verfijning is de helft van INV-04 die zonder klok te controleren is:
 * `createdAt` ligt nooit ná `updatedAt`. De andere helft van INV-04 — dat geen
 * van beide in de toekomst ligt — staat er niet in, want die vraagt om de
 * huidige tijd. §10.3 injecteert daarvoor een klok in de servicelaag; een schema
 * dat zelf de systeemtijd leest is niet te toetsen zonder de klok van de machine
 * te verzetten.
 */
export function recordSchema<Vorm extends z.ZodRawShape>(vorm: Vorm) {
  return z.strictObject({ ...BASISVELDEN, ...vorm }).refine(isChronologisch, CHRONOLOGIE);
}

/**
 * Legt INV-04 op een schema dat niet met `recordSchema` gebouwd is.
 *
 * Nodig voor `calendarEvents`, dat een unie van twee varianten is (T-48) en dus
 * niet uit één `strictObject` bestaat. Zonder deze functie zou de invariant daar
 * met de hand herhaald moeten worden, en dat is precies de tweede plek die U-03
 * verbiedt.
 */
export function metChronologie<Schema extends z.ZodTypeAny>(schema: Schema) {
  return schema.refine(isChronologisch, CHRONOLOGIE);
}

/**
 * `createdAt` ligt niet ná `updatedAt` (INV-04, eerste helft).
 *
 * Vergelijken op de tekenreeks mag: een `IsoDateTime` heeft een vaste breedte en
 * staat altijd in UTC, dus alfabetische volgorde ís chronologische volgorde.
 *
 * De parameter is `unknown` en niet het uitvoertype van het schema, omdat dat
 * uitvoertype binnen `recordSchema` nog een onopgeloste generieke uitdrukking is
 * en TypeScript er dan geen velden op vindt. De twee velden komen uit
 * `zBaseRecord` en zijn dus al gecontroleerd voordat deze verfijning draait.
 */
function isChronologisch(record: unknown): boolean {
  const { createdAt, updatedAt } = record as Pick<
    z.infer<typeof zBaseRecord>,
    "createdAt" | "updatedAt"
  >;
  return createdAt <= updatedAt;
}

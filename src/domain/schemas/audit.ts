/**
 * Schema's van `auditEvents` en `changeLog` (§8.3.13).
 *
 * `changeLog` is de enige tabel die **niet** van `BaseRecord` erft (§8.3). Hij
 * krijgt daarom een eigen `strictObject` en niet `recordSchema`. Een journaal-
 * regel heeft geen `rev` van zichzelf; de `rev` die erin staat is die van het
 * gewijzigde aggregaat.
 *
 * `kind` op een `AuditEvent` is een vrije tekenreeks. §16.2 somt twaalf soorten
 * gebeurtenissen op in gewone taal maar geeft er geen sleutels bij; een
 * opsomming hier zou een lijst zijn die het handboek niet kent (DR-01).
 *
 * INV-52 — een `AuditEvent` wordt alleen toegevoegd — is geen vorm maar een
 * schrijfpad, en staat volgens §9.5.7 in `AuditService`.
 */

import { z } from "zod";

import { recordSchema, zIsoDateTime, zUuid } from "./base";

export const zAuditEvent = recordSchema({
  kind: z.string().min(1),
  at: zIsoDateTime,
  deviceName: z.string(),
  // Feitelijk, zonder namen (§16.2, DR-44).
  detail: z.string(),
  actorNote: z.string(),
});

export const zChangeOperation = z.enum(["create", "update", "delete"]);

export const zChangeLogEntry = z.strictObject({
  table: z.string().min(1),
  recordId: zUuid,
  rev: z.number().int().min(1),
  op: zChangeOperation,
  at: zIsoDateTime,
  origin: zUuid,
});

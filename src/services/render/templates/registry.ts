import type { Template, TemplateId } from ".";
import { templateA } from "./templateA";
import { templateB } from "./templateB";
import { templateC } from "./templateC";
import { templateD } from "./templateD";

/** In de volgorde waarin de miniaturen in het exportpaneel staan (doc 04). */
export const TEMPLATES: Template[] = [templateA, templateB, templateC, templateD];

/** Template A is de meest gebruikte indeling en daarmee de standaard (doc 04). */
export const DEFAULT_TEMPLATE_ID: TemplateId = "a";

/**
 * Zoekt een template op. Valt terug op de standaard bij een onbekende waarde:
 * `templateId` is op de documentatie een gewone tekst, en een template dat
 * later verdwijnt mag een bestaande documentatie niet onbruikbaar maken.
 */
export function getTemplate(id: string | undefined): Template {
  return TEMPLATES.find((template) => template.id === id) ?? templateA;
}

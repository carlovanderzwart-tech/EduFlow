/** Genereert een stabiel, uniek id dat niet uit de inhoud volgt (docs/archief/03). */
export function createId(): string {
  return crypto.randomUUID();
}

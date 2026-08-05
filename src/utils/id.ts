/** Genereert een stabiel, uniek id dat niet uit de inhoud volgt (doc 03). */
export function createId(): string {
  return crypto.randomUUID();
}

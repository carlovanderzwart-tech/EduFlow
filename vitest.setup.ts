import "@testing-library/jest-dom/vitest";

// jsdom heeft geen IndexedDB. Nodig om de migraties te kunnen testen, zoals
// doc 03 (*Migraties*) voorschrijft.
import "fake-indexeddb/auto";

import { describe, expect, it } from "vitest";

import { fitWithinLongEdge, MAX_LONG_EDGE } from "./image";

/**
 * Besluit T-02: de lange zijde gaat naar maximaal 3300 pixels, dat dekt 279 mm
 * op 300 dpi. Kleinere foto's worden niet opgeschaald.
 */
describe("fitWithinLongEdge", () => {
  it("verkleint een liggende foto naar de grens", () => {
    expect(fitWithinLongEdge(4000, 3000)).toEqual({ width: MAX_LONG_EDGE, height: 2475 });
  });

  it("verkleint een staande foto naar de grens", () => {
    expect(fitWithinLongEdge(3000, 4000)).toEqual({ width: 2475, height: MAX_LONG_EDGE });
  });

  it("schaalt een kleinere foto niet op", () => {
    expect(fitWithinLongEdge(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("laat een foto op de grens ongemoeid", () => {
    expect(fitWithinLongEdge(MAX_LONG_EDGE, 1000)).toEqual({
      width: MAX_LONG_EDGE,
      height: 1000,
    });
  });

  it("houdt de verhouding aan", () => {
    const { width, height } = fitWithinLongEdge(6000, 2000);
    expect(width / height).toBeCloseTo(3, 2);
  });

  it("levert nooit nul op bij een extreme verhouding", () => {
    const { width, height } = fitWithinLongEdge(10000, 1);
    expect(width).toBe(MAX_LONG_EDGE);
    expect(height).toBeGreaterThanOrEqual(1);
  });
});

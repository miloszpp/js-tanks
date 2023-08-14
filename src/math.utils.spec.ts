import { describe } from "@jest/globals";
import { doRectsIntersect } from "./math.utils";
import { DEFAULT_SETTINGS } from "./settings";

describe("doRectsIntersect", () => {
  it("simple overlapping rects", () => {
    const r1 = { x: 1, y: 1, width: 10, height: 20 };
    const r2 = { x: 9, y: 19, width: 2, height: 2 };
    expect(doRectsIntersect(r1, r2)).toBe(true);
    expect(doRectsIntersect(r2, r1)).toBe(true);
  });

  it("should handle non-intersecting rects", () => {
    const r1 = {
      x: 265.38461538461536,
      y: 276.9230769230769,
      width: 11.538461538461538,
      height: 11.538461538461538,
    };
    const r2 = {
      x: 57.07692307692308,
      y: 270.0769230769231,
      width: 10,
      height: 10,
    };
    expect(doRectsIntersect(r1, r2)).toBe(false);
    expect(doRectsIntersect(r2, r1)).toBe(false);
  });

  it("r2 contains r1", () => {
    const r1 = {
      x: 46.15384615384615,
      y: 103.84615384615384,
      width: 11.538461538461538,
      height: 11.538461538461538,
    };
    const r2 = {
      x: 34,
      y: 91,
      width: DEFAULT_SETTINGS.tankSize,
      height: DEFAULT_SETTINGS.tankSize,
    };
    expect(doRectsIntersect(r1, r2)).toBe(true);
    expect(doRectsIntersect(r2, r1)).toBe(true);
  });
});

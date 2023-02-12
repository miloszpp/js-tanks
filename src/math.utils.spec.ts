import { describe } from "@jest/globals";
import { doRectsIntersect } from "./math.utils";

describe("doRectsIntersect", () => {
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
});

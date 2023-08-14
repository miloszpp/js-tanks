export type Settings = typeof DEFAULT_SETTINGS;

export type FieldType = "e" | "b" | "s";

const parseGridStrings = (lines: string[]) => {
  return lines.map((line) => line.split("")) as FieldType[][];
};

export const DEFAULT_SETTINGS = {
  canvasSize: 598,
  // change to sparse representation and compare FPS
  grid: parseGridStrings([
    "eeeebeeebeeee",
    "eeeebesebeeee",
    "eeeeeeseeeeee",
    "eeeeeeseeeeee",
    "bbeeeeseeeebb",
    "eeeeebbbeeeee",
    "essssbebsssse",
    "eeeeebbbeeeee",
    "bbeeeeseeeebb",
    "eeeeeeseeeeee",
    "eeeeeeseeeeee",
    "eeeeebbbeeeee",
    "eeeeebebeeeee",
  ]),
  bulletSpeed: 10,
  bulletSize: 10,

  shotThrottleTime: 500,

  get tankSize() {
    return this.canvasSize / this.grid.length;
  },

  get terrainSize() {
    return this.canvasSize / this.grid.length;
  },
};

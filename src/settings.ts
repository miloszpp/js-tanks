export type Settings = typeof DEFAULT_SETTINGS;

export type FieldType = "e" | "b" | "s";

const parseGridStrings = (lines: string[]) => {
  return lines.map((line) => line.split("")) as FieldType[][];
};

export const DEFAULT_SETTINGS = {
  canvasSize: 600,
  // change to sparse representation and compare FPS
  grid: parseGridStrings([
    "eeeeeebeeeeee",
    "eeeeeebeeeeee",
    "eeeeeebeeeeee",
    "eeeeeebeeeeee",
    "eeeeeebeeeeee",
    "eeeeeebeeeeee",
    "bbbbbbbbbbbbb",
    "eeeeeebeeeeee",
    "eeeeeebeeeeee",
    "eeeeeebeeeeee",
    "eeeeeebeeeeee",
    "eeeeeebeeeeee",
    "eeeeeebeeeeee",
  ]),
  bulletSpeed: 10,
  bulletSize: 10,

  get tankSize() {
    return this.canvasSize / this.grid.length;
  },

  get terrainSize() {
    return this.canvasSize / this.grid.length;
  },
};

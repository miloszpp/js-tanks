export type Settings = typeof DEFAULT_SETTINGS;

export type FieldType = "e" | "b" | "s";

export const DEFAULT_SETTINGS = {
  canvasSize: 600,
  grid: [
    ["e", "e", "e", "e", "b", "b", "e", "e", "e", "e"],
    ["e", "e", "e", "e", "b", "b", "e", "e", "e", "e"],
    ["e", "e", "e", "e", "e", "e", "e", "e", "e", "e"],
    ["e", "e", "e", "e", "e", "e", "e", "e", "e", "e"],
    ["e", "e", "e", "e", "e", "e", "e", "e", "e", "e"],
    ["e", "e", "e", "e", "e", "e", "e", "e", "e", "e"],
    ["e", "e", "e", "e", "e", "e", "e", "e", "e", "e"],
    ["e", "e", "e", "b", "b", "b", "b", "e", "e", "e"],
    ["e", "e", "e", "b", "e", "e", "b", "e", "e", "e"],
    ["e", "e", "e", "b", "e", "e", "b", "e", "e", "e"],
  ] as FieldType[][],

  get tankSize() {
    return (this.canvasSize / this.grid.length) * 2;
  },
};

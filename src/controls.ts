export type ControlKeys = "left" | "up" | "right" | "down" | "space";

export type Controls = Set<ControlKeys>;

const EVENT_KEYS_MAPPING: Record<string, ControlKeys | undefined> = {
  Right: "right",
  ArrowRight: "right",
  Left: "left",
  ArrowLeft: "left",
  Up: "up",
  ArrowUp: "up",
  Down: "down",
  ArrowDown: "down",
};

export function setupControls() {
  const controls: Controls = new Set();
  document.addEventListener(
    "keydown",
    (e) => {
      const controlKey = EVENT_KEYS_MAPPING[e.key];
      if (controlKey !== undefined) {
        controls.add(controlKey);
      }
    },
    false
  );
  document.addEventListener(
    "keyup",
    (e) => {
      const controlKey = EVENT_KEYS_MAPPING[e.key];
      if (controlKey !== undefined && controls.has(controlKey)) {
        controls.delete(controlKey);
      }
    },
    false
  );
  return controls;
}

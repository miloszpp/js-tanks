import { setupControls } from "./controls";
import { draw } from "./draw";
import { DEFAULT_SETTINGS } from "./settings";
import { getInitialState, updateState } from "./state";
import "./style.css";
import { ensureDefined } from "./utils";

const getCanvas = () =>
  ensureDefined(
    document.querySelector<HTMLCanvasElement>("#mainCanvas"),
    "Could not get canvas"
  );

const getContext = (canvas: HTMLCanvasElement) =>
  ensureDefined(canvas.getContext("2d"), "Could not get 2d context");

function main() {
  const canvas = getCanvas();
  const ctx = getContext(canvas);
  const settings = DEFAULT_SETTINGS;
  const controls = setupControls();

  const state = getInitialState(settings);

  let shouldContinue = true;
  let updateStateInterval: number;

  canvas.setAttribute("width", String(settings.canvasSize));
  canvas.setAttribute("height", String(settings.canvasSize));

  draw(ctx, state, settings, () => shouldContinue);

  updateStateInterval = window.setInterval(
    () =>
      updateState(state, controls, settings, (isWin) => {
        shouldContinue = false;
        clearInterval(updateStateInterval);

        if (isWin) {
          alert("You have won!");
        } else {
          alert("Game over!");
        }
      }),
    10
  );
}

main();

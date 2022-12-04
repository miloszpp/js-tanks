import { Settings } from "./settings";
import {
  drawSprite,
  getLoadedSpriteImage,
  getPlayerTankCoordinateKey,
} from "./sprites";
import { GameState, TankState } from "./state";

const sprite = await getLoadedSpriteImage();

function drawTank(
  ctx: CanvasRenderingContext2D,
  tank: TankState,
  settings: Settings
) {
  ctx.beginPath();
  const spriteKey = getPlayerTankCoordinateKey(
    "primary",
    "a",
    tank.direction,
    tank.frame
  );
  drawSprite(ctx, sprite, spriteKey, tank.x, tank.y, settings.tankSize);
  ctx.closePath();
}

export function draw(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  settings: Settings,
  shouldContinue: () => boolean
) {
  ctx.clearRect(0, 0, settings.canvasSize, settings.canvasSize);

  drawTank(ctx, state.myTank, settings);

  if (shouldContinue()) {
    requestAnimationFrame(() => draw(ctx, state, settings, shouldContinue));
  }
}

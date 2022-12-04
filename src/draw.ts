import { Settings } from "./settings";
import { drawSprite, getBrickKey, getPlayerTankCoordinateKey } from "./sprites";
import { GameState, TankState } from "./state";

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
  drawSprite(ctx, spriteKey, tank.x, tank.y, settings.tankSize + 1);
  ctx.closePath();
}

function drawTerrain(ctx: CanvasRenderingContext2D, settings: Settings) {
  const { grid } = settings;
  ctx.beginPath();
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid.length; col++) {
      if (grid[row][col] === "b") {
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            drawSprite(
              ctx,
              getBrickKey((((i + j) % 2) + 1) as 1 | 2),
              col * settings.terrainSize + (i * settings.terrainSize) / 4,
              row * settings.terrainSize + (j * settings.terrainSize) / 4,
              settings.terrainSize / 4 + 1
            );
          }
        }
      }
    }
  }
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
  drawTerrain(ctx, settings);

  if (shouldContinue()) {
    requestAnimationFrame(() => draw(ctx, state, settings, shouldContinue));
  }
}

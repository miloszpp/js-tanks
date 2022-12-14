import { Settings } from "./settings";
import { drawSprite, getBrickKey, getPlayerTankCoordinateKey } from "./sprites";
import { BulletState, GameState, TankState, TerrainState } from "./state";

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

function drawTerrain(
  ctx: CanvasRenderingContext2D,
  state: TerrainState,
  settings: Settings
) {
  ctx.beginPath();
  for (const node of state.nodes) {
    drawSprite(
      ctx,
      getBrickKey((((node.row + node.col) % 2) + 1) as 1 | 2),
      node.x,
      node.y,
      settings.terrainSize / 4 + 1
    );
  }
  ctx.closePath();
}

function drawBullets(
  ctx: CanvasRenderingContext2D,
  bullets: BulletState[],
  settings: Settings
) {
  ctx.beginPath();
  for (let bullet of bullets) {
    drawSprite(
      ctx,
      `bullet.${bullet.direction}` as const,
      bullet.x,
      bullet.y,
      settings.bulletSize
    );
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
  drawTerrain(ctx, state.terrain, settings);
  drawBullets(ctx, state.bullets, settings);

  if (shouldContinue()) {
    requestAnimationFrame(() => draw(ctx, state, settings, shouldContinue));
  }
}

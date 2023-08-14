import { Rect, doRectsIntersect } from "./math.utils";
import { Settings } from "./settings";
import {
  TankState,
  Direction,
  GameState,
  TerrainState,
  BulletState,
} from "./state";

const getMovedTank = (state: TankState, direction: Direction): TankState => {
  switch (direction) {
    case "down":
      return { ...state, y: state.y + 1 };
    case "up":
      return { ...state, y: state.y - 1 };
    case "left":
      return { ...state, x: state.x - 1 };
    case "right":
      return { ...state, x: state.x + 1 };
  }
};

export const getTankRect = (state: TankState, settings: Settings): Rect => ({
  x: state.x,
  y: state.y,
  width: settings.tankSize,
  height: settings.tankSize,
});

export const getBulletRect = (
  bullet: BulletState,
  settings: Settings
): Rect => ({
  x: bullet.x,
  y: bullet.y,
  width: settings.bulletSize,
  height: settings.bulletSize,
});

export const doesBulletHitTank = (
  tank: TankState,
  bullet: BulletState,
  settings: Settings
) =>
  doRectsIntersect(
    getBulletRect(bullet, settings),
    getTankRect(tank, settings)
  );

export const willTankCollideAfterMove = (
  tank: TankState,
  state: GameState,
  direction: Direction,
  settings: Settings
): boolean =>
  getCollidingNode(
    getTankRect(getMovedTank(tank, direction), settings),
    state.terrain,
    settings
  ) !== undefined;

export function getCollidingNode(
  r: Rect,
  terrain: TerrainState,
  { terrainSize }: Settings
) {
  for (const node of terrain.nodes) {
    if (
      doRectsIntersect(r, {
        x: node.x,
        y: node.y,
        width: terrainSize / 4,
        height: terrainSize / 4,
      })
    ) {
      return node;
    }
  }
  return undefined;
}

export function moveTank(
  tank: TankState,
  direction: Direction,
  state: GameState,
  settings: Settings
): boolean {
  let moved = false;

  if (
    direction === "right" &&
    !willTankCollideAfterMove(tank, state, "right", settings) &&
    tank.x < settings.canvasSize - settings.tankSize
  ) {
    tank.x += 1;
    moved = true;
  }

  if (
    direction === "left" &&
    !willTankCollideAfterMove(tank, state, "left", settings) &&
    tank.x > 0
  ) {
    tank.x -= 1;
    moved = true;
  }

  if (
    direction === "up" &&
    !willTankCollideAfterMove(tank, state, "up", settings) &&
    tank.y > 0
  ) {
    tank.y -= 1;
    moved = true;
  }

  if (
    direction === "down" &&
    !willTankCollideAfterMove(tank, state, "down", settings) &&
    tank.y < settings.canvasSize - settings.tankSize
  ) {
    tank.y += 1;
    moved = true;
  }

  if (moved) {
    tank.direction = direction;
    tank.frame = tank.frame === 1 ? 2 : 1;
  }

  return moved;
}

export function shoot(
  tank: TankState,
  author: "player" | "enemy",
  state: GameState,
  settings: Settings
) {
  if (tank.lastShotTimestamp + settings.shotThrottleTime > Date.now()) {
    return;
  }

  state.bullets.push({
    x: tank.x + settings.tankSize / 2 - settings.bulletSize / 2,
    y: tank.y + settings.tankSize / 2 - settings.bulletSize / 2,
    direction: tank.direction,
    author,
  });
  tank.lastShotTimestamp = Date.now();
}

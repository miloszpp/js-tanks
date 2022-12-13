import { Controls } from "./controls";
import { Settings } from "./settings";

export type Direction = "up" | "right" | "down" | "left";

export interface TankState {
  x: number;
  y: number;
  direction: Direction;
  frame: 1 | 2;
}

export interface BulletState {
  x: number;
  y: number;
  direction: Direction;
}

export interface GameState {
  myTank: TankState;
  enemyTanks: TankState[];
  bullets: BulletState[];
}

export const getInitialState = (): GameState => ({
  myTank: {
    x: 0,
    y: 0,
    direction: "up",
    frame: 1,
  },
  enemyTanks: [],
  bullets: [],
});

export function updateState(
  state: GameState,
  controls: Controls,
  settings: Settings,
  onGameOver: () => void
) {
  const { myTank } = state;

  const explodedBullets: Set<BulletState> = new Set();
  for (let bullet of state.bullets) {
    const dx =
      bullet.direction === "left"
        ? -settings.bulletSpeed
        : bullet.direction === "right"
        ? settings.bulletSpeed
        : 0;
    const dy =
      bullet.direction === "up"
        ? -settings.bulletSpeed
        : bullet.direction === "down"
        ? settings.bulletSpeed
        : 0;
    bullet.x += dx;
    bullet.y += dy;

    if (
      bullet.x < 0 ||
      bullet.y < 0 ||
      bullet.x > settings.canvasSize ||
      bullet.y < settings.canvasSize
    ) {
      explodedBullets.add(bullet);
    }
  }

  state.bullets = state.bullets.filter((b) => explodedBullets.has(b));

  if (
    controls.has("right") &&
    myTank.x <= settings.canvasSize - settings.tankSize
  ) {
    myTank.x += 1;
    myTank.direction = "right";
    myTank.frame = myTank.frame === 1 ? 2 : 1;
  } else if (controls.has("left") && myTank.x >= 0) {
    myTank.x -= 1;
    myTank.direction = "left";
    myTank.frame = myTank.frame === 1 ? 2 : 1;
  } else if (controls.has("up") && myTank.y >= 0) {
    myTank.y -= 1;
    myTank.direction = "up";
    myTank.frame = myTank.frame === 1 ? 2 : 1;
  } else if (
    controls.has("down") &&
    myTank.y <= settings.canvasSize - settings.tankSize
  ) {
    myTank.y += 1;
    myTank.direction = "down";
    myTank.frame = myTank.frame === 1 ? 2 : 1;
  }

  if (controls.has("space")) {
    state.bullets.push({
      x: myTank.x + settings.tankSize / 2 - settings.bulletSize / 2,
      y: myTank.y + settings.tankSize / 2 - settings.bulletSize / 2,
      direction: myTank.direction,
    });
    controls.delete("space");
  }
}

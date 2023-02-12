import { Controls } from "./controls";
import { Rect, doRectsIntersect } from "./math.utils";
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

export type TerrainNode = {
  type: "brick" | "concrete";
  x: number;
  y: number;
  row: number;
  col: number;
};

export interface TerrainState {
  nodes: TerrainNode[];
}

export interface GameState {
  myTank: TankState;
  enemyTanks: TankState[];
  bullets: BulletState[];
  terrain: TerrainState;
}

const generateNodesFromCoords = (
  row: number,
  col: number,
  type: TerrainNode["type"],
  { terrainSize }: Settings
) => {
  const nodes: TerrainNode[] = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      nodes.push({
        row: 4 * row + i,
        col: 4 * col + j,
        x: ((4 * row + i) * terrainSize) / 4,
        y: ((4 * col + j) * terrainSize) / 4,
        type,
      });
    }
  }
  return nodes;
};

export const getInitialState = (settings: Settings): GameState => ({
  myTank: {
    x: 0,
    y: 0,
    direction: "up",
    frame: 1,
  },
  enemyTanks: [],
  bullets: [],
  terrain: {
    nodes: settings.grid
      .flatMap((row, rowIdx) =>
        row.flatMap((f, colIdx) =>
          f === "e"
            ? null
            : generateNodesFromCoords(rowIdx, colIdx, "brick", settings)
        )
      )
      .filter((f): f is TerrainNode => f !== null),
  },
});

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

export function updateState(
  state: GameState,
  controls: Controls,
  settings: Settings,
  onGameOver: () => void
) {
  const { myTank } = state;

  const explodedBullets: Set<BulletState> = new Set();
  const removedTerrainNotes: Set<TerrainNode> = new Set();
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
      bullet.y > settings.canvasSize
    ) {
      explodedBullets.add(bullet);
    }

    const collidingNode = getCollidingNode(
      {
        x: bullet.x,
        y: bullet.y,
        width: settings.bulletSize,
        height: settings.bulletSize,
      },
      state.terrain,
      settings
    );
    if (collidingNode !== undefined) {
      explodedBullets.add(bullet);
      removedTerrainNotes.add(collidingNode);
    }
  }

  state.bullets = state.bullets.filter((b) => !explodedBullets.has(b));
  state.terrain.nodes = state.terrain.nodes.filter(
    (n) => !removedTerrainNotes.has(n)
  );

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

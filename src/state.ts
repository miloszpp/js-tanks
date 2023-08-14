import { updateAllEnemies } from "./ai";
import { Controls } from "./controls";
import { FieldType, Settings } from "./settings";
import {
  doesBulletHitTank,
  getBulletRect,
  getCollidingNode,
  moveTank,
  shoot,
} from "./state.utils";

export type Direction = "up" | "right" | "down" | "left";

export interface TankState {
  x: number;
  y: number;
  direction: Direction;
  frame: 1 | 2;
  lastShotTimestamp: number;
}

export interface BulletState {
  x: number;
  y: number;
  direction: Direction;
  author: "player" | "enemy";
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
        x: ((4 * col + i) * terrainSize) / 4,
        y: ((4 * row + j) * terrainSize) / 4,
        type,
      });
    }
  }
  return nodes;
};

const getTerrainTypeFromSymbol = (symbol: string): TerrainNode["type"] => {
  switch (symbol) {
    case "b":
      return "brick";
    case "s":
      return "concrete";
    default:
      throw Error(`did not recognize symbol: ${symbol}`);
  }
};

const findCoordsInGrid = (
  searchTerm: FieldType,
  grid: FieldType[][]
): [number, number][] => {
  const results: [number, number][] = [];
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === searchTerm) {
        results.push([i, j]);
      }
    }
  }
  return results;
};

function moveBullet(bullet: BulletState, settings: Settings) {
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
}

function moveAndExplodeBullets(
  state: GameState,
  settings: Settings,
  onGameOver: (isWin: boolean) => void
) {
  const explodedBullets: Set<BulletState> = new Set();
  const removedTerrainNotes: Set<TerrainNode> = new Set();
  const destroyedEnemies: Set<TankState> = new Set();

  for (let bullet of state.bullets) {
    moveBullet(bullet, settings);

    if (
      bullet.x < 0 ||
      bullet.y < 0 ||
      bullet.x > settings.canvasSize ||
      bullet.y > settings.canvasSize
    ) {
      explodedBullets.add(bullet);
    }

    const collidingNode = getCollidingNode(
      getBulletRect(bullet, settings),
      state.terrain,
      settings
    );
    if (collidingNode !== undefined) {
      explodedBullets.add(bullet);
      if (collidingNode.type === "brick") {
        removedTerrainNotes.add(collidingNode);
      }
    }

    if (
      bullet.author === "enemy" &&
      doesBulletHitTank(state.myTank, bullet, settings)
    ) {
      onGameOver(false);
    }

    if (bullet.author === "player") {
      const hitTank = state.enemyTanks.find((tank) =>
        doesBulletHitTank(tank, bullet, settings)
      );
      if (hitTank !== undefined) {
        destroyedEnemies.add(hitTank);
        explodedBullets.add(bullet);
      }
    }
  }

  state.bullets = state.bullets.filter((b) => !explodedBullets.has(b));
  state.terrain.nodes = state.terrain.nodes.filter(
    (n) => !removedTerrainNotes.has(n)
  );
  state.enemyTanks = state.enemyTanks.filter((t) => !destroyedEnemies.has(t));
}

export const getInitialState = (settings: Settings): GameState => {
  const nodes = settings.grid
    .flatMap((row, rowIdx) =>
      row.flatMap((f, colIdx) =>
        f === "e" || f === "p" || f === "x"
          ? null
          : generateNodesFromCoords(
              rowIdx,
              colIdx,
              getTerrainTypeFromSymbol(f),
              settings
            )
      )
    )
    .filter((f): f is TerrainNode => f !== null);

  const playerCoords = findCoordsInGrid("p", settings.grid).at(0);
  if (playerCoords === undefined) {
    throw Error("invalid number of players on the grid");
  }

  const enemiesCoords = findCoordsInGrid("x", settings.grid);

  return {
    myTank: {
      x: playerCoords[1] * settings.terrainSize,
      y: playerCoords[0] * settings.terrainSize,
      direction: "up",
      frame: 1,
      lastShotTimestamp: 0,
    },
    enemyTanks: enemiesCoords.map(([row, col]) => ({
      x: col * settings.terrainSize,
      y: row * settings.terrainSize,
      direction: "down",
      frame: 1,
      lastShotTimestamp: 0,
    })),
    bullets: [],
    terrain: {
      nodes,
    },
  };
};

export function updateState(
  state: GameState,
  controls: Controls,
  settings: Settings,
  onGameOver: (isWin: boolean) => void
) {
  const { myTank } = state;

  moveAndExplodeBullets(state, settings, onGameOver);

  if (controls.has("right")) {
    moveTank(myTank, "right", state, settings);
  } else if (controls.has("left")) {
    moveTank(myTank, "left", state, settings);
  } else if (controls.has("up")) {
    moveTank(myTank, "up", state, settings);
  } else if (controls.has("down")) {
    moveTank(myTank, "down", state, settings);
  }

  if (controls.has("space")) {
    shoot(myTank, "player", state, settings);
    controls.delete("space");
  }

  updateAllEnemies(state, settings);
}

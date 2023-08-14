import { Controls } from "./controls";
import { Rect, doRectsIntersect } from "./math.utils";
import { FieldType, Settings } from "./settings";

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

const moveTank = (state: TankState, direction: Direction): TankState => {
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

const getTankRect = (state: TankState, settings: Settings): Rect => ({
  x: state.x,
  y: state.y,
  width: settings.tankSize,
  height: settings.tankSize,
});

const willTankCollideAfterMove = (
  state: GameState,
  direction: Direction,
  settings: Settings
): boolean =>
  getCollidingNode(
    getTankRect(moveTank(state.myTank, direction), settings),
    state.terrain,
    settings
  ) !== undefined;

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
      if (collidingNode.type === "brick") {
        removedTerrainNotes.add(collidingNode);
      }
    }
  }

  state.bullets = state.bullets.filter((b) => !explodedBullets.has(b));
  state.terrain.nodes = state.terrain.nodes.filter(
    (n) => !removedTerrainNotes.has(n)
  );

  if (controls.has("right")) {
    if (
      !willTankCollideAfterMove(state, "right", settings) &&
      myTank.x < settings.canvasSize - settings.tankSize
    ) {
      myTank.x += 1;
    }
    myTank.direction = "right";
    myTank.frame = myTank.frame === 1 ? 2 : 1;
  } else if (controls.has("left")) {
    if (!willTankCollideAfterMove(state, "left", settings) && myTank.x > 0) {
      myTank.x -= 1;
    }
    myTank.direction = "left";
    myTank.frame = myTank.frame === 1 ? 2 : 1;
  } else if (controls.has("up")) {
    if (!willTankCollideAfterMove(state, "up", settings) && myTank.y > 0) {
      myTank.y -= 1;
    }
    myTank.direction = "up";
    myTank.frame = myTank.frame === 1 ? 2 : 1;
  } else if (controls.has("down")) {
    if (
      !willTankCollideAfterMove(state, "down", settings) &&
      myTank.y < settings.canvasSize - settings.tankSize
    ) {
      myTank.y += 1;
    }
    myTank.direction = "down";
    myTank.frame = myTank.frame === 1 ? 2 : 1;
  }

  if (
    controls.has("space") &&
    myTank.lastShotTimestamp + settings.shotThrottleTime < Date.now()
  ) {
    state.bullets.push({
      x: myTank.x + settings.tankSize / 2 - settings.bulletSize / 2,
      y: myTank.y + settings.tankSize / 2 - settings.bulletSize / 2,
      direction: myTank.direction,
    });
    myTank.lastShotTimestamp = Date.now();
    controls.delete("space");
  }
}

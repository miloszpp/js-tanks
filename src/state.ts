import { Controls } from "./controls";
import { Rect, doRectsIntersect } from "./math.utils";
import { Settings } from "./settings";
import { moveBullet, shouldBulletExplode } from "./state/bullet";

import * as R from "ramda";

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
    lastShotTimestamp: 0,
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
  direction: Direction,
  settings: Settings,
  terrain: TerrainState,
  myTank: TankState
): boolean =>
  getCollidingNode(
    getTankRect(moveTank(myTank, direction), settings),
    terrain,
    settings
  ) !== undefined;

const nextFrame = (frame: 1 | 2) => (frame === 1 ? 2 : 1);

const maybeMoveTank =
  (controls: Controls, settings: Settings, terrain: TerrainState) =>
  (myTank: TankState): TankState => {
    if (controls.has("right")) {
      const canMove =
        !willTankCollideAfterMove("right", settings, terrain, myTank) &&
        myTank.x < settings.canvasSize - settings.tankSize;
      return R.evolve(
        {
          x: canMove ? R.inc : R.identity,
          direction: R.always("right" as const),
          frame: nextFrame,
        },
        myTank
      );
    } else if (controls.has("left")) {
      const canMove =
        !willTankCollideAfterMove("left", settings, terrain, myTank) &&
        myTank.x > 0;
      return R.evolve(
        {
          x: canMove ? R.dec : R.identity,
          direction: R.always("left" as const),
          frame: nextFrame,
        },
        myTank
      );
    } else if (controls.has("up")) {
      const canMove =
        !willTankCollideAfterMove("up", settings, terrain, myTank) &&
        myTank.y > 0;
      return R.evolve(
        {
          y: canMove ? R.dec : R.identity,
          direction: R.always("up" as const),
          frame: nextFrame,
        },
        myTank
      );
    } else if (controls.has("down")) {
      const canMove =
        !willTankCollideAfterMove("down", settings, terrain, myTank) &&
        myTank.y < settings.canvasSize - settings.tankSize;
      return R.evolve(
        {
          y: canMove ? R.inc : R.identity,
          direction: R.always("down" as const),
          frame: nextFrame,
        },
        myTank
      );
    }
    return myTank;
  };

export const updateState = (
  state: GameState,
  controls: Controls,
  settings: Settings,
  getNow: () => number,
  onGameOver: () => void
) => {
  const { myTank } = state;

  const movedBullets = R.map(moveBullet(settings))(state.bullets);

  const explodedBullets = R.filter(
    R.pipe(
      shouldBulletExplode(state.terrain, settings),
      R.prop("shouldExplode")
    ),
    movedBullets
  );
  const removedTerrainNodes = R.pipe(
    R.map(
      R.pipe(
        shouldBulletExplode(state.terrain, settings),
        R.prop("collidingNode")
      )
    ),
    R.filter(R.pipe(R.isNil, R.not))
  )(movedBullets);

  const updatedBullets = R.difference(movedBullets, explodedBullets);
  const updatedTerrain = R.assoc(
    "terrain",
    R.difference(state.terrain.nodes, removedTerrainNodes),
    state.terrain
  );

  const updatedTank = maybeMoveTank(
    controls,
    settings,
    state.terrain
  )(state.myTank);

  const now = getNow();
  const isMyTankShooting =
    controls.has("space") &&
    myTank.lastShotTimestamp + settings.shotThrottleTime < now;
  const updatedBullets2 = isMyTankShooting
    ? R.append(
        {
          x: myTank.x + settings.tankSize / 2 - settings.bulletSize / 2,
          y: myTank.y + settings.tankSize / 2 - settings.bulletSize / 2,
          direction: myTank.direction,
        },
        updatedBullets
      )
    : updatedBullets;

  const updatedTank2 = isMyTankShooting
    ? R.assoc("lastShotTimestamp", now, updatedTank)
    : updatedTank;

  return {
    ...state,
    bullets: updatedBullets2,
    terrain: updatedTerrain,
    myTank: updatedTank2,
  };
};

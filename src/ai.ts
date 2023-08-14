import { Settings } from "./settings";
import { Direction, GameState, TankState } from "./state";
import { moveTank, shoot } from "./state.utils";

const PROBABILITIES = {
  CHANGE_DIRECTION: 0.01,
  SHOOT: 0.05,
  MOVE: 0.5,
};

const getRandomDirection = (): Direction => {
  const result = Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3;
  switch (result) {
    case 0:
      return "up";
    case 1:
      return "left";
    case 2:
      return "down";
    case 3:
      return "right";
  }
};

const updateEnemy = (
  enemy: TankState,
  state: GameState,
  settings: Settings
) => {
  const shouldShoot = Math.random() < PROBABILITIES.SHOOT;
  const shouldChangeDirection = Math.random() < PROBABILITIES.CHANGE_DIRECTION;
  // const shouldMove = Math.random() < PROBABILITIES.MOVE;

  if (shouldShoot) {
    shoot(enemy, "enemy", state, settings);
  }

  const moved = moveTank(enemy, enemy.direction, state, settings);

  if (shouldChangeDirection || !moved) {
    enemy.direction = getRandomDirection();
  }
};

export const updateAllEnemies = (state: GameState, settings: Settings) => {
  for (const enemy of state.enemyTanks) {
    updateEnemy(enemy, state, settings);
  }
};

import { Controls } from "./controls";
import { Settings } from "./settings";

export interface TankState {
  x: number;
  y: number;
  direction: "n" | "e" | "s" | "w";
  frame: 1 | 2;
}

export interface BulletState {}

export interface GameState {
  myTank: TankState;
  enemyTanks: TankState[];
  bullets: BulletState[];
}

export const getInitialState = (): GameState => ({
  myTank: {
    x: 0,
    y: 0,
    direction: "s",
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

  if (controls.has("right")) {
    myTank.x += 1;
    myTank.direction = "e";
    myTank.frame = myTank.frame === 1 ? 2 : 1;
  }
}

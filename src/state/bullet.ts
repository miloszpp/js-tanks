import { Settings } from "../settings";
import {
  BulletState,
  getCollidingNode,
  TerrainNode,
  TerrainState,
} from "../state";

export const moveBullet =
  (settings: Settings) =>
  (bullet: BulletState): BulletState => {
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
    return {
      ...bullet,
      x: bullet.x + dx,
      y: bullet.y + dy,
    };
  };

export const shouldBulletExplode =
  (terrain: TerrainState, settings: Settings) =>
  (
    bullet: BulletState
  ): { shouldExplode: boolean; collidingNode?: TerrainNode } => {
    if (
      bullet.x < 0 ||
      bullet.y < 0 ||
      bullet.x > settings.canvasSize ||
      bullet.y > settings.canvasSize
    ) {
      return { shouldExplode: true };
    }

    const collidingNode = getCollidingNode(
      {
        x: bullet.x,
        y: bullet.y,
        width: settings.bulletSize,
        height: settings.bulletSize,
      },
      terrain,
      settings
    );
    if (collidingNode !== undefined) {
      return { shouldExplode: true, collidingNode };
    }

    return { shouldExplode: false };
  };

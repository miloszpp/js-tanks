import SpriteManifest from "../public/sprite.manifest.json";
import SpriteImagePath from "../public/sprite.png";

export function getLoadedSpriteImage() {
  return new Promise<HTMLImageElement>((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.src = SpriteImagePath;
  });
}

export const getPlayerTankCoordinateKey = (
  mode: "primary" | "secondary",
  kind: "a" | "b" | "c" | "d",
  orientation: "up" | "down" | "left" | "right",
  frame: 1 | 2
) => `tank.player.${mode}.${kind}.${orientation}.${frame}` as const;

export const getEnemyTankCoordinateKey = (
  mode: "default",
  kind: "a" | "b" | "c" | "d",
  orientation: "up" | "down" | "left" | "right",
  frame: 1 | 2
) => `tank.enemy.${mode}.${kind}.${orientation}.${frame}` as const;

export const getBrickKey = (mode: 1 | 2) => `terrain.brick.${mode}` as const;

const SpriteImage = await getLoadedSpriteImage();

export const drawSprite = (
  ctx: CanvasRenderingContext2D,
  spriteKey: keyof typeof SpriteManifest,
  x: number,
  y: number,
  size: number
) => {
  const [spriteX, spriteY, spriteWidth, spriteHeight] =
    SpriteManifest[spriteKey].rect;

  ctx.drawImage(
    SpriteImage,
    spriteX,
    spriteY,
    spriteWidth,
    spriteHeight,
    x,
    y,
    size,
    size
  );
};

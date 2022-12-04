import SpriteManifest from "../public/sprite.manifest.json";

export function getLoadedSpriteImage() {
  return new Promise<HTMLImageElement>((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.src = "./sprite.png";
  });
}

export const getPlayerTankCoordinateKey = (
  mode: "primary" | "secondary",
  kind: "a" | "b" | "c" | "d",
  orientation: "up" | "down" | "left" | "right",
  frame: 1 | 2
) => `tank.player.${mode}.${kind}.${orientation}.${frame}` as const;

export const drawSprite = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  spriteKey: keyof typeof SpriteManifest,
  x: number,
  y: number,
  size: number
) => {
  const [spriteX, spriteY, spriteWidth, spriteHeight] =
    SpriteManifest[spriteKey].rect;

  ctx.drawImage(
    image,
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

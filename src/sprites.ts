const FRAME_SIZE = 64;

// https://github.com/dogballs/cattle-bity/blob/master/data/sprite.manifest.json

const COORDINATES: Record<string, [number, number]> = {
  TANK_YELLOW_N_F1: [0, 0],
  TANK_YELLOW_N_F2: [0, 1],
  TANK_YELLOW_W_F1: [0, 2],
  TANK_YELLOW_W_F2: [0, 3],
  TANK_YELLOW_S_F1: [0, 4],
  TANK_YELLOW_S_F2: [0, 5],
  TANK_YELLOW_E_F1: [0, 6],
  TANK_YELLOW_E_F2: [0, 7],
};

export function getLoadedSpriteImage() {
  return new Promise<HTMLImageElement>((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.src = "./sprite.png";
  });
}

export const getTankCoordinateKey = (
  color: "YELLOW",
  orientation: "n" | "w" | "s" | "e",
  frame: 1 | 2
) => `TANK_${color}_${orientation.toUpperCase()}_F${frame}`;

export const drawSprite = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  spriteKey: string,
  x: number,
  y: number,
  size: number
) => {
  const [row, column] = COORDINATES[spriteKey];
  ctx.drawImage(
    image,
    column * FRAME_SIZE,
    row * FRAME_SIZE,
    FRAME_SIZE,
    FRAME_SIZE,
    x,
    y,
    size,
    size
  );
};

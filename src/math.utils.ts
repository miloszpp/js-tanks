export type Rect = { x: number; y: number; width: number; height: number };

export const isPointContainedByRect = (x: number, y: number, rect: Rect) =>
  x >= rect.x &&
  x <= rect.x + rect.width &&
  y >= rect.y &&
  y <= rect.y + rect.height;

export const doRectsIntersect = (r1: Rect, r2: Rect) =>
  isPointContainedByRect(r1.x, r1.y, r2) ||
  isPointContainedByRect(r1.x + r1.width, r1.y, r2) ||
  isPointContainedByRect(r1.x, r1.y + r1.height, r2) ||
  isPointContainedByRect(r1.x + r1.width, r1.y + r1.height, r2);

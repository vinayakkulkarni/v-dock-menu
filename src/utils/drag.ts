import { DockPosition } from '../types';

export interface Coordinates {
  x: number;
  y: number;
}

const EDGE_THRESHOLD = 10;

const pointFromEvent = (
  event: DragEvent | TouchEvent,
  dragCoordinates: Coordinates,
): Coordinates | null => {
  if ('changedTouches' in event) {
    const touch = event.changedTouches[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  }
  return dragCoordinates;
};

/**
 * Resolves the dock position for a drop point. Returns `null` when the point
 * is not close enough to any edge of the viewport.
 */
export const dockPositionAt = (
  point: Coordinates,
  viewport: { width: number; height: number },
): DockPosition | null => {
  const x = Math.round((point.x / viewport.width) * 100);
  const y = Math.round((point.y / viewport.height) * 100);

  if (y < EDGE_THRESHOLD) {
    return DockPosition.TOP;
  }
  if (y > 100 - EDGE_THRESHOLD) {
    return DockPosition.BOTTOM;
  }
  if (x > 100 - EDGE_THRESHOLD) {
    return DockPosition.RIGHT;
  }
  if (x < EDGE_THRESHOLD) {
    return DockPosition.LEFT;
  }
  return null;
};

export const handleDragEnd = (
  event: DragEvent | TouchEvent,
  dragCoordinates: Coordinates,
): DockPosition | null => {
  const point = pointFromEvent(event, dragCoordinates);
  if (!point) {
    return null;
  }
  return dockPositionAt(point, {
    width: window.innerWidth,
    height: window.innerHeight,
  });
};

export const handleDragStart = (event: DragEvent | TouchEvent) => {
  // hide the default ghost image while dragging
  if ('dataTransfer' in event && event.dataTransfer) {
    event.dataTransfer.setDragImage(new Image(), 0, 0);
  }
};

export const isTouchDevice = (): boolean =>
  typeof navigator !== 'undefined' &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);

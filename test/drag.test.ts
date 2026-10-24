import { describe, expect, it } from 'vite-plus/test';
import { dockPositionAt } from '../src/utils/drag';
import { DockPosition } from '../src/types';

const viewport = { width: 1000, height: 800 };

describe('dockPositionAt', () => {
  it('docks to the edge nearest the drop point', () => {
    expect(dockPositionAt({ x: 500, y: 10 }, viewport)).toBe(DockPosition.TOP);
    expect(dockPositionAt({ x: 500, y: 790 }, viewport)).toBe(
      DockPosition.BOTTOM,
    );
    expect(dockPositionAt({ x: 990, y: 400 }, viewport)).toBe(
      DockPosition.RIGHT,
    );
    expect(dockPositionAt({ x: 10, y: 400 }, viewport)).toBe(DockPosition.LEFT);
  });

  it('returns null away from every edge', () => {
    expect(dockPositionAt({ x: 500, y: 400 }, viewport)).toBeNull();
  });
});

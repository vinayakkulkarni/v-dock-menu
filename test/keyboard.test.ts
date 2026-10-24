import { describe, expect, it } from 'vite-plus/test';
import { handleNav } from '../src/utils/keyboard';
import type { MenuBarItemModel } from '../src/types';

const items: MenuBarItemModel[] = [
  { id: 'a', name: 'File', menu: [{ name: 'Recent', menu: [{ name: 'x' }] }] },
  { id: 'b', name: 'Edit', menu: [{ name: 'Cut' }] },
  { id: 'c', name: 'Help' },
];

describe('handleNav', () => {
  it('wraps around the menubar in both directions', () => {
    expect(handleNav('c', 'next', items, -1, '')).toEqual({
      navigateMenubar: { nextId: 'a' },
    });
    expect(handleNav('a', 'prev', items, -1, '')).toEqual({
      navigateMenubar: { nextId: 'c' },
    });
  });

  it('opens the sub menu of the highlighted item', () => {
    const result = handleNav('a', 'next', items, 0, 'a');
    expect('navigateMenu' in result).toBe(true);
    if ('navigateMenu' in result) {
      expect(result.navigateMenu.items[0]?.menu?.[0]?.showSubMenu).toBe(true);
    }
  });
});

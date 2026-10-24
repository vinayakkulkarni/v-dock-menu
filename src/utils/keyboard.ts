import type { MenuBarItemModel } from '../types';

export type NavResult =
  | { navigateMenu: { items: MenuBarItemModel[] } }
  | { navigateMenubar: { nextId: string } };

export const handleNav = (
  id: string,
  dir: 'prev' | 'next',
  items: MenuBarItemModel[],
  activeSelection: number,
  activeMenuBarId: string,
): NavResult => {
  const index = items.findIndex((item) => item.id === id);
  const length = items.length;
  const nextIndex = (index + (dir === 'next' ? 1 : -1) + length) % length;
  const nextId = items[nextIndex]?.id ?? '';

  const menuBarItem = items[index];
  const menuItem = menuBarItem?.menu?.[activeSelection];

  if (menuItem?.menu && dir === 'next') {
    const target = menuItem.name?.toLowerCase();
    return {
      navigateMenu: {
        items: items.map((item) =>
          item.id === activeMenuBarId
            ? {
                ...item,
                menu: item.menu?.map((entry) => ({
                  ...entry,
                  showSubMenu: entry.name?.toLowerCase() === target,
                })),
              }
            : item,
        ),
      },
    };
  }

  return { navigateMenubar: { nextId } };
};

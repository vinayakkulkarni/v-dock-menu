import type { MenuBarItemModel, MenuTheme } from 'v-dock-menu';

/** Colours resolve from CSS custom properties, so the bar follows the page theme. */
export const menuTheme: MenuTheme = {
  primary: 'var(--bar)',
  secondary: 'var(--bar-2)',
  tertiary: 'var(--bar-3)',
  textColor: 'var(--bar-ink)',
};

export const menuItems: MenuBarItemModel[] = [
  {
    name: 'File',
    menu: [
      { name: 'New file', iconSlot: 'file' },
      { name: 'New window', iconSlot: 'window' },
      { isDivider: true },
      { name: 'Open folder', iconSlot: 'folder' },
      {
        name: 'Open recent',
        iconSlot: 'recent',
        menu: [
          { name: 'Roadmap' },
          { name: 'Changelog' },
          {
            name: 'More',
            menu: [{ name: 'Release notes' }, { name: 'Licence' }],
          },
        ],
      },
      { isDivider: true },
      { name: 'Save', iconSlot: 'save' },
      { name: 'Save as…', iconSlot: 'file', disable: true },
      { isDivider: true },
      { name: 'Exit', iconSlot: 'exit' },
    ],
  },
  {
    name: 'Edit',
    menu: [
      { name: 'Undo', iconSlot: 'undo' },
      { name: 'Redo', iconSlot: 'redo' },
      { isDivider: true },
      { name: 'Cut', iconSlot: 'cut' },
      { name: 'Copy', iconSlot: 'copy' },
      { name: 'Paste', iconSlot: 'paste' },
      { isDivider: true },
      { name: 'Find', iconSlot: 'search' },
    ],
  },
  {
    name: 'View',
    menu: [
      {
        name: 'Appearance',
        iconSlot: 'paint',
        menu: [{ name: 'Zen mode' }, { name: 'Full screen' }],
      },
      { name: 'Command palette', iconSlot: 'bolt' },
    ],
  },
  {
    name: 'Help',
    menu: [
      { name: 'Documentation', iconSlot: 'info' },
      { name: 'Settings', iconSlot: 'cog', disable: true },
    ],
  },
];

export const DockPosition = {
  TOP: 'TOP',
  LEFT: 'LEFT',
  BOTTOM: 'BOTTOM',
  RIGHT: 'RIGHT',
} as const;

export type DockPosition = (typeof DockPosition)[keyof typeof DockPosition];

export interface MenuItemModel {
  name?: string;
  id?: string;
  menu?: MenuItemModel[];
  disable?: boolean;
  isDivider?: boolean;
  iconSlot?: string;
  showSubMenu?: boolean;
}

export interface MenuBarItemModel {
  name: string;
  id?: string;
  menu?: MenuItemModel[];
  showMenu?: boolean;
}

export interface MenuTheme {
  primary: string;
  secondary: string;
  tertiary: string;
  textColor: string;
  textHoverColor?: string;
}

export interface SelectedItemModel {
  name: string;
  path: string;
}

export type OnSelected = (item: SelectedItemModel) => void;

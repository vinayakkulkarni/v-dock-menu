import bolt from '~/assets/icons/bolt.svg';
import cog from '~/assets/icons/cog.svg';
import copy from '~/assets/icons/copy.svg';
import cut from '~/assets/icons/cut.svg';
import file from '~/assets/icons/file.svg';
import folderOpen from '~/assets/icons/folder-open.svg';
import folder from '~/assets/icons/folder.svg';
import info from '~/assets/icons/info-circle.svg';
import paint from '~/assets/icons/paint-brush.svg';
import paste from '~/assets/icons/paste.svg';
import redo from '~/assets/icons/redo.svg';
import save from '~/assets/icons/save.svg';
import search from '~/assets/icons/search.svg';
import exit from '~/assets/icons/sign-out-alt.svg';
import undo from '~/assets/icons/undo.svg';
import windowMax from '~/assets/icons/window-maximize.svg';

/** Icon slot name (the `iconSlot` of a menu item) → SVG URL. */
export const glyphs: Record<string, string> = {
  bolt,
  cog,
  copy,
  cut,
  exit,
  file,
  folder,
  info,
  paint,
  paste,
  recent: folderOpen,
  redo,
  save,
  search,
  undo,
  window: windowMax,
};

import type { App, Plugin } from 'vue';
import DockMenu from './components/MenuBar.vue';

const install: Exclude<Plugin['install'], undefined> = (app: App) => {
  app.component('DockMenu', DockMenu);
};

export default install;

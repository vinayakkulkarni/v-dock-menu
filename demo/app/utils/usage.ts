/** The snippet shown in the Usage section. */
export const usage = `<script setup lang="ts">
  import { DockMenu, type SelectedItemModel } from 'v-dock-menu';
  import 'v-dock-menu/dist/index.css';

  const dock = ref('TOP');
  const items = [
    { name: 'File', menu: [{ name: 'Open' }, { isDivider: true }, { name: 'Exit' }] },
    { name: 'Edit', menu: [{ name: 'Cut' }, { name: 'Copy' }, { name: 'Paste' }] },
  ];
  const onSelected = ({ name, path }: SelectedItemModel) => console.log(name, path);
</script>

<template>
  <DockMenu v-model:dock="dock" :items="items" draggable :on-selected="onSelected" />
</template>`;

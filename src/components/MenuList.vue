<template>
  <div
    :class="[dockClass, 'menu-wrapper']"
    :style="{ background: theme.secondary }"
  >
    <ul
      ref="menuItemsRef"
      class="menu-items"
      role="menu"
      tabindex="0"
      @keyup.up="handleKeyUp"
      @keyup.down="handleKeyDown"
      @keyup.left="
        dock === DockPosition.RIGHT
          ? handleKeyRight($event)
          : handleKeyLeft($event)
      "
      @keyup.right="
        dock === DockPosition.RIGHT
          ? handleKeyLeft($event)
          : handleKeyRight($event)
      "
      @keyup.enter="handleKeySelection"
      @focus="hasFocus = true"
      @blur="hasFocus = false"
    >
      <li
        v-for="(item, index) of menuItems"
        :key="item.id"
        :class="[
          dockClass,
          'menu-item',
          {
            'is-parent': !!item.menu,
            highlight: index === highlightedIndex,
            divider: item.isDivider,
            disable: item.disable,
          },
        ]"
        :role="item.isDivider ? 'separator' : 'menuitem'"
        :aria-disabled="item.disable || undefined"
        :aria-haspopup="item.menu ? 'menu' : undefined"
        :style="menuItemStyle"
        @mouseenter="item.menu && !isMobile && toggleSubMenu(item.id)"
        @mouseleave="item.menu && !isMobile && toggleSubMenu(item.id)"
        @click="handleSelection($event, item)"
        @touchend="handleSelection($event, item)"
      >
        <template v-if="!item.isDivider">
          <span v-if="item.iconSlot" class="menu-item-icon">
            <slot :name="item.iconSlot" />
          </span>
          <span class="name">{{ item.name }}</span>
          <span :class="{ visible: !!item.menu }" class="icon-wrap">
            <ChevRight />
          </span>
          <div
            v-if="item.menu && showSubMenu && item.id === activeMenuId"
            :class="[dockClass, 'sub-menu-wrapper']"
          >
            <MenuList
              :items="item.menu"
              :dock="dock"
              :parent="`${parent}>${item.name}`"
              :theme="theme"
              :is-mobile="isMobile"
              :nested="true"
              :on-selected="onSelected"
              :initial-highlight-index="subMenuHighlightIndex"
              @close-menu="handleCloseMenu"
            >
              <template v-for="slot in Object.keys($slots)" #[slot]="scope">
                <slot :name="slot" v-bind="scope" />
              </template>
            </MenuList>
          </div>
        </template>
        <span v-else class="menu-item-divider" />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue';
  import ChevRight from './ChevRight.vue';
  import {
    DockPosition,
    type MenuItemModel,
    type MenuTheme,
    type OnSelected,
  } from '../types';

  defineOptions({ name: 'DockMenuList' });

  const props = withDefaults(
    defineProps<{
      items: MenuItemModel[];
      theme: MenuTheme;
      onSelected: OnSelected;
      dock?: DockPosition;
      parent?: string;
      isMobile?: boolean;
      nested?: boolean;
      initialHighlightIndex?: number;
    }>(),
    {
      dock: DockPosition.TOP,
      parent: '',
      isMobile: false,
      nested: false,
      initialHighlightIndex: -1,
    },
  );

  const emit = defineEmits<{ 'close-menu': [] }>();

  type ListItem = MenuItemModel & { id: string };

  const menuItemsRef = useTemplateRef<HTMLUListElement>('menuItemsRef');
  const showSubMenu = ref(false);
  const activeMenuId = ref<string | null>(null);
  const hasFocus = ref(false);
  const highlightedIndex = ref(props.initialHighlightIndex);
  const subMenuHighlightIndex = ref(-1);

  const menuItems = ref<ListItem[]>(
    props.items.map((item) => ({
      ...item,
      id: Math.random().toString(16).slice(2),
      showSubMenu: false,
    })),
  );

  const dockClass = computed(() => props.dock.toLowerCase());

  const menuItemStyle = computed(() => ({
    '--background-color-hover': props.theme.tertiary,
    '--fore-color': props.theme.textColor,
    '--text-hover-color': props.theme.textHoverColor ?? props.theme.textColor,
  }));

  const pathFor = (name: string) => `${props.parent}>${name}`.toLowerCase();

  const focusList = () => nextTick(() => menuItemsRef.value?.focus());

  const toggleSubMenu = (id: string) => {
    activeMenuId.value = showSubMenu.value ? null : id;
    showSubMenu.value = !showSubMenu.value;
  };

  const handleSelection = (event: Event, item: ListItem) => {
    event.stopPropagation();
    event.preventDefault();

    if (item.disable || item.isDivider) {
      return;
    }

    if (item.menu) {
      showSubMenu.value = !showSubMenu.value;
      return;
    }

    const name = item.name ?? '';
    props.onSelected({ name, path: pathFor(name) });
  };

  const focusMenuBar = () => {
    const container = menuItemsRef.value?.closest<HTMLElement>(
      '.menu-bar-item-container',
    );
    container?.focus();
  };

  const moveHighlight = (step: 1 | -1) => {
    const length = menuItems.value.length;
    let next = highlightedIndex.value + step;
    if (menuItems.value[next]?.isDivider) {
      next += step;
    }
    highlightedIndex.value = (next + length) % length;
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (!hasFocus.value) {
      return;
    }
    event.stopPropagation();
    moveHighlight(-1);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!hasFocus.value) {
      return;
    }
    event.stopPropagation();
    moveHighlight(1);
  };

  const handleKeyRight = (event: KeyboardEvent) => {
    if (!hasFocus.value) {
      return;
    }
    const item = menuItems.value[highlightedIndex.value];
    if (item?.menu) {
      event.stopPropagation();
      subMenuHighlightIndex.value = 0;
      toggleSubMenu(item.id);
    } else {
      focusMenuBar();
    }
  };

  const handleKeyLeft = (event: KeyboardEvent) => {
    if (!hasFocus.value) {
      return;
    }
    if (props.nested) {
      event.stopPropagation();
      emit('close-menu');
    } else {
      focusMenuBar();
    }
  };

  const handleKeySelection = (event: KeyboardEvent) => {
    const item = menuItems.value[highlightedIndex.value];
    if (!item) {
      return;
    }
    event.stopPropagation();

    if (item.menu) {
      subMenuHighlightIndex.value = 0;
      toggleSubMenu(item.id);
      focusList();
    } else if (!item.disable && !item.isDivider) {
      const name = item.name ?? '';
      props.onSelected({ name, path: pathFor(name) });
    }
  };

  const handleCloseMenu = () => {
    showSubMenu.value = false;
    focusList();
  };

  onMounted(focusList);
</script>

<style lang="scss" scoped>
  .menu-wrapper {
    align-items: flex-start;
    display: flex;
    justify-content: center;
    min-width: 200px;
    padding: 0.5rem 0;
  }

  .menu-items {
    align-items: flex-start;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: flex-start;
    list-style: none;
    margin: 0;
    outline: 0;
    padding: 0;
    width: 100%;
  }

  .icon-wrap {
    align-items: center;
    display: flex;
    height: 1rem;
    justify-content: center;
    margin-left: auto;
    width: 1.25rem;
  }

  .menu-item-icon {
    align-items: center;
    display: flex;
    height: 20px;
    justify-content: center;
    margin: 0 2px 0 6px;
    width: 20px;
  }

  .menu-item {
    align-items: center;
    color: var(--fore-color);
    display: flex;
    font-size: 0.9rem;
    justify-content: flex-start;
    position: relative;
    text-transform: capitalize;
    width: 100%;

    &:not(.divider) {
      padding: 0.4rem 0;
    }

    &:hover:not(.divider) {
      cursor: pointer;
      background: var(--background-color-hover);
      color: var(--text-hover-color);
    }

    &.highlight:not(.divider) {
      background: var(--background-color-hover);
      color: var(--text-hover-color);
    }

    span.name {
      flex-basis: 85%;
      text-align: left;
      padding-left: 3%;
    }

    span.icon-wrap {
      width: 10%;
      visibility: hidden;

      &.visible {
        visibility: visible;
      }
    }

    &.right {
      .name {
        order: 2;
        padding-right: 5%;
        text-align: right;
      }

      .icon-wrap {
        margin-right: auto;
        order: 1;
        transform: rotate(180deg);
      }

      .menu-item-icon {
        margin: 0 6px 0 2px;
        order: 3;
      }
    }

    &.disable {
      filter: opacity(0.5);
    }
  }

  .sub-menu-wrapper {
    position: absolute;
    top: 0;

    &:not(.right) {
      left: 100%;
    }

    &.right {
      right: 100%;
    }

    &.bottom {
      transform: translateY(-65%);
    }
  }

  .menu-item-divider {
    background: rgba(0, 0, 0, 0.1);
    display: block;
    height: 1px;
    margin: 0 auto;
    margin-bottom: 6px;
    margin-top: 6px;
    width: 90%;
  }
</style>

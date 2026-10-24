<template>
  <nav
    ref="menuBarRef"
    :class="[dockClass, 'menu-bar-container', expandClass]"
    :draggable="draggable"
    :style="menuBarStyle"
    aria-label="Dock menu"
    tabindex="0"
    @dragover="handleDragMove"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @touchstart="handleTouchStart"
    @touchmove="handleDragMove"
    @touchend="handleDragEnd"
  >
    <ul
      :class="[dockClass, 'menu-bar-items']"
      role="menubar"
      :aria-orientation="isSidebar ? 'vertical' : 'horizontal'"
      draggable="true"
      @dragstart="handleDragCancel"
    >
      <li
        v-for="item of menuItems"
        :key="item.id"
        :class="[dockClass, 'v-dock-menu-bar-item-wrapper']"
        role="none"
      >
        <MenuBarItem
          :id="item.id"
          :dock="dockPosition"
          :menu-active="menuActive"
          :menu="item.menu"
          :name="item.name"
          :menu-bar-active="menuBarActive"
          :show-menu="item.showMenu"
          :theme="theme"
          :is-mobile-device="isMobileDevice"
          :on-selected="handleSelected"
          :highlight-first-element="highlightFirstElement"
          @deactivate="handleDeactivateMenu"
          @activate="handleActivateMenu"
          @activate-next="handleActivateDir"
          @activate-previous="handleActivateDir"
          @show="handleOnShowMenu"
        >
          <template v-for="slot in Object.keys($slots)" #[slot]="scope">
            <slot :name="slot" v-bind="scope" />
          </template>
        </MenuBarItem>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
  import {
    computed,
    onBeforeUnmount,
    onMounted,
    ref,
    useTemplateRef,
    watch,
  } from 'vue';
  import MenuBarItem from './MenuBarItem.vue';
  import {
    DockPosition,
    type MenuBarItemModel,
    type MenuTheme,
    type OnSelected,
    type SelectedItemModel,
  } from '../types';
  import {
    handleDragEnd as dockFromDrag,
    handleDragStart as hideDragGhost,
    isTouchDevice,
    type Coordinates,
  } from '../utils/drag';
  import { handleNav } from '../utils/keyboard';

  defineOptions({ name: 'DockMenu' });

  const props = withDefaults(
    defineProps<{
      items: MenuBarItemModel[];
      onSelected?: OnSelected;
      dock?: DockPosition;
      draggable?: boolean;
      sidebarWidth?: string;
      theme?: MenuTheme;
    }>(),
    {
      onSelected: undefined,
      dock: DockPosition.TOP,
      draggable: false,
      sidebarWidth: '200px',
      theme: () => ({
        primary: '#21252b',
        secondary: '#32323e',
        tertiary: '#4c4c57',
        textColor: '#fff',
      }),
    },
  );

  const emit = defineEmits<{
    'update:dock': [dock: DockPosition];
    selected: [item: SelectedItemModel];
  }>();

  type BarItem = MenuBarItemModel & { id: string };

  const menuBarRef = useTemplateRef<HTMLElement>('menuBarRef');
  const dragStart = ref(false);
  const menuActive = ref(false);
  const menuBarActive = ref(false);
  const dockPosition = ref<DockPosition>(props.dock);
  const isMobileDevice = ref(false);
  const highlightFirstElement = ref(false);
  const activeMenuSelection = ref(-1);
  const activeMenuBarId = ref('');
  const clientCoords = ref<Coordinates>({ x: 0, y: 0 });

  const withIds = (items: MenuBarItemModel[]): BarItem[] =>
    items.map((item) => ({
      ...item,
      id: item.id ?? Math.random().toString(16).slice(2),
    }));

  const menuItems = ref<BarItem[]>(withIds(props.items));

  watch(
    () => props.items,
    (items) => {
      menuItems.value = withIds(items);
    },
  );

  watch(
    () => props.dock,
    (dock) => {
      dockPosition.value = dock;
    },
  );

  const dockClass = computed(() => dockPosition.value.toLowerCase());

  const isSidebar = computed(
    () =>
      dockPosition.value === DockPosition.LEFT ||
      dockPosition.value === DockPosition.RIGHT,
  );

  // convert to a sidebar when docked to either left or right
  const expandClass = computed(() => {
    if (!isSidebar.value) {
      return '';
    }
    return menuBarActive.value ? 'expanded' : 'not-expanded';
  });

  const menuBarStyle = computed(() => ({
    '--menubar-expanded-width': props.sidebarWidth,
    '--menubar-not-expanded-width': '50px',
    '--menubar-bg-color': props.theme.primary,
  }));

  const handleMouseEnter = () => {
    menuBarActive.value = true;
  };

  const handleMouseLeave = () => {
    if (!isMobileDevice.value && !menuActive.value) {
      menuBarActive.value = false;
    }
  };

  const handleDeactivateMenu = () => {
    // keep the menubar open while a menu is being displayed
    if (!menuActive.value) {
      menuItems.value = menuItems.value.map((item) => ({
        ...item,
        showMenu: false,
      }));
    }
  };

  const handleMenuClosure = () => {
    if (menuActive.value || menuBarActive.value) {
      menuBarActive.value = false;
      menuActive.value = false;
      activeMenuSelection.value = -1;
      activeMenuBarId.value = '';
      highlightFirstElement.value = false;
      handleDeactivateMenu();
    }
  };

  const updateDragCoords = (event: DragEvent) => {
    clientCoords.value = { x: event.clientX, y: event.clientY };
  };

  const closureEvent = () => (isMobileDevice.value ? 'touchend' : 'click');

  onMounted(() => {
    isMobileDevice.value = isTouchDevice();
    document.addEventListener(closureEvent(), handleMenuClosure);
    document.addEventListener('dragover', updateDragCoords);

    if (!isMobileDevice.value) {
      menuBarRef.value?.addEventListener('mouseenter', handleMouseEnter);
      menuBarRef.value?.addEventListener('mouseleave', handleMouseLeave);
    }
  });

  onBeforeUnmount(() => {
    document.removeEventListener(closureEvent(), handleMenuClosure);
    document.removeEventListener('dragover', updateDragCoords);
    menuBarRef.value?.removeEventListener('mouseenter', handleMouseEnter);
    menuBarRef.value?.removeEventListener('mouseleave', handleMouseLeave);
  });

  const handleDragStart = (event: DragEvent) => {
    dragStart.value = true;
    hideDragGhost(event);
  };

  const handleTouchStart = (event: TouchEvent) => {
    if (props.draggable) {
      dragStart.value = true;
      hideDragGhost(event);
    }
  };

  const handleDragEnd = (event: DragEvent | TouchEvent) => {
    if (!dragStart.value) {
      return;
    }
    dragStart.value = false;

    const next = dockFromDrag(event, clientCoords.value);
    if (next && next !== dockPosition.value) {
      dockPosition.value = next;
      emit('update:dock', next);
    }
  };

  const handleDragMove = () => {
    if (dragStart.value) {
      // close the menu during a drag operation
      menuActive.value = false;
    }
  };

  // cancels the drag event on the child elements of the menubar
  const handleDragCancel = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleActivateMenu = (id?: string) => {
    menuItems.value = menuItems.value.map((item) => ({
      ...item,
      showMenu: item.id === id,
    }));
  };

  const handleOnShowMenu = (state: boolean, id?: string) => {
    menuActive.value = state;
    if (state && id) {
      activeMenuBarId.value = id;
    } else {
      activeMenuBarId.value = '';
      highlightFirstElement.value = false;
    }
  };

  const handleSelected = (item: SelectedItemModel) => {
    handleMenuClosure();
    props.onSelected?.(item);
    emit('selected', item);
  };

  // moves between menubar items via the keyboard
  const handleActivateDir = (id: string, dir: 'prev' | 'next') => {
    const result = handleNav(
      id,
      dir,
      menuItems.value,
      activeMenuSelection.value,
      activeMenuBarId.value,
    );

    if ('navigateMenu' in result) {
      menuItems.value = withIds(result.navigateMenu.items);
    } else {
      const { nextId } = result.navigateMenubar;
      highlightFirstElement.value = true;
      activeMenuBarId.value = nextId;
      if (nextId) {
        handleActivateMenu(nextId);
      }
    }

    activeMenuSelection.value = -1;
  };
</script>

<style lang="scss" scoped>
  .menu-bar-container {
    position: fixed;
    display: flex;
    user-select: none;
    outline: 0;
    touch-action: none;
    z-index: 9999;
    background-color: var(--menubar-bg-color);

    &.left,
    &.right {
      height: 100%;
      align-items: flex-start;

      &.expanded {
        width: var(--menubar-expanded-width);
        animation: expand 0.1s linear;
      }

      &.not-expanded {
        width: var(--menubar-not-expanded-width);
        animation: collapse 0.1s linear;
      }
    }

    &.top,
    &.bottom {
      height: 2.5rem;
      width: 100%;
      align-items: center;
      left: 0;
    }

    &.left {
      left: 0;
      top: 0;
    }

    &.right {
      right: 0;
      top: 0;
    }

    &.top {
      top: 0;
    }

    &.bottom {
      bottom: 0;
    }
  }

  .menu-bar-items {
    display: flex;
    list-style: none;
    align-items: center;
    justify-content: flex-start;
    padding: 0;
    margin: 0;

    &.top,
    &.bottom {
      height: 100%;
    }

    &.left,
    &.right {
      flex-direction: column;
      width: 100%;
      align-items: flex-start;
    }
  }

  .v-dock-menu-bar-item-wrapper {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    &.left,
    &.right {
      width: 100%;
    }
  }

  @keyframes expand {
    0% {
      width: 50px;
    }

    100% {
      width: 200px;
    }
  }

  @keyframes collapse {
    0% {
      width: 200px;
    }

    100% {
      width: 50px;
    }
  }
</style>

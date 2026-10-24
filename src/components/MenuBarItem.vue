<template>
  <div
    ref="menuBarItemRef"
    :class="[...menuBarStyle, 'menu-bar-item-container']"
    :style="{ background: bgColor }"
    role="menuitem"
    :aria-haspopup="menu ? 'menu' : undefined"
    :aria-expanded="menuActive && showMenu"
    tabindex="0"
    @mouseenter="setMenuViewable(true)"
    @mouseleave="setMenuViewable(false)"
    @click="handleClick"
    @touchend="handleTouchEnd"
    @keyup="handleKeyUp"
  >
    <span
      :class="[...menuBarStyle, 'name-container']"
      :style="{ color: theme.textColor }"
    >
      {{ displayName }}
    </span>
    <span class="menu-container" :style="menuStyle">
      <Transition name="fade">
        <MenuList
          v-if="menu && menuActive && showMenu"
          :items="menu"
          :dock="dock"
          :parent="name"
          :theme="theme"
          :is-mobile="isMobileDevice"
          :on-selected="onSelected"
          :initial-highlight-index="highlightIndex"
        >
          <template v-for="slot in Object.keys($slots)" #[slot]="scope">
            <slot :name="slot" v-bind="scope" />
          </template>
        </MenuList>
      </Transition>
    </span>
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    useTemplateRef,
    watch,
  } from 'vue';
  import MenuList from './MenuList.vue';
  import {
    DockPosition,
    type MenuItemModel,
    type MenuTheme,
    type OnSelected,
  } from '../types';

  defineOptions({ name: 'DockMenuBarItem' });

  const props = withDefaults(
    defineProps<{
      id: string;
      name: string;
      theme: MenuTheme;
      onSelected: OnSelected;
      menu?: MenuItemModel[];
      dock?: DockPosition;
      menuActive?: boolean;
      menuBarActive?: boolean;
      showMenu?: boolean;
      isMobileDevice?: boolean;
      activeMenuSelectionIndex?: number;
      highlightFirstElement?: boolean;
    }>(),
    {
      menu: undefined,
      dock: DockPosition.TOP,
      menuActive: false,
      menuBarActive: false,
      showMenu: false,
      isMobileDevice: false,
      activeMenuSelectionIndex: -1,
      highlightFirstElement: false,
    },
  );

  const emit = defineEmits<{
    show: [state: boolean, id?: string];
    activate: [id: string];
    deactivate: [id: string];
    'activate-next': [id: string, dir: 'next'];
    'activate-previous': [id: string, dir: 'prev'];
    'highlight-menu-item': [dir: 'up' | 'down', id: string];
    'select-highlighted-menu-item': [];
  }>();

  const menuBarItemRef = useTemplateRef<HTMLDivElement>('menuBarItemRef');
  const menuBarItemActive = ref(false);
  const menuOpen = ref(false);
  const highlightIndex = ref(-1);
  const menuStyle = ref<Record<string, string>>({});

  const isSidebar = computed(
    () => props.dock === DockPosition.LEFT || props.dock === DockPosition.RIGHT,
  );

  const displayName = computed(() =>
    isSidebar.value && !props.menuBarActive ? props.name[0] : props.name,
  );

  const menuBarStyle = computed(() => [
    props.dock.toLowerCase(),
    menuBarItemActive.value ? 'active' : '',
    props.menuBarActive ? 'expanded' : '',
  ]);

  const bgColor = computed(() =>
    menuBarItemActive.value ? props.theme.secondary : 'transparent',
  );

  const setMenuViewable = (viewable: boolean) => {
    if (viewable) {
      emit('activate', props.id);
    } else {
      emit('deactivate', props.id);
    }
  };

  const toggleMenu = (event: Event) => {
    event.stopPropagation();
    menuOpen.value = !menuOpen.value;
    emit('show', menuOpen.value, props.id);
  };

  const handleClick = (event: MouseEvent) => {
    if (!props.isMobileDevice) {
      toggleMenu(event);
    }
  };

  const handleTouchEnd = (event: TouchEvent) => {
    if (props.isMobileDevice) {
      setMenuViewable(true);
      nextTick(() => toggleMenu(event));
    }
  };

  const computeMenuStyle = () => {
    const element = menuBarItemRef.value;
    if (!element) {
      return;
    }
    const { clientHeight, clientWidth } = element;
    const positions: Record<DockPosition, Record<string, string>> = {
      LEFT: { top: '0px', left: `${clientWidth}px` },
      RIGHT: { top: '0px', right: `${clientWidth}px` },
      TOP: { top: `${clientHeight}px`, left: '0px' },
      BOTTOM: { bottom: `${clientHeight}px`, left: '0px' },
    };
    menuStyle.value = positions[props.dock];
  };

  let styleTimer: ReturnType<typeof setTimeout> | undefined;

  watch(
    () => props.showMenu,
    (value) => {
      menuBarItemActive.value = value;
      if (value) {
        menuOpen.value = false;
        nextTick(() => menuBarItemRef.value?.focus());
      }
    },
  );

  // wait for the expand/collapse animation before measuring
  watch(
    () => [props.dock, props.menuBarActive],
    () => {
      clearTimeout(styleTimer);
      styleTimer = setTimeout(computeMenuStyle, 150);
    },
  );

  watch(
    () => props.highlightFirstElement,
    (value) => {
      highlightIndex.value = value ? 0 : -1;
    },
  );

  const keyNavType = computed(() =>
    isSidebar.value ? 'vertical' : 'horizontal',
  );

  const handleKeyUp = (event: KeyboardEvent) => {
    const { key } = event;
    const horizontal = keyNavType.value === 'horizontal';

    if (key === 'Tab') {
      emit('activate', props.id);
    } else if (key === 'Enter') {
      if (props.activeMenuSelectionIndex < 0) {
        emit('show', !props.menuActive, props.id);
      } else {
        emit('select-highlighted-menu-item');
      }
    } else if (key === 'Escape') {
      emit('show', false);
    } else if (
      (key === 'ArrowRight' && horizontal) ||
      (key === 'ArrowDown' && !horizontal)
    ) {
      emit('activate-next', props.id, 'next');
    } else if (
      (key === 'ArrowLeft' && horizontal) ||
      (key === 'ArrowUp' && !horizontal)
    ) {
      emit('activate-previous', props.id, 'prev');
    } else if (key === 'ArrowDown' && horizontal) {
      emit('highlight-menu-item', 'down', props.id);
    } else if (key === 'ArrowUp' && horizontal) {
      emit('highlight-menu-item', 'up', props.id);
    }
  };

  onMounted(computeMenuStyle);
  onBeforeUnmount(() => clearTimeout(styleTimer));
</script>

<style lang="scss" scoped>
  .menu-bar-item-container {
    align-items: center;
    cursor: pointer;
    display: flex;
    justify-content: center;
    position: relative;

    &:focus {
      outline: 0;
    }

    &:focus-visible {
      outline: 1px solid #0080ff;
    }

    &.left,
    &.right {
      padding: 0.5rem 0;
      width: 100%;
    }

    &.top,
    &.bottom {
      height: 100%;
      padding: 0 0.75rem;
    }
  }

  .menu-container {
    position: absolute;
    z-index: 9999;
  }

  .name-container {
    font-size: 0.95rem;
    margin: 0.25rem 0;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: capitalize;
    white-space: nowrap;

    &.left,
    &.right {
      align-items: center;
      background: none;
      display: flex;
      font-size: 1rem;
      height: 1.5rem;
      justify-content: flex-start;
      width: 100%;

      &.expanded {
        padding-left: 1rem;
      }

      &:not(.expanded) {
        font-size: 1.1rem;
        justify-content: center;
        text-transform: uppercase;
        width: 2rem;
      }
    }
  }
</style>

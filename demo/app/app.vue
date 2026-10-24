<script setup lang="ts">
  import { DockMenu, DockPosition, type SelectedItemModel } from 'v-dock-menu';
  import { glyphs } from '~/utils/glyphs';
  import { menuItems, menuTheme } from '~/utils/menu';
  import { usage } from '~/utils/usage';

  const REPO = 'https://github.com/vinayakkulkarni/v-dock-menu';
  const NPM = 'https://www.npmjs.com/package/v-dock-menu';
  const INSTALL = 'pnpm add v-dock-menu';

  const EDGES: { value: DockPosition; label: string; arrow: string }[] = [
    { value: DockPosition.TOP, label: 'Top', arrow: '↑' },
    { value: DockPosition.RIGHT, label: 'Right', arrow: '→' },
    { value: DockPosition.BOTTOM, label: 'Bottom', arrow: '↓' },
    { value: DockPosition.LEFT, label: 'Left', arrow: '←' },
  ];

  const { track } = useAnalytics();

  const dock = ref<DockPosition>(DockPosition.TOP);
  const draggable = ref(true);
  const history = ref<SelectedItemModel[]>([]);

  // keep page content clear of the fixed menubar
  const pagePadding = computed(() => {
    const bar = {
      TOP: 'pt-10',
      BOTTOM: 'pb-10',
      LEFT: 'pl-12',
      RIGHT: 'pr-12',
    };
    return bar[dock.value];
  });

  function onDockDragged(next: DockPosition) {
    dock.value = next;
    track('dock_changed', { dock: next, via: 'drag' });
  }

  function setDock(next: DockPosition) {
    if (next === dock.value) return;
    dock.value = next;
    track('dock_changed', { dock: next, via: 'control' });
  }

  function toggleDraggable() {
    draggable.value = !draggable.value;
    track('option_changed', {
      option: 'draggable',
      value: String(draggable.value),
    });
  }

  function onSelected(item: SelectedItemModel) {
    history.value = [item, ...history.value].slice(0, 4);
    track('menu_selected', { path: item.path, dock: dock.value });
  }
</script>

<template>
  <div :class="['min-h-dvh transition-[padding] duration-150', pagePadding]">
    <DockMenu
      :dock="dock"
      :items="menuItems"
      :theme="menuTheme"
      :draggable="draggable"
      :on-selected="onSelected"
      @update:dock="onDockDragged"
    >
      <template v-for="(src, slot) in glyphs" #[slot] :key="slot">
        <MenuGlyph :src="src" />
      </template>
    </DockMenu>

    <div class="mx-auto flex max-w-6xl flex-col px-5 sm:px-8">
      <header
        class="flex items-center justify-between gap-4 border-b border-rule py-5"
      >
        <span class="font-mono text-sm text-ink">v-dock-menu</span>
        <nav class="flex items-center gap-1 sm:gap-3">
          <OutboundLink
            :href="REPO"
            section="header"
            class="px-2 py-2 font-mono text-xs text-ink-2 hover:text-ink"
          >
            GitHub
          </OutboundLink>
          <OutboundLink
            :href="NPM"
            section="header"
            class="px-2 py-2 font-mono text-xs text-ink-2 hover:text-ink"
          >
            npm
          </OutboundLink>
          <ThemeToggle />
        </nav>
      </header>

      <main class="flex flex-col">
        <section
          class="grid gap-10 border-b border-rule py-12 md:grid-cols-[1fr_auto] md:items-end md:py-16"
        >
          <div class="flex min-w-0 flex-col gap-6">
            <p class="font-mono text-xs tracking-widest text-ink-3 uppercase">
              Vue 3 · TypeScript · keyboard accessible
            </p>
            <h1
              class="max-w-headline font-display text-heading font-semibold text-ink"
            >
              A menu bar you can dock to any edge.
            </h1>
            <p class="max-w-measure text-base leading-relaxed text-ink-2">
              The bar on this page is the component. Drag it to the left, right
              or bottom of the window, or pick an edge below. Menus nest to any
              depth, open with the arrow keys and take icons through slots.
            </p>
            <div class="max-w-md">
              <CopyCommand :command="INSTALL" />
            </div>
          </div>
          <p
            class="font-display text-edge font-semibold tracking-tight text-accent select-none"
            aria-live="polite"
          >
            <span class="sr-only">Docked to the </span>{{ dock.toLowerCase() }}
          </p>
        </section>

        <section
          class="grid gap-10 border-b border-rule py-12 md:grid-cols-2 md:gap-16"
          aria-labelledby="playground"
        >
          <div class="flex flex-col gap-6">
            <h2
              id="playground"
              class="font-display text-2xl font-semibold text-ink"
            >
              Playground
            </h2>
            <fieldset class="flex flex-col gap-3">
              <legend class="mb-3 font-mono text-xs text-ink-3 uppercase">
                Dock edge
              </legend>
              <div class="grid grid-cols-4 border border-rule">
                <button
                  v-for="edge in EDGES"
                  :key="edge.value"
                  type="button"
                  :aria-pressed="dock === edge.value"
                  :class="[
                    'flex flex-col items-center gap-1 border-r border-rule py-3 text-sm transition-colors last:border-r-0',
                    dock === edge.value
                      ? 'bg-ink text-paper'
                      : 'text-ink-2 hover:bg-paper-2 hover:text-ink',
                  ]"
                  @click="setDock(edge.value)"
                >
                  <span class="font-mono text-base" aria-hidden="true">{{
                    edge.arrow
                  }}</span>
                  {{ edge.label }}
                </button>
              </div>
            </fieldset>
            <label
              class="flex cursor-pointer items-center justify-between gap-4 border border-rule px-4 py-3"
            >
              <span class="flex flex-col">
                <span class="text-sm text-ink">Draggable</span>
                <span class="text-xs text-ink-3">
                  Drop the bar near an edge to dock it there.
                </span>
              </span>
              <input
                type="checkbox"
                class="size-4 accent-[var(--accent)]"
                :checked="draggable"
                @change="toggleDraggable"
              />
            </label>
            <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt class="font-mono text-xs text-ink-3 uppercase">Keys</dt>
              <dd class="text-ink-2">
                Tab to the bar, Enter to open, arrows to move, Esc to close.
              </dd>
            </dl>
          </div>

          <div class="flex flex-col gap-4">
            <h2 class="font-mono text-xs text-ink-3 uppercase">
              on-selected payload
            </h2>
            <ol
              v-if="history.length"
              class="flex flex-col border border-rule"
              aria-live="polite"
            >
              <li
                v-for="(item, index) in history"
                :key="`${item.path}-${index}`"
                :class="[
                  'flex flex-col gap-1 border-b border-rule px-4 py-3 last:border-b-0',
                  index === 0 ? 'bg-paper-2' : 'opacity-60',
                ]"
              >
                <span class="text-sm text-ink">{{ item.name }}</span>
                <code class="font-mono text-code break-all text-accent-ink">
                  {{ item.path }}
                </code>
              </li>
            </ol>
            <p
              v-else
              class="border border-dashed border-rule px-4 py-6 text-sm text-ink-3"
            >
              Choose any item from the bar. Its
              <code class="font-mono">name</code> and full
              <code class="font-mono">path</code> land here.
            </p>
          </div>
        </section>

        <section class="flex flex-col gap-6 py-12" aria-labelledby="usage">
          <h2 id="usage" class="font-display text-2xl font-semibold text-ink">
            Usage
          </h2>
          <pre
            class="overflow-x-auto border border-rule bg-paper-2 p-5 font-mono text-code leading-relaxed text-ink"
          ><code>{{ usage }}</code></pre>
        </section>
      </main>

      <footer
        class="flex flex-wrap items-center justify-between gap-4 border-t border-rule py-8 text-sm text-ink-3"
      >
        <span>MIT · Vinayak Kulkarni</span>
        <span class="flex gap-4">
          <OutboundLink :href="REPO" section="footer" class="hover:text-ink">
            Source
          </OutboundLink>
          <OutboundLink :href="NPM" section="footer" class="hover:text-ink">
            npm
          </OutboundLink>
        </span>
      </footer>
    </div>
  </div>
</template>

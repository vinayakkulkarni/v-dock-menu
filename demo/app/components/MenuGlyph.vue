<script setup lang="ts">
  const props = defineProps<{ src: string }>();

  // Vite may inline small SVGs as data URIs containing quotes and spaces,
  // so the URL is quoted with JSON.stringify before it reaches CSS.
  const style = computed(() => ({
    '--glyph': `url(${JSON.stringify(props.src)})`,
  }));
</script>

<template>
  <span class="menu-glyph" :style="style" aria-hidden="true" />
</template>

<style scoped>
  /* Paints the monochrome SVG in the menu's text colour. */
  .menu-glyph {
    display: block;
    width: 0.875rem;
    height: 0.875rem;
    background-color: currentColor;
    -webkit-mask: var(--glyph) center / contain no-repeat;
    mask: var(--glyph) center / contain no-repeat;
  }
</style>

import VueRolldown from 'unplugin-vue/rolldown';
import Vue from 'unplugin-vue/vite';
import { defineConfig } from 'vite-plus';

const ignorePatterns = [
  '.nuxt',
  '.output',
  'dist',
  'node_modules',
  '.wrangler',
  'coverage',
];

export default defineConfig({
  plugins: [Vue()],
  test: {
    environment: 'happy-dom',
    include: ['test/**/*.test.ts'],
  },
  lint: {
    plugins: ['typescript', 'vue', 'import'],
    ignorePatterns,
  },
  pack: {
    entry: ['src/index.ts'],
    format: ['esm'],
    platform: 'neutral',
    sourcemap: true,
    dts: { vue: true },
    plugins: [VueRolldown({ isProduction: true })],
    deps: {
      neverBundle: ['vue'],
    },
    css: {
      fileName: 'index.css',
    },
  },
  fmt: {
    printWidth: 80,
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'all',
    bracketSpacing: true,
    arrowParens: 'always',
    endOfLine: 'lf',
    vueIndentScriptAndStyle: true,
    ignorePatterns: [
      ...ignorePatterns,
      'pnpm-lock.yaml',
      '**/CHANGELOG.md',
      'readme-assets',
    ],
  },
});

import babel from '@rollup/plugin-babel';
import beep from '@rollup/plugin-beep';
import buble from '@rollup/plugin-buble';
import common from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import sucrase from '@rollup/plugin-sucrase';
import scss from 'rollup-plugin-scss';
import { terser } from 'rollup-plugin-terser';
import vue from 'rollup-plugin-vue';
import pkg from '../package.json';

const banner = `/*
 * ${pkg.name}
 * ${pkg.description}
 * v${pkg.version}
 * ${pkg.license} License
 */
`;

const external = ['@vue/composition-api'];

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      strict: true,
      banner,
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      strict: true,
      banner,
    },
    {
      file: pkg.umd,
      format: 'umd',
      exports: 'named',
      strict: true,
      banner,
      name: 'Vue2FloatMenu',
      globals: {
        '@vue/composition-api': 'vueCompositionApi',
      },
    },
  ],
  plugins: [
    vue({ css: false }),
    scss({
      output: 'dist/v-dock-menu.min.css',
      outputStyle: 'compressed',
    }),
    sucrase({
      exclude: ['node_modules/**'],
      transforms: ['typescript'],
    }),
    beep(),
    common(),
    buble(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
    }),
    resolve(),
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    }),
  ],
  external,
};

import { defineConfig, type UserConfig } from 'tsdown';

const config = {
  entry: 'src/plugin.ts',
  globalName: 'KaplayPluginTemplate',
  sourcemap: true,
  deps: {
    neverBundle: ['kaplay'],
  },
} satisfies UserConfig;

export default defineConfig([
  {
    ...config,
    format: ['esm', 'cjs', 'umd'],
  },

  {
    ...config,
    format: 'umd',
    minify: true,
    outputOptions: {
      entryFileNames: '[name].umd.min.js',
    },
  },
]);

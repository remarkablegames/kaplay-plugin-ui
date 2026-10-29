import type { uiPlugin } from './dist/plugin.cjs';

declare global {
  var uiPlugin: uiPlugin;
}

export {};

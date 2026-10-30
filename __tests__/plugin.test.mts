import type { KAPLAYCtx } from 'kaplay';

import { uiPlugin } from '../dist/plugin.mjs';

describe('dist/plugin.mjs', () => {
  it('exports plugin', () => {
    expect(uiPlugin).toBeTypeOf('function');
  });

  it('adds plugin', () => {
    const k = {} as unknown as KAPLAYCtx;
    expect(uiPlugin(k).addButton).toBeTypeOf('function');
  });
});

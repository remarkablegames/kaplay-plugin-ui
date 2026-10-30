import type { KAPLAYCtx } from 'kaplay';

import { uiPlugin } from '../dist/plugin.mjs';

describe('dist/plugin.mjs', () => {
  it('exports plugin', () => {
    expect(uiPlugin).toBeTypeOf('function');
  });

  it('adds plugin', () => {
    const k = {} as unknown as KAPLAYCtx;
    expect(uiPlugin(k).button).toBeTypeOf('function');
    expect(uiPlugin(k).addButton).toBeTypeOf('function');
  });

  it('creates component', () => {
    const k = {} as unknown as KAPLAYCtx;
    const comp = uiPlugin(k).button('hello');
    expect(comp.id).toBe('button');
    expect(comp.text).toBe('hello');
  });
});

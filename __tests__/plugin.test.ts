import type { KAPLAYCtx } from 'kaplay';

import { uiPlugin } from '../src/plugin';

function makeK(overrides: Record<string, unknown> = {}) {
  const k = {
    ...overrides,
  } as unknown as KAPLAYCtx;
  return { k };
}

describe('uiPlugin', () => {
  it('registers button helpers', () => {
    const { k } = makeK();
    const result = uiPlugin(k);
    expect(result.addButton).toBeTypeOf('function');
    expect(result.addModal).toBeTypeOf('function');
    expect(result.setTheme).toBeTypeOf('function');
    expect(result.getTheme).toBeTypeOf('function');
  });

  it('returns current theme', () => {
    const { k } = makeK();
    const ui = uiPlugin(k);
    ui.setTheme({ spacing: 8 });
    expect(ui.getTheme()).toMatchObject({ spacing: 8 });
  });
});

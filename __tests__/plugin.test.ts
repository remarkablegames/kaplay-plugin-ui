import type { KAPLAYCtx } from 'kaplay';

import { buttonPlugin, UIPlugin, uiPlugin } from '../src/plugin';

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
    expect(result.button).toBeTypeOf('function');
    expect(result.addButton).toBeTypeOf('function');
    expect(result.addTextButton).toBeTypeOf('function');
    expect(result.textButton).toBeTypeOf('function');
    expect(result.uiButton).toBeTypeOf('function');
    expect(result.setTheme).toBeTypeOf('function');
    expect(result.getTheme).toBeTypeOf('function');
  });

  it('getTheme returns current theme', () => {
    const { k } = makeK();
    const ui = uiPlugin(k);
    ui.setTheme({ spacing: 8 });
    expect(ui.getTheme()).toMatchObject({ spacing: 8 });
  });

  it('aliases point to the same implementation', () => {
    const { k } = makeK();
    expect(typeof buttonPlugin(k).button).toBe('function');
    expect(typeof UIPlugin(k).button).toBe('function');
  });
});

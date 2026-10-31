import type { KAPLAYCtx } from 'kaplay';

import { createButton } from '../src/button';
import { uiPlugin } from '../src/plugin';
import { resolveTheme } from '../src/theme';

const makeK = () =>
  ({
    add: vi.fn(() => ({
      add: vi.fn(() => ({})),
      onClick: vi.fn((cb?: () => void) => cb?.()),
      onHover: vi.fn((cb?: () => void) => cb?.()),
      onHoverEnd: vi.fn((cb?: () => void) => cb?.()),
    })),

    anchor: vi.fn(() => ({})),
    color: vi.fn((value: unknown) => value),
    area: vi.fn(() => ({})),
    rgb: vi.fn((r: number, g: number, b: number) => ({ r, g, b })),
    vec2: vi.fn((x: number, y: number) => ({ x, y })),
    rect: vi.fn(() => ({})),
    pos: vi.fn((value: unknown) => value),
    scale: vi.fn(() => ({})),
    text: vi.fn(() => ({})),
    setCursor: vi.fn(),
  }) as unknown as KAPLAYCtx;

describe('addButton', () => {
  it('creates button', () => {
    const k = makeK();
    const ui = uiPlugin(k);
    const button = ui.addButton('Click', { onClick: vi.fn(), radius: 6 });
    expect(k.add).toHaveBeenCalledOnce();
    expect(button).toBeDefined();
  });

  it('wires hover and click handlers', () => {
    const k = makeK();
    const ui = uiPlugin(k);
    const button = ui.addButton('Click', { onClick: vi.fn() }) as unknown as {
      onClick: ReturnType<typeof vi.fn>;
      onHover: ReturnType<typeof vi.fn>;
      onHoverEnd: ReturnType<typeof vi.fn>;
    };
    expect(button.onClick).toHaveBeenCalledOnce();
    expect(button.onHover).toHaveBeenCalledOnce();
    expect(button.onHoverEnd).toHaveBeenCalledOnce();
  });

  it('updates state', () => {
    const k = makeK();
    const ui = uiPlugin(k);
    const button = ui.addButton('Click');

    button.color = k.rgb(1, 2, 3);
    expect(button.color).toEqual({ r: 1, g: 2, b: 3 });

    button.pos = k.vec2(5, 6);
    expect(button.pos).toEqual({ x: 5, y: 6 });
  });

  it('creates button with factory', () => {
    const k = makeK();
    const button = createButton(k, resolveTheme(), 'direct', {});
    expect(button).toBeDefined();
  });
});

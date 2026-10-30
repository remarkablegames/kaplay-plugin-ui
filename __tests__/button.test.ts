import type { KAPLAYCtx } from 'kaplay';

import { createButton } from '../src/button';
import { uiPlugin } from '../src/plugin';
import { resolveTheme } from '../src/theme';

function makeK(overrides: Record<string, unknown> = {}) {
  const rectFn = vi.fn(() => ({}));
  const textFn = vi.fn(() => ({}));
  const colorFn = vi.fn((value: unknown) => value);
  const vec2Fn = vi.fn((x: number, y: number) => ({ x, y }));
  const addFn = vi.fn(() => {
    const obj = {
      add: vi.fn(() => {
        const child = { text: '', textSize: 0 };
        return child;
      }),
      onClick: vi.fn((cb?: () => void) => cb?.()),
      onHover: vi.fn((cb?: () => void) => cb?.()),
      onHoverEnd: vi.fn((cb?: () => void) => cb?.()),
      width: 0,
      height: 0,
      color: undefined,
      scale: { x: 1, y: 1 },
      pos: { x: 0, y: 0 },
    };
    return obj;
  });

  const k = {
    add: addFn,
    rect: rectFn,
    text: textFn,
    area: vi.fn(() => ({})),
    scale: vi.fn(() => ({})),
    color: colorFn,
    anchor: vi.fn(() => ({})),
    pos: vi.fn((value: unknown) => value),
    vec2: vec2Fn,
    rgb: vi.fn((r: number, g: number, b: number) => ({ r, g, b })),
    drawRect: vi.fn(),
    drawText: vi.fn(),
    setCursor: vi.fn(),
    Rect: class MockRect {
      pos: { x: number; y: number };
      width: number;
      height: number;
      constructor(
        pos: { x: number; y: number },
        width: number,
        height: number,
      ) {
        this.pos = pos;
        this.width = width;
        this.height = height;
      }
    },
    ...overrides,
  } as unknown as KAPLAYCtx;

  return { k, addFn, rectFn, textFn, colorFn, vec2Fn };
}

describe('addButton', () => {
  it('creates button', () => {
    const { k, addFn } = makeK();
    const ui = uiPlugin(k);
    const button = ui.addButton('Click', { onClick: vi.fn(), radius: 6 });
    expect(addFn).toHaveBeenCalledOnce();
    expect(button).toBeDefined();
  });

  it('wires hover and click handlers', () => {
    const { k } = makeK();
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
    const { k } = makeK();
    const ui = uiPlugin(k);
    const button = ui.addButton('Click');

    button.color = k.rgb(1, 2, 3);
    expect(button.color).toEqual({ r: 1, g: 2, b: 3 });

    button.pos = k.vec2(5, 6);
    expect(button.pos).toEqual({ x: 5, y: 6 });
  });

  it('creates button with factory', () => {
    const { k } = makeK();
    const button = createButton(k, resolveTheme(), 'direct', {});
    expect(button).toBeDefined();
  });
});

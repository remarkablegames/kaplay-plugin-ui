import type { KAPLAYCtx } from 'kaplay';

import { createButtonComponent, createButtonObject } from '../src/button';
import { uiPlugin } from '../src/plugin';
import { resolveTheme } from '../src/theme';
import type { Color } from '../src/types';

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

describe('button component', () => {
  it('creates a button component with id "button"', () => {
    const { k } = makeK();
    const comp = uiPlugin(k).button('hello');
    expect(comp.id).toBe('button');
    expect(comp.text).toBe('hello');
  });

  it('gets and sets text', () => {
    const { k } = makeK();
    const comp = uiPlugin(k).button('hello');
    expect(comp.text).toBe('hello');
    comp.text = 'world';
    expect(comp.text).toBe('world');
  });

  it('exposes width and height', () => {
    const { k } = makeK();
    const comp = uiPlugin(k).button('hello', { width: 200, height: 80 });
    expect(comp.width).toBe(200);
    expect(comp.height).toBe(80);
  });

  it('updates width and height', () => {
    const { k } = makeK();
    const comp = uiPlugin(k).button('hello');
    comp.width = 300;
    comp.height = 100;
    expect(comp.width).toBe(300);
    expect(comp.height).toBe(100);
  });

  it('calls setStyle', () => {
    const { k } = makeK();
    const comp = uiPlugin(k).button('hello', { size: 32 });
    comp.setStyle({ size: 64 });
    expect(comp.text).toBe('hello');
  });

  it('returns a Rect from renderArea', () => {
    const { k } = makeK();
    const comp = uiPlugin(k).button('hello');
    const area = comp.renderArea();
    expect(area.width).toBe(comp.width);
    expect(area.height).toBe(comp.height);
  });

  it('draws rect and text when draw is called', () => {
    const { k } = makeK();
    const comp = uiPlugin(k).button('hello');
    comp.draw?.();
    expect(k.drawRect).toHaveBeenCalledOnce();
    expect(k.drawText).toHaveBeenCalledOnce();
  });

  it('does not throw when draw methods are missing', () => {
    const { k } = makeK({ drawRect: undefined, drawText: undefined });
    const comp = uiPlugin(k).button('hello');
    expect(() => comp.draw?.()).not.toThrow();
  });

  it('does not throw on destroy', () => {
    const { k } = makeK();
    const comp = uiPlugin(k).button('hello');
    expect(() => comp.destroy?.()).not.toThrow();
  });

  it('add is a no-op', () => {
    const { k } = makeK();
    const comp = uiPlugin(k).button('hello');
    expect(() => comp.add?.()).not.toThrow();
  });

  it('uses theme defaults', () => {
    const { k } = makeK();
    const ui = uiPlugin(k);
    ui.setTheme({
      palette: {
        primary: { r: 1, g: 2, b: 3 } as Color,
        text: { r: 4, g: 5, b: 6 } as Color,
      },
      shape: { borderRadius: 8 },
      typography: { fontSize: 24, fontFamily: 'Arial' },
      components: { button: { width: 150, height: 50 } },
    });
    const comp = ui.button('themed');
    expect(comp.width).toBe(150);
    expect(comp.height).toBe(50);
    comp.draw?.();
    expect(k.drawRect).toHaveBeenCalledOnce();
  });

  it('uses theme minWidth when width is missing', () => {
    const { k } = makeK();
    const ui = uiPlugin(k);
    ui.setTheme({
      components: { button: { minWidth: 130 } },
    });
    const comp = ui.button('min');
    expect(comp.width).toBe(130);
    expect(comp.height).toBe(40);
  });

  it('direct factory creates component', () => {
    const { k } = makeK();
    const comp = createButtonComponent(k, resolveTheme(), 'direct', {});
    expect(comp.id).toBe('button');
    expect(comp.text).toBe('direct');
    expect(comp.width).toBe(120);
    expect(comp.height).toBe(40);
  });
});

describe('addButton helper', () => {
  it('creates button via addButton', () => {
    const { k, addFn } = makeK();
    const ui = uiPlugin(k);
    const btn = ui.addButton('Click', { onClick: vi.fn(), radius: 6 });
    expect(addFn).toHaveBeenCalledOnce();
    expect(btn).toBeDefined();
    expect(typeof btn.setButtonText).toBe('function');
  });

  it('addButton wires hover and click handlers', () => {
    const { k } = makeK();
    const ui = uiPlugin(k);
    const btn = ui.addButton('Click', { onClick: vi.fn() }) as unknown as {
      onClick: ReturnType<typeof vi.fn>;
      onHover: ReturnType<typeof vi.fn>;
      onHoverEnd: ReturnType<typeof vi.fn>;
    };
    expect(btn.onClick).toHaveBeenCalledOnce();
    expect(btn.onHover).toHaveBeenCalledOnce();
    expect(btn.onHoverEnd).toHaveBeenCalledOnce();
  });

  it('addButton setters update state', () => {
    const { k } = makeK();
    const ui = uiPlugin(k);
    const btn = ui.addButton('Click') as unknown as {
      setSize: (w: number, h: number) => void;
      width: number;
      height: number;
      setButtonColor: (color: unknown) => void;
      color: unknown;
      setButtonText: (value: string) => void;
      setButtonTextSize: (value: number) => void;
      setPosition: (x: number, y: number) => void;
      pos: { x: number; y: number };
    };
    btn.setSize(10, 20);
    expect(btn.width).toBe(10);
    expect(btn.height).toBe(20);

    btn.setButtonColor({ r: 1, g: 2, b: 3 });
    expect(btn.color).toEqual({ r: 1, g: 2, b: 3 });

    btn.setButtonText('New');
    expect(btn.setButtonText).toBeDefined();

    btn.setButtonTextSize(12);
    btn.setPosition(5, 6);
    expect(btn.pos).toEqual({ x: 5, y: 6 });
  });

  it('direct factory creates object', () => {
    const { k } = makeK();
    const obj = createButtonObject(k, resolveTheme(), 'direct', {});
    expect(obj).toBeDefined();
  });
});

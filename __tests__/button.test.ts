import type { KAPLAYCtx } from 'kaplay';

import { createButton } from '../src/button';
import { uiPlugin } from '../src/plugin';
import { resolveTheme } from '../src/theme';

const createMock = (textWidth = 60, textHeight = 20) => {
  const text = { width: textWidth, height: textHeight };

  const button = {
    width: 0,
    height: 0,
    add: vi.fn(() => text),
    onClick: vi.fn((cb?: () => void) => cb?.()),
    onHover: vi.fn((cb?: () => void) => cb?.()),
    onHoverEnd: vi.fn((cb?: () => void) => cb?.()),
    onUpdate: vi.fn((cb?: () => void) => cb),
  };

  const k = {
    add: vi.fn(() => button),
    anchor: vi.fn(() => ({})),
    color: vi.fn((value: unknown) => value),
    area: vi.fn(() => ({})),
    rgb: vi.fn((r: number, g: number, b: number) => ({ r, g, b })),
    vec2: vi.fn((x: number, y: number) => ({ x, y })),
    rect: vi.fn(() => ({})),
    pos: vi.fn((value: unknown) => value),
    scale: vi.fn(() => ({})),
    text: vi.fn(() => text),
    setCursor: vi.fn(),
  } as unknown as KAPLAYCtx;

  return { button, k, text };
};

describe('addButton', () => {
  it('creates button', () => {
    const { k } = createMock();
    const ui = uiPlugin(k);
    const button = ui.addButton('Click', { onClick: vi.fn(), radius: 6 });
    expect(k.add).toHaveBeenCalledOnce();
    expect(button).toBeDefined();
  });

  it('wires hover and click handlers', () => {
    const { k, button } = createMock();
    uiPlugin(k).addButton('Click', { onClick: vi.fn() });
    expect(button.onClick).toHaveBeenCalledOnce();
    expect(button.onHover).toHaveBeenCalledOnce();
    expect(button.onHoverEnd).toHaveBeenCalledOnce();
  });

  it('updates state', () => {
    const { k } = createMock();
    const ui = uiPlugin(k);
    const button = ui.addButton('Click');

    button.color = k.rgb(1, 2, 3);
    expect(button.color).toEqual({ r: 1, g: 2, b: 3 });

    button.pos = k.vec2(5, 6);
    expect(button.pos).toEqual({ x: 5, y: 6 });
  });

  it('sizes button to its label with padding and minWidth', () => {
    const { k, button } = createMock(30, 10);
    uiPlugin(k).addButton('Click');
    expect(button.width).toBe(120);
    expect(button.height).toBe(26);
  });

  it('sizes button to a wide label', () => {
    const { k, button } = createMock(150, 30);
    uiPlugin(k).addButton('Click');
    expect(button.width).toBe(174);
    expect(button.height).toBe(46);
  });

  it('uses explicit dimensions', () => {
    const { k, button } = createMock(150, 30);
    const width = 200;
    const height = 50;
    uiPlugin(k).addButton('Click', { width, height });
    expect(button).toMatchObject({ width, height });
    expect(button.onUpdate).not.toHaveBeenCalled();
  });

  it('auto-sizes only the omitted dimension', () => {
    const { k, button } = createMock(150, 30);
    const width = 200;
    uiPlugin(k).addButton('Click', { width });
    expect(button).toMatchObject({ width, height: 46 });
    expect(button.onUpdate).toHaveBeenCalledOnce();
  });

  it('resizes when label dimensions change', () => {
    const { k, button, text } = createMock(30, 10);
    uiPlugin(k).addButton('Click');
    expect(button).toMatchObject({ width: 120, height: 26 });

    const resize = button.onUpdate.mock.calls[0]?.[0];
    resize?.();
    expect(button).toMatchObject({ width: 120, height: 26 });

    text.width = 150;
    text.height = 30;
    resize?.();
    expect(button).toMatchObject({ width: 174, height: 46 });
  });

  it('creates button with factory', () => {
    const { k } = createMock();
    const button = createButton(k, resolveTheme(), 'direct', {});
    expect(button).toBeDefined();
  });
});

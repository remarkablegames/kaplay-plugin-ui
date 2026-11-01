import type { GameObj, KAPLAYCtx } from 'kaplay';

import { createButton } from '../src/button';
import { uiPlugin } from '../src/plugin';
import { resolveTheme } from '../src/theme';

const createMock = ({
  textWidth = 60,
  textHeight = 20,
  spriteWidth = 20,
  spriteHeight = 20,
} = {}) => {
  const text = {
    width: textWidth,
    height: textHeight,
    pos: { x: 0, y: 0 },
  };

  const sprites: {
    width: number;
    height: number;
    pos: { x: number; y: number };
    sprite: string;
  }[] = [];

  const button = {
    width: 0,
    height: 0,
    add: vi.fn((components: unknown[]) =>
      components[0] === text ? text : components[0],
    ),
    onClick: vi.fn((cb?: () => void) => cb),
    onHover: vi.fn((cb?: () => void) => cb),
    onHoverEnd: vi.fn((cb?: () => void) => cb),
    onUpdate: vi.fn((cb?: () => void) => cb),
  };

  const rect = vi.fn(() => ({}));

  const k = {
    add: vi.fn(() => button),
    anchor: vi.fn(() => ({})),
    color: vi.fn((value: unknown) => value),
    area: vi.fn(() => ({})),
    rgb: vi.fn((hex: string) => hex),
    vec2: vi.fn((x: number, y: number) => ({ x, y })),
    rect,
    pos: vi.fn((value?: unknown) => value),
    scale: vi.fn(() => ({})),
    sprite: vi.fn((source: string) => {
      const sprite = {
        width: spriteWidth,
        height: spriteHeight,
        pos: { x: 0, y: 0 },
        sprite: source,
      };
      sprites.push(sprite);
      return sprite;
    }),
    text: vi.fn(() => text),
    setCursor: vi.fn(),
  } as unknown as KAPLAYCtx;

  return { button, k, rect, sprites, text };
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

    button.pos = k.vec2(5, 6);
    expect(button.pos).toEqual({ x: 5, y: 6 });
  });

  it('resets hover state on a text-only button', () => {
    const { k, button: mockButton } = createMock();
    const button = uiPlugin(k).addButton('Click', { width: 200, height: 50 });

    const hover = mockButton.onHover.mock.calls[0]?.[0];
    hover?.();
    expect(k.setCursor).toHaveBeenLastCalledWith('pointer');

    const hoverEnd = mockButton.onHoverEnd.mock.calls[0]?.[0];
    hoverEnd?.();

    expect(button.color).toEqual('#4f8cff');
    expect(k.setCursor).toHaveBeenLastCalledWith('default');
    expect(mockButton.onUpdate).not.toHaveBeenCalled();
  });

  it('sizes button to its label with padding and minWidth', () => {
    const { k, button } = createMock({ textWidth: 30, textHeight: 10 });
    uiPlugin(k).addButton('Click');
    expect(button.width).toBe(120);
    expect(button.height).toBe(26);
  });

  it('sizes button to a wide label', () => {
    const { k, button } = createMock({ textWidth: 150, textHeight: 30 });
    uiPlugin(k).addButton('Click');
    expect(button.width).toBe(174);
    expect(button.height).toBe(46);
  });

  it('sizes button to an image and label', () => {
    const { k, button } = createMock({
      textWidth: 50,
      textHeight: 18,
      spriteWidth: 100,
      spriteHeight: 20,
    });
    const result = uiPlugin(k).addButton('Click', { icon: 'icon' });
    expect(button).toMatchObject({ width: 182, height: 36 });
    expect(result.icon?.pos).toEqual({ x: -29, y: 0 });
    expect(result.label.pos).toEqual({ x: 54, y: 0 });
  });

  it('sizes an image-only button without a gap', () => {
    const { k, button } = createMock({
      textWidth: 0,
      textHeight: 0,
      spriteWidth: 150,
      spriteHeight: 40,
    });
    uiPlugin(k).addButton('', { icon: 'icon' });
    expect(button).toMatchObject({ width: 174, height: 56 });
  });

  it('renders an image-only button without a background', () => {
    const { k, rect } = createMock({
      textWidth: 0,
      textHeight: 0,
      spriteWidth: 150,
      spriteHeight: 40,
    });
    uiPlugin(k).addButton('', { icon: 'icon' });
    expect(rect).toHaveBeenCalledWith(0, 0, { fill: false });
  });

  it('keeps the background for buttons with text and an icon', () => {
    const { k, rect } = createMock({
      textWidth: 50,
      textHeight: 18,
      spriteWidth: 100,
      spriteHeight: 20,
    });
    uiPlugin(k).addButton('Click', { icon: 'icon', radius: 6 });
    expect(rect).toHaveBeenCalledWith(0, 0, { radius: 6 });
  });

  it('centers the label over a background image', () => {
    const { k, button, rect } = createMock({
      textWidth: 50,
      textHeight: 18,
      spriteWidth: 100,
      spriteHeight: 50,
    });

    const result = uiPlugin(k).addButton('Click', {
      background: 'panel',
    });

    expect(rect).toHaveBeenCalledWith(0, 0, { fill: false });
    expect(button).toMatchObject({ width: 100, height: 50 });
    expect(result.background).toMatchObject({ width: 100, height: 50 });
    expect(result.label.pos).toEqual({ x: 0, y: 0 });
  });

  it('expands a background button to fit its label', () => {
    const { k, button } = createMock({
      textWidth: 100,
      textHeight: 18,
      spriteWidth: 50,
      spriteHeight: 20,
    });

    const result = uiPlugin(k).addButton('Click', {
      background: 'panel',
    });

    expect(button).toMatchObject({ width: 124, height: 34 });
    expect(result.background).toMatchObject({ width: 124, height: 34 });
    expect(result.label.pos).toEqual({ x: 0, y: 0 });
  });

  it('sizes a background-only button to the image', () => {
    const { k, button } = createMock({
      textWidth: 0,
      textHeight: 0,
      spriteWidth: 150,
      spriteHeight: 40,
    });
    uiPlugin(k).addButton('', { background: 'panel' });

    expect(button).toMatchObject({ width: 150, height: 40 });
  });

  it('resizes when a background image loads', () => {
    const { k, button } = createMock({
      textWidth: 0,
      textHeight: 0,
      spriteWidth: 0,
      spriteHeight: 0,
    });

    const result = uiPlugin(k).addButton('', { background: 'panel' });
    expect(button).toMatchObject({ width: 24, height: 16 });

    const layout = button.onUpdate.mock.calls[0]?.[0];
    layout?.();
    layout?.();
    expect(button).toMatchObject({ width: 24, height: 16 });

    if (result.background) {
      result.background.width = 150;
      result.background.height = 40;
    }

    layout?.();

    expect(button).toMatchObject({ width: 150, height: 40 });
  });

  it('swaps background images on hover, click, and hover end', () => {
    const { k, button: mockButton } = createMock({
      textWidth: 50,
      textHeight: 18,
      spriteWidth: 100,
      spriteHeight: 50,
    });

    const button = uiPlugin(k).addButton('Click', {
      background: 'base',
      hoverBackground: 'hover',
      pressedBackground: 'pressed',
    });

    expect(button.background?.sprite).toBe('base');

    const hover = mockButton.onHover.mock.calls[0]?.[0];
    hover?.();
    expect(button.background?.sprite).toBe('hover');

    const click = mockButton.onClick.mock.calls[0]?.[0];
    click?.();
    expect(button.background?.sprite).toBe('pressed');

    const hoverEnd = mockButton.onHoverEnd.mock.calls[0]?.[0];
    hoverEnd?.();
    expect(button.background?.sprite).toBe('base');
  });

  it('uses explicit dimensions', () => {
    const { k, button } = createMock({ textWidth: 150, textHeight: 30 });
    const width = 200;
    const height = 50;
    uiPlugin(k).addButton('Click', { width, height });
    expect(button).toMatchObject({ width, height });
    expect(button.onUpdate).not.toHaveBeenCalled();
  });

  it('keeps explicit dimensions with an image', () => {
    const { k, button } = createMock({
      textWidth: 50,
      textHeight: 18,
      spriteWidth: 100,
      spriteHeight: 20,
    });

    uiPlugin(k).addButton('Click', {
      icon: 'icon',
      width: 300,
      height: 60,
    });

    expect(button).toMatchObject({ width: 300, height: 60 });
    expect(button.onUpdate).toHaveBeenCalledOnce();
  });

  it('auto-sizes only the omitted dimension', () => {
    const { k, button } = createMock({ textWidth: 150, textHeight: 30 });
    const width = 200;
    uiPlugin(k).addButton('Click', { width });
    expect(button).toMatchObject({ width, height: 46 });
    expect(button.onUpdate).toHaveBeenCalledOnce();
  });

  it('resizes when label dimensions change', () => {
    const { k, button, text } = createMock({ textWidth: 30, textHeight: 10 });
    uiPlugin(k).addButton('Click');
    expect(button).toMatchObject({ width: 120, height: 26 });

    const layout = button.onUpdate.mock.calls[0]?.[0];
    layout?.();
    expect(button).toMatchObject({ width: 120, height: 26 });

    text.width = 150;
    text.height = 30;
    layout?.();
    expect(button).toMatchObject({ width: 174, height: 46 });
  });

  it('resizes when an image loads', () => {
    const { k, button, sprites } = createMock({
      textWidth: 0,
      textHeight: 0,
      spriteWidth: 0,
      spriteHeight: 0,
    });

    uiPlugin(k).addButton('', { icon: 'icon' });
    expect(button).toMatchObject({ width: 120, height: 16 });

    const layout = button.onUpdate.mock.calls[0]?.[0];
    const icon = sprites[0];
    icon.width = 150;
    icon.height = 30;

    layout?.();
    expect(button).toMatchObject({ width: 174, height: 46 });
  });

  it('swaps image sprites on hover, click, and hover end', () => {
    const { k, button: mockButton } = createMock({
      textWidth: 50,
      textHeight: 18,
      spriteWidth: 100,
      spriteHeight: 20,
    });

    const button = uiPlugin(k).addButton('Click', {
      icon: 'base',
      hoverIcon: 'hover',
      pressedIcon: 'pressed',
    });

    expect(button.icon?.sprite).toBe('base');

    const hover = mockButton.onHover.mock.calls[0]?.[0];
    hover?.();
    expect(button.icon?.sprite).toBe('hover');

    const click = mockButton.onClick.mock.calls[0]?.[0];
    click?.();
    expect(button.icon?.sprite).toBe('pressed');

    const hoverEnd = mockButton.onHoverEnd.mock.calls[0]?.[0];
    hoverEnd?.();
    expect(button.icon?.sprite).toBe('base');
  });

  it('keeps layout based on the base image while hovering', () => {
    const {
      k,
      button: mockButton,
      sprites,
    } = createMock({
      textWidth: 50,
      textHeight: 18,
      spriteWidth: 100,
      spriteHeight: 20,
    });

    const button = uiPlugin(k).addButton('Click', {
      icon: 'base',
      hoverIcon: 'hover',
    });

    expect(button).toMatchObject({ width: 182, height: 36 });

    const icon = sprites[0];
    icon.width = 300;
    icon.height = 100;

    const hover = mockButton.onHover.mock.calls[0]?.[0];
    hover?.();

    const layout = mockButton.onUpdate.mock.calls[0]?.[0];
    layout?.();

    expect(button).toMatchObject({ width: 182, height: 36 });
  });

  it('adds the button to a parent', () => {
    const { k, button } = createMock();
    const parent = {
      add: vi.fn(() => button),
    } as unknown as GameObj;

    const result = uiPlugin(k).addButton('Click', { parent });

    expect(parent.add).toHaveBeenCalledOnce();
    expect(k.add).not.toHaveBeenCalled();
    expect(result).toBe(button);
  });

  it('creates button with factory', () => {
    const { k } = createMock();
    const button = createButton(k, resolveTheme(), 'direct', {});
    expect(button).toBeDefined();
  });
});

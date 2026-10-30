import type { Comp, GameObj, KAPLAYCtx, Vec2 } from 'kaplay';

import type { ButtonComp, ButtonCompOpt, Color, Theme } from './types';

export function createButtonComponent(
  k: KAPLAYCtx,
  theme: Theme,
  text: string,
  opt: ButtonCompOpt,
): ButtonComp {
  let currentText = text;
  let currentOpt: ButtonCompOpt = { ...opt };

  const readWidth = (): number => {
    return currentOpt.width ?? theme.components.button.width;
  };

  const readHeight = (): number => {
    return currentOpt.height ?? theme.components.button.height;
  };

  const comp: ButtonComp = {
    id: 'button',
    get text() {
      return currentText;
    },
    set text(value: string) {
      currentText = value;
    },
    get width() {
      return readWidth();
    },
    set width(value: number) {
      currentOpt.width = value;
    },
    get height() {
      return readHeight();
    },
    set height(value: number) {
      currentOpt.height = value;
    },
    renderArea() {
      return new k.Rect(k.vec2(), comp.width, comp.height);
    },
    setStyle(next: Partial<ButtonCompOpt>): void {
      currentOpt = { ...currentOpt, ...next };
    },
    add(): void {
      // No-op: rendering is handled in draw().
    },
    draw(): void {
      const width = comp.width;
      const height = comp.height;
      const radius = currentOpt.radius ?? theme.shape.borderRadius;
      const fill = currentOpt.fill ?? theme.palette.primary;
      const textColor = currentOpt.textColor ?? theme.palette.text;
      const size = currentOpt.size ?? theme.typography.fontSize;
      const font = currentOpt.font ?? theme.typography.fontFamily;

      const drawRect = k.drawRect as unknown as
        ((opt: Record<string, unknown>) => void) | undefined;
      drawRect?.({
        pos: k.vec2(),
        width,
        height,
        color: fill,
        radius,
      });

      const drawText = k.drawText as unknown as
        ((opt: Record<string, unknown>) => void) | undefined;
      drawText?.({
        text: currentText,
        pos: k.vec2(width / 2, height / 2),
        size,
        font,
        color: textColor,
        anchor: 'center',
      });
    },
    destroy(): void {
      // No resources to release.
    },
  };

  return comp;
}

export function createButtonObject(
  k: KAPLAYCtx,
  theme: Theme,
  text: string,
  opt: ButtonCompOpt & {
    pos?: Vec2;
    onClick?: () => void;
    color?: Color;
    hoverColor?: Color;
    pressedColor?: Color;
    textColor?: Color;
  },
): GameObj {
  const width = opt.width ?? theme.components.button.width;
  const height = opt.height ?? theme.components.button.height;
  const radius = opt.radius ?? theme.shape.borderRadius;
  const baseColor = opt.color ?? opt.fill ?? theme.palette.primary;
  const hoverColor = opt.hoverColor ?? theme.palette.hover;
  const pressedColor = opt.pressedColor ?? theme.palette.pressed;
  const textColor = opt.textColor ?? theme.palette.text;
  const size = opt.size ?? theme.typography.fontSize;
  const font = opt.font ?? theme.typography.fontFamily;
  const pos = opt.pos ?? k.vec2();

  interface ButtonGameObj {
    add: (comps: Comp[]) => { text: string; textSize: number };
    onClick: (cb: () => void) => void;
    onHover: (cb: () => void) => void;
    onHoverEnd: (cb: () => void) => void;
    width: number;
    height: number;
    color: unknown;
    scale: { x: number; y: number };
    pos: { x: number; y: number };
    setSize: (w: number, h: number) => void;
    setButtonColor: (color: Color) => void;
    setButtonText: (value: string) => void;
    setButtonTextSize: (value: number) => void;
    setPosition: (x: number, y: number) => void;
  }

  const obj = k.add([
    k.rect(width, height, radius > 0 ? { radius } : undefined),
    k.pos(pos as never),
    k.area(),
    k.color(baseColor as never),
    k.anchor('center'),
  ]) as unknown as ButtonGameObj;

  const label = obj.add([
    k.text(text, { size, font }),
    k.color(textColor as never),
    k.anchor('center'),
  ]) as GameObj & { text: string; textSize: number };

  let currentText = text;
  let currentColor: Color = baseColor;

  obj.onClick(() => {
    obj.color = pressedColor;
    opt.onClick?.();
  });
  obj.onHover(() => {
    obj.color = hoverColor;
    obj.scale = k.vec2(1.05, 1.05);
    k.setCursor('pointer');
  });
  obj.onHoverEnd(() => {
    obj.color = currentColor;
    obj.scale = k.vec2(1, 1);
    k.setCursor('default');
  });

  obj.setSize = (w: number, h: number): void => {
    obj.width = w;
    obj.height = h;
  };

  obj.setButtonColor = (color: Color): void => {
    currentColor = color;
    obj.color = color;
  };

  obj.setButtonText = (value: string): void => {
    currentText = value;
    label.text = value;
  };

  obj.setButtonTextSize = (value: number): void => {
    label.textSize = value;
  };

  obj.setPosition = (x: number, y: number): void => {
    obj.pos = k.vec2(x, y);
  };

  label.text = currentText;

  return obj as unknown as GameObj;
}

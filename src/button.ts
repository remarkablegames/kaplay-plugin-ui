import type { Color, KAPLAYCtx, Vec2 } from 'kaplay';

import type { ButtonOpt, Theme } from './types';
import { toColor } from './utils';

export function createButton(
  k: KAPLAYCtx,
  theme: Theme,
  text: string,
  opt: ButtonOpt & {
    pos?: Vec2;
    onClick?: () => void;
    color?: string | Color;
    hoverColor?: string | Color;
    pressedColor?: string | Color;
    textColor?: string | Color;
  },
) {
  const radius = opt.radius ?? theme.shape.borderRadius;
  const { minWidth, paddingX, paddingY } = theme.components.button;
  const baseColor = toColor(k, opt.color ?? opt.fill ?? theme.palette.primary);
  const hoverColor = toColor(k, opt.hoverColor ?? theme.palette.hover);
  const pressedColor = toColor(k, opt.pressedColor ?? theme.palette.pressed);
  const textColor = toColor(k, opt.textColor ?? theme.palette.text);
  const size = opt.size ?? theme.typography.fontSize;
  const font = opt.font ?? theme.typography.fontFamily;
  const pos = opt.pos ?? k.vec2();

  const textComp = k.text(text, { size, font });
  const width = opt.width ?? Math.max(textComp.width + paddingX * 2, minWidth);
  const height = opt.height ?? textComp.height + paddingY * 2;

  const button = k.add([
    k.rect(width, height, radius > 0 ? { radius } : undefined),
    k.pos(pos),
    k.area(),
    k.scale(),
    k.color(baseColor),
    k.anchor('center'),
  ]);

  const label = button.add([
    textComp,
    k.color(textColor as never),
    k.anchor('center'),
  ]);

  function resize() {
    const nextWidth =
      opt.width ?? Math.max(label.width + paddingX * 2, minWidth);
    const nextHeight = opt.height ?? label.height + paddingY * 2;

    if (button.width !== nextWidth) {
      button.width = nextWidth;
    }

    if (button.height !== nextHeight) {
      button.height = nextHeight;
    }
  }

  resize();

  if (opt.width === undefined || opt.height === undefined) {
    button.onUpdate(resize);
  }

  button.onClick(() => {
    button.color = toColor(k, pressedColor);
    opt.onClick?.();
  });

  button.onHover(() => {
    button.color = toColor(k, hoverColor);
    button.scale = k.vec2(1.05, 1.05);
    k.setCursor('pointer');
  });

  button.onHoverEnd(() => {
    button.color = baseColor;
    button.scale = k.vec2(1, 1);
    k.setCursor('default');
  });

  return {
    ...button,
    label,
  };
}

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
  const width = opt.width ?? theme.components.button.width;
  const height = opt.height ?? theme.components.button.height;
  const radius = opt.radius ?? theme.shape.borderRadius;
  const baseColor = toColor(k, opt.color ?? opt.fill ?? theme.palette.primary);
  const hoverColor = toColor(k, opt.hoverColor ?? theme.palette.hover);
  const pressedColor = toColor(k, opt.pressedColor ?? theme.palette.pressed);
  const textColor = toColor(k, opt.textColor ?? theme.palette.text);
  const size = opt.size ?? theme.typography.fontSize;
  const font = opt.font ?? theme.typography.fontFamily;
  const pos = opt.pos ?? k.vec2();

  const button = k.add([
    k.rect(width, height, radius > 0 ? { radius } : undefined),
    k.pos(pos),
    k.area(),
    k.scale(),
    k.color(baseColor),
    k.anchor('center'),
  ]);

  const label = button.add([
    k.text(text, { size, font }),
    k.color(textColor as never),
    k.anchor('center'),
  ]);

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

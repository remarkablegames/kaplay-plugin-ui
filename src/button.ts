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
  let disabled = opt.disabled ?? false;
  const hoverColor = toColor(k, opt.hoverColor ?? theme.palette.hover);
  const pressedColor = toColor(k, opt.pressedColor ?? theme.palette.pressed);
  const textColor = toColor(k, opt.textColor ?? theme.palette.text);
  const size = opt.size ?? theme.typography.fontSize;
  const font = opt.font ?? theme.typography.fontFamily;
  const pos = opt.pos ?? k.vec2();

  const textComp = k.text(text, { size, font });
  const isIconOnly = opt.icon !== undefined && !text.length;
  const hasBackground = opt.background !== undefined;
  const showFill = !hasBackground && !isIconOnly;
  const rectOpt = showFill
    ? radius > 0
      ? { radius }
      : undefined
    : { fill: false };

  const components = [
    k.rect(0, 0, rectOpt),
    k.pos(pos),
    k.area(),
    k.scale(),
    k.color(disabled ? toColor(k, theme.palette.disabled) : baseColor),
    k.anchor('center'),
  ];
  const button = opt.parent ? opt.parent.add(components) : k.add(components);

  const background = opt.background
    ? button.add([k.sprite(opt.background), k.pos(), k.anchor('center')])
    : undefined;

  const icon = opt.icon
    ? button.add([k.sprite(opt.icon), k.pos(), k.anchor('center')])
    : undefined;

  const label = button.add([
    textComp,
    k.color(textColor as never),
    k.pos(),
    k.anchor('center'),
  ]);

  let iconWidth = 0;
  let iconHeight = 0;
  let iconState: 'base' | 'hover' | 'pressed' = 'base';
  let backgroundWidth = 0;
  let backgroundHeight = 0;
  let backgroundMeasured = false;
  let backgroundState: 'base' | 'hover' | 'pressed' = 'base';

  /**
   * Update button layout:
   *
   * - caches the base icon/background dimensions,
   * - calculates content width/height,
   * - updates `button.width` / `button.height`,
   * - stretches the background and repositions the icon and label.
   */
  function layout() {
    if (icon && iconState === 'base') {
      iconWidth = icon.width;
      iconHeight = icon.height;
    }

    if (
      background &&
      backgroundState === 'base' &&
      !backgroundMeasured &&
      (background.width > 0 || background.height > 0)
    ) {
      backgroundWidth = background.width;
      backgroundHeight = background.height;
      backgroundMeasured = true;
    }

    const gap = icon && iconWidth > 0 && label.width > 0 ? theme.spacing : 0;
    const contentWidth = iconWidth + gap + label.width;
    const contentHeight = Math.max(iconHeight, label.height);
    const contentBoxWidth = contentWidth + paddingX * 2;
    const contentBoxHeight = contentHeight + paddingY * 2;

    const nextWidth =
      opt.width ??
      (background
        ? Math.max(contentBoxWidth, backgroundWidth)
        : Math.max(contentBoxWidth, minWidth));
    const nextHeight =
      opt.height ??
      (background
        ? Math.max(contentBoxHeight, backgroundHeight)
        : contentBoxHeight);

    if (button.width !== nextWidth) {
      button.width = nextWidth;
    }

    if (button.height !== nextHeight) {
      button.height = nextHeight;
    }

    if (background && backgroundMeasured) {
      background.width = nextWidth;
      background.height = nextHeight;
      background.pos = k.vec2();
    }

    if (icon) {
      icon.pos = k.vec2(-contentWidth / 2 + iconWidth / 2, 0);
    }

    label.pos = k.vec2(
      -contentWidth / 2 + iconWidth + gap + label.width / 2,
      0,
    );
  }

  layout();

  if (
    opt.width === undefined ||
    opt.height === undefined ||
    opt.icon !== undefined ||
    opt.background !== undefined
  ) {
    button.onUpdate(layout);
  }

  button.onClick(() => {
    if (disabled) {
      return;
    }

    // prevent stray click from click-through
    k.wait(0, () => {
      button.color = toColor(k, pressedColor);

      if (icon && opt.pressedIcon) {
        iconState = 'pressed';
        icon.sprite = opt.pressedIcon as string;
      }

      if (background && opt.pressedBackground) {
        backgroundState = 'pressed';
        background.sprite = opt.pressedBackground as string;
      }

      opt.onClick?.();
    });
  });

  button.onHover(() => {
    if (disabled) {
      k.setCursor('not-allowed');
      return;
    } else {
      k.setCursor('pointer');
    }

    button.color = toColor(k, hoverColor);
    button.scale = k.vec2(1.05, 1.05);

    if (icon && opt.hoverIcon) {
      iconState = 'hover';
      icon.sprite = opt.hoverIcon as string;
    }

    if (background && opt.hoverBackground) {
      backgroundState = 'hover';
      background.sprite = opt.hoverBackground as string;
    }
  });

  button.onHoverEnd(() => {
    k.setCursor('default');

    if (disabled) {
      return;
    }

    button.color = baseColor;
    button.scale = k.vec2(1, 1);

    if (icon && opt.icon) {
      iconState = 'base';
      icon.sprite = opt.icon as string;
    }

    if (background && opt.background) {
      backgroundState = 'base';
      background.sprite = opt.background as string;
    }

    if (icon || background) {
      layout();
    }
  });

  function applyDisabledState() {
    button.color = disabled ? toColor(k, theme.palette.disabled) : baseColor;
  }

  applyDisabledState();

  const assignedButton = Object.assign(button, {
    background,
    icon,
    label,
  });

  const definedButton = Object.defineProperty(assignedButton, 'disabled', {
    get() {
      return disabled;
    },
    set(value: boolean) {
      disabled = value;
      applyDisabledState();
    },
    enumerable: true,
    configurable: true,
  }) as typeof assignedButton & { disabled: boolean };

  return definedButton;
}

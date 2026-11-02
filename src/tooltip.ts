import type {
  AreaComp,
  FixedComp,
  GameObj,
  KAPLAYCtx,
  KEventController,
  PosComp,
  TimerController,
  Vec2,
  ZComp,
} from 'kaplay';

import type { Theme, TooltipOpt, TooltipPlacement } from './types';
import { toColor, uniqueTag } from './utils';

/** Tag applied to tooltip game objects. */
export const TOOLTIP_TAG = uniqueTag('tooltip');

type PositionedGameObj = GameObj<AreaComp | PosComp> & {
  anchor?: string;
  fixed?: boolean;
  height?: number;
  width?: number;
};

/** Horizontal anchor factor used to find the target's center. */
const ANCHOR_CENTER_X: Record<string, number> = {
  botleft: 0.5,
  left: 0.5,
  topleft: 0.5,
  botright: -0.5,
  right: -0.5,
  topright: -0.5,
};

/** Vertical anchor factor used to find the target's center. */
const ANCHOR_CENTER_Y: Record<string, number> = {
  bot: -0.5,
  botleft: -0.5,
  botright: -0.5,
  topleft: 0.5,
  top: 0.5,
  topright: 0.5,
};

/**
 * Get the arrow points for a placement.
 *
 * @param k - The Kaplay context.
 * @param placement - The tooltip placement.
 * @param size - The arrow size.
 * @returns The arrow points.
 */
function getArrowPoints(
  k: KAPLAYCtx,
  placement: TooltipPlacement,
  size: number,
): Vec2[] {
  const half = size / 2;

  switch (placement) {
    case 'bottom':
      return [k.vec2(-half, 0), k.vec2(half, 0), k.vec2(0, -size)];
    case 'left':
      return [k.vec2(0, -half), k.vec2(0, half), k.vec2(size, 0)];
    case 'right':
      return [k.vec2(0, -half), k.vec2(0, half), k.vec2(-size, 0)];
    default:
      return [k.vec2(-half, 0), k.vec2(half, 0), k.vec2(0, size)];
  }
}

export function createTooltip(
  k: KAPLAYCtx,
  theme: Theme,
  text: string,
  opt: TooltipOpt,
) {
  const {
    background: themeBackground,
    delay: themeDelay,
    textColor: themeTextColor,
  } = theme.components.tooltip;
  const { borderRadius } = theme.shape;
  const { fontFamily: font, fontSize: size } = theme.typography;
  const paddingX = theme.spacing;
  const paddingY = theme.spacing / 2;
  const targetObj = opt.target as PositionedGameObj;
  const placement = opt.placement ?? 'top';
  const delay = opt.delay ?? themeDelay;
  const z = opt.z ?? 900;
  const showArrow = opt.arrow ?? true;
  const trigger = opt.trigger ?? 'auto';
  const isClick =
    trigger === 'click' || (trigger === 'auto' && k.isTouchscreen());
  const fixed = targetObj.fixed;
  const backgroundColor = toColor(k, opt.background ?? themeBackground);
  const labelColor = toColor(k, opt.textColor ?? themeTextColor);

  const components: (FixedComp | PosComp | string | ZComp)[] = [
    k.pos(),
    k.z(z),
    TOOLTIP_TAG,
  ];

  if (fixed) {
    components.push(k.fixed());
  }

  const parent = targetObj.parent;
  const tooltip = parent ? parent.add(components) : k.add(components);

  const background = tooltip.add([
    k.rect(0, 0, borderRadius > 0 ? { radius: borderRadius } : undefined),
    k.pos(),
    k.color(backgroundColor),
    k.anchor('center'),
  ]);

  const label = tooltip.add([
    k.text(text, { size, font }),
    k.pos(),
    k.color(labelColor),
    k.anchor('center'),
  ]);

  const arrow = showArrow
    ? tooltip.add([
        k.polygon(getArrowPoints(k, placement, paddingX)),
        k.pos(),
        k.color(backgroundColor),
      ])
    : undefined;

  tooltip.hidden = true;

  let timer: TimerController | undefined;
  let hoverController: KEventController | undefined;
  let hoverEndController: KEventController | undefined;
  let clickController: KEventController | undefined;

  /**
   * Update tooltip layout:
   *
   * - sizes the background to the label,
   * - positions the tooltip relative to the target,
   * - positions the arrow on the side facing the target.
   */
  function layout() {
    const width = label.width + paddingX * 2;
    const height = label.height + paddingY * 2;

    if (background.width !== width) {
      background.width = width;
    }

    if (background.height !== height) {
      background.height = height;
    }

    const {
      anchor = '',
      height: targetHeight = 0,
      width: targetWidth = 0,
    } = targetObj;
    const centerX =
      targetObj.pos.x + (ANCHOR_CENTER_X[anchor] ?? 0) * targetWidth;
    const centerY =
      targetObj.pos.y + (ANCHOR_CENTER_Y[anchor] ?? 0) * targetHeight;
    const horizontal = placement === 'left' || placement === 'right';
    const direction = placement === 'bottom' || placement === 'right' ? 1 : -1;
    const x = horizontal
      ? centerX + direction * (targetWidth / 2 + paddingX + width / 2)
      : centerX;
    const y = horizontal
      ? centerY
      : centerY + direction * (targetHeight / 2 + paddingX + height / 2);

    tooltip.pos = k.vec2(x, y);

    if (arrow) {
      arrow.pos = horizontal
        ? k.vec2(placement === 'left' ? width / 2 : -width / 2, 0)
        : k.vec2(0, placement === 'top' ? height / 2 : -height / 2);
    }
  }

  function hide() {
    timer?.cancel();
    timer = undefined;
    tooltip.hidden = true;
  }

  function show() {
    timer = undefined;
    layout();
    tooltip.hidden = false;
  }

  function toggle() {
    if (tooltip.hidden) {
      show();
    } else {
      hide();
    }
  }

  function showSoon() {
    timer?.cancel();

    if (delay <= 0) {
      show();
      return;
    }

    timer = k.wait(delay / 1000, show);
  }

  const pressController = k.onMousePress(() => {
    if (isClick) {
      if (!tooltip.hidden && !targetObj.isHovering()) {
        hide();
      }
    } else {
      hide();
    }
  });

  if (isClick) {
    clickController = targetObj.onClick(toggle);
  } else {
    hoverController = targetObj.onHover(showSoon);
    hoverEndController = targetObj.onHoverEnd(hide);
  }

  const targetDestroyController = targetObj.onDestroy(() => {
    tooltip.destroy();
  });

  tooltip.onUpdate(() => {
    if (!tooltip.hidden) {
      layout();
    }
  });

  tooltip.onDestroy(() => {
    timer?.cancel();
    hoverController?.cancel();
    hoverEndController?.cancel();
    clickController?.cancel();
    pressController.cancel();
    targetDestroyController.cancel();
  });

  layout();

  return Object.assign(tooltip, { arrow, background, label });
}

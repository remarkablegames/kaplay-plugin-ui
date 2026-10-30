import type { Color, KAPLAYCtx } from 'kaplay';

/**
 * Convert hex string to color or return color.
 *
 * @param k - The Kaplay context.
 * @param color - The hex string or color.
 * @returns The color.
 */
export function toColor(k: KAPLAYCtx, color: string | Color): Color {
  return typeof color === 'string' ? k.rgb(color) : color;
}

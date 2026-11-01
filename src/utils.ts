import type { Color, GameObj, KAPLAYCtx } from 'kaplay';

import { MODAL_TAG } from './modal';

/**
 * Check if the game object is a modal.
 *
 * @param gameObj - The game object.
 * @returns Whether game object is a modal.
 */
export function isModal(gameObj: GameObj): boolean {
  return gameObj.is(MODAL_TAG);
}

/**
 * Convert a hex string or color to color.
 *
 * @param k - The Kaplay context.
 * @param color - The hex string or color.
 * @returns The color.
 */
export function toColor(k: KAPLAYCtx, color: string | Color): Color {
  return typeof color === 'string' ? k.rgb(color) : color;
}

/**
 * Generate a unique tag.
 *
 * @param id - The identifier.
 * @returns The tag.
 */
export function uniqueTag(id: string): string {
  return [
    'kaplay-plugin-ui',
    id,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    crypto?.randomUUID?.(),
  ].join(':');
}

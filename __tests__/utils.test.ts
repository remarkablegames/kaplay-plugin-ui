import type { Color, GameObj, KAPLAYCtx } from 'kaplay';

import { isModal, toColor, uniqueTag } from '../src/utils';

describe('isModal', () => {
  it.each([true, false])('returns %s', (expected) => {
    const gameObj = { is: vi.fn().mockReturnValueOnce(expected) };
    expect(isModal(gameObj as unknown as GameObj)).toBe(expected);
    expect(gameObj.is).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining('kaplay-plugin-ui:modal:'),
    );
  });
});

describe('toColor', () => {
  const makeK = () =>
    ({
      rgb: vi.fn((value: unknown) => value),
    }) as unknown as KAPLAYCtx;

  it('converts hex string to color', () => {
    const k = makeK();
    const hex = '#bada55';
    toColor(k, hex);
    expect(k.rgb).toHaveBeenCalledExactlyOnceWith(hex);
  });

  it('returns color', () => {
    const k = makeK();
    toColor(k, { r: 0, g: 0, b: 0 } as Color);
    expect(k.rgb).not.toHaveBeenCalled();
  });
});

describe('uniqueTag', () => {
  it('generates unique tag', () => {
    const uuid = '00000000-0000-4000-8000-000000000001';
    const spy = vi.spyOn(crypto, 'randomUUID').mockReturnValueOnce(uuid);
    expect(uniqueTag('modal')).toBe(`kaplay-plugin-ui:modal:${uuid}`);
    spy.mockRestore();
  });
});

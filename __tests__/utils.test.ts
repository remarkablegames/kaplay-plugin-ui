import type { Color, KAPLAYCtx } from 'kaplay';

import { toColor } from '../src/utils';

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

import type { GameObj, KAPLAYCtx, TimerController } from 'kaplay';

import { uiPlugin } from '../src/plugin';
import { resolveTheme } from '../src/theme';
import { createTooltip, TOOLTIP_TAG } from '../src/tooltip';
import { asMock, type Comp, makeK, makeTree, type MockObj } from './mocks';

const createMock = () => {
  const timers: {
    action: () => void;
    cancelled: boolean;
    cancel: () => void;
    time: number;
  }[] = [];
  const mousePressHandlers: (() => void)[] = [];
  const isTouchscreen = vi.fn(() => false);

  const tree = makeTree();
  const { root } = tree;

  function addController(list: (() => void)[], cb: () => void) {
    list.push(cb);

    return {
      cancel: () => {
        const index = list.indexOf(cb);

        if (index !== -1) {
          list.splice(index, 1);
        }
      },
    };
  }

  const { k } = makeK(
    {
      add: vi.fn((comps: Comp[]) => tree.attach(root, comps)),
      isTouchscreen,
      onMousePress: (cb: () => void) => addController(mousePressHandlers, cb),
      rgb: (hex: string) => hex,
      wait: vi.fn((time: number, action: () => void) => {
        const timer = {
          action,
          cancel: () => {
            timer.cancelled = true;
          },
          cancelled: false,
          time,
        };
        timers.push(timer);
        return timer as unknown as TimerController;
      }),
    },
    tree,
  );

  const add = k.add;

  return { add, isTouchscreen, k, mousePressHandlers, root, timers };
};

const createTarget = (k: KAPLAYCtx) => {
  const target = asMock(k.add([]));
  target.anchor = 'center';
  target.height = 40;
  target.pos = { x: 100, y: 100 };
  target.width = 100;
  return target as GameObj & MockObj;
};

describe('addTooltip', () => {
  it('creates a hidden tooltip with an arrow above the target', () => {
    const { k } = createMock();
    const target = createTarget(k);
    const tooltip = uiPlugin(k).addTooltip('Hint', { target });

    expect(tooltip.hidden).toBe(true);
    expect(tooltip.parent).toBe(target.parent);
    expect(asMock(tooltip).is(TOOLTIP_TAG)).toBe(true);
    expect(tooltip.z).toBe(900);
    expect(tooltip.background).toMatchObject({ width: 56, height: 26 });
    expect(tooltip.background.color).toBe('#111827');
    expect(asMock(tooltip.background).rectOpts).toBeUndefined();
    expect(tooltip.label).toMatchObject({
      text: 'Hint',
      width: 40,
      height: 18,
    });
    expect(tooltip.label.color).toBe('#ffffff');
    expect(tooltip.pos).toEqual({ x: 100, y: 59 });
    expect(tooltip.arrow?.pos).toEqual({ x: 0, y: 13 });
    expect(tooltip.arrow?.pts).toEqual([
      { x: -4, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 8 },
    ]);
  });

  it('shows after the theme delay and hides on hover end', () => {
    const { k, timers } = createMock();
    const target = createTarget(k);
    const tooltip = uiPlugin(k).addTooltip('Hint', { target });

    target.hoverHandlers[0]?.();

    expect(tooltip.hidden).toBe(true);
    expect(timers).toHaveLength(1);
    expect(timers[0]?.time).toBe(0.3);

    timers[0]?.action();

    expect(tooltip.hidden).toBe(false);

    target.hoverEndHandlers[0]?.();

    expect(tooltip.hidden).toBe(true);
  });

  it('cancels a pending hover timer', () => {
    const { k, timers } = createMock();
    const target = createTarget(k);
    uiPlugin(k).addTooltip('Hint', { target });

    target.hoverHandlers[0]?.();
    const first = timers[0];
    target.hoverHandlers[0]?.();
    const second = timers[1];

    expect(first.cancelled).toBe(true);
    expect(timers).toHaveLength(2);

    target.hoverEndHandlers[0]?.();

    expect(second.cancelled).toBe(true);
  });

  it('shows immediately when the delay is zero', () => {
    const { k, timers } = createMock();
    const target = createTarget(k);
    const tooltip = uiPlugin(k).addTooltip('Hint', { delay: 0, target });

    target.hoverHandlers[0]?.();

    expect(tooltip.hidden).toBe(false);
    expect(timers).toHaveLength(0);
  });

  it('hides on mouse press', () => {
    const { k, mousePressHandlers } = createMock();
    const target = createTarget(k);
    const tooltip = uiPlugin(k).addTooltip('Hint', { delay: 0, target });

    mousePressHandlers[0]?.();
    expect(tooltip.hidden).toBe(true);

    target.hoverHandlers[0]?.();
    expect(tooltip.hidden).toBe(false);

    mousePressHandlers[0]?.();
    expect(tooltip.hidden).toBe(true);
  });

  it('toggles on click and dismisses on an outside click', () => {
    const { k, mousePressHandlers } = createMock();
    const target = createTarget(k);
    const tooltip = uiPlugin(k).addTooltip('Hint', {
      target,
      trigger: 'click',
    });

    expect(target.hoverHandlers).toHaveLength(0);
    expect(target.clickHandlers).toHaveLength(1);

    target.clickHandlers[0]?.();
    expect(tooltip.hidden).toBe(false);

    target.hovering = true;
    mousePressHandlers[0]?.();
    expect(tooltip.hidden).toBe(false);

    target.clickHandlers[0]?.();
    expect(tooltip.hidden).toBe(true);

    target.clickHandlers[0]?.();
    expect(tooltip.hidden).toBe(false);

    target.hovering = false;
    mousePressHandlers[0]?.();
    expect(tooltip.hidden).toBe(true);

    mousePressHandlers[0]?.();
    expect(tooltip.hidden).toBe(true);
  });

  it('uses click on touchscreens with auto trigger', () => {
    const { isTouchscreen, k } = createMock();
    isTouchscreen.mockReturnValue(true);
    const target = createTarget(k);
    const tooltip = uiPlugin(k).addTooltip('Hint', { target });

    expect(isTouchscreen).toHaveBeenCalledOnce();
    expect(target.hoverHandlers).toHaveLength(0);
    expect(target.clickHandlers).toHaveLength(1);

    target.clickHandlers[0]?.();

    expect(tooltip.hidden).toBe(false);
  });

  it('allows hover to be forced on touchscreens', () => {
    const { isTouchscreen, k } = createMock();
    isTouchscreen.mockReturnValue(true);
    const target = createTarget(k);
    uiPlugin(k).addTooltip('Hint', { target, trigger: 'hover' });

    expect(target.hoverHandlers).toHaveLength(1);
    expect(target.clickHandlers).toHaveLength(0);
  });

  it.each([
    [
      'top',
      { x: 100, y: 59 },
      { x: 0, y: 13 },
      [
        { x: -4, y: 0 },
        { x: 4, y: 0 },
        { x: 0, y: 8 },
      ],
    ],
    [
      'bottom',
      { x: 100, y: 141 },
      { x: 0, y: -13 },
      [
        { x: -4, y: 0 },
        { x: 4, y: 0 },
        { x: 0, y: -8 },
      ],
    ],
    [
      'left',
      { x: 14, y: 100 },
      { x: 28, y: 0 },
      [
        { x: 0, y: -4 },
        { x: 0, y: 4 },
        { x: 8, y: 0 },
      ],
    ],
    [
      'right',
      { x: 186, y: 100 },
      { x: -28, y: 0 },
      [
        { x: 0, y: -4 },
        { x: 0, y: 4 },
        { x: -8, y: 0 },
      ],
    ],
  ] as const)(
    'positions the tooltip on the %s side',
    (placement, pos, arrowPos, points) => {
      const { k } = createMock();
      const target = createTarget(k);
      const tooltip = uiPlugin(k).addTooltip('Hint', { placement, target });

      expect(tooltip.pos).toEqual(pos);
      expect(tooltip.arrow?.pos).toEqual(arrowPos);
      expect(tooltip.arrow?.pts).toEqual(points);
    },
  );

  it.each([
    ['topleft', 150, 79],
    ['top', 100, 79],
    ['topright', 50, 79],
    ['left', 150, 59],
    ['right', 50, 59],
    ['botleft', 150, 39],
    ['bot', 100, 39],
    ['botright', 50, 39],
  ] as const)('positions above a %s target', (anchor, x, y) => {
    const { k } = createMock();
    const target = createTarget(k);
    target.anchor = anchor;
    const tooltip = uiPlugin(k).addTooltip('Hint', { target });

    expect(tooltip.pos).toEqual({ x, y });
  });

  it('disables the arrow', () => {
    const { k } = createMock();
    const target = createTarget(k);
    const tooltip = uiPlugin(k).addTooltip('Hint', { arrow: false, target });

    expect(tooltip.arrow).toBeUndefined();
    expect(asMock(tooltip).children).toHaveLength(2);
  });

  it('uses custom theme and option overrides', () => {
    const { k, timers } = createMock();
    const target = createTarget(k);
    const tooltip = uiPlugin(k, {
      components: {
        tooltip: {
          background: '#000000',
          delay: 100,
          textColor: '#eeeeee',
        },
      },
      shape: { borderRadius: 4 },
      spacing: 10,
    }).addTooltip('Hint', {
      background: '#123456',
      delay: 50,
      placement: 'bottom',
      target,
      textColor: '#abcdef',
      z: 5,
    });

    expect(tooltip.background.color).toBe('#123456');
    expect(tooltip.label.color).toBe('#abcdef');
    expect(asMock(tooltip.background).rectOpts).toEqual({ radius: 4 });
    expect(tooltip.z).toBe(5);
    expect(tooltip.pos).toEqual({ x: 100, y: 144 });

    target.hoverHandlers[0]?.();

    expect(timers[0]?.time).toBe(0.05);
  });

  it('falls back to k.add when the target has no parent', () => {
    const { add, k, root } = createMock();
    const target = {
      isHovering: vi.fn(() => false),
      onClick: vi.fn(() => ({ cancel: vi.fn() })),
      onDestroy: vi.fn(() => ({ cancel: vi.fn() })),
      onHover: vi.fn(() => ({ cancel: vi.fn() })),
      onHoverEnd: vi.fn(() => ({ cancel: vi.fn() })),
      parent: null,
      pos: { x: 0, y: 0 },
    } as unknown as GameObj;
    const tooltip = uiPlugin(k).addTooltip('Hint', { target });

    expect(add).toHaveBeenCalledOnce();
    expect(tooltip.parent).toBe(root);
    expect(tooltip.pos).toEqual({ x: 0, y: -21 });
  });

  it('copies the fixed component from the target', () => {
    const { k } = createMock();
    const target = createTarget(k);
    target.fixed = true;
    const tooltip = uiPlugin(k).addTooltip('Hint', { target });

    expect(tooltip.fixed).toBe(true);
  });

  it('updates layout only while visible', () => {
    const { k } = createMock();
    const target = createTarget(k);
    const tooltip = uiPlugin(k).addTooltip('Hint', { delay: 0, target });
    const update = asMock(tooltip).onUpdateCallbacks[0];

    target.pos = { x: 200, y: 200 };
    update();

    expect(tooltip.pos).toEqual({ x: 100, y: 59 });

    target.hoverHandlers[0]?.();
    update();

    expect(tooltip.pos).toEqual({ x: 200, y: 159 });
  });

  it('destroys the tooltip when the target is destroyed', () => {
    const { k, timers } = createMock();
    const target = createTarget(k);
    const tooltip = uiPlugin(k).addTooltip('Hint', { target });

    target.hoverHandlers[0]?.();
    const timer = timers[0];

    target.destroy();

    expect(timer.cancelled).toBe(true);
    expect(tooltip.exists()).toBe(false);
  });

  it('cleans up hover listeners when the tooltip is destroyed', () => {
    const { k, mousePressHandlers } = createMock();
    const target = createTarget(k);
    const tooltip = uiPlugin(k).addTooltip('Hint', { target });

    tooltip.destroy();

    expect(target.hoverHandlers).toHaveLength(0);
    expect(target.hoverEndHandlers).toHaveLength(0);
    expect(mousePressHandlers).toHaveLength(0);
    expect(() => {
      target.destroy();
    }).not.toThrow();
  });

  it('cleans up click listeners when the tooltip is destroyed', () => {
    const { k, mousePressHandlers } = createMock();
    const target = createTarget(k);
    const tooltip = uiPlugin(k).addTooltip('Hint', {
      target,
      trigger: 'click',
    });

    tooltip.destroy();

    expect(target.clickHandlers).toHaveLength(0);
    expect(mousePressHandlers).toHaveLength(0);
  });

  it('creates tooltip with factory', () => {
    const { k } = createMock();
    const target = createTarget(k);
    const tooltip = createTooltip(k, resolveTheme(), 'Direct', { target });

    expect(tooltip.hidden).toBe(true);
  });
});

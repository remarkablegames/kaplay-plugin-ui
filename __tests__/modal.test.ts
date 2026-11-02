import type { GameObj, KAPLAYCtx } from 'kaplay';

import { createModalManager, MODAL_TAG } from '../src/modal';
import { uiPlugin } from '../src/plugin';
import { asMock, type Comp, createMockTree } from './mocks';

const createMock = () => {
  const screen = { height: 600, width: 800 };
  const mouse = { x: 0, y: 0 };
  const { attach, onAdd, root, update, walk, worldPos, isActive } =
    createMockTree();

  function click(point: { x: number; y: number }) {
    mouse.x = point.x;
    mouse.y = point.y;

    walk(root, (obj) => {
      if (!isActive(obj) || !obj.hasPoint(point)) {
        return;
      }

      obj.clickHandlers.forEach((cb) => {
        cb();
      });
    });
  }

  const pressKey = (key: string) => {
    walk(root, (obj) => {
      if (!isActive(obj)) {
        return;
      }

      obj.keyHandlers.forEach((handler) => {
        if (handler.key === key) {
          handler.cb();
        }
      });
    });
  };

  const k = {
    add: (comps: Comp[]) => attach(root, comps),
    anchor: (value: string) => ({ kind: 'anchor', value }),
    area: () => ({ kind: 'area' }),
    center: () => ({ x: screen.width / 2, y: screen.height / 2 }),
    color: (value: unknown) => ({ kind: 'color', value }),
    fixed: () => ({ kind: 'fixed' }),
    getTreeRoot: () => root,
    height: () => screen.height,
    mousePos: () => mouse,
    onAdd,
    opacity: (value: number) => ({ kind: 'opacity', value }),
    pos: (value: { x: number; y: number } = { x: 0, y: 0 }) => ({
      kind: 'pos',
      value,
    }),
    rect: (
      width: number,
      height: number,
      opts?: { fill?: boolean; radius?: number },
    ) => ({ height, kind: 'rect', opts, width }),
    rgb: (r: number, g: number, b: number) => ({ b, g, r }),
    scale: () => ({ kind: 'scale' }),
    setCursor: vi.fn(),
    sprite: () => ({ kind: 'sprite' }),
    text: (value: string, opts: { size?: number; width?: number } = {}) => {
      const naturalWidth = value.length * 10;
      const size = opts.size ?? 16;
      const width = opts.width ?? naturalWidth;
      const height = opts.width
        ? Math.ceil(naturalWidth / opts.width) * size
        : size;

      return {
        height,
        kind: 'text',
        opts,
        text: value,
        width,
      };
    },
    vec2: (x = 0, y = 0) => ({ x, y }),
    wait: vi.fn((time: number, action: () => void) => {
      action();
    }),
    width: () => screen.width,
    z: (value: number) => ({ kind: 'z', value }),
  } as unknown as KAPLAYCtx;

  return {
    click,
    k,
    mouse,
    pressKey,
    screen,
    treeRoot: root,
    update,
    worldPos,
  };
};

describe('addModal', () => {
  it('creates a modal with content and actions', () => {
    const { k } = createMock();
    const modal = uiPlugin(k).addModal({
      title: 'Title',
      text: 'Body',
      actions: [{ text: 'OK' }],
    });
    const root = asMock(modal);

    expect(root.is(MODAL_TAG)).toBe(true);
    expect(root.children).toHaveLength(2);
    expect(modal.content).toBeDefined();
    expect(modal.actions).toBeDefined();
    expect(asMock(modal.content).children).toContain(modal.actions);
  });

  it('sizes content to its title, text, and actions', () => {
    const { k } = createMock();
    const modal = uiPlugin(k).addModal({
      title: 'Hi',
      text: 'Hello',
      actions: [{ text: 'OK' }],
    });

    expect(modal.content).toMatchObject({ height: 147, width: 280 });
  });

  it('wraps long text and clamps the width', () => {
    const { k } = createMock();
    const title = 'a'.repeat(100);
    const modal = uiPlugin(k).addModal({ title });

    expect(modal.content).toMatchObject({ height: 109, width: 480 });
    expect(asMock(modal.content).children[1]).toMatchObject({
      text: title,
      textOpts: { width: 432 },
    });
  });

  it('uses explicit dimensions', () => {
    const { k } = createMock();
    const modal = uiPlugin(k).addModal({ height: 200, width: 300 });

    expect(modal.content).toMatchObject({ height: 200, width: 300 });
  });

  it('runs actions and closes by default', () => {
    const { k } = createMock();
    const onClick = vi.fn();
    const modal = uiPlugin(k).addModal({
      actions: [{ text: 'OK', onClick }],
    });
    const action = asMock(asMock(modal.actions).children[0]);

    action.clickHandlers[0]?.();

    expect(onClick).toHaveBeenCalledOnce();
    expect(asMock(modal).exists()).toBe(false);
  });

  it('keeps the modal open when an action has close false', () => {
    const { k } = createMock();
    const modal = uiPlugin(k).addModal({
      actions: [{ close: false, text: 'Stay' }],
    });
    const action = asMock(asMock(modal.actions).children[0]);

    action.clickHandlers[0]?.();

    expect(asMock(modal).exists()).toBe(true);
  });

  it('dismisses when the backdrop is clicked outside the content', () => {
    const { click, k } = createMock();
    const modal = uiPlugin(k).addModal({ title: 'Title' });

    click({ x: 0, y: 0 });

    expect(asMock(modal).exists()).toBe(false);
  });

  it('does not dismiss when the content is clicked', () => {
    const { click, k, screen } = createMock();
    const modal = uiPlugin(k).addModal({ title: 'Title' });

    click({ x: screen.width / 2, y: screen.height / 2 });

    expect(asMock(modal).exists()).toBe(true);
  });

  it('does not dismiss when not dismissible', () => {
    const { click, k } = createMock();
    const modal = uiPlugin(k).addModal({
      dismissible: false,
      title: 'Title',
    });
    const root = asMock(modal);
    const backdrop = asMock(root.children[0]);

    expect(backdrop.clickHandlers).toHaveLength(0);
    expect(root.keyHandlers).toHaveLength(0);

    click({ x: 0, y: 0 });

    expect(root.exists()).toBe(true);
  });

  it('dismisses with Escape only for the topmost modal', () => {
    const { k, pressKey } = createMock();
    const ui = uiPlugin(k);
    const first = ui.addModal({ title: 'First' });
    const second = ui.addModal({ title: 'Second' });

    pressKey('escape');

    expect(asMock(first).exists()).toBe(true);
    expect(asMock(second).exists()).toBe(false);

    pressKey('escape');

    expect(asMock(first).exists()).toBe(false);
  });

  it('pauses the scene and restores previous state', () => {
    const { k } = createMock();
    const active = asMock(k.add([]));
    const paused = asMock(k.add([]));
    paused.paused = true;

    const modal = uiPlugin(k).addModal({ title: 'Title' });
    const added = asMock(k.add([]));

    expect(active.paused).toBe(true);
    expect(paused.paused).toBe(true);
    expect(added.paused).toBe(true);
    expect(asMock(modal.actions).paused).toBe(false);

    asMock(modal).destroy();

    expect(active.paused).toBe(false);
    expect(paused.paused).toBe(true);
    expect(added.paused).toBe(false);
  });

  it('pauses a lower modal when another modal opens', () => {
    const { k } = createMock();
    const ui = uiPlugin(k);
    const first = ui.addModal({ actions: [{ text: 'OK' }], title: 'First' });
    const second = ui.addModal({ title: 'Second' });

    expect(asMock(first).paused).toBe(true);
    expect(asMock(asMock(first.actions).children[0]).paused).toBe(true);
    expect(asMock(second).paused).toBe(false);

    asMock(second).destroy();

    expect(asMock(first).paused).toBe(false);
    expect(asMock(asMock(first.actions).children[0]).paused).toBe(false);
  });

  it('updates the backdrop and position on resize', () => {
    const { k, screen, update } = createMock();
    const modal = uiPlugin(k).addModal({ title: 'Title' });
    const root = asMock(modal);
    const backdrop = asMock(root.children[0]);

    screen.width = 1000;
    screen.height = 700;
    update(root);

    expect(backdrop).toMatchObject({ height: 700, width: 1000 });
    expect(root.pos).toEqual({ x: 500, y: 350 });
  });

  it('lets users attach buttons to actions', () => {
    const { k } = createMock();
    const ui = uiPlugin(k);
    const modal = ui.addModal({ title: 'Title' });

    ui.addButton('Extra', { parent: modal.actions });

    expect(asMock(modal.actions).children).toHaveLength(1);
  });

  it('does not dismiss a non-topmost modal when its backdrop is clicked', () => {
    const { k } = createMock();
    const ui = uiPlugin(k);
    const first = ui.addModal({ title: 'First' });
    const second = ui.addModal({ title: 'Second' });

    const backdrop = asMock(asMock(first).children[0]);
    backdrop.clickHandlers[0]?.();

    expect(asMock(first).exists()).toBe(true);
    expect(asMock(second).exists()).toBe(true);
  });

  it('closeModal returns early when the modal is not in the stack', () => {
    const k = {
      getTreeRoot: () => ({ children: [] }),
      onAdd: vi.fn(() => ({ cancel: vi.fn() })),
    } as unknown as KAPLAYCtx;
    const manager = createModalManager(k);

    const notInStack = {} as GameObj;

    expect(() => {
      manager.closeModal(notInStack);
    }).not.toThrow();
  });

  it('uses undefined width when textWrapWidth is zero', () => {
    const { k } = createMock();
    const modal = uiPlugin(k).addModal({
      title: 'Title',
      text: 'Body',
      width: 0,
    });

    const content = asMock(asMock(modal).children[1]);
    const title = asMock(content.children[1]);
    const body = asMock(content.children[2]);

    expect(title.textOpts?.width).toBeUndefined();
    expect(body.textOpts?.width).toBeUndefined();
  });

  it('uses undefined border radius when borderRadius is zero', () => {
    const { k } = createMock();
    const modal = uiPlugin(k, {
      components: { modal: { borderRadius: 0 } },
    }).addModal({ title: 'Title' });

    const content = asMock(asMock(modal).children[1]);

    expect(content.rectOpts).toBeUndefined();
  });

  it('does not destroy a non-topmost modal on Escape', () => {
    const { k } = createMock();
    const ui = uiPlugin(k);
    const first = ui.addModal({ title: 'First' });
    const second = ui.addModal({ title: 'Second' });

    // Lower modals are paused when a higher modal opens, so `pressKey` never
    // reaches their escape handler. Invoke it directly to cover the guard.
    for (const h of asMock(first).keyHandlers) {
      if (h.key === 'escape') {
        h.cb();
        break;
      }
    }

    expect(asMock(first).exists()).toBe(true);
    expect(asMock(second).exists()).toBe(true);
  });

  it('restores only existing objects when closing the last modal', () => {
    const { k } = createMock();
    const ui = uiPlugin(k);
    const active = asMock(k.add([]));
    const destroyed = asMock(k.add([]));

    const modal = ui.addModal({ title: 'Title' });

    asMock(destroyed).destroy();
    asMock(modal).destroy();

    expect(active.paused).toBe(false);
    expect(destroyed.paused).toBe(true);
  });

  it('uses an explicit z index', () => {
    const { k } = createMock();
    const modal = uiPlugin(k).addModal({ title: 'Title', z: 500 });

    expect(asMock(modal).z).toBe(500);
  });

  it('closes a non-topmost modal without resuming the others', () => {
    const { k } = createMock();
    const ui = uiPlugin(k);
    const first = ui.addModal({ title: 'First' });
    const second = ui.addModal({ title: 'Second' });

    asMock(first).destroy();

    expect(asMock(first).exists()).toBe(false);
    expect(asMock(second).exists()).toBe(true);
  });
});

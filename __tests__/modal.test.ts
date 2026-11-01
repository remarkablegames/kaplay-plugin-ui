import type { GameObj, KAPLAYCtx } from 'kaplay';

import { createModalManager, MODAL_TAG } from '../src/modal';
import { uiPlugin } from '../src/plugin';

interface MockController {
  cancel: () => void;
}

interface MockComp {
  height?: number;
  kind: string;
  opts?: { fill?: boolean; radius?: number; size?: number; width?: number };
  text?: string;
  value?: unknown;
  width?: number;
}

type Comp = MockComp | string;

interface MockObj {
  add: (comps: Comp[]) => MockObj;
  anchor?: string;
  children: MockObj[];
  clickHandlers: (() => void)[];
  destroy: () => void;
  exists: () => boolean;
  fixed?: boolean;
  hasArea: boolean;
  hasPoint: (point: { x: number; y: number }) => boolean;
  height: number;
  hoverEndHandlers: (() => void)[];
  hoverHandlers: (() => void)[];
  id: number;
  is: (tag: string) => boolean;
  isAncestorOf: (obj: MockObj) => boolean;
  isHovering: () => boolean;
  keyHandlers: { cb: () => void; key: string }[];
  onDestroyCallbacks: (() => void)[];
  onClick: (cb: () => void) => MockController;
  onDestroy: (cb: () => void) => MockController;
  onHover: (cb: () => void) => MockController;
  onHoverEnd: (cb: () => void) => MockController;
  onKeyPress: (key: string, cb: () => void) => MockController;
  onUpdate: (cb: () => void) => MockController;
  onUpdateCallbacks: (() => void)[];
  parent: MockObj | null;
  paused: boolean;
  pos: { x: number; y: number };
  rectOpts?: { fill?: boolean; radius?: number };
  tags: Set<string>;
  text?: string;
  textOpts?: { size?: number; width?: number };
  width: number;
  z?: number;
}

const createMock = () => {
  const screen = { height: 600, width: 800 };
  const mouse = { x: 0, y: 0 };
  const addCallbacks: ((obj: MockObj) => void)[] = [];
  let nextId = 0;
  const treeRoot = makeObj([], null);

  function worldPos(obj: MockObj) {
    let x = obj.pos.x;
    let y = obj.pos.y;
    let parent = obj.parent;

    while (parent) {
      x += parent.pos.x;
      y += parent.pos.y;
      parent = parent.parent;
    }

    return { x, y };
  }

  function exists(obj: MockObj) {
    let current = obj.parent;

    while (current) {
      if (current === treeRoot) {
        return true;
      }

      current = current.parent;
    }

    return false;
  }

  function isAncestorOf(obj: MockObj, other: MockObj) {
    let current = other.parent;

    while (current) {
      if (current === obj) {
        return true;
      }

      current = current.parent;
    }

    return false;
  }

  function hasPoint(obj: MockObj, point: { x: number; y: number }) {
    if (!obj.hasArea) {
      return false;
    }

    const world = worldPos(obj);
    const left = obj.anchor === 'center' ? world.x - obj.width / 2 : world.x;
    const right =
      obj.anchor === 'center' ? world.x + obj.width / 2 : world.x + obj.width;
    const top = obj.anchor === 'center' ? world.y - obj.height / 2 : world.y;
    const bottom =
      obj.anchor === 'center' ? world.y + obj.height / 2 : world.y + obj.height;

    return (
      point.x >= left && point.x <= right && point.y >= top && point.y <= bottom
    );
  }

  function destroy(obj: MockObj) {
    const parent = obj.parent;

    if (!parent) {
      return;
    }

    const index = parent.children.indexOf(obj);

    if (index !== -1) {
      parent.children.splice(index, 1);
    }

    obj.parent = null;
    triggerDestroy(obj);
  }

  function triggerDestroy(obj: MockObj) {
    obj.onDestroyCallbacks.forEach((cb) => {
      cb();
    });
    obj.children.forEach(triggerDestroy);
  }

  function makeObj(comps: Comp[], parent: MockObj | null): MockObj {
    const obj: MockObj = {
      add: (next) => attach(obj, next),
      children: [],
      clickHandlers: [],
      destroy: () => {
        destroy(obj);
      },
      exists: () => exists(obj),
      hasArea: false,
      hasPoint: (point) => hasPoint(obj, point),
      height: 0,
      hoverEndHandlers: [],
      hoverHandlers: [],
      id: nextId++,
      is: (tag) => obj.tags.has(tag),
      isAncestorOf: (other) => isAncestorOf(obj, other),
      isHovering: () => false,
      keyHandlers: [],
      onDestroyCallbacks: [],
      onDestroy: (cb) => {
        obj.onDestroyCallbacks.push(cb);
        return {
          cancel: () => {
            const index = obj.onDestroyCallbacks.indexOf(cb);
            if (index !== -1) {
              obj.onDestroyCallbacks.splice(index, 1);
            }
          },
        };
      },
      onClick: (cb) => {
        obj.clickHandlers.push(cb);
        return {
          cancel: () => {
            const index = obj.clickHandlers.indexOf(cb);
            if (index !== -1) {
              obj.clickHandlers.splice(index, 1);
            }
          },
        };
      },
      onHover: (cb) => {
        obj.hoverHandlers.push(cb);
        return {
          cancel: () => {
            const index = obj.hoverHandlers.indexOf(cb);
            if (index !== -1) {
              obj.hoverHandlers.splice(index, 1);
            }
          },
        };
      },
      onHoverEnd: (cb) => {
        obj.hoverEndHandlers.push(cb);
        return {
          cancel: () => {
            const index = obj.hoverEndHandlers.indexOf(cb);
            if (index !== -1) {
              obj.hoverEndHandlers.splice(index, 1);
            }
          },
        };
      },
      onKeyPress: (key, cb) => {
        const handler = { cb, key };
        obj.keyHandlers.push(handler);
        return {
          cancel: () => {
            const index = obj.keyHandlers.indexOf(handler);
            if (index !== -1) {
              obj.keyHandlers.splice(index, 1);
            }
          },
        };
      },
      onUpdate: (cb) => {
        obj.onUpdateCallbacks.push(cb);
        return {
          cancel: () => {
            const index = obj.onUpdateCallbacks.indexOf(cb);
            if (index !== -1) {
              obj.onUpdateCallbacks.splice(index, 1);
            }
          },
        };
      },
      onUpdateCallbacks: [],
      parent,
      paused: false,
      pos: { x: 0, y: 0 },
      tags: new Set<string>(),
      width: 0,
    };

    for (const comp of comps) {
      if (typeof comp === 'string') {
        obj.tags.add(comp);
        continue;
      }

      switch (comp.kind) {
        case 'anchor':
          obj.anchor = comp.value as string;
          break;
        case 'area':
          obj.hasArea = true;
          break;
        case 'fixed':
          obj.fixed = true;
          break;
        case 'pos':
          obj.pos = comp.value as { x: number; y: number };
          break;
        case 'rect':
          obj.width = comp.width ?? 0;
          obj.height = comp.height ?? 0;
          obj.rectOpts = comp.opts;
          break;
        case 'text':
          obj.width = comp.width ?? 0;
          obj.height = comp.height ?? 0;
          obj.text = comp.text;
          obj.textOpts = comp.opts;
          break;
        case 'z':
          obj.z = comp.value as number;
          break;
      }
    }

    return obj;
  }

  function attach(parent: MockObj, comps: Comp[]) {
    const obj = makeObj(comps, parent);
    parent.children.push(obj);
    addCallbacks.forEach((cb) => {
      cb(obj);
    });
    return obj;
  }

  function isActive(obj: MockObj) {
    let current: MockObj | null = obj;

    while (current) {
      if (current.paused) {
        return false;
      }

      current = current.parent;
    }

    return true;
  }

  function walk(obj: MockObj, action: (obj: MockObj) => void) {
    action(obj);
    obj.children.forEach((child) => {
      walk(child, action);
    });
  }

  const update = (obj: MockObj) => {
    if (obj.paused) {
      return;
    }

    obj.children.forEach(update);
    obj.onUpdateCallbacks.forEach((cb) => {
      cb();
    });
  };

  const click = (point: { x: number; y: number }) => {
    mouse.x = point.x;
    mouse.y = point.y;

    walk(treeRoot, (obj) => {
      if (!isActive(obj) || !obj.hasPoint(point)) {
        return;
      }

      obj.clickHandlers.forEach((cb) => {
        cb();
      });
    });
  };

  const pressKey = (key: string) => {
    walk(treeRoot, (obj) => {
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
    add: (comps: Comp[]) => attach(treeRoot, comps),
    anchor: (value: string) => ({ kind: 'anchor', value }),
    area: () => ({ kind: 'area' }),
    center: () => ({ x: screen.width / 2, y: screen.height / 2 }),
    color: (value: unknown) => ({ kind: 'color', value }),
    fixed: () => ({ kind: 'fixed' }),
    getTreeRoot: () => treeRoot,
    height: () => screen.height,
    mousePos: () => mouse,
    onAdd: (cb: (obj: MockObj) => void) => {
      addCallbacks.push(cb);
      return {
        cancel: () => {
          const index = addCallbacks.indexOf(cb);
          if (index !== -1) {
            addCallbacks.splice(index, 1);
          }
        },
      };
    },
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
    treeRoot,
    update,
    worldPos,
  };
};

const asMock = (obj: unknown) => obj as MockObj;

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

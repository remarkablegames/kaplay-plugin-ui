import type { KAPLAYCtx } from 'kaplay';

export interface MockController {
  cancel: () => void;
}

export type Comp =
  | string
  | { kind: 'anchor'; value: string }
  | { kind: 'area' }
  | { kind: 'color'; value: unknown }
  | { kind: 'fixed' }
  | { kind: 'polygon'; pts: { x: number; y: number }[] }
  | { kind: 'pos'; value: { x: number; y: number } }
  | {
      height: number;
      kind: 'rect';
      opts?: { fill?: boolean; radius?: number };
      width: number;
    }
  | {
      height: number;
      kind: 'text';
      opts?: { size?: number; width?: number };
      text: string;
      width: number;
    }
  | { kind: 'z'; value: number };

export interface MockObj {
  add: (comps: Comp[]) => MockObj;
  anchor?: string;
  children: MockObj[];
  clickHandlers: (() => void)[];
  color?: unknown;
  destroy: () => void;
  exists: () => boolean;
  fixed?: boolean;
  hasArea: boolean;
  hasPoint: (point: { x: number; y: number }) => boolean;
  height: number;
  hidden: boolean;
  hoverEndHandlers: (() => void)[];
  hoverHandlers: (() => void)[];
  hovering: boolean;
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
  pts?: { x: number; y: number }[];
  rectOpts?: { fill?: boolean; radius?: number };
  tags: Set<string>;
  text?: string;
  textOpts?: { size?: number; width?: number };
  width: number;
  z?: number;
}

export const asMock = (obj: unknown) => obj as MockObj;

export function createMockTree() {
  let nextId = 0;
  const root = makeObj([], null);
  const addCallbacks: ((obj: MockObj) => void)[] = [];

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
    let current: MockObj | null = obj.parent;

    while (current) {
      if (current === root) {
        return true;
      }

      current = current.parent;
    }

    return false;
  }

  function isAncestorOf(obj: MockObj, other: MockObj) {
    let current: MockObj | null = other.parent;

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
      hidden: false,
      hoverEndHandlers: [],
      hoverHandlers: [],
      hovering: false,
      id: nextId++,
      is: (tag) => obj.tags.has(tag),
      isAncestorOf: (other) => isAncestorOf(obj, other),
      isHovering: () => obj.hovering,
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
          obj.anchor = comp.value;
          break;
        case 'area':
          obj.hasArea = true;
          break;
        case 'color':
          obj.color = comp.value;
          break;
        case 'fixed':
          obj.fixed = true;
          break;
        case 'polygon':
          obj.pts = comp.pts;
          break;
        case 'pos':
          obj.pos = comp.value;
          break;
        case 'rect':
          obj.width = comp.width;
          obj.height = comp.height;
          obj.rectOpts = comp.opts;
          break;
        case 'text':
          obj.width = comp.width;
          obj.height = comp.height;
          obj.text = comp.text;
          obj.textOpts = comp.opts;
          break;
        case 'z':
          obj.z = comp.value;
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

  return {
    attach,
    destroy,
    exists,
    hasPoint,
    isActive,
    isAncestorOf,
    makeObj,
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
    root,
    triggerDestroy,
    update,
    walk,
    worldPos,
  };
}

export function makeK(
  overrides: Record<string, unknown> = {},
  tree: ReturnType<typeof createMockTree> = createMockTree(),
) {
  const { attach, onAdd, root } = tree;
  const k = {
    add: (comps: Comp[]) => attach(root, comps),
    anchor: (value: string) => ({ kind: 'anchor', value }),
    area: () => ({ kind: 'area' }),
    center: () => ({ x: 400, y: 300 }),
    color: (value: unknown) => ({ kind: 'color', value }),
    fixed: () => ({ kind: 'fixed' }),
    getTreeRoot: () => root,
    height: () => 600,
    mousePos: () => ({ x: 0, y: 0 }),
    onAdd,
    opacity: (value: number) => ({ kind: 'opacity', value }),
    polygon: (pts: { x: number; y: number }[]) => ({ kind: 'polygon', pts }),
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
    text: (value: string, opts: { size?: number } = {}) => ({
      height: opts.size ?? 16,
      kind: 'text',
      opts,
      text: value,
      width: value.length * 10,
    }),
    vec2: (x = 0, y = 0) => ({ x, y }),
    wait: vi.fn((time: number, action: () => void) => {
      action();
    }),
    width: () => 800,
    z: (value: number) => ({ kind: 'z', value }),
    ...overrides,
  } as unknown as KAPLAYCtx;

  return { k, tree };
}

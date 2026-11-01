import type { GameObj, KAPLAYCtx } from 'kaplay';

import { createButton } from './button';
import type { ModalOpt, Theme } from './types';
import { isModal, setPaused, toColor, uniqueTag } from './utils';

/** Tag applied to modal game objects. */
export const MODAL_TAG = uniqueTag('modal');

type SizedGameObj = GameObj & {
  height: number;
  width: number;
};

export interface ModalHooks {
  isTopmost: (modal: GameObj) => boolean;
  onClose: (modal: GameObj) => void;
  onOpen: (modal: GameObj) => void;
}

function isSized(obj: GameObj): obj is SizedGameObj {
  const sized = obj as Partial<SizedGameObj>;
  return typeof sized.width === 'number' && typeof sized.height === 'number';
}

export function createModal(
  k: KAPLAYCtx,
  theme: Theme,
  opt: ModalOpt,
  hooks: ModalHooks,
) {
  const {
    backdropOpacity,
    borderRadius,
    gap,
    maxWidth,
    minWidth,
    paddingX,
    paddingY,
  } = theme.components.modal;
  const fontSize = theme.typography.fontSize;
  const titleSize = Math.round(fontSize * 1.25);
  const font = theme.typography.fontFamily;
  const dismissible = opt.dismissible ?? true;

  const modal = k.add([
    k.pos(k.center()),
    k.fixed(),
    k.z(opt.z ?? 1000),
    MODAL_TAG,
  ]);

  modal.onDestroy(() => {
    hooks.onClose(modal);
  });

  hooks.onOpen(modal);

  const backdrop = modal.add([
    k.rect(k.width(), k.height()),
    k.pos(),
    k.color(0, 0, 0),
    k.opacity(backdropOpacity),
    k.anchor('center'),
    k.area(),
  ]);

  const content = modal.add([
    k.rect(0, 0, borderRadius > 0 ? { radius: borderRadius } : undefined),
    k.pos(),
    k.color(toColor(k, theme.palette.surface)),
    k.anchor('center'),
    k.area(),
  ]);

  const actions = content.add([k.pos()]);

  for (const action of opt.actions ?? []) {
    createButton(k, theme, action.text, {
      parent: actions,
      onClick: () => {
        if (action.close !== false) {
          modal.destroy();
        }

        action.onClick?.();
      },
    });
  }

  const titleMeasure = opt.title
    ? k.text(opt.title, { size: titleSize, font })
    : undefined;
  const bodyMeasure = opt.text
    ? k.text(opt.text, { size: fontSize, font })
    : undefined;
  const textWrapWidth = Math.max(0, (opt.width ?? maxWidth) - paddingX * 2);

  const title = opt.title
    ? content.add([
        k.text(opt.title, {
          size: titleSize,
          font,
          width: textWrapWidth > 0 ? textWrapWidth : undefined,
          align: 'center',
        }),
        k.pos(),
        k.color(toColor(k, theme.palette.text)),
        k.anchor('center'),
      ])
    : undefined;

  const body = opt.text
    ? content.add([
        k.text(opt.text, {
          size: fontSize,
          font,
          width: textWrapWidth > 0 ? textWrapWidth : undefined,
          align: 'center',
        }),
        k.pos(),
        k.color(toColor(k, theme.palette.textSecondary)),
        k.anchor('center'),
      ])
    : undefined;

  /**
   * Update modal layout:
   *
   * - fits the backdrop to the screen,
   * - sizes the content to its title, text, and actions,
   * - repositions the title, text, and actions.
   */
  function layout() {
    const screenWidth = k.width();
    const screenHeight = k.height();

    if (backdrop.width !== screenWidth) {
      backdrop.width = screenWidth;
    }

    if (backdrop.height !== screenHeight) {
      backdrop.height = screenHeight;
    }

    modal.pos = k.center();

    const buttons = actions.children.filter(isSized);
    const actionsWidth =
      buttons.reduce((width, button) => width + button.width, 0) +
      gap * Math.max(0, buttons.length - 1);
    const actionsHeight = Math.max(
      0,
      ...buttons.map((button) => button.height),
    );

    const textContentWidth = Math.max(
      titleMeasure?.width ?? 0,
      bodyMeasure?.width ?? 0,
    );
    const nextWidth =
      opt.width ??
      Math.max(
        Math.min(textContentWidth, maxWidth - paddingX * 2) + paddingX * 2,
        actionsWidth + paddingX * 2,
        minWidth,
      );

    const titleHeight = title?.height ?? 0;
    const bodyHeight = body?.height ?? 0;
    const hasTitle = title !== undefined;
    const hasBody = body !== undefined;
    const hasActions = buttons.length > 0;
    const blockCount = Number(hasTitle) + Number(hasBody) + Number(hasActions);
    const contentHeight =
      titleHeight +
      bodyHeight +
      actionsHeight +
      gap * Math.max(0, blockCount - 1);
    const nextHeight = opt.height ?? contentHeight + paddingY * 2;

    if (content.width !== nextWidth) {
      content.width = nextWidth;
    }

    if (content.height !== nextHeight) {
      content.height = nextHeight;
    }

    let y = -nextHeight / 2 + (nextHeight - contentHeight) / 2;

    if (title) {
      title.pos = k.vec2(0, y + title.height / 2);
      y += title.height + gap;
    }

    if (body) {
      body.pos = k.vec2(0, y + body.height / 2);
      y += body.height + gap;
    }

    if (hasActions) {
      let x = -actionsWidth / 2;

      for (const button of buttons) {
        button.pos = k.vec2(x + button.width / 2, y + actionsHeight / 2);
        x += button.width + gap;
      }
    }
  }

  layout();
  modal.onUpdate(layout);

  if (dismissible) {
    // prevent click-through so modal isn't dismissed right after creation
    k.wait(0, () => {
      backdrop.onClick(() => {
        if (!hooks.isTopmost(modal)) {
          return;
        }

        if (content.hasPoint(k.mousePos())) {
          return;
        }

        modal.destroy();
      });
    });

    modal.onKeyPress('escape', () => {
      if (hooks.isTopmost(modal)) {
        modal.destroy();
      }
    });
  }

  return Object.assign(modal, {
    actions,
    content,
  });
}

export interface ModalManager {
  openModal: ModalHooks['onOpen'];
  closeModal: ModalHooks['onClose'];
  isTopmost: ModalHooks['isTopmost'];
  isInsideModal: (gameObj: GameObj) => boolean;
}

export function createModalManager(k: KAPLAYCtx): ModalManager {
  const modals: GameObj[] = [];
  let pausedScene: Map<GameObj, boolean> | undefined;
  let cancelPauseOnAdd: (() => void) | undefined;

  const isInsideModal = (gameObj: GameObj) =>
    modals.some((modal) => modal === gameObj || modal.isAncestorOf(gameObj));

  function pauseSceneTree(gameObj: GameObj) {
    if (isModal(gameObj) || isInsideModal(gameObj)) {
      return;
    }

    pausedScene ??= new Map();

    // v8 ignore next
    if (!pausedScene.has(gameObj)) {
      pausedScene.set(gameObj, gameObj.paused);
    }

    setPaused(gameObj);
    gameObj.children.forEach(pauseSceneTree);
  }

  function openModal(modal: GameObj) {
    if (modals.length > 0) {
      setPaused(modals[modals.length - 1], true, true);
    }

    modals.push(modal);

    if (modals.length === 1) {
      pausedScene = new Map();
      k.getTreeRoot().children.forEach(pauseSceneTree);

      const controller = k.onAdd((gameObj) => {
        if (!isModal(gameObj) && !isInsideModal(gameObj)) {
          pauseSceneTree(gameObj);
        }
      });

      cancelPauseOnAdd = () => {
        controller.cancel();
      };
    }
  }

  function closeModal(modal: GameObj) {
    const index = modals.indexOf(modal);

    if (index === -1) {
      return;
    }

    const wasTopmost = index === modals.length - 1;

    modals.splice(index, 1);

    if (!modals.length) {
      cancelPauseOnAdd?.();
      cancelPauseOnAdd = undefined;

      // v8 ignore next
      if (pausedScene) {
        for (const [gameObj, paused] of pausedScene) {
          if (gameObj.exists()) {
            setPaused(gameObj, paused);
          }
        }

        pausedScene = undefined;
      }
    } else if (wasTopmost) {
      setPaused(modals[modals.length - 1], false, true);
    }
  }

  const isTopmost = (modal: GameObj) => modals[modals.length - 1] === modal;

  return { openModal, closeModal, isTopmost, isInsideModal };
}

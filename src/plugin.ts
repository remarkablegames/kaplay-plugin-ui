import type { KAPLAYCtx } from 'kaplay';

import { createButton } from './button';
import { createModal, createModalManager } from './modal';
import { resolveTheme } from './theme';
import type {
  AddButton,
  AddModal,
  DeepPartial,
  GetTheme,
  SetTheme,
  Theme,
} from './types';

/**
 * Kaplay UI plugin.
 *
 * @param k - The Kaplay context.
 * @param theme - The theme config.
 * @returns The plugin methods.
 */
export function uiPlugin(k: KAPLAYCtx, theme: DeepPartial<Theme> = {}) {
  let userTheme: DeepPartial<Theme> = theme;
  let currentTheme: Theme = resolveTheme(userTheme);

  const getTheme: GetTheme = () => currentTheme;

  const setTheme: SetTheme = (next) => {
    userTheme = { ...userTheme, ...next };
    currentTheme = resolveTheme(userTheme);
  };

  const addButton: AddButton = (text = '', opt = {}) => {
    return createButton(k, currentTheme, text, opt);
  };

  const modalManager = createModalManager(k);

  const addModal: AddModal = (opt = {}) => {
    return createModal(k, currentTheme, opt, {
      isTopmost: modalManager.isTopmost,
      onClose: modalManager.closeModal,
      onOpen: modalManager.openModal,
    });
  };

  return {
    addButton,
    addModal,
    setTheme,
    getTheme,
  };
}

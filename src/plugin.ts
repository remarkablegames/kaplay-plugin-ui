import type { KAPLAYCtx } from 'kaplay';

import { createButton } from './button';
import { resolveTheme } from './theme';
import type {
  AddButton,
  DeepPartial,
  GetTheme,
  SetTheme,
  Theme,
} from './types';

/** KAPLAY UI plugin. */
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

  return {
    addButton,
    setTheme,
    getTheme,
  };
}

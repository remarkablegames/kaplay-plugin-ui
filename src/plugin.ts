import type { Color, KAPLAYCtx, Vec2 } from 'kaplay';

import { createButton } from './button';
import { resolveTheme } from './theme';
import type { ButtonOpt, DeepPartial, Theme, UIPlugin } from './types';

export type { ButtonOpt, Theme, UIPlugin };

/** KAPLAY UI plugin. */
export function uiPlugin(
  k: KAPLAYCtx,
  theme: DeepPartial<Theme> = {},
): UIPlugin {
  let userTheme: DeepPartial<Theme> = theme;
  let currentTheme: Theme = resolveTheme(userTheme);

  const getTheme = (): Theme => currentTheme;

  const setTheme = (next: DeepPartial<Theme>): void => {
    userTheme = { ...userTheme, ...next };
    currentTheme = resolveTheme(userTheme);
  };

  const addButton = (
    text = '',
    opt: ButtonOpt & {
      pos?: Vec2;
      onClick?: () => void;
      color?: string | Color;
      hoverColor?: string | Color;
      pressedColor?: string | Color;
      textColor?: string | Color;
    } = {},
  ) => {
    return createButton(k, currentTheme, text, opt);
  };

  return {
    addButton,
    setTheme,
    getTheme,
  };
}

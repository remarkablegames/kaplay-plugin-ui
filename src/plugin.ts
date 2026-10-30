import type { GameObj, KAPLAYCtx, Vec2 } from 'kaplay';

import { createButtonComponent, createButtonObject } from './button';
import { resolveTheme } from './theme';
import type {
  ButtonComp,
  ButtonCompOpt,
  Color,
  DeepPartial,
  Theme,
} from './types';

export { createButtonComponent, createButtonObject } from './button';
export type { ButtonComp, ButtonCompOpt, Color, Theme } from './types';

declare module 'kaplay' {
  interface KAPLAYCtx {
    button: (text?: string, opt?: ButtonCompOpt) => ButtonComp;
    addButton: (
      text?: string,
      opt?: ButtonCompOpt & {
        pos?: Vec2;
        onClick?: () => void;
        color?: Color;
        hoverColor?: Color;
        pressedColor?: Color;
        textColor?: Color;
      },
    ) => GameObj;
    setTheme: (theme: DeepPartial<Theme>) => void;
    getTheme: () => Theme;
  }
}

/** KAPLAY UI plugin. */
export function uiPlugin(k: KAPLAYCtx, theme: DeepPartial<Theme> = {}) {
  let userTheme: DeepPartial<Theme> = theme;
  let currentTheme: Theme = resolveTheme(userTheme);

  const getTheme = (): Theme => currentTheme;

  const setTheme = (next: DeepPartial<Theme>): void => {
    userTheme = { ...userTheme, ...next };
    currentTheme = resolveTheme(userTheme);
  };

  const button = (text = '', opt: ButtonCompOpt = {}): ButtonComp => {
    return createButtonComponent(k, currentTheme, text, opt);
  };

  const addButton = (
    text = '',
    opt: ButtonCompOpt & {
      pos?: Vec2;
      onClick?: () => void;
      color?: Color;
      hoverColor?: Color;
      pressedColor?: Color;
      textColor?: Color;
    } = {},
  ): GameObj => {
    return createButtonObject(k, currentTheme, text, opt);
  };

  return {
    button,
    addButton,
    setTheme,
    getTheme,
  };
}

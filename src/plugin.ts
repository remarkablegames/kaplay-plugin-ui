import type { GameObj, KAPLAYCtx, Vec2 } from 'kaplay';

import { createButtonComponent, createButtonObject } from './button';
import type { ButtonComp, ButtonCompOpt, UIColor, UITheme } from './types';

export { createButtonComponent, createButtonObject } from './button';
export type { ButtonComp, ButtonCompOpt, UIColor, UITheme } from './types';

declare module 'kaplay' {
  interface KAPLAYCtx {
    button: (text?: string, opt?: ButtonCompOpt) => ButtonComp;
    addButton: (
      text?: string,
      opt?: ButtonCompOpt & {
        pos?: Vec2;
        onClick?: () => void;
        color?: UIColor;
        hoverColor?: UIColor;
        pressedColor?: UIColor;
        textColor?: UIColor;
      },
    ) => GameObj;
    addTextButton: (
      text?: string,
      opt?: ButtonCompOpt & {
        pos?: Vec2;
        onClick?: () => void;
        color?: UIColor;
        hoverColor?: UIColor;
        pressedColor?: UIColor;
        textColor?: UIColor;
      },
    ) => GameObj;
    textButton: (text?: string, opt?: ButtonCompOpt) => ButtonComp;
    uiButton: (text?: string, opt?: ButtonCompOpt) => ButtonComp;
    setTheme: (theme: UITheme) => void;
    getTheme: () => UITheme | undefined;
  }
}

/** KAPLAY UI plugin. */
export function uiPlugin(k: KAPLAYCtx, theme?: UITheme) {
  let currentTheme: UITheme | undefined = theme;

  const getTheme = (): UITheme | undefined => currentTheme;

  const setTheme = (next: UITheme): void => {
    currentTheme = { ...currentTheme, ...next };
  };

  const button = (text = '', opt: ButtonCompOpt = {}): ButtonComp => {
    return createButtonComponent(k, currentTheme, text, opt);
  };

  const addButton = (
    text = '',
    opt: ButtonCompOpt & {
      pos?: Vec2;
      onClick?: () => void;
      color?: UIColor;
      hoverColor?: UIColor;
      pressedColor?: UIColor;
      textColor?: UIColor;
    } = {},
  ): GameObj => {
    return createButtonObject(k, currentTheme, text, opt);
  };

  return {
    button,
    addButton,
    addTextButton: addButton,
    textButton: button,
    uiButton: button,
    setTheme,
    getTheme,
  };
}

export const buttonPlugin = uiPlugin;
export const UIPlugin = uiPlugin;

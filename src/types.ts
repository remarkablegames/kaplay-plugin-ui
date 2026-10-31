import type { Color, Vec2 } from 'kaplay';

import { createButton } from './button';

declare module 'kaplay' {
  interface KAPLAYCtx {
    addButton: AddButton;
    getTheme: GetTheme;
    setTheme: SetTheme;
  }
}

export type AddButton = (
  text?: string,
  opt?: ButtonOpt & {
    pos?: Vec2;
    onClick?: () => void;
    color?: string | Color;
    hoverColor?: string | Color;
    pressedColor?: string | Color;
    textColor?: string | Color;
  },
) => ReturnType<typeof createButton>;

export type GetTheme = () => Theme;

export type SetTheme = (theme: DeepPartial<Theme>) => void;

/** Recursively partial version of a type. */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/** Theme config. */
export interface Theme {
  palette: {
    primary: string | Color;
    secondary: string | Color;
    background: string | Color;
    surface: string | Color;
    text: string | Color;
    textSecondary: string | Color;
    hover: string | Color;
    pressed: string | Color;
    disabled: string | Color;
    error: string | Color;
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number | string;
    lineHeight: number;
  };
  shape: {
    borderRadius: number;
  };
  spacing: number;
  components: {
    button: {
      width: number;
      height: number;
      minWidth: number;
      paddingX: number;
      paddingY: number;
      textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    };
    modal: {
      backdropOpacity: number;
      borderRadius: number;
    };
    tooltip: {
      background: string | Color;
      textColor: string | Color;
      delay: number;
    };
  };
}

/** Button options. */
export interface ButtonOpt {
  width?: number;
  height?: number;
  size?: number;
  font?: string;
  fill?: string | Color;
  textColor?: string | Color;
  radius?: number;
  hoverFill?: string | Color;
  pressedFill?: string | Color;
}

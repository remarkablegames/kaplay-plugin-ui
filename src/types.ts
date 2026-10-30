import type { Color, Vec2 } from 'kaplay';

import { createButton } from './button';

export interface UIPlugin {
  addButton: (
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

  getTheme: () => Theme;

  setTheme: (theme: DeepPartial<Theme>) => void;
}

declare module 'kaplay' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface KAPLAYCtx extends UIPlugin {}
}

/** Recursively partial version of a type. */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

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

import type { Color as KaplayColor, Comp, Rect } from 'kaplay';

/** Color value accepted by the UI theme and components. */
export type Color = KaplayColor | string;

/** Recursively partial version of a type. */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export interface Theme {
  palette: {
    primary: Color;
    secondary: Color;
    background: Color;
    surface: Color;
    text: Color;
    textSecondary: Color;
    hover: Color;
    pressed: Color;
    disabled: Color;
    error: Color;
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
      background: Color;
      textColor: Color;
      delay: number;
    };
  };
}

/** Options for a single button. */
export interface ButtonCompOpt {
  width?: number;
  height?: number;
  size?: number;
  font?: string;
  fill?: Color;
  textColor?: Color;
  radius?: number;
  hoverFill?: Color;
  pressedFill?: Color;
}

/** The `button` component. */
export interface ButtonComp extends Comp {
  id: 'button';
  text: string;
  width: number;
  height: number;
  renderArea(): Rect;
  setStyle(opt: Partial<ButtonCompOpt>): void;
}

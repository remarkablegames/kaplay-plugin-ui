import type { Color, Comp, Rect } from 'kaplay';

/** Color value accepted by the UI theme and components. */
export type UIColor = Color | string;

/** Options for a single button. */
export interface ButtonCompOpt {
  width?: number;
  height?: number;
  size?: number;
  font?: string;
  fill?: UIColor;
  textColor?: UIColor;
  radius?: number;
  hoverFill?: UIColor;
  pressedFill?: UIColor;
}

/** Theme tokens shared across UI components. */
export interface UITheme {
  palette?: {
    primary?: UIColor;
    secondary?: UIColor;
    background?: UIColor;
    surface?: UIColor;
    text?: UIColor;
    textSecondary?: UIColor;
    hover?: UIColor;
    pressed?: UIColor;
    disabled?: UIColor;
    error?: UIColor;
  };
  typography?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number | string;
    lineHeight?: number;
  };
  shape?: {
    borderRadius?: number;
  };
  spacing?: number;
  components?: {
    button?: {
      width?: number;
      height?: number;
      minWidth?: number;
      paddingX?: number;
      paddingY?: number;
      textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    };
    modal?: {
      backdropOpacity?: number;
      borderRadius?: number;
    };
    tooltip?: {
      background?: UIColor;
      textColor?: UIColor;
      delay?: number;
    };
  };
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

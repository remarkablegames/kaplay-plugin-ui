import type { Asset, Color, GameObj, SpriteData, Vec2 } from 'kaplay';

import type { createButton } from './button';
import type { createModal } from './modal';

type SpriteSource = string | SpriteData | Asset<SpriteData>;

declare module 'kaplay' {
  interface KAPLAYCtx {
    addButton: AddButton;
    addModal: AddModal;
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

export type AddModal = (opt?: ModalOpt) => ReturnType<typeof createModal>;

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
      minWidth: number;
      paddingX: number;
      paddingY: number;
      textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    };
    modal: {
      backdropOpacity: number;
      borderRadius: number;
      gap: number;
      maxWidth: number;
      minWidth: number;
      paddingX: number;
      paddingY: number;
    };
    tooltip: {
      background: string | Color;
      textColor: string | Color;
      delay: number;
    };
  };
}

/** Modal options. */
export interface ModalOpt {
  title?: string;
  text?: string;
  width?: number;
  height?: number;
  actions?: ModalAction[];
  /** Allow closing with the backdrop or Escape. Defaults to true. */
  dismissible?: boolean;
  /** Z index of the modal. Defaults to 1000. */
  z?: number;
}

/** Modal action. */
export interface ModalAction {
  text: string;
  /** Runs after the modal closes, unless `close` is false. */
  onClick?: () => void;
  /** Close the modal after the action. Defaults to true. */
  close?: boolean;
}

/** Button options. */
export interface ButtonOpt {
  width?: number;
  height?: number;
  /** Parent object to add the button to. Defaults to the scene root. */
  parent?: GameObj;
  size?: number;
  font?: string;
  fill?: string | Color;
  textColor?: string | Color;
  radius?: number;
  hoverFill?: string | Color;
  pressedFill?: string | Color;
  /** Sprite drawn beside the label. */
  icon?: SpriteSource;
  /** Sprite drawn beside the label on hover. */
  hoverIcon?: SpriteSource;
  /** Sprite drawn beside the label when pressed. */
  pressedIcon?: SpriteSource;
  /** Sprite drawn behind the label. */
  background?: SpriteSource;
  /** Sprite drawn behind the label on hover. */
  hoverBackground?: SpriteSource;
  /** Sprite drawn behind the label when pressed. */
  pressedBackground?: SpriteSource;
}

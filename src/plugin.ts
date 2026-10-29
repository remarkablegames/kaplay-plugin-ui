import type { Color, Comp, GameObj, KAPLAYCtx, Rect, Vec2 } from 'kaplay';

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

function resolveNumber(value: number | undefined, fallback: number): number {
  return value ?? fallback;
}

function createButtonComponent(
  k: KAPLAYCtx,
  theme: UITheme | undefined,
  text: string,
  opt: ButtonCompOpt,
): ButtonComp {
  let currentText = text;
  let currentOpt: ButtonCompOpt = { ...opt };

  const readWidth = (): number => {
    return (
      currentOpt.width ??
      theme?.components?.button?.width ??
      theme?.components?.button?.minWidth ??
      120
    );
  };

  const readHeight = (): number => {
    return currentOpt.height ?? theme?.components?.button?.height ?? 40;
  };

  const comp: ButtonComp = {
    id: 'button',
    get text() {
      return currentText;
    },
    set text(value: string) {
      currentText = value;
    },
    get width() {
      return readWidth();
    },
    set width(value: number) {
      currentOpt.width = value;
    },
    get height() {
      return readHeight();
    },
    set height(value: number) {
      currentOpt.height = value;
    },
    renderArea(): Rect {
      return new k.Rect(k.vec2(), comp.width, comp.height);
    },
    setStyle(next: Partial<ButtonCompOpt>): void {
      currentOpt = { ...currentOpt, ...next };
    },
    add(): void {
      // No-op: rendering is handled in draw().
    },
    draw(): void {
      const width = comp.width;
      const height = comp.height;
      const radius = resolveNumber(
        currentOpt.radius ?? theme?.shape?.borderRadius,
        0,
      );
      const fill =
        currentOpt.fill ?? theme?.palette?.primary ?? k.rgb(80, 160, 255);
      const textColor =
        currentOpt.textColor ?? theme?.palette?.text ?? k.rgb(255, 255, 255);
      const size = resolveNumber(
        currentOpt.size ?? theme?.typography?.fontSize,
        18,
      );
      const font = currentOpt.font ?? theme?.typography?.fontFamily;

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const drawRect = k.drawRect as unknown as
        ((opt: Record<string, unknown>) => void) | undefined;
      drawRect?.({
        pos: k.vec2(),
        width,
        height,
        color: fill,
        radius,
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const drawText = k.drawText as unknown as
        ((opt: Record<string, unknown>) => void) | undefined;
      drawText?.({
        text: currentText,
        pos: k.vec2(width / 2, height / 2),
        size,
        font,
        color: textColor,
        anchor: 'center',
      });
    },
    destroy(): void {
      // No resources to release.
    },
  };

  return comp;
}

function createButtonObject(
  k: KAPLAYCtx,
  theme: UITheme | undefined,
  text: string,
  opt: ButtonCompOpt & {
    pos?: Vec2;
    onClick?: () => void;
    color?: UIColor;
    hoverColor?: UIColor;
    pressedColor?: UIColor;
    textColor?: UIColor;
  },
): GameObj {
  const width = resolveNumber(
    opt.width ??
      theme?.components?.button?.width ??
      theme?.components?.button?.minWidth,
    120,
  );
  const height = resolveNumber(
    opt.height ?? theme?.components?.button?.height,
    40,
  );
  const radius = resolveNumber(opt.radius ?? theme?.shape?.borderRadius, 0);
  const baseColor =
    opt.color ?? opt.fill ?? theme?.palette?.primary ?? k.rgb(80, 160, 255);
  const hoverColor = opt.hoverColor ?? theme?.palette?.hover ?? baseColor;
  const pressedColor = opt.pressedColor ?? theme?.palette?.pressed ?? baseColor;
  const textColor =
    opt.textColor ?? theme?.palette?.text ?? k.rgb(255, 255, 255);
  const size = resolveNumber(opt.size ?? theme?.typography?.fontSize, 18);
  const font = opt.font ?? theme?.typography?.fontFamily;
  const pos = opt.pos ?? k.vec2();

  interface ButtonGameObj {
    add: (comps: unknown[]) => { text: string; textSize: number };
    onClick: (cb: () => void) => void;
    onHover: (cb: () => void) => void;
    onHoverEnd: (cb: () => void) => void;
    width: number;
    height: number;
    color: unknown;
    scale: { x: number; y: number };
    pos: { x: number; y: number };
    setSize: (w: number, h: number) => void;
    setButtonColor: (color: UIColor) => void;
    setButtonText: (value: string) => void;
    setButtonTextSize: (value: number) => void;
    setPosition: (x: number, y: number) => void;
  }

  const obj = k.add([
    k.rect(width, height, radius > 0 ? { radius } : undefined),
    k.pos(pos as never),
    k.area(),
    k.color(baseColor as never),
    k.anchor('center'),
  ]) as unknown as ButtonGameObj;

  const label = obj.add([
    k.text(text, { size, font }),
    k.color(textColor as never),
    k.anchor('center'),
  ]) as GameObj & { text: string; textSize: number };

  let currentText = text;
  let currentColor: UIColor = baseColor;

  obj.onClick(() => {
    obj.color = pressedColor;
    opt.onClick?.();
  });
  obj.onHover(() => {
    obj.color = hoverColor;
    obj.scale = k.vec2(1.05, 1.05);
  });
  obj.onHoverEnd(() => {
    obj.color = currentColor;
    obj.scale = k.vec2(1, 1);
  });

  obj.setSize = (w: number, h: number): void => {
    obj.width = w;
    obj.height = h;
  };

  obj.setButtonColor = (color: UIColor): void => {
    currentColor = color;
    obj.color = color;
  };

  obj.setButtonText = (value: string): void => {
    currentText = value;
    label.text = value;
  };

  obj.setButtonTextSize = (value: number): void => {
    label.textSize = value;
  };

  obj.setPosition = (x: number, y: number): void => {
    obj.pos = k.vec2(x, y);
  };

  // Keep an initial label text in sync.
  label.text = currentText;

  return obj as unknown as GameObj;
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

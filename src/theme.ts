import type { DeepPartial, Theme } from './types';

const DEFAULT_PRIMARY = '#4f8cff';
const DEFAULT_TEXT = '#ffffff';

/** Default theme used when no theme is provided. */
export const defaultTheme: Theme = {
  palette: {
    primary: DEFAULT_PRIMARY,
    secondary: DEFAULT_PRIMARY,
    background: '#111827',
    surface: '#1f2937',
    text: DEFAULT_TEXT,
    textSecondary: DEFAULT_TEXT,
    hover: DEFAULT_PRIMARY,
    pressed: DEFAULT_PRIMARY,
    disabled: '#6b7280',
    error: '#ef4444',
  },
  typography: {
    fontFamily: 'sans-serif',
    fontSize: 18,
    fontWeight: 400,
    lineHeight: 1.2,
  },
  shape: {
    borderRadius: 0,
  },
  spacing: 8,
  components: {
    button: {
      width: 120,
      height: 40,
      minWidth: 120,
      paddingX: 12,
      paddingY: 8,
      textTransform: 'none',
    },
    modal: {
      backdropOpacity: 0.5,
      borderRadius: 8,
    },
    tooltip: {
      background: '#111827',
      textColor: DEFAULT_TEXT,
      delay: 300,
    },
  },
};

/** Resolve a partial theme into a fully resolved theme. */
export function resolveTheme(input?: DeepPartial<Theme>): Theme {
  return {
    palette: { ...defaultTheme.palette, ...input?.palette },
    typography: { ...defaultTheme.typography, ...input?.typography },
    shape: { ...defaultTheme.shape, ...input?.shape },
    spacing: input?.spacing ?? defaultTheme.spacing,
    components: {
      button: {
        ...defaultTheme.components.button,
        ...input?.components?.button,
        width:
          input?.components?.button?.width ??
          input?.components?.button?.minWidth ??
          defaultTheme.components.button.width,
      },
      modal: {
        ...defaultTheme.components.modal,
        ...input?.components?.modal,
      },
      tooltip: {
        ...defaultTheme.components.tooltip,
        ...input?.components?.tooltip,
      },
    },
  };
}

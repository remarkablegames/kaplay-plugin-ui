import type { DeepPartial, Theme } from './types';

const PRIMARY = '#4f8cff';
const TEXT = '#ffffff';

/** Default theme. */
const theme: Theme = {
  palette: {
    primary: PRIMARY,
    secondary: PRIMARY,
    background: '#111827',
    surface: '#1f2937',
    text: TEXT,
    textSecondary: TEXT,
    hover: PRIMARY,
    pressed: PRIMARY,
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
      textColor: TEXT,
      delay: 300,
    },
  },
};

/** Resolve a partial theme into a fully resolved theme. */
export function resolveTheme(input?: DeepPartial<Theme>): Theme {
  return {
    palette: { ...theme.palette, ...input?.palette },
    typography: { ...theme.typography, ...input?.typography },
    shape: { ...theme.shape, ...input?.shape },
    spacing: input?.spacing ?? theme.spacing,
    components: {
      button: {
        ...theme.components.button,
        ...input?.components?.button,
        width:
          input?.components?.button?.width ??
          input?.components?.button?.minWidth ??
          theme.components.button.width,
      },
      modal: {
        ...theme.components.modal,
        ...input?.components?.modal,
      },
      tooltip: {
        ...theme.components.tooltip,
        ...input?.components?.tooltip,
      },
    },
  };
}

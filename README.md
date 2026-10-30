# kaplay-plugin-ui

[![NPM](https://nodei.co/npm/kaplay-plugin-ui.svg)](https://www.npmjs.com/package/kaplay-plugin-ui)

[![NPM version](https://img.shields.io/npm/v/kaplay-plugin-ui.svg)](https://www.npmjs.com/package/kaplay-plugin-ui)
[![build](https://github.com/remarkablegames/kaplay-plugin-ui/actions/workflows/build.yml/badge.svg)](https://github.com/remarkablegames/kaplay-plugin-ui/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/remarkablegames/kaplay-plugin-ui/graph/badge.svg?token=54qf1pKjqI)](https://codecov.io/gh/remarkablegames/kaplay-plugin-ui)

🦖 KAPLAY plugin UI:

- `addButton(text?, opt?)`: button game object
- `button(text?, opt?)`: button component (use in `add([button(...)])`)
- `setTheme(theme)`: update theme

## Prerequisites

Install [kaplay](https://www.npmjs.com/package/kaplay):

```sh
npm install kaplay
```

## Install

[NPM](https://www.npmjs.com/package/kaplay-plugin-ui):

```sh
npm install kaplay-plugin-ui
```

[CDN](https://unpkg.com/browse/kaplay-plugin-ui/):

```html
<script src="https://unpkg.com/kaplay-plugin-ui@latest/dist/plugin.umd.js"></script>
```

## Usage

Import the plugin:

```ts
import kaplay from 'kaplay';
import { uiPlugin } from 'kaplay-plugin-ui';

const k = kaplay({
  plugins: [uiPlugin],
});
```

Use the plugin:

```ts
const button = k.addButton('Start', {
  onClick: () => {
    k.go('game');
  },
});
```

Customize the theme:

```ts
k.setTheme({
  palette: {
    primary: k.rgb(80, 160, 255),
    text: k.rgb(255, 255, 255),
  },
  shape: {
    borderRadius: 8,
  },
});
```

To load the plugin using a script:

```html
<script src="https://unpkg.com/kaplay@latest/dist/kaplay.js"></script>
<script src="https://unpkg.com/kaplay-plugin-ui@latest/dist/plugin.umd.js"></script>

<script>
  const k = kaplay({
    plugins: [KaplayPluginUI.uiPlugin],
  });

  const button = k.addButton('Start');
</script>
```

## Release

Release is automated with [Release Please](https://github.com/googleapis/release-please).

## License

[MIT](https://github.com/remarkablegames/kaplay-plugin-ui/blob/master/LICENSE)

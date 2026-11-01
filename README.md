# kaplay-plugin-ui

[![NPM](https://nodei.co/npm/kaplay-plugin-ui.svg)](https://www.npmjs.com/package/kaplay-plugin-ui)

[![NPM version](https://img.shields.io/npm/v/kaplay-plugin-ui.svg)](https://www.npmjs.com/package/kaplay-plugin-ui)
[![build](https://github.com/remarkablegames/kaplay-plugin-ui/actions/workflows/build.yml/badge.svg)](https://github.com/remarkablegames/kaplay-plugin-ui/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/remarkablegames/kaplay-plugin-ui/graph/badge.svg?token=54qf1pKjqI)](https://codecov.io/gh/remarkablegames/kaplay-plugin-ui)

🦖 KAPLAY plugin UI (see [API](#api)):

- [addButton](#addButton)
- [getTheme](#getTheme)
- [setTheme](#setTheme)

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

Import the plugin's global TypeScript definitions:

```ts
import 'kaplay-plugin-ui/global';
```

Load the plugin using a script:

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

Use the plugin:

```ts
k.setTheme({
  shape: {
    borderRadius: 8,
  },
});

k.addButton('Start', {
  onClick: () => {
    k.go('game');
  },
});
```

## API

### addButton

Add a text button:

```ts
addButton(text, opt);
```

Buttons auto-size to their content. Width uses `components.button.paddingX` and `components.button.minWidth`; height uses `components.button.paddingY`. Pass `width` or `height` to override either dimension.

Add an icon button with text:

```ts
addButton('Play', {
  icon: 'play',
});
```

Add an icon-only button:

```ts
addButton('', {
  icon: 'play',
  hoverIcon: 'play-hover',
  pressedIcon: 'play-pressed',
});
```

Add an image button with text:

```ts
addButton('Play', {
  background: 'panel',
});
```

Add an image-only button:

```ts
addButton('', {
  background: 'panel',
  hoverBackground: 'panel-hover',
  pressedBackground: 'panel-pressed',
});
```

Icons use the theme's `spacing` as the gap between the icon and label. Icon-only and background-image buttons have a transparent background. Text is centered over a background image, which stretches to fit the button.

Update the button text:

```ts
const button = addButton('Text');
button.label.text = 'New Text';
```

The button resizes automatically when the label, icon, or background image dimensions change.

Add a button to a container with `parent`:

```ts
addButton('Extra', {
  parent: modal.actions,
});
```

### getTheme

Retrieve theme:

```ts
getTheme();
```

### setTheme

Customize theme:

```ts
setTheme({
  palette: {
    primary: rgb(80, 160, 255),
    text: rgb(255, 255, 255),
  },
  shape: {
    borderRadius: 8,
  },
});
```

## Release

Release is automated with [Release Please](https://github.com/googleapis/release-please).

## License

[MIT](https://github.com/remarkablegames/kaplay-plugin-ui/blob/master/LICENSE)

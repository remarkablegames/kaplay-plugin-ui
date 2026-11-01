# kaplay-plugin-ui

[![NPM](https://nodei.co/npm/kaplay-plugin-ui.svg)](https://www.npmjs.com/package/kaplay-plugin-ui)

[![NPM version](https://img.shields.io/npm/v/kaplay-plugin-ui.svg)](https://www.npmjs.com/package/kaplay-plugin-ui)
[![build](https://github.com/remarkablegames/kaplay-plugin-ui/actions/workflows/build.yml/badge.svg)](https://github.com/remarkablegames/kaplay-plugin-ui/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/remarkablegames/kaplay-plugin-ui/graph/badge.svg?token=54qf1pKjqI)](https://codecov.io/gh/remarkablegames/kaplay-plugin-ui)

🦖 KAPLAY plugin UI (see [API](#api)):

- [addButton](#addButton)
- [addModal](#addModal)
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

### addModal

Add a modal dialog:

```ts
addModal(opt);
```

```ts
addModal({
  title: 'Pause',
  text: 'Take a break?',
  actions: [{ text: 'Resume' }, { text: 'Quit', onClick: () => go('menu') }],
});
```

The modal opens immediately. It blocks the scene by pausing every object outside the modal while it's open, and restores each object's previous paused state when the modal closes. Opening another modal pauses the one below it, so only the topmost modal responds to dismissal.

Modals auto-size to their title, text, and actions. Text wraps at `components.modal.maxWidth` minus horizontal padding. Pass `width` or `height` to override either dimension.

Actions close the modal by default before calling `onClick`. Set `close: false` to keep it open:

```ts
addModal({
  text: 'Saved.',
  actions: [{ text: 'OK', close: false }],
});
```

Dismiss with the backdrop or <kbd>Esc</kbd> by default. Disable dismissal with `dismissible: false`:

```ts
addModal({
  text: 'Choose an option.',
  dismissible: false,
  actions: [{ text: 'Continue' }],
});
```

Pass `z` to change the stacking order. The default is `1000`.

Add custom content to the returned `content` container:

```ts
const modal = addModal({ title: 'Options' });

modal.content.add([text('Custom content', { size: 16 }), pos(0, 40)]);
```

Attach extra buttons to `modal.actions`:

```ts
addButton('Help', { parent: modal.actions });
```

Close a modal by destroying it:

```ts
modal.destroy();
```

Use `modal.exists()` to check whether it is still open.

> [!NOTE]
> Pausing stops updates and object-level input events on scene objects. Global handlers registered with `onUpdate`, `onKeyPress`, or `onMousePress` still run while a modal is open. Guard those handlers if you don't want them to fire behind a modal.

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

import '../global';

import kaplay from 'kaplay';

import { uiPlugin } from '../src/plugin';

const k = kaplay({
  plugins: [uiPlugin],
});

k.addButton('Button', {
  pos: k.vec2(100),
  onClick: () => {
    k.debug.log('Button clicked');
  },
});

setTheme({
  palette: {
    primary: k.rgb(80, 160, 255),
    text: k.rgb(255, 255, 255),
  },
  shape: {
    borderRadius: 8,
  },
});

// eslint-disable-next-line no-console
console.log('theme:', getTheme());

const themedButton = addButton('Button', {
  pos: k.vec2(200),
  onClick: () => {
    themedButton.label.text = 'Themed Button Clicked';
  },
});

themedButton.label.text = 'Themed Button';

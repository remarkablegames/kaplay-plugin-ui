/// <reference types="vite/client" />

import '../global';

import kaplay from 'kaplay';

import { uiPlugin } from '../src/plugin';
import buttonImage from './button.png';

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
  pos: k.vec2(150, 150),
  onClick: () => {
    themedButton.label.text = 'Themed Button Clicked';
  },
});

themedButton.label.text = 'Themed Button';

k.loadSprite('buttonImage', buttonImage);

addButton('Icon Button', {
  pos: k.vec2(400, 300),
  color: '#333333',
  icon: 'buttonImage',
});

addButton('Image Button', {
  pos: k.vec2(300, 500),
  background: 'buttonImage',
});

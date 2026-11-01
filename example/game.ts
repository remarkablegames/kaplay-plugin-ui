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

const customButton = addButton('Button', {
  pos: k.vec2(150, 150),
  onClick: () => {
    k.debug.log('Disabled Custom Button');
    customButton.disabled = true;
  },
});

customButton.label.text = 'Custom Button';

k.loadSprite('buttonImage', buttonImage);

const iconButton = addButton('Icon Button', {
  pos: k.vec2(400, 275),
  color: '#333333',
  icon: 'buttonImage',
  onClick: () => {
    iconButton.destroy();
  },
});

addButton('Image Button', {
  pos: k.vec2(300, 450),
  background: 'buttonImage',
});

addButton('Modal', {
  pos: k.vec2(100, 550),
  onClick: () => {
    k.debug.log('Modal clicked');

    addModal({
      title: 'Pause',
      text: 'Take a break?',
      actions: [
        { text: 'Resume' },
        {
          text: 'Quit',
          onClick: () => {
            k.debug.log('Quit clicked');
          },
        },
      ],
    });
  },
});

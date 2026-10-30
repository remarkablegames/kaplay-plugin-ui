import kaplay from 'kaplay';

import { uiPlugin } from '../src/plugin';

const k = kaplay({
  plugins: [uiPlugin],
});

k.addButton('Start', {
  pos: k.vec2(100),
  onClick: () => {
    k.debug.log('clicked');
  },
});

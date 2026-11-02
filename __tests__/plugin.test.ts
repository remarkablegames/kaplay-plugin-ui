import { uiPlugin } from '../src/plugin';
import { makeK } from './mocks';

describe('uiPlugin', () => {
  it('registers button helpers', () => {
    const { k } = makeK();
    const result = uiPlugin(k);
    expect(result.addButton).toBeTypeOf('function');
    expect(result.addModal).toBeTypeOf('function');
    expect(result.addTooltip).toBeTypeOf('function');
    expect(result.setTheme).toBeTypeOf('function');
    expect(result.getTheme).toBeTypeOf('function');
  });

  it('returns current theme', () => {
    const { k } = makeK();
    const ui = uiPlugin(k);
    ui.setTheme({ spacing: 8 });
    expect(ui.getTheme()).toMatchObject({ spacing: 8 });
  });
});

import { uiPlugin } from './dist/plugin.cjs';

type Plugin = ReturnType<typeof uiPlugin>;

declare global {
  /**
   * Add a button.
   *
   * @param text - The button text.
   * @param opt - The button options.
   *
   * @example
   * ```js
   * addButton('Start', {
   *   onClick: () => {
   *     go('game');
   *   },
   * });
   * ```
   *
   * @returns The button object.
   */
  var addButton: Plugin['addButton'];

  /**
   * Add a modal dialog.
   *
   * @param opt - The modal options.
   *
   * @example
   * ```js
   * const modal = addModal({
   *   title: 'Pause',
   *   text: 'Take a break?',
   *   actions: [
   *     { text: 'Resume' },
   *     { text: 'Quit', onClick: () => go('menu') },
   *   ],
   * });
   *
   * modal.destroy();
   * ```
   *
   * @returns The modal object with `content` and `actions`.
   */
  var addModal: Plugin['addModal'];

  /**
   * Retrieve the theme.
   *
   * @example
   * ```js
   * getTheme();
   * ```
   *
   * @returns The theme config.
   */
  var getTheme: Plugin['getTheme'];

  /**
   * Customize the theme.
   *
   * @param theme - The partial theme overrides.
   *
   * @example
   * ```js
   * setTheme({
   *   palette: {
   *     primary: rgb(80, 160, 255),
   *     text: rgb(255, 255, 255),
   *   },
   *   shape: {
   *     borderRadius: 8,
   *   },
   * });
   * ```
   */
  var setTheme: Plugin['setTheme'];
}

export {};

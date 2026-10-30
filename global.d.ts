import type { UIPlugin } from './dist/plugin.cjs';

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
  var addButton: UIPlugin['addButton'];

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
  var getTheme: UIPlugin['getTheme'];

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
  var setTheme: UIPlugin['setTheme'];
}

export {};

import { readFileSync } from "node:fs";
import path from "node:path";

import type { selectors } from "playwright-core";

const selectorEngine = (fileName: string): SelectorEngine => ({
  // https://github.com/microsoft/playwright/issues/36448
  content: `(() => {
        const module = {exports: {}};
        
        ${
          // oxlint-disable-next-line node/no-sync -- fixing this would be a breaking change to the API
          readFileSync(path.join(__dirname, `../../dist/browser/${fileName}.js`), "utf8")
        };
        return module.exports.default
    })()`,
});

// eslint-disable import/exports-last -- can't put all exports at the end due to the deprecation, see comment below

export type SelectorEngine = Parameters<typeof selectors.register>[1];

export const css = selectorEngine("css");
export const xpath = selectorEngine("xpath");

// eslint-enable import/exports-last

/**
 * @deprecated the default import is deprecated. explicitly import either the css or xpath selector
 *   engine instead
 */
const cssSelectorEngine = css;

// eslint-disable-next-line typescript/no-deprecated -- unfortunately you can't declare and export a default const in the same line
export default cssSelectorEngine;

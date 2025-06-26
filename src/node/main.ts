import { readFileSync } from 'fs'
import { join } from 'path'
import type { selectors } from 'playwright-core'

export type SelectorEngine = Parameters<typeof selectors.register>[1]

const selectorEngine = (fileName: string): SelectorEngine => ({
    // https://github.com/microsoft/playwright/issues/16705
    content: `(() => {${readFileSync(
        join(__dirname, `../../dist/browser/${fileName}.js`),
        'utf8',
    )};return module.exports.default})()`,
})

export const css = selectorEngine('css')
export const xpath = selectorEngine('xpath')

/** @deprecated the default import is deprecated. explicitly import either the css or xpath selector engine instead */
const cssSelectorEngine = css
// eslint-disable-next-line detachhead/suggestions-as-errors -- deprecated usage, unfortunately you can't declare and export a default const in the same line
export default cssSelectorEngine

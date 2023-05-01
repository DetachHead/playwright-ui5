import { readFileSync } from 'fs'
import { join } from 'path'
import { selectors } from 'playwright'

export type SelectorEngine = Parameters<typeof selectors.register>[1]

const selectorEngine: SelectorEngine = {
    // https://github.com/microsoft/playwright/issues/16705
    content: `(() => {${readFileSync(
        join(__dirname, '../../dist/browser/main.js'),
        'utf8',
    )};return module.exports.default})()`,
}

export default selectorEngine

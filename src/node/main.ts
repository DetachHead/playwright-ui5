import { readFileSync } from 'fs'
import { join } from 'path'
import { selectors } from 'playwright'

const selectorEngine: Parameters<typeof selectors.register>[1] = {
    // https://github.com/microsoft/playwright/issues/16705
    content: `(() => {${readFileSync(
        join(__dirname, '../browser/main.js'),
        'utf8',
    )};return module.exports.default})()`,
}

export default selectorEngine

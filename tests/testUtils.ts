import { SelectorEngine } from '../src/node/main'
import { Page, selectors } from '@playwright/test'
import { throwIfUndefined } from 'throw-expression'

export const navigateToUi5DocsPage = (page: Page, path: `/${string}`) =>
    page.goto(`https://ui5.sap.com/1.112.3${path}`, { waitUntil: 'networkidle' })

export const navigateToControlSample = (page: Page, lib: string, sampleId: string) =>
    navigateToUi5DocsPage(
        page,
        `/resources/sap/ui/documentation/sdk/index.html?sap-ui-xx-sample-id=${sampleId}&sap-ui-xx-sample-lib=${lib}&sap-ui-xx-sample-origin=.&sap-ui-xx-dk-origin=https://ui5.sap.com`,
    )

export const registerSelectorEngine = async (name: string) =>
    selectors.register(
        `ui5_${name}`,
        // need dynamic import, otherwise it could import outdated code:
        throwIfUndefined(
            ((await import('../dist/node/main')) as Record<string, SelectorEngine>)[name],
            `invalid selector engine name: ${name}`,
        ),
    )

/**
 *  fixes this stupid shit in playwright where the default timeout is infinite when running with a debugger
 * @see https://github.com/microsoft/playwright/issues/10312
 */
export const fixDefaultTimeout = (page: Page) => {
    const defaultTimeout = 30000
    page.setDefaultTimeout(defaultTimeout)
    page.setDefaultNavigationTimeout(defaultTimeout)
}

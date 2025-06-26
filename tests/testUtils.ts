import { SelectorEngine } from '../src/node/main'
import { Page, selectors } from '@playwright/test'
import { throwIfUndefined } from 'throw-expression'

type SelectorEngineName = 'css' | 'xpath'

export class Ui5Tester {
    selectorEngineId: `ui5_${SelectorEngineName}`

    constructor(private selectorEngineName: SelectorEngineName) {
        this.selectorEngineId = `ui5_${selectorEngineName}`
    }
    navigateToUi5DocsPage = async (page: Page, path: `/${string}`) => {
        await page.goto(`https://ui5.sap.com/1.125.1${path}`)
        await page.waitForSelector(
            `${this.selectorEngineId}=${
                this.selectorEngineName === 'css' ? '*' : '//*'
            } >> visible=true`,
        )
    }

    navigateToControlSample = (page: Page, lib: string, sampleId: string) =>
        this.navigateToUi5DocsPage(
            page,
            `/resources/sap/ui/documentation/sdk/index.html?sap-ui-xx-sample-id=${sampleId}&sap-ui-xx-sample-lib=${lib}&sap-ui-xx-sample-origin=.&sap-ui-xx-dk-origin=https%3A%2F%2Fui5.sap.com&sap-ui-theme=sap_horizon_dark&sap-ui-rtl=false&sap-ui-density=sapUiSizeCompact`,
        )

    registerSelectorEngine = async () =>
        selectors.register(
            this.selectorEngineId,
            // need dynamic import, otherwise it could import outdated code:
            throwIfUndefined(
                ((await import('../dist/node/main.js')) as Record<string, SelectorEngine>)[
                    this.selectorEngineName
                ],
                `invalid selector engine name: ${this.selectorEngineName}`,
            ),
        )
}

/**
 *  fixes this stupid shit in playwright where the default timeout is infinite when running with a debugger
 * @see https://github.com/microsoft/playwright/issues/10312
 */
export const fixDefaultTimeout = (page: Page) => {
    const defaultTimeout = 30000
    page.setDefaultTimeout(defaultTimeout)
    page.setDefaultNavigationTimeout(defaultTimeout)
}

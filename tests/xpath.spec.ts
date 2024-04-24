import { fixDefaultTimeout, navigateToControlSample, registerSelectorEngine } from './testUtils'
import { expect, test } from '@playwright/test'
import { escapeRegExp } from 'lodash'

test.beforeAll(() => registerSelectorEngine('xpath'))
test.beforeEach(({ page }) => fixDefaultTimeout(page))

test.describe('ui5 site - button', () => {
    test.beforeEach(({ page }) => navigateToControlSample(page, 'sap.m', 'sap.m.sample.Button'))
    test.describe('any control', () => {
        test('*', async ({ page }) => expect(page.locator('ui5_xpath=//*')).toHaveCount(43))
        test('id', ({ page }) =>
            expect(page.locator('ui5_xpath=//*[@id="__button1"]')).toHaveCount(1))
        test('property', async ({ page }) =>
            expect(page.locator('ui5_xpath=//*[not(ui5:property(., "text")="")]')).toHaveCount(21))
    })
    test('interaction', async ({ page }) => {
        await page.click('ui5_xpath=//sap.m.Button[ui5:property(.,"text")="Accept"]')
        await expect(page.getByText('__button6 Pressed')).toBeVisible()
    })
    test('not found', ({ page }) => expect(page.locator('ui5_xpath=//sap.m.asdf')).toHaveCount(0))
    test('includes the selector in the error message', async ({ page }) => {
        // ideally we shouldn't need the site here, but fontoxpath needs to build the xml from ui5 before it can validate the xpath
        await navigateToControlSample(page, 'sap.m', 'sap.m.sample.Button')
        const selector = '\\%(&*)^%*)[asdf'
        await expect(page.locator(`ui5_xpath=${selector}`).isVisible()).rejects.toThrow(
            new RegExp(`selector: "${escapeRegExp(selector)}"`, 'u'),
        )
    })
})

test.describe('no ui5 site', () => {
    test.describe('page has no ui5', () => {
        test('no global sap object', async ({ page }) => {
            await page.setContent('<div></div>')
            await expect(page.locator('ui5_xpath=//sap.m.Button')).toHaveCount(0)
        })
        test('no sap.ui object', async ({ page }) => {
            await page.setContent('<div></div>')
            await page.evaluate(() => {
                // @ts-expect-error https://github.com/microsoft/TypeScript/issues/43434
                window.sap = {}
            })
            await expect(page.locator('ui5_xpath=//sap.m.Button')).toHaveCount(0)
        })
    })
})

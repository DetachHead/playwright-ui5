import { Ui5Tester, fixDefaultTimeout } from './testUtils'
import { expect, test } from '@playwright/test'
import { escapeRegExp } from 'lodash'

const ui5Tester = new Ui5Tester('xpath')

test.beforeAll(() => ui5Tester.registerSelectorEngine())
test.beforeEach(({ page }) => fixDefaultTimeout(page))

test.describe('ui5 site', () => {
    test.describe('control samples', () => {
        test.beforeEach(({ page }) =>
            ui5Tester.navigateToControlSample(page, 'sap.m', 'sap.m.sample.Button'),
        )
        test.describe('any control', () => {
            test('*', ({ page }) => expect(page.locator('ui5_xpath=//*')).toHaveCount(43))
            test('id', ({ page }) =>
                expect(page.locator('ui5_xpath=//*[@id="__button1"]')).toHaveCount(1))
            test.describe('ui5:property function', () => {})
            test('nullish property', ({ page }) =>
                expect(page.locator('ui5_xpath=//*[ui5:property(., "text")]')).toHaveCount(21))
            test.describe('boolean property', () => {
                test('true', ({ page }) =>
                    expect(
                        page.locator('ui5_xpath=//sap.m.Button[ui5:property(., "enabled")]'),
                    ).toHaveCount(11))
                test('false', async ({ page }) => {
                    const button = page.locator(
                        'ui5_xpath=//sap.m.Button[not(ui5:property(., "enabled"))]',
                    )
                    await expect(button).toHaveCount(1)
                    await expect(button).toHaveId('__button8')
                })
            })
            test('number property', ({ page }) =>
                expect(
                    page.locator(
                        'ui5_xpath=//sap.m.Button[@id="__button2" and ui5:property(.,"busyIndicatorDelay")=1000]',
                    ),
                ).toHaveCount(1))
        })
        test('interaction', async ({ page }) => {
            await page.click('ui5_xpath=//sap.m.Button[ui5:property(.,"text")="Accept"]')
            await expect(page.getByText('__button6 Pressed')).toBeVisible()
        })
        test('not found', ({ page }) =>
            expect(page.locator('ui5_xpath=//sap.m.asdf')).toHaveCount(0))
        test('includes the selector in the error message', async ({ page }) => {
            // ideally we shouldn't need the site here, but fontoxpath needs to build the xml from ui5 before it can validate the xpath
            await ui5Tester.navigateToControlSample(page, 'sap.m', 'sap.m.sample.Button')
            const selector = '\\%(&*)^%*)[asdf'
            await expect(page.locator(`ui5_xpath=${selector}`).isVisible()).rejects.toThrow(
                new RegExp(`selector: "${escapeRegExp(selector)}"`, 'u'),
            )
        })
        test('debug-xml function', async ({ page }) => {
            await page.locator('ui5_xpath=//*').first().waitFor()
            await expect(page.locator('ui5_xpath=ui5:debug-xml(/*)').isVisible()).rejects.toThrow(
                new RegExp(escapeRegExp('<sap.ui.core.ComponentContainer id="__container0">'), 'u'),
            )
        })
        test('root element', async ({ page }) => {
            await expect(page.locator('ui5_xpath=/root')).toHaveCount(0) // doesn't match anything because it's not a real ui5 element
            await expect(page.locator('ui5_xpath=/root/*')).toHaveCount(1)
        })
        test.describe('concatenated with other locators', () => {
            test('child', ({ page }) =>
                expect(page.locator('#__toolbar2').locator('ui5_xpath=./*')).toHaveCount(4))
            test('following-sibling', ({ page }) =>
                expect(
                    page.locator('#__toolbar0').locator('ui5_xpath=./following-sibling::*').first(),
                ).toHaveAttribute('id', '__toolbar1'))
        })
    })
    test.describe('demo apps', () => {
        test('multiple root nodes', async ({ page }) => {
            await ui5Tester.navigateToUi5DocsPage(
                page,
                '/test-resources/sap/m/demokit/cart/webapp/index.html?sap-ui-theme=sap_horizon_dark',
            )
            await expect(
                page.locator(
                    'ui5_xpath=//sap.m.List[@id="container-cart---homeView--categoryList"]',
                ),
            ).toBeVisible()
        })
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

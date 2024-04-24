import { fixDefaultTimeout, navigateToControlSample, registerSelectorEngine } from './testUtils'
import { expect, test } from '@playwright/test'
import { escapeRegExp } from 'lodash'

test.beforeAll(() => registerSelectorEngine('css'))
test.beforeEach(({ page }) => fixDefaultTimeout(page))

test.describe('ui5 site - button', () => {
    test.beforeEach(({ page }) => navigateToControlSample(page, 'sap.m', 'sap.m.sample.Button'))
    test.describe('any control', () => {
        test('*', ({ page }) => expect(page.locator('ui5_css=*')).toHaveCount(45))
        test('id', ({ page }) => expect(page.locator('ui5_css=#__button1')).toHaveCount(1))
        test('property', ({ page }) => expect(page.locator('ui5_css=[text]')).toHaveCount(25))
    })

    test.describe('implicit "sap." namespace', () => {
        test('exists', ({ page }) => expect(page.locator('ui5_css=m.Button')).toHaveCount(12))
        test("doesn't exist", ({ page }) => expect(page.locator('ui5_css=m.Table')).toHaveCount(0))
    })

    test.describe('control without property', () => {
        test('exists', ({ page }) => expect(page.locator('ui5_css=sap.m.Button')).toHaveCount(12))
        test("doesn't exist", ({ page }) =>
            expect(page.locator('ui5_css=sap.m.Table')).toHaveCount(0))
    })
    test.describe('control with id', () => {
        test('exists', ({ page }) =>
            expect(page.locator('ui5_css=sap.m.Button#__button1')).toHaveCount(1))
        test("doesn't exist", ({ page }) =>
            expect(page.locator('ui5_css=sap.m.Button#asdfasdf')).toHaveCount(0))
    })

    test.describe('control with property exists', () => {
        test('exists', ({ page }) =>
            expect(page.locator('ui5_css=sap.m.Button[text]')).toHaveCount(12))
        test("doesn't exist", ({ page }) =>
            expect(page.locator('ui5_css=sap.m.Button[asdf]')).toHaveCount(0))
    })
    test.describe('control with property =', () => {
        test('exists', ({ page }) =>
            expect(page.locator("ui5_css=sap.m.Button[text='Accept']")).toHaveCount(1))
        test("doesn't exist", ({ page }) =>
            expect(page.locator("ui5_css=sap.m.Button[text='asdfasdf']")).toHaveCount(0))
    })
    test.describe('control with property ^=', () => {
        test('exists', ({ page }) =>
            expect(page.locator("ui5_css=sap.m.Button[text^='Acc']")).toHaveCount(1))
        test("doesn't exist", ({ page }) =>
            expect(page.locator("ui5_css=sap.m.Button[text^='asdfasdf']")).toHaveCount(0))
    })
    test.describe('control with property $=', () => {
        test('exists', ({ page }) =>
            expect(page.locator("ui5_css=sap.m.Button[text$='ept']")).toHaveCount(1))
        test("doesn't exist", ({ page }) =>
            expect(page.locator("ui5_css=sap.m.Button[text$='asdfasdf']")).toHaveCount(0))
    })
    test.describe('control with property *=', () => {
        test('exists', ({ page }) =>
            expect(page.locator("ui5_css=sap.m.Button[text*='ccep']")).toHaveCount(1))
        test("doesn't exist", ({ page }) =>
            expect(page.locator("ui5_css=sap.m.Button[text*='asdfasdf']")).toHaveCount(0))
    })
    test.describe('control with multiple properties', () => {
        test('exists', ({ page }) =>
            expect(page.locator("ui5_css=sap.m.Button[text='Accept'][busy='false']")).toHaveCount(
                1,
            ))
        test("doesn't exist", ({ page }) =>
            expect(page.locator("ui5_css=sap.m.Button[text='Accept'][busy='true']")).toHaveCount(0))
    })
    test.describe('nested selectors', () => {
        test('exists', ({ page }) =>
            expect(
                page.locator("ui5_css=m.HBox >> ui5_css=sap.m.Button[text='Default']"),
            ).toHaveCount(1))
        test("doesn't exist", ({ page }) =>
            expect(
                page.locator("ui5_css=m.HBox >> ui5_css=m.Button[text='Emphasized']"),
            ).toHaveCount(0))
    })
    test.describe(':has', () => {
        test('exists', ({ page }) =>
            expect(page.locator("ui5_css=m.Toolbar:has(m.Button[text='Reject'])")).toHaveCount(1))
        test("doesn't exist", ({ page }) =>
            expect(page.locator('ui5_css=m.Toolbar:has(m.Toolbar)')).toHaveCount(0))
    })
    test.describe('comma-separated rules', () => {
        test('exists', ({ page }) =>
            expect(
                page.locator("ui5_css=m.Button[text='Accept'],m.Button[text='Emphasized']"),
            ).toHaveCount(2))
        test("doesn't exist", ({ page }) =>
            expect(
                page.locator("ui5_css=m.Button[text='asdf'],m.Button[text='asdfsdfg']"),
            ).toHaveCount(0))
    })
    test.describe('control with subclass', () => {
        test.describe('exists', () => {
            test('subclass', ({ page }) =>
                expect(page.locator('ui5_css=sap.m.FlexBox::subclass')).toHaveCount(1))
            test('same class', ({ page }) =>
                expect(page.locator('ui5_css=sap.m.HBox::subclass')).toHaveCount(1))
        })
        test.describe("doesn't exist", () => {
            test('no control with type', ({ page }) =>
                expect(page.locator('ui5_css=sap.m.DateTimeField::subclass')).toHaveCount(0))
            test('control exists with type but not using subclass', ({ page }) =>
                expect(page.locator('ui5_css=sap.m.FlexBox')).toHaveCount(0))
        })
    })
})

test('~', async ({ page }) => {
    await navigateToControlSample(page, 'sap.m', 'sap.m.sample.InputAssisted')
    // on webkit clicking it brings up a popup with a second input box
    const control = page.locator('ui5_css=sap.m.Input').last()
    // need to click and use keyboard because on webkit the input field is readonly
    await control.click()
    // focus the second one
    await control.click()
    const element = control.locator('input')
    await element.fill('asdf ')
    await element.blur()
    await expect(control.and(page.locator("ui5_css=[value~='asdf']"))).toBeVisible()
})

test.describe('no ui5 site', () => {
    test.describe('page has no ui5', () => {
        test('no global sap object', async ({ page }) => {
            await page.setContent('<div></div>')
            await expect(page.locator('ui5_css=m.Button')).toHaveCount(0)
        })
        test('no sap.ui object', async ({ page }) => {
            await page.setContent('<div></div>')
            await page.evaluate(() => {
                // @ts-expect-error https://github.com/microsoft/TypeScript/issues/43434
                window.sap = {}
            })
            await expect(page.locator('ui5_css=m.Button')).toHaveCount(0)
        })
    })
    test.describe('unsupported syntax', () => {
        test('comparitors', ({ page }) =>
            expect(page.locator('ui5_css=m.Table > m.Button').isVisible()).rejects.toThrow(
                /Expected rule but ">" found/u,
            ))
        test('includes the selector in the error message', async ({ page }) => {
            const selector = '[asdf'
            await expect(page.locator(`ui5_css=${selector}`).isVisible()).rejects.toThrow(
                new RegExp(`selector: "${escapeRegExp(selector)}"`, 'u'),
            )
        })
    })
    test.describe('subclass with no tagname', () => {
        test('wildcard', ({ page }) =>
            expect(page.locator('ui5_css=*::subclass').isVisible()).rejects.toThrow(
                new RegExp(
                    'subclass pseudo-selector cannot be used without specifying a control type',
                    'u',
                ),
            ))
        test('nothing', ({ page }) =>
            expect(page.locator('ui5_css=::subclass').isVisible()).rejects.toThrow(
                new RegExp(
                    'subclass pseudo-selector cannot be used without specifying a control type',
                    'u',
                ),
            ))
    })
})

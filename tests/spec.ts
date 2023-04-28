import selectorEngine from '../dist/node/main'
import { expect, test } from '@playwright/test'
import { selectors } from 'playwright'

test.beforeAll(async () => {
    await selectors.register('ui5', selectorEngine)
})

test.beforeEach(async ({ page }) => {
    await page.goto(
        'https://ui5.sap.com/1.112.3/resources/sap/ui/documentation/sdk/index.html?sap-ui-xx-sample-id=sap.m.sample.Button&sap-ui-xx-sample-lib=sap.m&sap-ui-xx-sample-origin=.&sap-ui-xx-dk-origin=https://ui5.sap.com',
    )
})

test.describe('control without property', () => {
    test('exists', ({ page }) => expect(page.locator('ui5=sap.m.Button')).toHaveCount(12))
    test("doesn't exist", ({ page }) => expect(page.locator('ui5=sap.m.Table')).toBeHidden())
})

test.describe('control with property exists', () => {
    test('exists', ({ page }) => expect(page.locator('ui5=sap.m.Button[text]')).toHaveCount(12))
    test("doesn't exist", ({ page }) => expect(page.locator('ui5=sap.m.Button[asdf]')).toBeHidden())
})
test.describe('control with property =', () => {
    test('exists', ({ page }) =>
        expect(page.locator("ui5=sap.m.Button[text='Accept']")).toHaveCount(1))
    test("doesn't exist", ({ page }) =>
        expect(page.locator("ui5=sap.m.Button[text='asdfasdf']")).toBeHidden())
})
test.describe('control with property ^=', () => {
    test('exists', ({ page }) =>
        expect(page.locator("ui5=sap.m.Button[text^='Acc']")).toHaveCount(1))
    test("doesn't exist", ({ page }) =>
        expect(page.locator("ui5=sap.m.Button[text^='asdfasdf']")).toBeHidden())
})
test.describe('control with property $=', () => {
    test('exists', ({ page }) =>
        expect(page.locator("ui5=sap.m.Button[text$='ept']")).toHaveCount(1))
    test("doesn't exist", ({ page }) =>
        expect(page.locator("ui5=sap.m.Button[text$='asdfasdf']")).toBeHidden())
})
test.describe('control with property *=', () => {
    test('exists', ({ page }) =>
        expect(page.locator("ui5=sap.m.Button[text*='ccep']")).toHaveCount(1))
    test("doesn't exist", ({ page }) =>
        expect(page.locator("ui5=sap.m.Button[text*='asdfasdf']")).toBeHidden())
})
test.describe('control with multiple properties', () => {
    test('exists', ({ page }) =>
        expect(page.locator("ui5=sap.m.Button[text='Accept'][busy='false']")).toHaveCount(1))
    test("doesn't exist", ({ page }) =>
        expect(page.locator("ui5=sap.m.Button[text='Accept'][busy='true']")).toBeHidden())
})

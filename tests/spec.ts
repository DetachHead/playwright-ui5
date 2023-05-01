import { SelectorEngine } from '../src/node/main'
import { HasDefaultExport } from '@detachhead/ts-helpers/dist/types/misc'
import { expect, test } from '@playwright/test'
import { execSync } from 'child_process'
import isCI from 'is-ci'
import { selectors } from 'playwright'

test.beforeAll(async () => {
    if (!isCI) {
        // prevent tests running on outdated code when running locally, since node src reads compiled browser code
        execSync('npm run build')
    }
    await selectors.register(
        'ui5',
        // need dynamic import, otherwise it could import outdated code:
        ((await import('../dist/node/main' as string)) as HasDefaultExport<SelectorEngine>).default,
    )
})

test.beforeEach(async ({ page }) => {
    await page.goto(
        'https://ui5.sap.com/1.112.3/resources/sap/ui/documentation/sdk/index.html?sap-ui-xx-sample-id=sap.m.sample.Button&sap-ui-xx-sample-lib=sap.m&sap-ui-xx-sample-origin=.&sap-ui-xx-dk-origin=https://ui5.sap.com',
    )
})

test.describe('any control', () => {
    test('*', ({ page }) => expect(page.locator('ui5=*')).toHaveCount(45))
    test('id', ({ page }) => expect(page.locator('ui5=#__button1')).toHaveCount(1))
    test('property', ({ page }) => expect(page.locator('ui5=[text]')).toHaveCount(25))
})

test.describe('implicit "sap." namespace', () => {
    test('exists', ({ page }) => expect(page.locator('ui5=m.Button')).toHaveCount(12))
    test("doesn't exist", ({ page }) => expect(page.locator('ui5=m.Table')).toBeHidden())
})

test.describe('control without property', () => {
    test('exists', ({ page }) => expect(page.locator('ui5=sap.m.Button')).toHaveCount(12))
    test("doesn't exist", ({ page }) => expect(page.locator('ui5=sap.m.Table')).toBeHidden())
})
test.describe('control with id', () => {
    test('exists', ({ page }) => expect(page.locator('ui5=sap.m.Button#__button1')).toHaveCount(1))
    test("doesn't exist", ({ page }) =>
        expect(page.locator('ui5=sap.m.Button#asdfasdf')).toBeHidden())
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

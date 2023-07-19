import { SelectorEngine } from '../src/node/main'
import { HasDefaultExport } from '@detachhead/ts-helpers/dist/types/misc'
import { expect, selectors, test } from '@playwright/test'
import { execSync } from 'child_process'
import isCI from 'is-ci'

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

test.describe('ui5 site', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(
            'https://ui5.sap.com/1.112.3/resources/sap/ui/documentation/sdk/index.html?sap-ui-xx-sample-id=sap.m.sample.Button&sap-ui-xx-sample-lib=sap.m&sap-ui-xx-sample-origin=.&sap-ui-xx-dk-origin=https://ui5.sap.com',
            { waitUntil: 'networkidle' },
        )
    })
    test.describe('any control', () => {
        test('*', ({ page }) => expect(page.locator('ui5=*')).toHaveCount(45))
        test('id', ({ page }) => expect(page.locator('ui5=#__button1')).toHaveCount(1))
        test('property', ({ page }) => expect(page.locator('ui5=[text]')).toHaveCount(25))
    })

    test.describe('implicit "sap." namespace', () => {
        test('exists', ({ page }) => expect(page.locator('ui5=m.Button')).toHaveCount(12))
        test("doesn't exist", ({ page }) => expect(page.locator('ui5=m.Table')).toHaveCount(0))
    })

    test.describe('control without property', () => {
        test('exists', ({ page }) => expect(page.locator('ui5=sap.m.Button')).toHaveCount(12))
        test("doesn't exist", ({ page }) => expect(page.locator('ui5=sap.m.Table')).toHaveCount(0))
    })
    test.describe('control with id', () => {
        test('exists', ({ page }) =>
            expect(page.locator('ui5=sap.m.Button#__button1')).toHaveCount(1))
        test("doesn't exist", ({ page }) =>
            expect(page.locator('ui5=sap.m.Button#asdfasdf')).toHaveCount(0))
    })

    test.describe('control with property exists', () => {
        test('exists', ({ page }) => expect(page.locator('ui5=sap.m.Button[text]')).toHaveCount(12))
        test("doesn't exist", ({ page }) =>
            expect(page.locator('ui5=sap.m.Button[asdf]')).toHaveCount(0))
    })
    test.describe('control with property =', () => {
        test('exists', ({ page }) =>
            expect(page.locator("ui5=sap.m.Button[text='Accept']")).toHaveCount(1))
        test("doesn't exist", ({ page }) =>
            expect(page.locator("ui5=sap.m.Button[text='asdfasdf']")).toHaveCount(0))
    })
    test.describe('control with property ^=', () => {
        test('exists', ({ page }) =>
            expect(page.locator("ui5=sap.m.Button[text^='Acc']")).toHaveCount(1))
        test("doesn't exist", ({ page }) =>
            expect(page.locator("ui5=sap.m.Button[text^='asdfasdf']")).toHaveCount(0))
    })
    test.describe('control with property $=', () => {
        test('exists', ({ page }) =>
            expect(page.locator("ui5=sap.m.Button[text$='ept']")).toHaveCount(1))
        test("doesn't exist", ({ page }) =>
            expect(page.locator("ui5=sap.m.Button[text$='asdfasdf']")).toHaveCount(0))
    })
    test.describe('control with property *=', () => {
        test('exists', ({ page }) =>
            expect(page.locator("ui5=sap.m.Button[text*='ccep']")).toHaveCount(1))
        test("doesn't exist", ({ page }) =>
            expect(page.locator("ui5=sap.m.Button[text*='asdfasdf']")).toHaveCount(0))
    })
    test.describe('control with multiple properties', () => {
        test('exists', ({ page }) =>
            expect(page.locator("ui5=sap.m.Button[text='Accept'][busy='false']")).toHaveCount(1))
        test("doesn't exist", ({ page }) =>
            expect(page.locator("ui5=sap.m.Button[text='Accept'][busy='true']")).toHaveCount(0))
    })
    test.describe('nested selectors', () => {
        test('exists', ({ page }) =>
            expect(page.locator("ui5=m.HBox >> ui5=sap.m.Button[text='Default']")).toHaveCount(1))
        test("doesn't exist", ({ page }) =>
            expect(page.locator("ui5=m.HBox >> ui5=m.Button[text='Emphasized']")).toHaveCount(0))
    })
    test.describe(':has', () => {
        test('exists', ({ page }) =>
            expect(page.locator("ui5=m.Toolbar:has(m.Button[text='Reject'])")).toHaveCount(1))
        test("doesn't exist", ({ page }) =>
            expect(page.locator('ui5=m.Toolbar:has(m.Toolbar)')).toHaveCount(0))
    })
    test.describe('comma-separated rules', () => {
        test('exists', ({ page }) =>
            expect(
                page.locator("ui5=m.Button[text='Accept'],m.Button[text='Emphasized']"),
            ).toHaveCount(2))
        test("doesn't exist", ({ page }) =>
            expect(page.locator("ui5=m.Button[text='asdf'],m.Button[text='asdfsdfg']")).toHaveCount(
                0,
            ))
    })
})

test.describe('no ui5 site', () => {
    test('no ui5', async ({ page }) => {
        await page.setContent('<div></div>')
        await expect(page.locator('ui5=m.Button')).toHaveCount(0)
    })
    test.describe('unsupported syntax', () => {
        test('comparitors', ({ page }) =>
            expect(page.locator('ui5=m.Table > m.Button').isVisible()).rejects.toThrow(
                /Expected rule but ">" found/u,
            ))
    })
})

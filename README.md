# playwright ui5

a playwright [custom selector engine](https://playwright.dev/docs/extensibility#custom-selector-engines) for [sapui5](https://ui5.sap.com/)

## installation

```bash
npm install playwright-ui5
```

## usage

```ts
import { selectors, test } from '@playwright/test'
import ui5 from 'playwright-ui5'

test.beforeAll(async () => {
    await selectors.register('ui5', ui5)
})

test('ui5 example', ({ page }) => {
    await page.goto('https://ui5.sap.com/')
    await page.click("ui5=sap.m.Button[text='Get Started with UI5']")
})
```

## syntax

this selector engine uses css selector-like syntax. the main difference is that `.` is not used for class names, rather they are treated as part of the type name (ie. `sap.m.Button`)

| feature             | examples                                                   | suported | notes                                                                                                                                         |
| ------------------- | ---------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| type selectors      | `sap.m.Button`, `m.Button`, `*`                            | ✔        |
| class selectors     | n/a                                                        | n/a      | as mentioned above, `.` is treated as part of the control type                                                                                |
| attribute selectors | `[text]`, `[text='foo']`, `[text*='foo']` ,`[text~='foo']` | ✔        | `~=` trims leading and trailing whitespace for the whole value instead of matching a whitespace-separated list of values like it does in CSS. |
| id selectors        | `sap.m.Button#foo`                                         | ✔        | you should not use id selectors if the id is generated (eg. `__button1`) as they can change often                                             |
| nesting             | `sap.m.Table sap.m.Button`,`sap.m.Table > sap.m.Button`    | ❌       | use playwright selector nesting instead (`ui5=sap.m.Table >> ui5=sap.m.Button`)                                                               |
| pseudo-classes      | `sap.m.Table:has(sap.m.Button)`                            | ✔        | only `:has` is supported for now                                                                                                              |
| pseudo-elements     | `sap.m.DateTimeField::subclass`                            | ✔        | `::subclass` will match the specified control type and any subtypes (eg. both `sap.m.DateTimeField` and subtypes like `sap.m.DatePicker`)     |
| selector lists      | `sap.m.Button,sap.m.Table`                                 | ✔        |

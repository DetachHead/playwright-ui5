# playwright ui5

a playwright [custom selector engine](https://playwright.dev/docs/extensibility#custom-selector-engines) for [sapui5](https://ui5.sap.com/)

## installation

```bash
npm install playwright-ui5
```

## usage

```ts
import { selectors } from 'playwright'
import ui5 from 'playwright-ui5'

selectors.register('ui5', ui5)
;(async () => {
    await page.goto('https://ui5.sap.com/')
    await page.click("ui5=sap.m.Button[text='Get Started with UI5']")
})()
```

## syntax

this selector engine uses css selector-like syntax. the main difference is that `.` is not used for class names, rather they are treated as part of the type name (ie. `sap.m.Button`)

<!-- https://github.com/prettier/prettier/issues/11410 -->
<!-- prettier-ignore -->
| feature        | examples            | suported | notes |
| -------------- | ------------------- | -------- | ----- |
| type selectors | `sap.m.Button`, `*` | ✔        |
| class selectors | n/a                | n/a       |as mentioned above, `.` is treated as part of the control type
| attribute selectors | `[text]`, `[text='foo']`,`[text*='foo']` | ✔ | some equality mods are useless for ui5 (eg. `|=`) but are supported for the sake of completeness |
| id selectors | `sap.m.Button#foo` | ✔ |you should not use id selectors if the id is generated (eg. `__button1`) as they can change often
| nesting | `sap.m.Table sap.m.Button`,`sap.m.Table > sap.m.Button` | ❌ |use playwright selector nesting instead (`ui5=sap.m.Table >> ui5=sap.m.Button`)
| pseudo-classes | `sap.m.Table:has(sap.m.Button)` | ❌ |

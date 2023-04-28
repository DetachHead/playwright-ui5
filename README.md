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
| class selectors | n/a                | ❌       |`.` syntax is treated as part of the control type
| attribute selectors | `[text]`, `[text='foo']`,`[text*='foo']` | ✔ | some equality mods are useless for ui5 (eg. `|=`) but are supported for the sake of completeness |
| id selectors | `sap.m.Button#foo` | ✔ |you should not use id selectors when the ids are generated (eg. `__button1`) 
| pseudo-classes | `sap.m.Table:has(sap.m.Button)` | ❌ |
| nesting | `sap.m.Table sap.m.Button`,`sap.m.Table > sap.m.Button` | ❌ |

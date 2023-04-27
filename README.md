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

## disclaimer

the selector parser currently sucks because it just uses regex. so although the syntax resembles css selectors, most css selector functionality is not yet supported

# playwright ui5

playwright [custom selector engines](https://playwright.dev/docs/extensibility#custom-selector-engines) for [sapui5](https://ui5.sap.com/)

## installation

```bash
npm install playwright-ui5
```

## usage

playwright-ui5 contains a selector engine for both css and xpath syntax. you can use whichever one you want, but the xpath one is more flexible since not all css selector syntax has been implemented yet.

### css selector engine

```ts
import { selectors, test } from '@playwright/test'
import { css } from 'playwright-ui5'

test.beforeAll(async () => {
    await selectors.register('ui5', css)
})

test('ui5 example', ({ page }) => {
    await page.goto('https://ui5.sap.com/')
    await page.click("ui5=sap.m.Button[text='Get Started with UI5']")
})
```

#### syntax

the main difference between regular CSS selectors and playwright-ui5's syntax is is that `.` is not used for class names, rather they are treated as part of the type name (ie. `sap.m.Button`).

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

### xpath selector engine

```ts
import { selectors, test } from '@playwright/test'
import { xpath } from 'playwright-ui5'

test.beforeAll(async () => {
    await selectors.register('ui5', xpath)
})

test('ui5 example', ({ page }) => {
    await page.goto('https://ui5.sap.com/')
    await page.click("ui5=//sap.m.Button[ui5:property(., 'text')='Get Started with UI5']")
})
```

#### syntax

unlike the CSS selector syntax, all xpath syntax is supported (even newer xpath features up to version 3.1 thanks to [fontoxpath](https://github.com/FontoXML/fontoxpath)).

note that properties cannot be accessed via the `@attribute` syntax. this is because the selector engine needs to build an XML tree of all the ui5 elements on the page, and for performance reasons the properties are not evaluated during this step, so the only attribute that can be accessed that way is the element's ID.

for example, for a button with the id `"foo"` and the text `"bar"`, the xml view may look like this:

```xml
<sap.m.Page id="__page0">
    <sap.m.Button id="foo"></sap.m.Button>
</sap.m.Page>
```

in this case, `//sap.m.Button[@id='foo']` will work, but `//sap.m.Button[@text='bar']` will not. to access the property, you can use the [`ui5:property`](#ui5property) xpath function instead, like so:

```xpath
//sap.m.Button[ui5:property(., 'text')='bar']
```

the XML view matches the control tree from the [ui5 diagnostics window](https://sapui5.hana.ondemand.com/sdk/#/topic/04b75eae78ef4bae9b40cd7540ae8bdc) and the [ui5 inspector chrome extension](https://chromewebstore.google.com/detail/ui5-inspector/bebecogbafbighhaildooiibipcnbngo), so we recommend using one of these when working with the ui5 xpath selector enging.

#### the root node

since the ui5 control tree can have multiple root nodes, the xpath selector engine wraps `sap-ui-area` nodes inside a `root` node:

```xml
<root>
    <sap-ui-area id="sap-ui-static">
        <sap.m.Page id="__page0">
            <sap.m.Button id="foo"></sap.m.Button>
        </sap.m.Page>
    </sap-ui-area>
    <sap-ui-area id="canvas">
</root>
```

#### API

the following xpath functions are available in the `ui5:` namespace:

##### `ui5:property`

-   **arguments:** `element()`, `xs:string`
-   **return type:** `xs:string`

gets the value for the property with the specified name from the specified element

```xpath
//sap.m.Button[ui5:property(., "text")="Click here"]
```

> [!NOTE]  
> currently, due to [a limitation in fontoxpath (or xpath itself, i'm not sure)](https://github.com/FontoXML/fontoxpath/issues/636), properties are always converted to strings before they are returned. if the property does not exist or its value is `null` or `undefined`, then an empty string is returned instead.

##### `ui5:debug-xml`

-   **arguments:** `element()`
-   **return type:** `xs:string`

raises an exception containining the XML control tree with the specified element as the root. this function is only intended for debugging purposes.

```xpath
ui5:debug-xml(root)
```

this will throw an exception containing the entire control tree for the page in XML format:

```
playwright-ui5 debug-xml function was called. here is the XML element tree:

<root>
    <sap-ui-area id="sap-ui-static">
        <!-- ... -->
    </sap-ui-area>
</root>
```

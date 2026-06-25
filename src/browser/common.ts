import type Core from 'sap/ui/core/Core'

/* eslint-disable @typescript-eslint/no-namespace -- see comment below */
declare global {
    // using @sapui5/ts-types-esm instead of @sapui5/ts-types even though we are
    // accessing the ui5 api globally because @sapui5/ts-types is deprecated and
    // they keep breaking things with each release. so it's easier to just use the
    // more supported esm package and declare the global namespaces ourselves. see
    // https://github.com/SAP/ui5-typescript/issues/289#issuecomment-1562667387

    // to make the esm imports work at runtime we use a custom esbuild plugin (see build.ts)
    // but we still need this globally define namespace gfor out `isui5` function so we can
    // test if the current page actually has ui5 in it
    namespace sap.ui {
        const core: Core | undefined
    }
}
/* eslint-enable @typescript-eslint/no-namespace */

/**
 * handling for if the page is not ui5.
 * sap webgui also uses a global sap object so we need to check for sap.ui specifically
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- the types don't account for this but any of these could be undefined if the ui5 runtime is partially loaded
export const isUi5 = () => typeof sap !== 'undefined' && sap.ui?.core !== undefined

export class Ui5SelectorEngineError extends Error {
    constructor(selector: string, error: unknown) {
        super(`ui5 selector engine failed on selector: "${selector}"\n\n${String(error)}`)
    }
}

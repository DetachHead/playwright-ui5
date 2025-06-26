import UI5Metadata from 'sap/ui/base/Metadata'
import type UI5Core from 'sap/ui/core/Core'
import UI5Element from 'sap/ui/core/Element'

/* eslint-disable @typescript-eslint/no-namespace -- see comment below */
declare global {
    // using @sapui5/ts-types-esm instead of @sapui5/ts-types even though we are
    // accessing the ui5 api globally because @sapui5/ts-types is deprecated and
    // they keep breaking things with each release. so it's easier to just use the
    // more supported esm package and declare the global namespaces ourselves. see
    // https://github.com/SAP/ui5-typescript/issues/289#issuecomment-1562667387

    // ideally these would be defined like `const Element = Ui5Element` instead of
    // these fake subclasses. see https://github.com/microsoft/TypeScript/issues/36348
    namespace sap.ui.core {
        class Element extends UI5Element {}
        const Core: {
            // no idea how this works, but it seems to be a class when using the global
            // declaration but an instance when importing it as a module.
            // https://github.com/SAP/ui5-typescript/issues/443#issuecomment-2074074078
            new (): UI5Core
            (): UI5Core
        }
    }
    namespace sap.ui.base {
        class Metadata extends UI5Metadata {}
    }
}
/* eslint-enable @typescript-eslint/no-namespace */

export interface SelectorEngine {
    queryAll: (root: Element | Document, selector: string) => Element[]
    query: (root: Element | Document, selector: string) => Element | undefined
}

/**
 * handling for if the page is not ui5.
 * sap webgui also uses a global sap object so we need to check for sap.ui specifically
 */
export const isUi5 = () => typeof sap !== 'undefined' && typeof sap.ui !== 'undefined'

export class Ui5SelectorEngineError extends Error {
    constructor(selector: string, error: unknown) {
        super(`ui5 selector engine failed on selector: "${selector}"\n\n${String(error)}`)
    }
}

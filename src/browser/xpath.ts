import type { SelectorEngine } from '../common/types'
import { Ui5SelectorEngineError, isUi5 } from './common'
import type { Options } from 'fontoxpath'
import {
    evaluateXPathToFirstNode,
    evaluateXPathToNodes,
    registerCustomXPathFunction,
} from 'fontoxpath'
import { throwIfUndefined } from 'throw-expression'
import { create } from 'xmlbuilder2'

interface TreeModelNode {
    id: string
    name: string
    type: string
    content: TreeModelNode[]
}

const createTreeModelNodes = (node: Element) => {
    // this function is mostly copied from https://github.com/SAP/ui5-inspector/blob/f8b5edd56180b0a3811979fd403e913562f0f306/app/vendor/ToolsAPI.js#L159-L160
    const result: TreeModelNode[] = []
    const inner = (nodeElement: Element, resultArray: TreeModelNode[]) => {
        const rootNode = nodeElement
        let childNode = rootNode.firstElementChild
        const results = resultArray
        let subResult = results
        // eslint-disable-next-line detachhead/suggestions-as-errors -- Core type is busted https://github.com/SAP/ui5-typescript/issues/443
        const control = sap.ui.getCore().byId(rootNode.id)

        if (rootNode.getAttribute('data-sap-ui') && control) {
            results.push({
                id: control.getId(),
                name: control.getMetadata().getName(),
                type: 'sap-ui-control',
                content: [],
            })

            subResult = throwIfUndefined(results[results.length - 1]).content
        } else if (rootNode.getAttribute('data-sap-ui-area')) {
            results.push({
                id: rootNode.id,
                name: 'sap-ui-area',
                type: 'data-sap-ui',
                content: [],
            })

            subResult = throwIfUndefined(results[results.length - 1]).content
        }

        while (childNode) {
            inner(childNode, subResult)
            childNode = childNode.nextElementSibling
        }
    }
    inner(node, result)
    return result
}

const createXmlFromTreeNodes = (treeModelNodes: TreeModelNode[]) => {
    let xml = create({ version: '1.0' })
    // need to create a top level "root" node because xml doesn't support multiple root nodes
    if (treeModelNodes[0]?.name === 'sap-ui-area') {
        xml = xml.ele('root')
    }
    const inner = (nodes: TreeModelNode[]) => {
        nodes.forEach((node) => {
            xml = xml.ele(node.name, { id: node.id })
            inner(node.content)
            xml = xml.up()
        })
    }
    inner(treeModelNodes)
    return xml.end({ prettyPrint: true })
}

const createXml = (nodeElement: Element) =>
    createXmlFromTreeNodes(createTreeModelNodes(nodeElement))

const namespaceURI = 'ui5'

registerCustomXPathFunction(
    { namespaceURI, localName: 'property' },
    ['element()', 'xs:string'],
    'item()*',
    (_, element: Element, name: string) => {
        const id = element.getAttribute('id')
        // eslint-disable-next-line detachhead/suggestions-as-errors -- using deprecated byId method to support older ui5 versions
        const ui5Element = sap.ui.getCore().byId(id)
        let result
        try {
            result = ui5Element?.getProperty(name) as unknown
        } catch {
            // intentionally empty
        }
        if (Array.isArray(result)) {
            return result as unknown[]
        }
        if (result === undefined || result === null) {
            return []
        }
        return [result]
    },
)

registerCustomXPathFunction(
    { namespaceURI, localName: 'debug-xml' },
    ['element()'],
    'xs:string', // actually returns never but i doubt xpath has a type for such a thing
    (_, element: Element) => {
        // we throw an exception instead of just logging it to prevent users from accidentally leaving debug code in their tests
        throw new Error(
            `playwright-ui5 debug-xml function was called. here is the XML element tree:\n\n${element.outerHTML}`,
        )
    },
)

const options: Options = {
    namespaceResolver: (prefix) => (prefix === namespaceURI ? prefix : null),
}

const getRootElement = (node: Element | Document) =>
    (node instanceof Element ? node.ownerDocument : node).querySelector('*')

const createXmlDom = (node: Element | Document) => {
    const root = getRootElement(node)
    if (root === null) {
        return undefined
    }
    const result = new DOMParser().parseFromString(createXml(root), 'text/xml')
    // if it's an html element where its id exists in the xml dom too, then return the element
    // in the dom matching that id, as it can be used as the context (.) for xpath selectors
    return node instanceof Element ? result.getElementById(node.id) ?? result : result
}

const matchXmlElementToHtmlElement = (root: Element | Document, element: Element) =>
    // this should always match an element, but there seems to be a timing issue in firefox while
    // the ui5 site is loading where there's an element with an empty id
    getRootElement(root)?.querySelector(`[id='${element.id}']`) ?? undefined

/**
 * if the selector is in the context of another locator and does not start with a `.`, prepend a
 * `.` to it to ensure that it doesn't match elements outside of its parent locator. this is the
 * same thing playwright does in its xpath selector engine.
 */
const fixSelectorContext = (root: Element | Document, selector: string) =>
    selector.startsWith('/') && root.nodeType !== Node.DOCUMENT_NODE ? `.${selector}` : selector

export default {
    queryAll: (root, selector) => {
        try {
            if (!isUi5()) {
                return []
            }
            return evaluateXPathToNodes<Element>(
                fixSelectorContext(root, selector),
                createXmlDom(root),
                null,
                null,
                options,
            )
                .map((element) => matchXmlElementToHtmlElement(root, element))
                .filter((element) => element !== undefined)
        } catch (e) {
            throw new Ui5SelectorEngineError(selector, e)
        }
    },
    query: (root, selector) => {
        try {
            if (!isUi5()) {
                return undefined
            }
            const node = getRootElement(root)
            if (node === null) {
                return undefined
            }
            const result = evaluateXPathToFirstNode<Element>(
                fixSelectorContext(root, selector),
                createXmlDom(node),
                null,
                null,
                options,
            )
            return result ? matchXmlElementToHtmlElement(root, result) : undefined
        } catch (e) {
            throw new Ui5SelectorEngineError(selector, e)
        }
    },
} satisfies SelectorEngine

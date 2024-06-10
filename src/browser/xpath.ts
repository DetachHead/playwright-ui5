import { SelectorEngine, Ui5SelectorEngineError, isUi5 } from './common'
import {
    Options,
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

const createXmlFromTreeNode = (treeModelNode: TreeModelNode) => {
    let xml = create({ version: '1.0' })
    const inner = (nodes: TreeModelNode[]) => {
        nodes.forEach((node) => {
            xml = xml.ele(node.name, { id: node.id })
            inner(node.content)
            xml = xml.up()
        })
    }
    inner([treeModelNode])
    return xml.end({ prettyPrint: true })
}

const createXml = (nodeElement: Element) =>
    createTreeModelNodes(nodeElement).map(createXmlFromTreeNode)

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

const getRootElements = (htmlNode: Element | Document) =>
    Array.from(htmlNode.childNodes).filter((childNode) => childNode instanceof Element)
const createXmlDoms = (node: Element) =>
    createXml(node).map((xml) => new DOMParser().parseFromString(xml, 'text/xml'))

const matchXmlElementToHtmlElement = (htmlRoot: Element | Document, xmlElement: Element) => {
    const result = htmlRoot.querySelector(`[id='${xmlElement.id}']`)
    // this should always match an element, but there seems to be a timing issue in firefox while
    // the ui5 site is loading where there's an element with an empty id
    if (result === null) {
        return []
    }
    return [result]
}

export default {
    queryAll: (root, selector) => {
        try {
            if (!isUi5()) {
                return []
            }
            return getRootElements(root).flatMap((node) =>
                createXmlDoms(node)
                    .flatMap((xmlDom) =>
                        evaluateXPathToNodes<Element>(selector, xmlDom, null, null, options),
                    )
                    .flatMap((element) => matchXmlElementToHtmlElement(root, element)),
            )
        } catch (e) {
            throw new Ui5SelectorEngineError(selector, e)
        }
    },
    query: (root, selector) => {
        try {
            if (!isUi5()) {
                return undefined
            }
            for (const node of getRootElements(root)) {
                for (const xmlDom of createXmlDoms(node)) {
                    const result = evaluateXPathToFirstNode<Element>(
                        selector,
                        xmlDom,
                        null,
                        null,
                        options,
                    )
                    if (result) {
                        return matchXmlElementToHtmlElement(root, result)[0]
                    }
                }
            }
            return undefined
        } catch (e) {
            throw new Ui5SelectorEngineError(selector, e)
        }
    },
} satisfies SelectorEngine

import { AstString, createParser } from 'css-selector-parser'
import { throwIfUndefined } from 'throw-expression'

const parse = createParser({
    syntax: {
        combinators: [],
        namespace: false,
        attributes: { operators: ['=', '^=', '$=', '*=', '~=', '|='] },
        pseudoElements: false,
        tag: { wildcard: true },
        ids: true,
        // classes are actually not supported but need to enable this to support . in tag names,
        // classes are then concatenated and appended to the tag name
        classNames: true,
    },
})

const queryAll = (root: Element | Document, selector: string): Element[] => {
    const parsedSelector = parse(selector)
    if (selector === '') {
        throw new Error('ui5 selector is empty')
    }
    if (parsedSelector.rules.length > 1) {
        throw new Error('comma-separated selectors not supported')
    }
    if (typeof sap === 'undefined') {
        return []
    }
    const rule = throwIfUndefined(parsedSelector.rules[0], 'rules array was empty')

    if (rule.tag?.type === 'TagName' && rule.classNames) {
        // support omitting the sap., since every ui5 control starts with sap (i think):
        const sapNamespace = 'sap'
        if (rule.tag.name !== sapNamespace) {
            rule.tag.name = `${sapNamespace}.${rule.tag.name}`
        }
        // hack to prevent parser from treating . as classes:
        rule.tag.name = [rule.tag.name, ...rule.classNames].join('.')
        delete rule.classNames
    }

    const controls = sap.ui.core.Element.registry.filter((element) => {
        if (rule.ids && rule.ids.length > 1) {
            throw new Error('multiple ids are not supported')
        }
        if (
            (rule.tag?.type === 'TagName' && rule.tag.name !== element.getMetadata().getName()) ||
            (rule.ids && rule.ids[0] !== element.getId())
        ) {
            return false
        }

        return (rule.attributes ?? []).every((attr) => {
            let actualValue: string
            try {
                actualValue = String(element.getProperty(attr.name))
            } catch {
                // property doesn't exist
                return false
            }
            if (!('value' in attr)) {
                // eg. sap.m.Button[attr]
                return true
            }
            const expectedValue = (attr.value as AstString).value
            return {
                '=': actualValue === expectedValue,
                '^=': actualValue.startsWith(expectedValue),
                '$=': actualValue.endsWith(expectedValue),
                '*=': actualValue.includes(expectedValue),
                '~=': actualValue.split(/\s+/u).includes(expectedValue),
                '|=': actualValue.split('-')[0] === expectedValue,
            }[
                throwIfUndefined(
                    attr.operator,
                    'attribute operator was undefined when value was set (this should NEVER happen)',
                )
            ]
        })
    })
    return controls
        .map((control) => control.getDomRef())
        .filter(
            (element): element is Element =>
                element !== null &&
                // on nested selectors/locators, exclude any elements from outside that scope by making sure they're present in this root:
                root.querySelector(`#${element.id}`) !== null,
        )
}

export default {
    queryAll,
    query: (root: Element | Document, selector: string): Element | undefined =>
        queryAll(root, selector)[0],
}

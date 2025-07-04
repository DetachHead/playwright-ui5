import type { SelectorEngine } from '../common/types'
import { Ui5SelectorEngineError, isUi5 } from './common'
import { type AstSelector, type AstString, createParser } from 'css-selector-parser'
import { throwIfUndefined } from 'throw-expression'

const getAllParents = (element: sap.ui.core.Element): string[] => {
    const getParents = (class_: sap.ui.base.Metadata): sap.ui.base.Metadata[] => {
        const parent = class_.getParent()
        if (parent !== undefined) {
            return [class_, ...getParents(parent)]
        }
        return [class_]
    }
    return getParents(element.getMetadata()).map((parent) => parent.getName())
}

const parseSelector = (selector: string): AstSelector => {
    if (selector === '') {
        throw new Error('ui5 selector is empty')
    }
    const parsedSelector = parse(selector)
    parsedSelector.rules.forEach((rule) => {
        if (rule.ids && rule.ids.length > 1) {
            throw new Error('multiple ids are not supported')
        }
        if (rule.pseudoElement === 'subclass' && rule.tag?.type !== 'TagName') {
            throw new Error(
                'subclass pseudo-selector cannot be used without specifying a control type',
            )
        }
    })
    return parsedSelector
}

const parse = createParser({
    syntax: {
        combinators: [],
        namespace: false,
        attributes: { operators: ['=', '^=', '$=', '*=', '~=', '|='] },
        pseudoElements: { definitions: ['subclass'] },
        pseudoClasses: { definitions: { Selector: ['has'] } },
        tag: { wildcard: true },
        ids: true,
        // classes are actually not supported but need to enable this to support . in tag names,
        // classes are then concatenated and appended to the tag name
        classNames: true,
    },
})

const querySelector = (root: Element | Document, selector: AstSelector): Element[] =>
    selector.rules.flatMap((rule) => {
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

        const controls =
            // eslint-disable-next-line detachhead/suggestions-as-errors, @typescript-eslint/no-unnecessary-condition -- using the deprecated registry since we still want to support older ui5 versions, seems this can be undefined if the page is in the middle of loading
            sap.ui.core.Element?.registry.filter((element) => {
                if (
                    (rule.tag?.type === 'TagName' &&
                        rule.tag.name !== element.getMetadata().getName() &&
                        (rule.pseudoElement !== 'subclass' ||
                            !getAllParents(element).includes(rule.tag.name))) ||
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
                        '~=': actualValue.trim() === expectedValue,
                        '|=': actualValue.split('-')[0] === expectedValue,
                    }[
                        throwIfUndefined(
                            attr.operator,
                            'attribute operator was undefined when value was set (this should NEVER happen)',
                        )
                    ]
                })
            }) ?? []
        return controls
            .map((control) => control.getDomRef())
            .filter((element): element is Element => {
                if (
                    element === null ||
                    // on nested selectors/locators, exclude any elements from outside that scope by making sure they're present in this root:
                    root.querySelector(`[id='${element.id}']`) === null
                ) {
                    return false
                }
                if (
                    rule.pseudoClasses &&
                    querySelector(
                        element,
                        throwIfUndefined(
                            rule.pseudoClasses[0],
                            '":has" pseudo-class was specified without an argument',
                        ).argument as AstSelector,
                    ).length === 0
                ) {
                    return false
                }
                return true
            })
    })

const queryAll = (root: Element | Document, selector: string): Element[] => {
    try {
        const parsedSelector = parseSelector(selector)
        // handling for if the page is not ui5. sap webgui also uses a global sap object so we need to check for sap.ui specifically
        if (!isUi5()) {
            return []
        }
        return querySelector(root, parsedSelector)
    } catch (e) {
        throw new Ui5SelectorEngineError(selector, e)
    }
}

export default {
    queryAll,
    query: (root, selector) => queryAll(root, selector)[0],
} satisfies SelectorEngine

import { CssSelectorParser } from 'css-selector-parser'
import { isFilled } from 'ts-is-present'

const parser = new CssSelectorParser()
parser.registerAttrEqualityMods('^', '$', '*', '~', '|')

const queryAll = (_root: Element | Document, selector: string): Element[] => {
    const parsedSelector = parser.parse(selector)
    if (parsedSelector.type === 'selectors') {
        throw new Error('comma-separated selectors not supported')
    }
    const { rule } = parsedSelector

    // hack to prevent parser from treating . as classes:
    rule.tagName = [rule.tagName, ...(rule.classNames ?? [])].join('.')
    delete rule.classNames

    const controls = sap.ui.core.Element.registry.filter((element) => {
        if (element.getMetadata().getName() !== rule.tagName) {
            return false
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- https://github.com/mdevils/css-selector-parser/pull/23
        return (rule.attrs ?? []).every((attr) => {
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
            return {
                '=': actualValue === attr.value,
                '^=': actualValue.startsWith(attr.value),
                '$=': actualValue.endsWith(attr.value),
                '*=': actualValue.includes(attr.value),
                '~=': actualValue.split(/\s+/u).includes(attr.value),
                '|=': actualValue.split('-')[0] === attr.value,
            }[attr.operator]
        })
    })
    return controls.map((control) => control.getDomRef()).filter(isFilled)
}

export default {
    queryAll,
    query: (root: Element | Document, selector: string): Element | undefined =>
        queryAll(root, selector)[0],
}

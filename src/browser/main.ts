import { tail } from 'lodash'
import { throwIfNull, throwIfUndefined } from 'throw-expression'
import { isFilled } from 'ts-is-present'

interface Selector {
    controlType: string
    properties: Record<string, string>
}

const parseSelector = (selector: string): Selector => {
    // CRINGE!!!!!! TODO: replace this with an actual parser
    const tokens = selector.split('[')
    const controlType = throwIfUndefined(tokens[0], 'this should NEVER happen')
    const properties = tail(tokens).map((prop) => prop.slice(0, -1))
    const pairs = Object.fromEntries(
        properties.map((property) => {
            const errorMessage = `syntax error in selector: ${property}`
            const [_, key, __, value] = throwIfNull(
                property.match(/^(\w+)=('([^']*)'|"([^"]*)")$/u),
                errorMessage,
            )
            if (key === undefined || value === undefined) {
                throw new Error(errorMessage)
            }
            return [key, value]
        }),
    )
    return { controlType, properties: pairs }
}

const queryAll = (_root: Element | Document, selector: string): Element[] => {
    const parsedSelector = parseSelector(selector)
    const controls = sap.ui.core.Element.registry.filter((element) => {
        if (element.getMetadata().getName() !== parsedSelector.controlType) {
            return false
        }
        return Object.entries(parsedSelector.properties).every(([key, value]) => {
            try {
                return String(element.getProperty(key)) === value
            } catch {
                return false // property doesn't exist
            }
        })
    })
    return controls.map((control) => control.getDomRef()).filter(isFilled)
}

export default {
    queryAll,
    query: (root: Element | Document, selector: string): Element | undefined =>
        queryAll(root, selector)[0],
}

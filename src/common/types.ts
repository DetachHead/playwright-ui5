export interface SelectorEngine {
    queryAll: (root: Element | Document, selector: string) => Element[]
    query: (root: Element | Document, selector: string) => Element | undefined
}

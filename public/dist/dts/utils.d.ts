export interface ElementInput {
    tagName: string;
    style?: Partial<CSSStyleDeclaration>;
    innerProps?: Partial<HTMLElement | HTMLImageElement> & {
        [key: `data-${string}`]: string;
    };
}
export declare function createElement(parentQuery: string, elementInput: ElementInput): HTMLElement;

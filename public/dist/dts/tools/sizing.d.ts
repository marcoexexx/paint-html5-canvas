import { ElementInput } from "../utils.js";
import { ResizeProps, Tool } from "./index.js";
interface SizingToolProps extends HTMLElement {
}
export declare class SizingTool extends Tool {
    props: SizingToolProps;
    currentSize: number;
    isFirstSizeAdded: boolean;
    constructor(props: SizingToolProps);
    static new(props: SizingToolProps): SizingTool;
    haldleOnClick(size: string): (_evt: MouseEvent) => void;
    resize({ width, height, top, left, overlayRect }: ResizeProps): void;
    addSize(elementInput: ElementInput): void;
    loadFirstSize(size: string): void;
}
export {};

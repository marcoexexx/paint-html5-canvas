import { ElementInput } from "../utils.js";
import { ResizeProps, Tool } from "./index.js";
interface DrawingItemToolProps extends HTMLElement {
}
export declare class DrawingItemTool extends Tool {
    props: DrawingItemToolProps;
    currentItem: CanvasLineCap | "eraser" | "insert";
    cursorUrl: string;
    constructor(props: DrawingItemToolProps);
    static new(props: DrawingItemToolProps): DrawingItemTool;
    haldleOnClick(item: CanvasLineCap | "eraser", id: string, cursorUrl: string): (_evt: MouseEvent) => void;
    resize({ width, height, top, left, overlayRect }: ResizeProps): void;
    addItem(url: string, elementInput: ElementInput): void;
}
export {};

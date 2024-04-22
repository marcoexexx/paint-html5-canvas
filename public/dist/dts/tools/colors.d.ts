import { ElementInput } from "../utils.js";
import { ResizeProps, Tool } from "./index.js";
interface ColorToolProps extends HTMLElement {
}
export declare class ColorTool extends Tool {
    props: ColorToolProps;
    currentColor: string;
    constructor(props: ColorToolProps);
    static new(props: ColorToolProps): ColorTool;
    haldleOnClick(color: string): (_evt: MouseEvent) => void;
    resize({ width, height, top, left, overlayRect }: ResizeProps): void;
    addColor(elementInput: ElementInput): void;
}
export {};

import { ColorTool } from "./tools/colors.js";
import { DrawableCanvas } from "./tools/drawableCanvas.js";
import { DrawingItemTool } from "./tools/items.js";
import { SizingTool } from "./tools/sizing.js";
import { createElement } from "./utils.js";
interface PaintTool {
    canvas: DrawableCanvas;
    colors: ColorTool;
    items: DrawingItemTool;
    sizing: SizingTool;
}
declare class Paint {
    backgroundOverlay: HTMLElement;
    tools: PaintTool;
    constructor(tools: PaintTool, backgroundOverlay: HTMLElement);
    resize(): void;
    static new(tools: PaintTool, backgroundOverlay: HTMLElement): Paint;
    handleMouseDown(evt: MouseEvent): void;
    handleMouseMove(evt: MouseEvent): void;
    handleMouseUp(evt: MouseEvent): void;
    handleMouseOut(evt: MouseEvent): void;
}
export { ColorTool, createElement, DrawableCanvas, DrawingItemTool, Paint, SizingTool, };

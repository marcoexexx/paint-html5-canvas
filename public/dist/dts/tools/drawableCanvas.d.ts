import { ResizeProps, Tool } from "./index.js";
interface DrawableCanvasProps extends HTMLCanvasElement {
}
export declare class DrawableCanvas extends Tool {
    props: DrawableCanvasProps;
    insertedImageAngle: number;
    isRotating: boolean;
    isPainting: boolean;
    isSaved: boolean;
    lastX: number;
    lastY: number;
    mode: "eraser" | "insert" | "draw";
    ctx: CanvasRenderingContext2D | null;
    newCanvasCtxs: CanvasRenderingContext2D[];
    cursor: HTMLElement | null;
    cursorImage: string | null;
    insertedImage: HTMLImageElement | null;
    imageX: number;
    imageY: number;
    constructor(props: DrawableCanvasProps);
    static new(props: DrawableCanvasProps): DrawableCanvas;
    resize({ width, height, top, left, overlayRect }: ResizeProps): void;
    private draw;
    setupNewCanvasForImage(): CanvasRenderingContext2D;
    handleConfirmImage(): void;
    createConfirmLayer(): void;
    handleImageInsert(x: number, y: number): void;
    handleMouseDown(evt: MouseEvent): void;
    handleMouseMove(evt: MouseEvent): void;
    checkCanvasIsEmpty(data: Uint8ClampedArray): boolean;
    handleMouseUp(_evt: MouseEvent): void;
    handleMouseOut(_evt: MouseEvent): void;
    addCursor(url: string): void;
}
export {};

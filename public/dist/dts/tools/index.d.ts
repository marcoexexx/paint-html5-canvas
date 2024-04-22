export declare const Tools: {
    readonly CanvasTool: "CanvasTool";
    readonly ColorTool: "ColorTool";
    readonly DrawingTool: "DrawingTool";
    readonly SizingTool: "SizingTool";
};
export type Tools = typeof Tools[keyof typeof Tools];
export interface ResizeProps {
    width: number;
    height: number;
    top: number;
    left: number;
    overlayRect: DOMRect;
}
export declare abstract class Tool {
    name: string;
    constructor(name: string);
    resize({}: ResizeProps): void;
}

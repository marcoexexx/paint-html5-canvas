import { AppError, ErrorKind } from "../error.js";

export const Tools = {
  CanvasTool: "CanvasTool",
  ColorTool: "ColorTool",
  DrawingTool: "DrawingTool",
  SizingTool: "SizingTool",
} as const;
export type Tools = typeof Tools[keyof typeof Tools];

export interface ResizeProps {
  width: number;
  height: number;
  top: number;
  left: number;
  overlayRect: DOMRect;
}

export abstract class Tool {
  constructor(public name: string) {}

  resize({}: ResizeProps) {
    throw AppError.new(
      ErrorKind.NotImplementedError,
      `Please set resize method in your tool: "${this.name}"`,
    );
  }
}

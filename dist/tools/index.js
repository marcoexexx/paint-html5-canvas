import { AppError, ErrorKind } from "../error.js";
export const Tools = {
  CanvasTool: "CanvasTool",
  ColorTool: "ColorTool",
  DrawingTool: "DrawingTool",
  SizingTool: "SizingTool",
};
export class Tool {
  constructor(name) {
    this.name = name;
  }
  resize({}) {
    throw AppError.new(
      ErrorKind.NotImplementedError,
      `Please set resize method in your tool: "${this.name}"`,
    );
  }
}

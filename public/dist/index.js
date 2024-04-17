import { ColorTool } from "./tools/colors.js";
import { DrawableCanvas } from "./tools/drawableCanvas.js";
import { DrawingItemTool } from "./tools/items.js";
import { SizingTool } from "./tools/sizing.js";
import { createElement } from "./utils.js";
class Paint {
  constructor(tools, backgroundOverlay) {
    this.backgroundOverlay = backgroundOverlay;
    this.tools = tools;
    this.tools.canvas.props.addEventListener(
      "mousedown",
      this.handleMouseDown.bind(this),
    );
    this.tools.canvas.props.addEventListener(
      "mousemove",
      this.handleMouseMove.bind(this),
    );
    this.tools.canvas.props.addEventListener(
      "mouseup",
      this.handleMouseUp.bind(this),
    );
    this.tools.canvas.props.addEventListener(
      "mouseout",
      this.handleMouseOut.bind(this),
    );
    setTimeout(() => this.resize(), 100);
    window.addEventListener("resize", this.resize.bind(this));
  }
  resize() {
    const overlayRect = this.backgroundOverlay.getBoundingClientRect();
    this.tools.canvas.resize({
      width: .750,
      height: .70,
      top: .235,
      left: .016,
      overlayRect,
    });
    this.tools.colors.resize({
      width: .17,
      height: .38,
      top: .06,
      left: .8,
      overlayRect: overlayRect,
    });
    this.tools.items.resize({
      width: .17,
      height: .29,
      top: .49,
      left: .8,
      overlayRect: overlayRect,
    });
    this.tools.sizing.resize({
      width: .17,
      height: .06,
      top: .88,
      left: .8,
      overlayRect: overlayRect,
    });
  }
  static new(tools, backgroundOverlay) {
    return new Paint(tools, backgroundOverlay);
  }
  handleMouseDown(evt) {
    this.tools.canvas.handleMouseDown(evt);
  }
  handleMouseMove(evt) {
    if (this.tools.canvas.ctx) {
      this.tools.canvas.addCursor(this.tools.items.cursorUrl);
      this.tools.canvas.ctx.strokeStyle = this.tools.colors.currentColor;
      switch (this.tools.items.currentItem) {
        case "eraser": {
          this.tools.canvas.mode = "eraser";
          break;
        }
        case "insert": {
          this.tools.canvas.mode = "insert";
          break;
        }
        default: {
          this.tools.canvas.mode = "draw";
          break;
        }
      }
      if (
        this.tools.items.currentItem !== "eraser"
        && this.tools.items.currentItem !== "insert"
      ) {
        this.tools.canvas.ctx.lineCap = this.tools.items.currentItem;
      }
      this.tools.canvas.ctx.lineWidth = this.tools.sizing.currentSize;
    }
    this.tools.canvas.handleMouseMove(evt);
  }
  handleMouseUp(evt) {
    this.tools.canvas.handleMouseUp(evt);
  }
  handleMouseOut(evt) {
    this.tools.canvas.handleMouseOut(evt);
  }
}
export {
  ColorTool,
  createElement,
  DrawableCanvas,
  DrawingItemTool,
  Paint,
  SizingTool,
};

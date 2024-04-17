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

class Paint {
  tools: PaintTool;

  constructor(
    tools: PaintTool,
    public backgroundOverlay: HTMLElement,
  ) {
    this.tools = tools;

    // Event listeners
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

    // Resize
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

  static new(tools: PaintTool, backgroundOverlay: HTMLElement) {
    return new Paint(tools, backgroundOverlay);
  }

  handleMouseDown(evt: MouseEvent) {
    this.tools.canvas.handleMouseDown(evt);
  }

  handleMouseMove(evt: MouseEvent) {
    if (this.tools.canvas.ctx) {
      // this.tools.canvas.props.style.cursor = "url(/assets/pen.png), auto"
      this.tools.canvas.addCursor(this.tools.items.cursorUrl);

      // colors
      this.tools.canvas.ctx.strokeStyle = this.tools.colors.currentColor;

      // drawing items
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

      // size
      this.tools.canvas.ctx.lineWidth = this.tools.sizing.currentSize;
    }
    this.tools.canvas.handleMouseMove(evt);
  }

  handleMouseUp(evt: MouseEvent) {
    this.tools.canvas.handleMouseUp(evt);
  }

  handleMouseOut(evt: MouseEvent) {
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

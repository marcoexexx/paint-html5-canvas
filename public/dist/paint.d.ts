interface ElementInput {
  tagName: string;
  style?: Partial<CSSStyleDeclaration>;
  innerProps?: Partial<HTMLElement | HTMLImageElement> & {
    [key: `data-${string}`]: string;
  };
}
declare function createElement(
  parentQuery: string,
  elementInput: ElementInput,
): HTMLElement;

interface ResizeProps {
  width: number;
  height: number;
  top: number;
  left: number;
  overlayRect: DOMRect;
}
declare abstract class Tool {
  name: string;
  constructor(name: string);
  resize({}: ResizeProps): void;
}

interface ColorToolProps extends HTMLElement {
}
declare class ColorTool extends Tool {
  props: ColorToolProps;
  currentColor: string;
  constructor(props: ColorToolProps);
  static new(props: ColorToolProps): ColorTool;
  haldleOnClick(color: string): (_evt: MouseEvent) => void;
  resize({ width, height, top, left, overlayRect }: ResizeProps): void;
  addColor(elementInput: ElementInput): void;
}

interface DrawableCanvasProps extends HTMLCanvasElement {
}
declare class DrawableCanvas extends Tool {
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

interface DrawingItemToolProps extends HTMLElement {
}
declare class DrawingItemTool extends Tool {
  props: DrawingItemToolProps;
  currentItem: CanvasLineCap | "eraser" | "insert";
  cursorUrl: string;
  constructor(props: DrawingItemToolProps);
  static new(props: DrawingItemToolProps): DrawingItemTool;
  haldleOnClick(
    item: CanvasLineCap | "eraser",
    id: string,
    cursorUrl: string,
  ): (_evt: MouseEvent) => void;
  resize({ width, height, top, left, overlayRect }: ResizeProps): void;
  addItem(url: string, elementInput: ElementInput): void;
}

interface SizingToolProps extends HTMLElement {
}
declare class SizingTool extends Tool {
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

export {
  ColorTool,
  createElement,
  DrawableCanvas,
  DrawingItemTool,
  Paint,
  SizingTool,
};

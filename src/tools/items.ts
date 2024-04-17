import { AppError, ErrorKind } from "../error.js";
import { createElement, ElementInput } from "../utils.js";
import { ResizeProps, Tool } from "./index.js";

interface DrawingItemToolProps extends HTMLElement {}

export class DrawingItemTool extends Tool {
  currentItem: CanvasLineCap | "eraser" | "insert" = "round";
  cursorUrl: string = "assets/brush.png";

  constructor(public props: DrawingItemToolProps) {
    super("DrawingItemTool");

    this.props.setAttribute("id", "tool-container");
  }

  static new(props: DrawingItemToolProps) {
    return new DrawingItemTool(props);
  }

  haldleOnClick(
    item: CanvasLineCap | "eraser",
    id: string,
    cursorUrl: string,
  ) {
    return (_evt: MouseEvent) => {
      this.props.childNodes.forEach(node => {
        // @ts-ignore
        if (node.id === id) node.style.opacity = ".5";
        // @ts-ignore
        else node.style.opacity = "1";
      });

      this.currentItem = item;
      this.cursorUrl = cursorUrl;
    };
  }

  resize(
    { width, height, top, left, overlayRect }: ResizeProps,
  ) {
    const props = this.props;
    props.style.width = overlayRect.width * width + "px";
    props.style.height = overlayRect.height * height + "px";
    props.style.top = overlayRect.top + (overlayRect.height * top)
      + "px";
    props.style.left = overlayRect.left + (overlayRect.width * left)
      + "px";
  }

  addItem(url: string, elementInput: ElementInput) {
    if (!elementInput.innerProps?.id) {
      throw AppError.new(
        ErrorKind.ElementIdNotFoundError,
        `tool item must have id`,
      );
    }

    const itemElement = createElement(`#${this.props.id}`, elementInput);
    const imgElement = createElement(`#${elementInput.innerProps.id}`, {
      tagName: "img",
      innerProps: {
        src: url,
      },
      style: {
        padding: "10%",
        width: "80%",
        height: "80%",
      },
    });

    itemElement.appendChild(imgElement);

    const item = elementInput.innerProps["data-line-cap"];

    itemElement.addEventListener(
      "click",
      this.haldleOnClick(item as CanvasLineCap, itemElement.id, url),
    );
  }
}

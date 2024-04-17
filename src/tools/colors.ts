import { createElement, ElementInput } from "../utils.js";
import { ResizeProps, Tool } from "./index.js";

interface ColorToolProps extends HTMLElement {}

export class ColorTool extends Tool {
  currentColor = "#00";

  constructor(public props: ColorToolProps) {
    super("ColorTool");

    this.props.setAttribute("id", "color-container");
  }

  static new(props: ColorToolProps) {
    return new ColorTool(props);
  }

  haldleOnClick(color: string) {
    return (_evt: MouseEvent) => {
      this.currentColor = color;
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

  addColor(elementInput: ElementInput) {
    const colorElement = createElement(`#${this.props.id}`, elementInput);

    const color = elementInput.style?.background;
    if (color) {
      colorElement.addEventListener("click", this.haldleOnClick(color));
    }
  }
}

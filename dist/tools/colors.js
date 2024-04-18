import { createElement } from "../utils.js";
import { Tool } from "./index.js";
export class ColorTool extends Tool {
    constructor(props) {
        super("ColorTool");
        this.props = props;
        this.currentColor = "#00";
        this.props.setAttribute("id", "color-container");
    }
    static new(props) {
        return new ColorTool(props);
    }
    haldleOnClick(color) {
        return (_evt) => {
            this.currentColor = color;
        };
    }
    resize({ width, height, top, left, overlayRect }) {
        const props = this.props;
        props.style.width = overlayRect.width * width + "px";
        props.style.height = overlayRect.height * height + "px";
        props.style.top = overlayRect.top + (overlayRect.height * top)
            + "px";
        props.style.left = overlayRect.left + (overlayRect.width * left)
            + "px";
    }
    addColor(elementInput) {
        var _a;
        const colorElement = createElement(`#${this.props.id}`, elementInput);
        const color = (_a = elementInput.style) === null || _a === void 0 ? void 0 : _a.background;
        if (color) {
            colorElement.addEventListener("click", this.haldleOnClick(color));
        }
    }
}

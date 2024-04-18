import { AppError, ErrorKind } from "../error.js";
import { createElement } from "../utils.js";
import { Tool } from "./index.js";
export class DrawingItemTool extends Tool {
    constructor(props) {
        super("DrawingItemTool");
        this.props = props;
        this.currentItem = "round";
        this.cursorUrl = "assets/brush.png";
        this.props.setAttribute("id", "tool-container");
    }
    static new(props) {
        return new DrawingItemTool(props);
    }
    haldleOnClick(item, id, cursorUrl) {
        return (_evt) => {
            this.props.childNodes.forEach(node => {
                if (node.id === id)
                    node.style.opacity = ".5";
                else
                    node.style.opacity = "1";
            });
            this.currentItem = item;
            this.cursorUrl = cursorUrl;
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
    addItem(url, elementInput) {
        var _a;
        if (!((_a = elementInput.innerProps) === null || _a === void 0 ? void 0 : _a.id)) {
            throw AppError.new(ErrorKind.ElementIdNotFoundError, `tool item must have id`);
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
        itemElement.addEventListener("click", this.haldleOnClick(item, itemElement.id, url));
    }
}

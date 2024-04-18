import { AppError, ErrorKind } from "../error.js";
import { createElement } from "../utils.js";
import { Tool } from "./index.js";
const offsetSize = 15;
export class SizingTool extends Tool {
    constructor(props) {
        super("SizingTool");
        this.props = props;
        this.currentSize = 0;
        this.isFirstSizeAdded = false;
        this.props.setAttribute("id", "size-container");
    }
    static new(props) {
        return new SizingTool(props);
    }
    haldleOnClick(size) {
        return (_evt) => {
            try {
                const parsedSize = parseInt(size, 10);
                this.currentSize = parsedSize * offsetSize;
                this.props.childNodes.forEach(node => {
                    const currentId = `size-indicator-slider-${this.currentSize / offsetSize}`;
                    const currentEl = node.childNodes.item(1);
                    if (currentEl.id === currentId) {
                        currentEl.style.display = "block";
                    }
                    else {
                        currentEl.style.display = "none";
                    }
                });
            }
            catch (err) {
                console.log("size must number: " + err.message);
            }
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
    addSize(elementInput) {
        var _a, _b;
        if (!((_a = elementInput.innerProps) === null || _a === void 0 ? void 0 : _a["data-size"])) {
            throw AppError.new(ErrorKind.ElementIdNotFoundError, `Please set data attribute for size item`);
        }
        const size_item = createElement(`#${this.props.id}`, {
            tagName: "div",
            innerProps: {
                id: `size-item-${elementInput.innerProps["data-size"]}`,
            },
            style: {
                position: "absolute",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                left: (_b = elementInput.style) === null || _b === void 0 ? void 0 : _b.left,
                height: "100%",
            },
        });
        const size_indicator_container = createElement(`#${size_item.id}`, {
            tagName: "div",
            innerProps: {
                id: `size-item-indicator-container-${elementInput.innerProps["data-size"]}`,
            },
            style: Object.assign(Object.assign({}, elementInput.style), { width: "none", background: "none", border: "none", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }),
        });
        const size_indicator = createElement(`#${size_indicator_container.id}`, {
            tagName: "div",
            innerProps: {
                id: `size-item-indicator-${elementInput.innerProps["data-size"]}`,
            },
            style: {
                width: `${elementInput.innerProps["data-size"]}px`,
                height: `${elementInput.innerProps["data-size"]}px`,
                borderRadius: "50%",
                background: "black",
            },
        });
        const colorElement = createElement(`#${size_item.id}`, Object.assign(Object.assign({}, elementInput), { innerProps: {
                id: `size-indicator-slider-${elementInput.innerProps["data-size"]}`,
            }, style: Object.assign(Object.assign({}, elementInput.style), { display: "none", width: "16px", height: "16px", borderRadius: "50%" }) }));
        const size = elementInput.innerProps["data-size"];
        if (!this.isFirstSizeAdded)
            this.loadFirstSize(size);
        if (size) {
            colorElement.addEventListener("click", this.haldleOnClick(size));
            size_indicator.addEventListener("click", this.haldleOnClick(size));
        }
    }
    loadFirstSize(size) {
        try {
            const _size = parseInt(size, 10);
            this.currentSize = _size * offsetSize;
            this.props.childNodes.item(0).childNodes.item(1).style.display =
                "block";
        }
        catch (e) {
            console.error(e);
        }
    }
}

const ErrorKind = {
    CanvasNotFoundError: "CanvasNotFoundError",
    ElementIdNotFoundError: "ElementIdNotFoundError",
    ParentElementNotFoundError: "ParentElementNotFoundError",
    NotImplementedError: "NotImplementedError",
};
class AppError extends Error {
    constructor(kind, message) {
        super(`${message}: ${kind}`);
        this.kind = kind;
    }
    static new(kind, message = "Unknown error") {
        return new AppError(kind, message);
    }
}

function createElement(parentQuery, elementInput) {
    var _a;
    const root = window.document.querySelector(parentQuery);
    const element = window.document.createElement(elementInput.tagName);
    if (!root)
        throw AppError.new(ErrorKind.ParentElementNotFoundError);
    Object.assign(element.style, elementInput.style);
    if (((_a = elementInput === null || elementInput === void 0 ? void 0 : elementInput.innerProps) === null || _a === void 0 ? void 0 : _a.classList)
        && elementInput.innerProps.classList.length > 0) {
        elementInput.innerProps.classList.forEach(className => element.classList.add(className));
    }
    if (elementInput.innerProps) {
        Object.keys(elementInput.innerProps).forEach(attr => {
            if (attr !== "classList") {
                // @ts-ignore
                element.setAttribute(attr, elementInput.innerProps[attr]);
            }
        });
    }
    root.appendChild(element);
    return element;
}

class Tool {
    constructor(name) {
        this.name = name;
    }
    resize({}) {
        throw AppError.new(ErrorKind.NotImplementedError, `Please set resize method in your tool: "${this.name}"`);
    }
}

class ColorTool extends Tool {
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

const getCursorElement = (cursorImage) => ({
    tagName: "img",
    innerProps: {
        src: cursorImage,
    },
    style: {
        zIndex: "10",
        width: "10%",
    },
});
class DrawableCanvas extends Tool {
    constructor(props) {
        var _a;
        super("DrawableCanvas");
        this.props = props;
        this.insertedImageAngle = 0;
        this.isRotating = false;
        this.isPainting = false;
        this.isSaved = true;
        this.lastX = 0;
        this.lastY = 0;
        this.mode = "draw";
        this.ctx = null;
        this.newCanvasCtxs = [];
        this.cursor = null;
        this.cursorImage = null;
        this.insertedImage = null;
        this.imageX = 0;
        this.imageY = 0;
        this.ctx = props.getContext("2d");
        this.props.style.cursor = "none";
        this.cursor = window.document.querySelector(".cursor");
        if (!this.cursor) {
            this.cursor = createElement("#root", {
                tagName: "div",
                innerProps: {
                    // @ts-ignore
                    classList: ["cursor"],
                },
                style: {
                    width: "5%",
                    zIndex: "10",
                },
            });
            if (this.cursorImage) {
                (_a = this.cursor) === null || _a === void 0 ? void 0 : _a.appendChild(createElement("img", getCursorElement(this.cursorImage)));
            }
        }
    }
    static new(props) {
        return new DrawableCanvas(props);
    }
    resize({ width, height, top, left, overlayRect }) {
        const props = this.props;
        const imageData = this.ctx
            ? this.ctx.getImageData(0, 0, props.width, props.height)
            : null;
        const newTop = overlayRect.top + (overlayRect.height * top);
        const newLeft = overlayRect.left + (overlayRect.width * left);
        const inMemCanvas = document.createElement("canvas");
        const inMemCtx = inMemCanvas.getContext("2d");
        if (!inMemCtx || !this.ctx)
            return;
        inMemCanvas.width = props.width;
        inMemCanvas.height = props.height;
        inMemCtx.drawImage(this.props, 0, 0);
        props.id = "drawable-canvas";
        props.width = overlayRect.width * width;
        props.height = overlayRect.height * height;
        props.style.top = newTop + "px";
        props.style.left = newLeft + "px";
        if (!this.isSaved) {
            // WARN: clear all  canvas
            const canvases = window.document.querySelectorAll(".image-canvas");
            canvases.forEach(canvas => {
                canvas.remove();
            });
            return window.alert("Changes you made may not be saved.");
        }
        if (imageData) {
            this.ctx.clearRect(0, 0, props.width, props.height);
            this.ctx.putImageData(imageData, 0, 0);
        }
    }
    draw(x, y) {
        if (this.ctx) {
            const ctxs = [
                { ctx: this.ctx, type: "main" },
            ].concat(this.newCanvasCtxs.map(ctx => ({
                ctx,
                type: "image",
            })));
            ctxs.forEach(({ ctx, type }) => {
                var _a;
                ctx.beginPath();
                if (this.mode === "eraser") {
                    ctx.globalCompositeOperation = "destination-out";
                    ctx.arc(x, y, ((_a = ctx.lineWidth) !== null && _a !== void 0 ? _a : 1) / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                else if (this.mode === "insert") {
                    return;
                }
                else {
                    if (type !== "main")
                        return;
                    ctx.globalCompositeOperation = "source-over";
                    ctx.moveTo(this.lastX, this.lastY);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
                [this.lastX, this.lastY] = [x, y];
            });
        }
    }
    setupNewCanvasForImage() {
        const newCanvas = createElement(".container", {
            tagName: "canvas",
            innerProps: {
                id: `image-canvas-${this.newCanvasCtxs.length}`,
                // @ts-ignore
                classList: [`image-canvas`],
                width: this.props.width,
                height: this.props.height,
            },
            style: {
                position: "absolute",
                left: this.props.style.left,
                top: this.props.style.top,
                zIndex: "10",
                pointerEvents: "none",
            },
        });
        const newCanvasCtx = newCanvas.getContext("2d");
        if (!newCanvasCtx || !this.ctx) {
            throw AppError.new(ErrorKind.CanvasNotFoundError, `Could not get context from image canvas`);
        }
        newCanvasCtx.fillStyle = this.ctx.fillStyle;
        newCanvasCtx.strokeStyle = this.ctx.strokeStyle;
        newCanvasCtx.lineWidth = this.ctx.lineWidth;
        this.newCanvasCtxs.push(newCanvasCtx);
        return newCanvasCtx;
    }
    handleConfirmImage() {
        var _a, _b, _c, _d, _e, _f;
        if (!this.insertedImage) {
            throw AppError.new(ErrorKind.ElementIdNotFoundError, `insertedImage not found.`);
        }
        const angle = this.insertedImageAngle;
        const centerX = (this.imageX - 20) + ((_b = (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.lineWidth) !== null && _b !== void 0 ? _b : 1) / 2;
        const centerY = this.imageY - ((_d = (_c = this.ctx) === null || _c === void 0 ? void 0 : _c.lineWidth) !== null && _d !== void 0 ? _d : 1) / 2;
        const ctx = this.setupNewCanvasForImage();
        if (ctx && this.ctx) {
            ctx.translate(centerX, centerY);
            ctx.rotate(angle * Math.PI / 180);
            ctx.translate(-centerX, -centerY);
            ctx.drawImage(this.insertedImage, this.imageX - 20, this.imageY - ((_e = this.ctx.lineWidth) !== null && _e !== void 0 ? _e : 2), this.ctx.lineWidth, this.ctx.lineWidth);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.globalCompositeOperation = "source-in";
            ctx.fillStyle = this.ctx.strokeStyle;
            ctx.fillRect(this.imageX - 20, this.imageY - ((_f = this.ctx.lineWidth) !== null && _f !== void 0 ? _f : 2), this.ctx.lineWidth, this.ctx.lineWidth);
            ctx.globalCompositeOperation = "source-over";
            this.insertedImage = null;
        }
    }
    createConfirmLayer() {
        var _a, _b;
        if (!this.insertedImage) {
            throw AppError.new(ErrorKind.ElementIdNotFoundError, `insertedImage not found.`);
        }
        const cursorEl = window.document.querySelector(".cursor");
        if (!cursorEl) {
            throw AppError.new(ErrorKind.ElementIdNotFoundError, `Cursor not found`);
        }
        const cursorRect = cursorEl.getBoundingClientRect();
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const insertImgContainer = createElement(".container", {
            tagName: "div",
            innerProps: {
                id: "insert-image-container",
            },
            style: {
                position: "absolute",
                top: cursorRect.top + scrollY + "px",
                left: cursorRect.left + scrollX + "px",
                width: ((_a = this.ctx) === null || _a === void 0 ? void 0 : _a.lineWidth) + "px",
                height: ((_b = this.ctx) === null || _b === void 0 ? void 0 : _b.lineWidth) + "px",
                border: "2px solid #ccc",
                zIndex: "20",
                cursor: "pointer",
            },
        });
        createElement(`#${insertImgContainer.id}`, {
            tagName: "img",
            innerProps: {
                src: this.insertedImage.src,
            },
            style: {
                position: "absolute",
                width: "100%",
                pointerEvents: "none",
            },
        });
        const rotateButton = createElement(`#${insertImgContainer.id}`, {
            tagName: "div",
            innerProps: {
                id: "image-rotate-button",
            },
            style: {
                position: "absolute",
                top: "-35%",
                left: "40%",
                width: "30%",
                height: "30%",
                background: "yellow",
            },
        });
        const confirmButton = createElement(`#${insertImgContainer.id}`, {
            tagName: "div",
            innerProps: {
                id: "image-confirm-button",
            },
            style: {
                position: "absolute",
                top: "40%",
                left: "100%",
                width: "30%",
                height: "30%",
                background: "green",
            },
        });
        const cancelButton = createElement(`#${insertImgContainer.id}`, {
            tagName: "div",
            innerProps: {
                id: "image-cancel-button",
            },
            style: {
                position: "absolute",
                top: "70%",
                left: "100%",
                width: "30%",
                height: "30%",
                background: "red",
            },
        });
        confirmButton.addEventListener("click", (_evt) => {
            this.handleConfirmImage();
            insertImgContainer.remove();
        });
        cancelButton.addEventListener("click", (_evt) => {
            insertImgContainer.remove();
            this.insertedImage = null;
        });
        // rotate handler
        rotateButton.addEventListener("mousedown", () => this.isRotating = !this.isRotating);
        rotateButton.addEventListener("mouseup", () => this.isRotating = false);
        insertImgContainer.addEventListener("mousemove", (evt) => {
            if (!this.isRotating)
                return;
            const rect = insertImgContainer.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = evt.clientX - centerX;
            const deltaY = evt.clientY - centerY;
            const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
                + 80;
            insertImgContainer.style.transform = `rotate(${angle}deg)`;
            this.insertedImageAngle = angle;
        });
    }
    handleImageInsert(x, y) {
        if (this.ctx) {
            if (!this.insertedImage) {
                this.insertedImageAngle = 0;
                const img = new Image();
                img.src = "assets/shoes.png";
                img.onload = () => {
                    this.insertedImage = img;
                    this.imageX = x;
                    this.imageY = y;
                    this.createConfirmLayer();
                    // this.handleConfirmImage();
                };
            }
        }
    }
    handleMouseDown(evt) {
        const { offsetX, offsetY } = evt;
        this.isPainting = true;
        this.isSaved = false;
        this.lastX = offsetX;
        this.lastY = offsetY;
        if (this.mode === "insert")
            this.handleImageInsert(offsetX, offsetY);
    }
    handleMouseMove(evt) {
        var _a, _b, _c, _d, _e;
        (_a = this.cursor) === null || _a === void 0 ? void 0 : _a.setAttribute("style", "top: " + (evt.pageY - ((_c = (_b = this.ctx) === null || _b === void 0 ? void 0 : _b.lineWidth) !== null && _c !== void 0 ? _c : 1)) + "px; left: "
            + (evt.pageX - 20)
            + `px; position: absolute; width: ${((_e = (_d = this.ctx) === null || _d === void 0 ? void 0 : _d.lineWidth) !== null && _e !== void 0 ? _e : 1) * 10}px; z-index: 10; pointer-events: none`);
        if (!this.isPainting)
            return;
        const { offsetX, offsetY } = evt;
        this.draw(offsetX, offsetY);
    }
    checkCanvasIsEmpty(data) {
        let isEmpty = true;
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] !== 0) {
                isEmpty = false;
                break;
            }
        }
        return isEmpty;
    }
    handleMouseUp(_evt) {
        this.isPainting = false;
        if (this.ctx) {
            const ctxs = this.newCanvasCtxs;
            ctxs.forEach((ctx, idx) => {
                const imageData = ctx.getImageData(0, 0, this.props.width, this.props.height);
                const data = imageData.data;
                if (this.checkCanvasIsEmpty(data)) {
                    const _canvas = window.document.querySelector(`#image-canvas-${idx}`);
                    _canvas === null || _canvas === void 0 ? void 0 : _canvas.remove();
                }
            });
        }
    }
    handleMouseOut(_evt) {
        this.isPainting = false;
    }
    addCursor(url) {
        var _a, _b;
        this.cursorImage = url;
        while ((_a = this.cursor) === null || _a === void 0 ? void 0 : _a.firstChild) {
            this.cursor.removeChild(this.cursor.firstChild);
        }
        (_b = this.cursor) === null || _b === void 0 ? void 0 : _b.appendChild(createElement("img", getCursorElement(this.cursorImage)));
    }
}

class DrawingItemTool extends Tool {
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
                // @ts-ignore
                if (node.id === id)
                    node.style.opacity = ".5";
                // @ts-ignore
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

const offsetSize = 15;
class SizingTool extends Tool {
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
                // clean and active currentSize
                this.props.childNodes.forEach(node => {
                    const currentId = `size-indicator-slider-${this.currentSize / offsetSize}`;
                    const currentEl = node.childNodes.item(1);
                    // @ts-ignore
                    if (currentEl.id === currentId) {
                        // @ts-ignore
                        currentEl.style.display = "block";
                    }
                    else {
                        // @ts-ignore
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
            style: {
                ...elementInput.style,
                width: "none",
                background: "none",
                border: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            },
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
        const colorElement = createElement(`#${size_item.id}`, {
            ...elementInput,
            innerProps: {
                id: `size-indicator-slider-${elementInput.innerProps["data-size"]}`,
            },
            style: {
                ...elementInput.style,
                display: "none",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
            },
        });
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
            // @ts-ignore
            this.props.childNodes.item(0).childNodes.item(1).style.display =
                "block";
        }
        catch (e) {
            console.error(e);
        }
    }
}

class Paint {
    constructor(tools, backgroundOverlay) {
        this.backgroundOverlay = backgroundOverlay;
        this.tools = tools;
        // Event listeners
        this.tools.canvas.props.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.tools.canvas.props.addEventListener("mousemove", this.handleMouseMove.bind(this));
        this.tools.canvas.props.addEventListener("mouseup", this.handleMouseUp.bind(this));
        this.tools.canvas.props.addEventListener("mouseout", this.handleMouseOut.bind(this));
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
    static new(tools, backgroundOverlay) {
        return new Paint(tools, backgroundOverlay);
    }
    handleMouseDown(evt) {
        this.tools.canvas.handleMouseDown(evt);
    }
    handleMouseMove(evt) {
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
            if (this.tools.items.currentItem !== "eraser"
                && this.tools.items.currentItem !== "insert") {
                this.tools.canvas.ctx.lineCap = this.tools.items.currentItem;
            }
            // size
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

export { ColorTool, DrawableCanvas, DrawingItemTool, Paint, SizingTool, createElement };

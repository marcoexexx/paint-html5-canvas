import { AppError, ErrorKind } from "../error.js";
import { createElement } from "../utils.js";
import { Tool } from "./index.js";
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
export class DrawableCanvas extends Tool {
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
          classList: ["cursor"],
        },
        style: {
          width: "5%",
          zIndex: "10",
        },
      });
      if (this.cursorImage) {
        (_a = this.cursor) === null || _a === void 0
          ? void 0
          : _a.appendChild(
            createElement("img", getCursorElement(this.cursorImage)),
          );
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
    if (!inMemCtx || !this.ctx) {
      return;
    }
    inMemCanvas.width = props.width;
    inMemCanvas.height = props.height;
    inMemCtx.drawImage(this.props, 0, 0);
    props.id = "drawable-canvas";
    props.width = overlayRect.width * width;
    props.height = overlayRect.height * height;
    props.style.top = newTop + "px";
    props.style.left = newLeft + "px";
    if (!this.isSaved) {
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
      const ctxs = [this.ctx, ...this.newCanvasCtxs];
      ctxs.forEach(ctx => {
        var _a;
        ctx.beginPath();
        if (this.mode === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
          ctx.arc(
            x,
            y,
            ((_a = ctx.lineWidth) !== null && _a !== void 0 ? _a : 1) / 2,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        } else if (this.mode === "insert") {
          return;
        } else {
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
      throw AppError.new(
        ErrorKind.CanvasNotFoundError,
        `Could not get context from image canvas`,
      );
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
      throw AppError.new(
        ErrorKind.ElementIdNotFoundError,
        `insertedImage not found.`,
      );
    }
    const angle = this.insertedImageAngle;
    const centerX = (this.imageX - 20)
      + ((_b = (_a = this.ctx) === null || _a === void 0
                ? void 0
                : _a.lineWidth) !== null && _b !== void 0
          ? _b
          : 1) / 2;
    const centerY = this.imageY
      - ((_d = (_c = this.ctx) === null || _c === void 0
                ? void 0
                : _c.lineWidth) !== null && _d !== void 0
          ? _d
          : 1) / 2;
    const ctx = this.setupNewCanvasForImage();
    if (ctx && this.ctx) {
      ctx.translate(centerX, centerY);
      ctx.rotate(angle * Math.PI / 180);
      ctx.translate(-centerX, -centerY);
      ctx.drawImage(
        this.insertedImage,
        this.imageX - 20,
        this.imageY
          - ((_e = this.ctx.lineWidth) !== null && _e !== void 0 ? _e : 2),
        this.ctx.lineWidth,
        this.ctx.lineWidth,
      );
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = this.ctx.strokeStyle;
      ctx.fillRect(
        this.imageX - 20,
        this.imageY
          - ((_f = this.ctx.lineWidth) !== null && _f !== void 0 ? _f : 2),
        this.ctx.lineWidth,
        this.ctx.lineWidth,
      );
      ctx.globalCompositeOperation = "source-over";
      this.insertedImage = null;
    }
  }
  createConfirmLayer() {
    var _a, _b;
    if (!this.insertedImage) {
      throw AppError.new(
        ErrorKind.ElementIdNotFoundError,
        `insertedImage not found.`,
      );
    }
    const cursorEl = window.document.querySelector(".cursor");
    if (!cursorEl) {
      throw AppError.new(
        ErrorKind.ElementIdNotFoundError,
        `Cursor not found`,
      );
    }
    const cursorRect = cursorEl.getBoundingClientRect();
    const insertImgContainer = createElement(".container", {
      tagName: "div",
      innerProps: {
        id: "insert-image-container",
      },
      style: {
        position: "absolute",
        top: cursorRect.top + "px",
        left: cursorRect.left + "px",
        width: ((_a = this.ctx) === null || _a === void 0
          ? void 0
          : _a.lineWidth) + "px",
        height: ((_b = this.ctx) === null || _b === void 0
          ? void 0
          : _b.lineWidth) + "px",
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
    rotateButton.addEventListener(
      "mousedown",
      () => this.isRotating = !this.isRotating,
    );
    rotateButton.addEventListener(
      "mouseup",
      () => this.isRotating = false,
    );
    insertImgContainer.addEventListener("mousemove", (evt) => {
      if (!this.isRotating) {
        return;
      }
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
    if (this.mode === "insert") {
      this.handleImageInsert(offsetX, offsetY);
    }
  }
  handleMouseMove(evt) {
    var _a, _b, _c, _d, _e;
    (_a = this.cursor) === null || _a === void 0
      ? void 0
      : _a.setAttribute(
        "style",
        "top: "
          + (evt.pageY - ((_c = (_b = this.ctx) === null || _b === void 0
                  ? void 0
                  : _b.lineWidth) !== null && _c !== void 0
            ? _c
            : 1))
          + "px; left: "
          + (evt.pageX - 20)
          + `px; position: absolute; width: ${
            ((_e = (_d = this.ctx) === null || _d === void 0
                    ? void 0
                    : _d.lineWidth) !== null && _e !== void 0
              ? _e
              : 1) * 10
          }px; z-index: 10; pointer-events: none`,
      );
    if (!this.isPainting) {
      return;
    }
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
        const imageData = ctx.getImageData(
          0,
          0,
          this.props.width,
          this.props.height,
        );
        const data = imageData.data;
        if (this.checkCanvasIsEmpty(data)) {
          const _canvas = window.document.querySelector(
            `#image-canvas-${idx}`,
          );
          _canvas === null || _canvas === void 0
            ? void 0
            : _canvas.remove();
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
    while (
      (_a = this.cursor) === null || _a === void 0
        ? void 0
        : _a.firstChild
    ) {
      this.cursor.removeChild(this.cursor.firstChild);
    }
    (_b = this.cursor) === null || _b === void 0
      ? void 0
      : _b.appendChild(
        createElement("img", getCursorElement(this.cursorImage)),
      );
  }
}

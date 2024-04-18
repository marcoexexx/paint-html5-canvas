import { AppError, ErrorKind } from "../error.js";
import { createElement } from "../utils.js";
import { ResizeProps, Tool } from "./index.js";

const getCursorElement = (cursorImage: string) => ({
  tagName: "img",
  innerProps: {
    src: cursorImage,
  },
  style: {
    zIndex: "10",
    width: "10%",
  },
});

interface DrawableCanvasProps extends HTMLCanvasElement {}

export class DrawableCanvas extends Tool {
  insertedImageAngle = 0;
  isRotating = false;
  isPainting = false;
  isSaved = true;
  lastX = 0;
  lastY = 0;
  mode: "eraser" | "insert" | "draw" = "draw";
  ctx: CanvasRenderingContext2D | null = null;
  newCanvasCtxs: CanvasRenderingContext2D[] = [];
  cursor: HTMLElement | null = null;
  cursorImage: string | null = null;

  insertedImage: HTMLImageElement | null = null;
  imageX: number = 0;
  imageY: number = 0;

  constructor(public props: DrawableCanvasProps) {
    super("DrawableCanvas");
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
        this.cursor?.appendChild(
          createElement("img", getCursorElement(this.cursorImage)),
        );
      }
    }
  }

  static new(props: DrawableCanvasProps) {
    return new DrawableCanvas(props);
  }

  resize({ width, height, top, left, overlayRect }: ResizeProps) {
    const props = this.props;

    const imageData = this.ctx
      ? this.ctx.getImageData(0, 0, props.width, props.height)
      : null;

    const newTop = overlayRect.top + (overlayRect.height * top);
    const newLeft = overlayRect.left + (overlayRect.width * left);

    const inMemCanvas = document.createElement("canvas");
    const inMemCtx = inMemCanvas.getContext("2d");

    if (!inMemCtx || !this.ctx) return;

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

      return window.alert(
        "Changes you made may not be saved.",
      );
    }

    if (imageData) {
      this.ctx.clearRect(0, 0, props.width, props.height);
      this.ctx.putImageData(imageData, 0, 0);
    }
  }

  private draw(x: number, y: number) {
    if (this.ctx) {
      const ctxs = [this.ctx, ...this.newCanvasCtxs];

      ctxs.forEach(ctx => {
        ctx.beginPath();
        if (this.mode === "eraser") {
          ctx.globalCompositeOperation = "destination-out";
          ctx.arc(x, y, (ctx.lineWidth ?? 1) / 2, 0, Math.PI * 2);
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
    }) as HTMLCanvasElement;
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
    if (!this.insertedImage) {
      throw AppError.new(
        ErrorKind.ElementIdNotFoundError,
        `insertedImage not found.`,
      );
    }

    const angle = this.insertedImageAngle;

    const centerX = (this.imageX - 20) + (this.ctx?.lineWidth ?? 1) / 2;
    const centerY = this.imageY - (this.ctx?.lineWidth ?? 1) / 2;

    const ctx = this.setupNewCanvasForImage();

    if (ctx && this.ctx) {
      ctx.translate(centerX, centerY);
      ctx.rotate(angle * Math.PI / 180);
      ctx.translate(-centerX, -centerY);

      ctx.drawImage(
        this.insertedImage,
        this.imageX - 20,
        this.imageY - (this.ctx.lineWidth ?? 2),
        this.ctx.lineWidth,
        this.ctx.lineWidth,
      );

      ctx.setTransform(1, 0, 0, 1, 0, 0);

      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = this.ctx.strokeStyle;
      ctx.fillRect(
        this.imageX - 20,
        this.imageY - (this.ctx.lineWidth ?? 2),
        this.ctx.lineWidth,
        this.ctx.lineWidth,
      );

      ctx.globalCompositeOperation = "source-over";

      this.insertedImage = null;
    }
  }

  createConfirmLayer() {
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

    const scrollX = window.scrollX || document.documentElement.scrollLeft
    const scrollY = window.scrollY || document.documentElement.scrollTop

    const insertImgContainer = createElement(".container", {
      tagName: "div",
      innerProps: {
        id: "insert-image-container",
      },
      style: {
        position: "absolute",
        top: cursorRect.top + scrollY + "px",
        left: cursorRect.left + scrollX + "px",
        width: this.ctx?.lineWidth + "px",
        height: this.ctx?.lineWidth + "px",

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
    const rotateButton = createElement(
      `#${insertImgContainer.id}`,
      {
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
      },
    );
    const confirmButton = createElement(
      `#${insertImgContainer.id}`,
      {
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
      },
    );
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
    rotateButton.addEventListener(
      "mousedown",
      () => this.isRotating = !this.isRotating,
    );
    rotateButton.addEventListener(
      "mouseup",
      () => this.isRotating = false,
    );
    insertImgContainer.addEventListener("mousemove", (evt) => {
      if (!this.isRotating) return;

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

  handleImageInsert(x: number, y: number) {
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

  handleMouseDown(evt: MouseEvent) {
    const { offsetX, offsetY } = evt;
    this.isPainting = true;
    this.isSaved = false;

    this.lastX = offsetX;
    this.lastY = offsetY;

    if (this.mode === "insert") this.handleImageInsert(offsetX, offsetY);
  }

  handleMouseMove(evt: MouseEvent) {
    this.cursor?.setAttribute(
      "style",
      "top: " + (evt.pageY - (this.ctx?.lineWidth ?? 1)) + "px; left: "
        + (evt.pageX - 20)
        + `px; position: absolute; width: ${
          (this.ctx?.lineWidth ?? 1) * 10
        }px; z-index: 10; pointer-events: none`,
    );

    if (!this.isPainting) return;

    const { offsetX, offsetY } = evt;
    this.draw(offsetX, offsetY);
  }

  checkCanvasIsEmpty(data: Uint8ClampedArray): boolean {
    let isEmpty = true;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] !== 0) {
        isEmpty = false;
        break;
      }
    }

    return isEmpty;
  }

  handleMouseUp(_evt: MouseEvent) {
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
          _canvas?.remove();
        }
      });
    }
  }

  handleMouseOut(_evt: MouseEvent) {
    this.isPainting = false;
  }

  addCursor(url: string) {
    this.cursorImage = url;

    while (this.cursor?.firstChild) {
      this.cursor.removeChild(this.cursor.firstChild);
    }
    this.cursor?.appendChild(
      createElement("img", getCursorElement(this.cursorImage)),
    );
  }
}

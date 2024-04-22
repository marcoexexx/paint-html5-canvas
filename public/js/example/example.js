"use strict";

import {
  ColorTool,
  createElement,
  DrawableCanvas,
  DrawingItemTool,
  Paint,
  SizingTool,
} from "../../dist/paint.js";
import { createColors } from "./colors.js";
import { createItems } from "./items.js";
import { createSizes } from "./sizes.js";

const BACKGROUND_OVERLAY = createElement(".container", {
  tagName: "img",
  innerProps: {
    src: "assets/background.png",
    classList: ["background"],
  },
  style: {
    position: "absolute",
    width: "100%",

    pointerEvents: "none",
  },
});

function main() {
  const tools = {
    canvas: DrawableCanvas.new(createElement(".container", {
      tagName: "canvas",
      innerProps: {},
      style: {
        position: "absolute",
        zIndex: 10,
      },
    })),

    colors: ColorTool.new(createElement(".container", {
      tagName: "div",
      innerProps: {},
      style: {
        position: "absolute",
        borderRadius: "30px",
      },
    })),

    items: DrawingItemTool.new(createElement(".container", {
      tagName: "div",
      innerProps: {},
      style: {
        position: "absolute",
      },
    })),

    sizing: SizingTool.new(createElement(".container", {
      tagName: "div",
      innerProps: {},
      style: {
        position: "absolute",
      },
    })),
  };

  // CREATE ITEMS
  createColors(tools.colors);
  createItems(tools.items);
  createSizes(tools.sizing);

  Paint.new(
    tools,
    BACKGROUND_OVERLAY,
  );
}

main();

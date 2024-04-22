"use strict";

import { DrawingItemTool } from "../../dist/paint.js";

/**
 * @param {DrawingItemTool} itemTool
 */
export function createItems(itemTool) {
  itemTool.addItem("assets/brush.png", {
    tagName: "div",
    innerProps: {
      id: "tool-item-brush",
      "data-line-cap": "round",
    },
    style: {
      position: "absolute",
      cursor: "pointer",
      height: "47%",
      width: "47%",
    },
  });
  itemTool.addItem("assets/pen.png", {
    tagName: "div",
    innerProps: {
      id: "tool-item-pen",
      "data-line-cap": "square",
    },
    style: {
      position: "absolute",
      cursor: "pointer",
      height: "47%",
      width: "47%",
      left: "53%",
      userSelect: "none",
    },
  });
  itemTool.addItem("assets/eraser.png", {
    tagName: "div",
    innerProps: {
      id: "tool-item-eraser",
      "data-line-cap": "eraser",
    },
    style: {
      position: "absolute",
      cursor: "pointer",
      height: "47%",
      width: "47%",
      top: "53%",
    },
  });
  itemTool.addItem("assets/shoes.png", {
    tagName: "div",
    innerProps: {
      id: "tool-item-shooes",
      "data-line-cap": "insert",
    },
    style: {
      position: "absolute",
      cursor: "pointer",
      height: "47%",
      width: "47%",
      top: "53%",
      left: "53%",
    },
  });
}

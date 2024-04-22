"use strict";

import { SizingTool } from "../../dist/paint.js";

/**
 * @param {SizingTool} sizeTool
 */
export function createSizes(sizeTool) {
  sizeTool.addSize({
    tagName: "div",
    innerProps: {
      "data-size": "16",
    },
    style: {
      width: "10%",
      height: "40%",
      background: "yellow",
      border: "1px solid gold",
      cursor: "pointer",
    },
  });
  sizeTool.addSize({
    tagName: "div",
    innerProps: {
      "data-size": "10",
    },
    style: {
      width: "10%",
      height: "40%",
      background: "yellow",
      left: "50%",
      border: "1px solid gold",
      cursor: "pointer",
    },
  });
  sizeTool.addSize({
    tagName: "div",
    innerProps: {
      "data-size": "5",
    },
    style: {
      width: "10%",
      height: "40%",
      background: "yellow",
      left: "100%",
      border: "1px solid gold",
      cursor: "pointer",
    },
  });
}

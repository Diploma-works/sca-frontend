import { elementTools, g } from "@joint/core";

export const connectTool = new elementTools.Connect({
  markup: [
    {
      tagName: "path",
      selector: "button",
      attributes: {
        d: "M0-11.5L0-11.5c6.4,0,11.5,5.1,11.5,11.5l0,0c0,6.4-5.1,11.5-11.5,11.5l0,0c-6.4,0-11.5-5.1-11.5-11.5l0,0C-11.5-6.4-6.4-11.5,0-11.5z",
        stroke: "#4b4b4b",
        class: "tool-button-bg",
        cursor: "pointer",
      },
    },
    {
      tagName: "path",
      selector: "icon",
      attributes: {
        d: "M1.7,4.1V0.8h-7.4l0-1.7h7.5v-3.3L5.8,0L1.7,4.1z",
        fill: "#4489ff",
        cursor: "pointer",
      },
    },
  ],
  x: "calc(w + 16)",
  y: "calc(h / 2)",
});

export const deleteBlockTool = new elementTools.Remove({
  markup: [
    {
      tagName: "path",
      selector: "button",
      attributes: {
        d: "M-27.5-14c0-3,2.5-5.5,5.5-5.5h44c3,0,5.5,2.5,5.5,5.5v28c0,3-2.5,5.5-5.5,5.5h-44c-3,0-5.5-2.5-5.5-5.5V-14z",
        stroke: "#4b4b4b",
        class: "tool-button-bg",
        cursor: "pointer",
      },
    },
    {
      tagName: "path",
      selector: "icon",
      attributes: {
        d: "M-6,7c0,0.5,0.2,1,0.6,1.4C-5,8.8-4.5,9-4,9h8c0.5,0,1-0.2,1.4-0.6C5.8,8,6,7.5,6,7V-5H-6V7z M-4-3h8V7h-8V-3zM3.5-8l-1-1h-5l-1,1H-7v2H7v-2H3.5z",
        fill: "#BC000A",
        cursor: "pointer",
      },
    },
  ],
  x: "calc(w / 2)",
  y: "calc(h + 24)",
});

const ResizeTool = elementTools.Control.extend({
  children: [
    {
      tagName: "g",
      selector: "handle",
      children: [
        {
          tagName: "path",
          attributes: {
            d: "M0-11.5L0-11.5c6.4,0,11.5,5.1,11.5,11.5l0,0c0,6.4-5.1,11.5-11.5,11.5l0,0c-6.4,0-11.5-5.1-11.5-11.5l0,0C-11.5-6.4-6.4-11.5,0-11.5z",
            stroke: "#4b4b4b",
            class: "tool-button-bg",
            cursor: "nwse-resize",
          },
        },
        {
          tagName: "path",
          attributes: {
            d: "M-4,-4 L4,4 M1,-4 L4,-4 L4,-1 M-1,4 L-4,4 L-4,1",
            stroke: "#4489ff",
            "stroke-width": 2,
            fill: "none",
            cursor: "nwse-resize",
            "pointer-events": "none",
          },
        },
      ],
    },
  ],
  getPosition: function(view) {
    const model = view.model;
    const size = model.size();
    return { x: size.width, y: size.height };
  },
  setPosition: function(view, coordinates) {
    const model = view.model;
    const size = model.size();
    const minWidth = 144;
    const minHeight = 96;

    const newWidth = Math.max(minWidth, coordinates.x);
    const newHeight = Math.max(minHeight, coordinates.y);

    model.resize(newWidth, newHeight);
  }
});

export const createResizeTool = () => new ResizeTool();

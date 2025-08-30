import { elementTools } from "@joint/core";

export const connectTool = new elementTools.Connect({
  markup: [
    {
      tagName: "path",
      selector: "button",
      attributes: {
        d: "M0-11.5L0-11.5c6.4,0,11.5,5.1,11.5,11.5l0,0c0,6.4-5.1,11.5-11.5,11.5l0,0c-6.4,0-11.5-5.1-11.5-11.5l0,0C-11.5-6.4-6.4-11.5,0-11.5z",
        stroke: "#4b4b4b",
        fill: "black",
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
        fill: "black",
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

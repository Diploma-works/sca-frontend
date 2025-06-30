import Client from "./Client.svg";
import ClientString from "./Client.svg?raw";
import DB from "./DB.svg";
import DBString from "./DB.svg?raw";
import Queue from "./Queue.svg";
import QueueString from "./Queue.svg?raw";
import Service from "./Sevice.svg";
import ServiceString from "./Sevice.svg?raw";
import Balancer from "./Balancer.svg";
import BalancerString from "./Balancer.svg?raw";

import { dia } from "@joint/core";
import { util } from "@joint/core";

const BLOCK_TYPES = {
  CLIENT: "custom.CLIENT",
  DB: "custom.DB",
  QUEUE: "custom.QUEUE",
  SERVICE: "custom.SERVICE",
  BALANCER: "custom.BALANCER",
};

const shapes = {};

export const shapesRaw = {
  CLIENT: {
    component: Client,
    size: { width: 96, height: 96 },
    tooltip: "Начальное событие",
  },
  DB: {
    component: DB,
    size: { width: 96, height: 96 },
    tooltip: "Промежуточное событие",
  },
  QUEUE: {
    component: Queue,
    size: { width: 144, height: 96 },
    tooltip: "Завершающее событие",
  },
  SERVICE: {
    component: Service,
    size: { width: 144, height: 96 },
    tooltip: "Действие (задача)",
  },
  BALANCER: {
    component: Balancer,
    size: { width: 144, height: 96 },
    tooltip: "Дорожка",
  },
};

function findAndPasteSelector(str, textAfterPaste, textToPaste) {
  const textIndex = str.lastIndexOf(textAfterPaste);
  if (~textIndex) {
    return (
      str.slice(0, textIndex + textAfterPaste.length) +
      textToPaste +
      str.slice(textIndex + textAfterPaste.length)
    );
  }
  return str;
}

function formatShapeString(svg) {
  const indexStart = svg.indexOf("<g>");
  const indexEnd = svg.indexOf("</g>") + 4;
  const startPart = svg.slice(indexStart, indexStart + 2);
  const endPart = svg.slice(indexStart + 2, indexEnd);
  let output = startPart + ' @selector="body" ' + endPart;

  output = findAndPasteSelector(output, "<text", ' @selector="label" ');
  output = findAndPasteSelector(
    output,
    'class="svg-p-time"',
    ' @selector="time" '
  );
  output = findAndPasteSelector(
    output,
    'class="svg-p-text"',
    ' @selector="text" '
  );

  return output;
}

function makeLabelOptions(text) {
  return {
    text,
    textVerticalAnchor: "central",
    textAnchor: "middle",
    x: "calc(0.5 * w)",
    y: "calc(0.5 * h)",
  };
}

class ClientShape extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: BLOCK_TYPES.CLIENT,
      size: shapesRaw.CLIENT.size,
      attrs: {
        label: makeLabelOptions("Начало"),
        options: {},
      },
    };
  }
  markup = util.svg`${formatShapeString(ClientString)}`;
}
class DBShape extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: BLOCK_TYPES.between,
      size: shapesRaw.BETWEEN_EVENT.size,
      attrs: {
        label: makeLabelOptions("Событие"),
        options: {},
      },
    };
  }
  markup = util.svg`${formatShapeString(DBString)}`;
}
class QueueShape extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: BLOCK_TYPES.end,
      size: shapesRaw.END_EVENT.size,
      attrs: {
        label: makeLabelOptions("Конец"),
        options: {},
      },
    };
  }
  markup = util.svg`${formatShapeString(QueueString)}`;
}

class ServiceShape extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: BLOCK_TYPES.task,
      size: shapesRaw.TASK.size,
      attrs: {
        label: {
          ...makeLabelOptions("Действие"),
          textAnchor: "",
          x: "16",
          y: "22",
        },
        options: {
          resizable: true,
        },
      },
    };
  }
  markup = util.svg`${formatShapeString(ServiceString)}`;
}
class BalancerShape extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: BLOCK_TYPES.divider,
      size: shapesRaw.DIVIDER.size,
      attrs: {
        options: {
          resizable: true,
        },
      },
    };
  }
  markup = util.svg`${formatShapeString(BalancerString)}`;
}

Object.assign(shapes, {
  custom: {
    CLIENT: ClientShape,
    DB: DBShape,
    QUEUE: QueueShape,
    SERVICE: ServiceShape,
    BALANCER: BalancerShape,
  },
});

export { shapes };

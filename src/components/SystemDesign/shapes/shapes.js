import Client from "./Client.svg?react";
import DB from "./DB.svg?react";
import Queue from "./Queue.svg?react";
import Service from "./Sevice.svg?react";
import Balancer from "./Balancer.svg?react";
import CDN from "./CDN.svg?react";
import Gateway from "./Gateway.svg?react";
import Comment from "./Comment.svg?react";

import ClientRaw from "./Client.svg?raw";
import DBRaw from "./DB.svg?raw";
import QueueRaw from "./Queue.svg?raw";
import ServiceRaw from "./Sevice.svg?raw";
import BalancerRaw from "./Balancer.svg?raw";
import CDNRaw from "./CDN.svg?raw";
import GatewayRaw from "./Gateway.svg?raw";
import CommentRaw from "./Comment.svg?raw";

import {dia} from "@joint/core";
import {util} from "@joint/core";

const BLOCK_TYPES = {
  CLIENT: "custom.CLIENT",
  DB: "custom.DB",
  QUEUE: "custom.QUEUE",
  SERVICE: "custom.SERVICE",
  BALANCER: "custom.BALANCER",
  CDN: "custom.CDN",
  Gateway: "custom.GATEWAY",
  COMMENT: "custom.COMMENT",
};

const shapes = {};

export const shapesRaw = {
  CLIENT: {
    component: Client,
    size: {width: 96, height: 96},
    tooltip: "Клиент",
  },
  DB: {
    component: DB,
    size: {width: 96, height: 96},
    tooltip: "База данных",
  },
  QUEUE: {
    component: Queue,
    size: {width: 144, height: 96},
    tooltip: "Очередь",
  },
  SERVICE: {
    component: Service,
    size: {width: 144, height: 96},
    tooltip: "Сервис",
  },
  BALANCER: {
    component: Balancer,
    size: {width: 144, height: 96},
    tooltip: "Балансировщик нагрузки",
  },
  CDN: {
    component: CDN,
    size: {width: 96, height: 96},
    tooltip: "Сеть доставки контента",
  },
  GATEWAY: {
    component: Gateway,
    size: {width: 96, height: 96},
    tooltip: "Шлюз",
  },
  COMMENT: {
    component: Comment,
    size: {width: 120, height: 60},
    tooltip: "Комментарий",
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


function decodeBase64SVG(base64String) {
  const base64Data = base64String.replace(/^data:image\/svg\+xml;base64,/, '');
  return atob(base64Data);
}

function formatShapeString(svgi) {
  const svg = decodeBase64SVG(svgi)

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
    x: "48",
    y: "48",
  };
}

class ClientShape extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: BLOCK_TYPES.CLIENT,
      size: shapesRaw.CLIENT.size,
      attrs: {
        label: makeLabelOptions("Client"),
        options: {},
      },
    };
  }

  markup = util.svg`${formatShapeString(ClientRaw)}`;
}

class DBShape extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: BLOCK_TYPES.DB,
      size: shapesRaw.DB.size,
      attrs: {
        label: makeLabelOptions("DB"),
        options: {},
      },
    };
  }

  markup = util.svg`${formatShapeString(DBRaw)}`;
}

class QueueShape extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: BLOCK_TYPES.QUEUE,
      size: shapesRaw.QUEUE.size,
      attrs: {
        label: {
          ...makeLabelOptions("Queue"),
          x: 72,
        },
        options: {},
      },
    };
  }

  markup = util.svg`${formatShapeString(QueueRaw)}`;
}

class ServiceShape extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: BLOCK_TYPES.SERVICE,
      size: shapesRaw.SERVICE.size,
      attrs: {
        label: {
          ...makeLabelOptions("Service"),
          x: 72,
        },
      },
    };
  }

  markup = util.svg`${formatShapeString(ServiceRaw)}`;
}

class BalancerShape extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: BLOCK_TYPES.BALANCER,
      size: shapesRaw.BALANCER.size,
      attrs: {
        body: {
          refWidth: '100%',
          refHeight: '100%',
        },
        background: {
          refWidth: '100%',
          refHeight: '100%',
          rx: 7.25,
          ry: 7.25,
          class: 'svg-shape-fill',
        },
        content: {
          refWidth: '100%',
          refHeight: -33.5,
          y: 33.5,
          rx: 7.25,
          ry: 7.25,
          class: 'svg-content-fill',
        },
        border: {
          refWidth: '100%',
          refHeight: '100%',
          rx: 7.25,
          ry: 7.25,
          class: 'svg-shape-stroke',
          fill: 'none',
          strokeWidth: 1.5,
        },
        divider: {
          refWidth: '100%',
          y: 32,
          height: 1.5,
          class: 'svg-accent-fill',
        },
        label: {
          textVerticalAnchor: 'middle',
          textAnchor: 'middle',
          refX: '50%',
          y: 18,
          class: 'bold-svg-text',
          text: 'Balancer',
        },
      },
    };
  }

  // markup = util.svg`
  //       <g @selector="body">
  //           <rect @selector="background"/>
  //           <rect @selector="content"/>
  //           <rect @selector="border"/>
  //           <rect @selector="divider"/>
  //           <text @selector="label"/>
  //       </g>
  //   `;
}

class CDNShape extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: BLOCK_TYPES.CDN,
      size: shapesRaw.CDN.size,
      attrs: {
        label: {
          ...makeLabelOptions("CDN"),
          y: 18,
        },
        options: {},
      },
    };
  }

  markup = util.svg`${formatShapeString(CDNRaw)}`;
}

class GatewayShape extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: BLOCK_TYPES.Gateway,
      size: shapesRaw.GATEWAY.size,
      attrs: {
        label: {
          ...makeLabelOptions("Gateway"),
          y: 18,
        },
        options: {},
      },
    };
  }

  markup = util.svg`${formatShapeString(GatewayRaw)}`;
}

class CommentShape extends dia.Element {
  defaults() {
    return {
      ...super.defaults,
      type: BLOCK_TYPES.COMMENT,
      size: shapesRaw.COMMENT.size,
      attrs: {
        label: {
          ...makeLabelOptions(""),
          x: 60,
          y: 24,
        },
        options: {},
      },
    };
  }

  markup = util.svg`${formatShapeString(CommentRaw)}`;
}

Object.assign(shapes, {
  custom: {
    CLIENT: ClientShape,
    DB: DBShape,
    SERVICE: ServiceShape,
    QUEUE: QueueShape,
    BALANCER: BalancerShape,
    CDN: CDNShape,
    GATEWAY: GatewayShape,
    COMMENT: CommentShape,
  },
});

export {shapes};

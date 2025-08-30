import {ReactComponent as Client} from "./Client.svg";
import ClientRaw from "!raw-loader!./Client.svg"
import {ReactComponent as DB} from "./DB.svg";
import DBRaw from "!raw-loader!./DB.svg"
import {ReactComponent as Queue} from "./Queue.svg";
import QueueRaw from "!raw-loader!./Queue.svg"
import {ReactComponent as Service} from "./Sevice.svg";
import ServiceRaw from "!raw-loader!./Sevice.svg"
import {ReactComponent as Balancer} from "./Balancer.svg";
import BalancerRaw from "!raw-loader!./Balancer.svg"

import {dia} from "@joint/core";
import {util} from "@joint/core";

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
        tooltip: "Балансировщтк нагрузки",
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
                options: {
                    resizable: true,
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
            size: {width: 576, height: 384},
            attrs: {
                label: {
                    ...makeLabelOptions("Balancer"),
                    y: 18,
                    x: 288,
                },
                options: {
                    resizable: true,
                },
            },
        };
    }

    markup = util.svg`${formatShapeString(BalancerRaw)}`;
}

Object.assign(shapes, {
    custom: {
        CLIENT: ClientShape,
        DB: DBShape,
        SERVICE: ServiceShape,
        QUEUE: QueueShape,
        BALANCER: BalancerShape,
    },
});

export {shapes};

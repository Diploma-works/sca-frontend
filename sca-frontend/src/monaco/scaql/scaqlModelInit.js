import { TreeFragment } from "@lezer/common";
import { printTree } from "./printTree";
import { parser } from "./scaqlParser";

export const scaqlModelInit = (model, debug = false) => {
    const code = model.getValue();
    const tree = parser.parse(code);
    const fragments = TreeFragment.addTree(tree);

    model.__scaqlDebug = debug;
    model.__scaqlTree = tree;
    model.__scaqlFragments = fragments;
    model.onDidChangeContent((event) => {
        const code = model.getValue();
        const changes = event.changes.map(change => ({
            fromA: change.rangeOffset,
            toA: change.rangeOffset + change.rangeLength,
            fromB: change.rangeOffset,
            toB: change.rangeOffset + change.text.length
        }));

        model.__scaqlFragments = TreeFragment.applyChanges(model.__scaqlFragments, changes);
        model.__scaqlTree = parser.parse(code, model.__scaqlFragments);
        model.__scaqlFragments = TreeFragment.addTree(model.__scaqlTree);

        if (debug) {
            printTree(model.__scaqlTree, code);
        }
    });

    if (debug) {
        printTree(model.__scaqlTree, code);
    }
}
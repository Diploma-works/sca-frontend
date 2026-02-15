import { loader } from "@monaco-editor/react";

import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { TreeFragment } from "@lezer/common";
import { parser } from "./parser";
import { printTree } from "@/monaco/printTree";

function keyword(text) {
    return {
        label: text,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: text + " "
    };
}

function column(text) {
    return {
        label: text,
        kind: monaco.languages.CompletionItemKind.Field,
        insertText: text
    };
}

function symbol(text) {
    return {
        label: text,
        kind: monaco.languages.CompletionItemKind.Operator,
        insertText: text + " "
    };
}

function variable(text) {
    return {
        label: text,
        kind: monaco.languages.CompletionItemKind.Variable,
        insertText: text
    };
}

function findDeepestChildBeforePos(node, pos) {
    let current = node;

    while (current) {
        let cursor = current.cursor();
        if (!cursor.firstChild()) return current; // детей нет, возвращаем сам узел

        let closest = null;
        do {
            const child = cursor.node;
            if (child.type.isError || cursor.from === cursor.to) continue; // игнорируем error и пустые узлы

            if (cursor.to <= pos) {
                closest = child;
            } else {
                break;
            }
        } while (cursor.nextSibling());

        if (!closest) return current; // у ребенка нет детей, возвращаем самого ребенка

        current = closest; // спускаемся глубже
    }

    return null;
}


self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === "json") return new jsonWorker();
        if (label === "css" || label === "scss" || label === "less") return new cssWorker();
        if (label === "html" || label === "handlebars" || label === "razor") return new htmlWorker();
        if (label === "typescript" || label === "javascript") return new tsWorker();
        return new editorWorker();
    },
};

loader.config({ monaco });

loader.init().then((monaco) => {
    /* Регистрация светлой темы */
    monaco.editor.defineTheme("sca-light", {
        base: "vs",
        inherit: true,
        rules: [],
        colors: {
            "editor.background": "#00000000",
            "editor.lineHighlightBackground": "#00000010",
            "editor.selectionBackground": "#00000020",
        },
    });

    /* Регистрация темной темы */
    monaco.editor.defineTheme("sca-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
            "editor.background": "#00000000",
            "editor.lineHighlightBackground": "#ffffff10",
            "editor.selectionBackground": "#ffffff20",
        },
    });

    /* Регистрация языка */
    monaco.languages.register({ id: "SCAQL" });
    monaco.languages.setMonarchTokensProvider("SCAQL", {
        tokenizer: {
            root: [
                [/\b(SELECT|FROM)\b/, "keyword"],
                [/\b[a-zA-Z_]\w*\b/, "identifier"],
                [/\d+/, "number"],
            ],
        },
    });
    monaco.editor.onDidCreateModel((model) => {
        if (model.getLanguageId() === "SCAQL") {
            const code = model.getValue();
            const tree = parser.parse(code);
            const fragments = TreeFragment.addTree(tree);

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
                printTree(model.__scaqlTree, code);
            });

            printTree(model.__scaqlTree, code);
        }
    });
    monaco.languages.registerCompletionItemProvider("SCAQL", {
        triggerCharacters: [" ", ","],

        provideCompletionItems(model, position) {
            const tree = model.__scaqlTree;
            if (!tree) return { suggestions: [] };

            const pos = model.getOffsetAt(position);
            let node = tree.resolveInner(pos, -1);
            if (!node) return { suggestions: [keyword("SELECT")] };

            node = findDeepestChildBeforePos(node, pos);
            const suggestions = [];

            switch (node.type.name) {
                case "Query":
                    suggestions.push(keyword("SELECT"));
                    break;
                case "Select":
                    suggestions.push(keyword("*"));
                    suggestions.push(column("git_info"));
                    suggestions.push(column("problems"));
                    suggestions.push(column("arch"));
                    break;
                case "Asterisk":
                    suggestions.push(keyword("FROM"));
                    break;
                case "GitInfo":
                case "Problems":
                case "Arch":
                    suggestions.push(symbol(","));
                    suggestions.push(keyword("FROM"));
                    break;
                case "Comma":
                    suggestions.push(column("git_info"));
                    suggestions.push(column("problems"));
                    suggestions.push(column("arch"));
                    break;
                case "From":
                    suggestions.push(variable("project_1"));
                    suggestions.push(variable("project_2"));
                    break;
            }

            return { suggestions };
        }
    });
});

export default monaco;
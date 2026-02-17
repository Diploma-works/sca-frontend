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

function keyword(text, addLeadingSpace) {
    return {
        label: text,
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: addLeadingSpace ? " " + text : text,
    };
}

function field(text, addLeadingSpace) {
    return {
        label: text,
        kind: monaco.languages.CompletionItemKind.Field,
        insertText: addLeadingSpace ? " " + text : text,
    };
}

function symbol(text, addLeadingSpace) {
    return {
        label: text,
        kind: monaco.languages.CompletionItemKind.Operator,
        insertText: addLeadingSpace ? " " + text : text,
    };
}

function variable(text, addLeadingSpace) {
    return {
        label: text,
        kind: monaco.languages.CompletionItemKind.Variable,
        insertText: addLeadingSpace ? " " + text : text,
    };
}

function findDeepestChildBeforePos(node, pos) {
    // Если нам пришел errorNode - поднимаемся до первого корректного родителя и ищем детей в нем
    while (node && node.type.isError) {
        node = node.parent;
    }

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

function getCompletionRange(model, position, before, after) {
    // Если слева error - заменяем его (важнее, чем справа)
    if (before.type.isError) {
        return {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: model.getPositionAt(before.from).column,
            endColumn: model.getPositionAt(before.to).column,
        };
    }

    // Если справа error - заменяем его
    if (after.type.isError) {
        return {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: model.getPositionAt(after.from).column,
            endColumn: model.getPositionAt(after.to).column,
        };
    }

    // Иначе вставляем в позицию курсора
    return {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: position.column,
        endColumn: position.column,
    };
}

function skipWhitespaceLeft(model, pos) {
    while (pos > 0) {
        const ch = model.getValue()[pos - 1];
        if (!/\s/.test(ch)) break;
        pos--;
    }
    return pos;
}

function skipWhitespaceRight(model, pos) {
    const text = model.getValue();
    while (pos < text.length) {
        if (!/\s/.test(text[pos])) break;
        pos++;
    }
    return pos;
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
            const nodeBefore = tree.resolveInner(skipWhitespaceLeft(model, pos), -1);
            const nodeAfter = tree.resolveInner(skipWhitespaceRight(model, pos), 1);

            // В начале текста, если справа валидный узел - запрещаем
            if (pos === 0 && nodeAfter.type.name === "Select") return { suggestions: [] };

            // Внутри валидного узла - запрещаем
            if (!nodeBefore.type.isError && pos > nodeBefore.from && pos < nodeBefore.to) return { suggestions: [] };

            console.log("start: ", nodeBefore.type.name, nodeAfter.type.name)

            const addLeadingSpace = !/\s/.test(model.getValue()[pos - 1]);
            const range = getCompletionRange(model, position, nodeBefore, nodeAfter);
            const command = { id: "editor.action.triggerSuggest", title: "Re-trigger suggestions" };

            const node = findDeepestChildBeforePos(nodeBefore, pos); // ищем валидный узел
            let suggestions = [];

            console.log("found: ", node.type.name)

            switch (node.type.name) {
                case "Query":
                    suggestions.push(keyword("SELECT", false));
                    break;
                case "Select":
                    if (!["Asterisk", "GitInfo", "Problems", "Arch"].includes(nodeAfter.type.name)) {
                        suggestions.push(keyword("*", addLeadingSpace));
                        suggestions.push(field("git_info", addLeadingSpace));
                        suggestions.push(field("problems", addLeadingSpace));
                        suggestions.push(field("arch", addLeadingSpace));
                    }
                    break;
                case "Asterisk":
                    if (nodeAfter.type.name !== "From") {
                        suggestions.push(keyword("FROM", addLeadingSpace));
                    }
                    break;
                case "GitInfo":
                case "Problems":
                case "Arch":
                    if (nodeAfter.type.name !== "Comma") {
                        suggestions.push(symbol(",", false));
                    }
                    if (nodeAfter.type.name !== "From") {
                        suggestions.push(keyword("FROM", addLeadingSpace));
                    }
                    break;
                case "Comma":
                    if (!["GitInfo", "Problems", "Arch"].includes(nodeAfter.type.name)) {
                        suggestions.push(field("git_info", addLeadingSpace));
                        suggestions.push(field("problems", addLeadingSpace));
                        suggestions.push(field("arch", addLeadingSpace));
                    }
                    break;
                case "From":
                    if (nodeAfter.type.name !== "Project") {
                        suggestions.push(variable("project_1", addLeadingSpace));
                        suggestions.push(variable("project_2", addLeadingSpace));
                    }
                    break;
            }

            suggestions = suggestions.map((s) => ({ ...s, range, command }));
            console.log(suggestions);

            return { suggestions, incomplete: true };
        }
    });
});

export default monaco;
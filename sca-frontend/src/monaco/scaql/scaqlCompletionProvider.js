import * as monaco from "monaco-editor";
import { Arch, Asterisk, Comma, From, GitInfo, Problems, Project, Query, Select } from "./scaqlParser.terms";

const keyword = (text, addLeadingSpace) => ({
    label: text,
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: addLeadingSpace ? " " + text : text,
});

const operator = (text, addLeadingSpace) => ({
    label: text,
    kind: monaco.languages.CompletionItemKind.Operator,
    insertText: addLeadingSpace ? " " + text : text,
});

const field = (text, addLeadingSpace) => ({
    label: text,
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: addLeadingSpace ? " " + text : text,
});

const symbol = (text, addLeadingSpace) => ({
    label: text,
    kind: monaco.languages.CompletionItemKind.Text,
    insertText: addLeadingSpace ? " " + text : text,
});

const reference = (text, addLeadingSpace) => ({
    label: text,
    kind: monaco.languages.CompletionItemKind.Reference,
    insertText: addLeadingSpace ? " " + text : text,
});

const skipWhitespaceLeft = (model, pos) => {
    while (pos > 0) {
        const ch = model.getValue()[pos - 1];
        if (!/\s/.test(ch)) break;
        pos--;
    }
    return pos;
}

const skipWhitespaceRight = (model, pos) => {
    const text = model.getValue();
    while (pos < text.length) {
        if (!/\s/.test(text[pos])) break;
        pos++;
    }
    return pos;
}

const findDeepestChildBeforePos = (node, pos) => {
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

const getCompletionRange = (model, position, before, after) => {
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

const getUsedFields = (fieldList) => {
    const used = new Set();
    if (!fieldList) return used;

    let cursor = fieldList.cursor();
    if (!cursor.firstChild()) return used;

    do {
        const node = cursor.node;

        if (node.type.name === "Arch") used.add("arch");
        if (node.type.name === "GitInfo") used.add("git_info");
        if (node.type.name === "Problems") used.add("problems");
    } while (cursor.nextSibling());

    return used;
}

export const scaqlCompletionProvider = {
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

        const addLeadingSpace = !/\s/.test(model.getValue()[pos - 1]);
        const range = getCompletionRange(model, position, nodeBefore, nodeAfter);
        const command = { id: "editor.action.triggerSuggest", title: "Re-trigger suggestions" };

        const node = findDeepestChildBeforePos(nodeBefore, pos); // ищем валидный узел
        let suggestions = [];

        switch (node.type.id) {
            case Query:
                suggestions.push(keyword("SELECT", false));
                break;
            case Select:
                if (![Asterisk, GitInfo, Problems, Arch].includes(nodeAfter.type.id)) {
                    suggestions.push(operator("*", addLeadingSpace));
                    suggestions.push(field("git_info", addLeadingSpace));
                    suggestions.push(field("problems", addLeadingSpace));
                    suggestions.push(field("arch", addLeadingSpace));
                }
                break;
            case Asterisk:
                if (nodeAfter.type.id !== From) {
                    suggestions.push(keyword("FROM", addLeadingSpace));
                }
                break;
            case GitInfo:
            case Problems:
            case Arch:
                if (nodeAfter.type.id !== Comma) {
                    const fieldList = node.parent;
                    const allFields = ["git_info", "problems", "arch"];
                    const usedFields = getUsedFields(fieldList);
                    const unusedFields = allFields.filter((f) => !usedFields.has(f));

                    if (unusedFields.length > 0) {
                        suggestions.push(symbol(",", false));
                    }
                }
                if (nodeAfter.type.id !== From) {
                    suggestions.push(keyword("FROM", addLeadingSpace));
                }
                break;
            case Comma:
                if (![GitInfo, Problems, Arch].includes(nodeAfter.type.id)) {
                    const fieldList = node.parent;
                    const allFields = ["git_info", "problems", "arch"];
                    const usedFields = getUsedFields(fieldList);
                    const unusedFields = allFields.filter((f) => !usedFields.has(f));

                    unusedFields.forEach((f) => suggestions.push(field(f, addLeadingSpace)));
                }
                break;
            case From:
                if (nodeAfter.type.id !== Project) {
                    suggestions.push(reference("project_1", addLeadingSpace));
                    suggestions.push(reference("project_2", addLeadingSpace));
                }
                break;
        }

        suggestions = suggestions.map((s) => ({ ...s, range, command }));

        return { suggestions, incomplete: true };
    }
};
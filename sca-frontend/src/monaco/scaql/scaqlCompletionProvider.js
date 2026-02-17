import * as monaco from "monaco-editor";

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
                    suggestions.push(operator("*", addLeadingSpace));
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
                    suggestions.push(reference("project_1", addLeadingSpace));
                    suggestions.push(reference("project_2", addLeadingSpace));
                }
                break;
        }

        suggestions = suggestions.map((s) => ({ ...s, range, command }));
        console.log(suggestions);

        return { suggestions, incomplete: true };
    }
};
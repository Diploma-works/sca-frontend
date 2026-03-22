import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { scaqlCompletionProvider, scaqlLanguageDef, scaqlModelInit } from "@/monaco/scaql";

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
    monaco.languages.setMonarchTokensProvider("SCAQL", scaqlLanguageDef);
    monaco.languages.registerCompletionItemProvider("SCAQL", scaqlCompletionProvider);
    monaco.editor.onDidCreateModel((model) => {
        if (model.getLanguageId() === "SCAQL") {
            scaqlModelInit(model, true);
        }
    });
});

export default monaco;
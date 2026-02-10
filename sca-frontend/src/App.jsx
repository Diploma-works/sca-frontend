import { useEffect, useState } from "react";

import "overlayscrollbars/overlayscrollbars.css";

import { CssBaseline, Stack, ThemeProvider } from "@mui/material";

import { BrowserRouter, Route, Routes } from "react-router-dom";

import { darkTheme, lightTheme } from "./themes";
import Navbar from "./components/Navbar";
import Main from "./components/Main";
import Auth from "./components/Auth";
import Projects from "./components/Projects";
import GitHubPage from "./pages/GitHubPage";

import AuthProvider from "react-auth-kit";
import RequireAuth from "@auth-kit/react-router/RequireAuth"

import createStore from "react-auth-kit/createStore";
import { ProjectInfo } from "./components/ProjectInfo";
import { useMonaco } from "@monaco-editor/react";

const store = createStore({
    authName: '_auth',
    authType: 'cookie',
    cookieDomain: 'localhost',
    cookieSecure: false,
    cookieSameSite: 'lax',
});

const App = () => {
    const [mode, setMode] = useState("dark");

    const theme = mode === "light" ? lightTheme : darkTheme;
    const switchMode = () => setMode(prevState => prevState === "light" ? "dark" : "light");

    const [projectInfoOpen, setProjectInfoOpen] = useState(false);
    const monaco = useMonaco();

    useEffect(() => {
        if (!monaco) return;

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
        monaco.languages.registerCompletionItemProvider("SCAQL", {
            triggerCharacters: [" ", "."],

            provideCompletionItems(model, position) {
                const text = model.getValue();
                const offset = model.getOffsetAt(position);

                console.log("Tree-sitter context (future):", {
                    fullText: text,
                    cursorOffset: offset,
                    textBeforeCursor: text.slice(0, offset),
                });

                return {
                    suggestions: [
                        {
                            label: "SELECT",
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: "SELECT ",
                        },
                        {
                            label: "FROM",
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: "FROM ",
                        },
                        {
                            label: "users",
                            kind: monaco.languages.CompletionItemKind.Class,
                            insertText: "users",
                        },
                        {
                            label: "id",
                            kind: monaco.languages.CompletionItemKind.Field,
                            insertText: "id",
                        },
                    ],
                };
            },
        });

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
    }, [monaco]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme/>
            <Stack sx={{
                height: '100dvh',
            }}>
                <AuthProvider store={store}>
                    <BrowserRouter>
                        <Navbar mode={mode} switchMode={switchMode} setProjectInfoOpen={setProjectInfoOpen}/>
                        <Routes>
                            <Route path="/auth" element={<Auth/>}/>
                            <Route path="/projects" element={
                                <RequireAuth fallbackPath="/auth">
                                    <Projects/>
                                </RequireAuth>
                            }/>
                            <Route path="/github" element={
                                <RequireAuth fallbackPath="/auth">
                                    <GitHubPage/>
                                </RequireAuth>
                            }/>
                            <Route path="/projects/:id" element={
                                <RequireAuth fallbackPath="/auth">
                                    <Main/>
                                </RequireAuth>
                            }/>
                            <Route path="/*" element={
                                <RequireAuth fallbackPath="/auth">
                                    <Main/>
                                </RequireAuth>
                            }/>
                        </Routes>
                    </BrowserRouter>
                    <ProjectInfo open={projectInfoOpen} setOpen={setProjectInfoOpen}/>
                </AuthProvider>
            </Stack>
        </ThemeProvider>
    );
}

export default App;

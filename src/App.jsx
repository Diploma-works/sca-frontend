import { useMemo, useState } from "react";

import { createTheme, CssBaseline, Divider, Stack, ThemeProvider } from "@mui/material";
import { lightTheme } from "./themes/light";
import { darkTheme } from "./themes/dark";

import "overlayscrollbars/overlayscrollbars.css";

import Navbar from "./components/Navbar";
import Editor from "./components/Editor";
import LeftSidebar from "./components/LeftSidebar";
import { TabsContextProvider } from "./contexts/TabsContext";
import PathBreadcrumbs from "./components/PathBreadcrumbs";
import { ProjectStructureContextProvider } from "./contexts/ProjectStructureContext";

const defaultTabs = [
    {
        id: "Editor.jsx",
        label: "Editor.jsx",
        path: [
            {
                id: "src",
                label: "src"
            },
            {
                id: "components",
                label: "components"
            },
            {
                id: "Editor",
                label: "Editor"
            }
        ]
    },
    {
        id: "index1.js",
        label: "index.js",
        path: [
            {
                id: "src",
                label: "src"
            },
            {
                id: "components",
                label: "components"
            },
            {
                id: "Editor",
                label: "Editor"
            }
        ]
    },
    {
        id: "utils",
        label: "utils.ts",
        path: [
            {
                id: "src",
                label: "src"
            },
            {
                id: "themes",
                label: "themes"
            }
        ]
    },
    {
        id: "index.html",
        label: "index.html",
        path: [
            {
                id: "public",
                label: "public"
            }
        ]
    },
    {
        id: "logo512.jpg",
        label: "logo512.jpg",
        path: [
            {
                id: "public",
                label: "public"
            }
        ]
    },
    {
        id: "manifest.json",
        label: "manifest.json",
        path: [
            {
                id: "public",
                label: "public"
            }
        ]
    },
    {
        id: "robots.txt",
        label: "robots.txt",
        path: [
            {
                id: "public",
                label: "public"
            }
        ]
    },
    {
        id: "main.css",
        label: "main.css",
        path: [
            {
                id: "styles",
                label: "styles"
            },
            {
                id: "css",
                label: "css"
            }
        ]
    },
];

const App = () => {
    const [mode, setMode] = useState("dark");

    const switchMode = (prev) => {
        const next = prev === "light" ? "dark" : "light";
        setMode(next);
    }

    const theme = useMemo(
        () => createTheme(mode === "light" ? lightTheme : darkTheme),
        [mode]
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme/>
            <Navbar mode={mode} switchMode={switchMode}/>
            <Divider/>
            <TabsContextProvider tabs={defaultTabs} activeTab={defaultTabs[0]}>
                <ProjectStructureContextProvider>
                    <PathBreadcrumbs/>
                    <Divider/>
                    <Stack direction="row" sx={{ flex: 1, overflow: 'hidden' }}>
                        <LeftSidebar/>
                        <Editor/>
                    </Stack>
                </ProjectStructureContextProvider>
            </TabsContextProvider>
        </ThemeProvider>
    );
}

export default App;

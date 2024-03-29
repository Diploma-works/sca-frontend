import { useMemo, useState } from "react";

import { createTheme, CssBaseline, Divider, Stack, ThemeProvider } from "@mui/material";
import { lightTheme } from "./themes/light";
import { darkTheme } from "./themes/dark";

import Navbar from "./components/Navbar";
import Editor from "./components/Editor";
import LeftSidebar from "./components/LeftSidebar";
import { TabsContextProvider } from "./contexts/TabsContext";
import PathBreadcrumbs from "./components/PathBreadcrumbs";

const defaultTabs = [
    { id: "Editor.jsx", label: "src/components/Editor/Editor.jsx" },
    { id: "index.js", label: "src/components/Editor/index.js" },
    { id: "utils", label: "src/themes/utils.ts" },
    { id: "RightSidebar", label: "src/components/Sidebars/RightSidebar.tsx" },
    { id: "index.html", label: "public/index.html" },
    { id: "logo512.jpg", label: "public/logo512.jpg" },
    { id: "manifest.json", label: "public/manifest.json" },
    { id: "robots.txt", label: "public/robots.txt" },
    { id: "main.css", label: "styles/css/main.css" },
    { id: "Montserrat-Bold.ttf", label: "src/assets/fonts/Montserrat-Bold.ttf" },
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
                <PathBreadcrumbs/>
                <Divider/>
                <Stack direction="row" sx={{ flex: 1, overflow: 'hidden' }}>
                    <LeftSidebar/>
                    <Editor/>
                </Stack>
            </TabsContextProvider>
        </ThemeProvider>
    );
}

export default App;

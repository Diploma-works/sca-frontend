import { useMemo, useState } from "react";

import { createTheme, CssBaseline, Divider, Stack, ThemeProvider } from "@mui/material";
import { lightTheme } from "./themes/light";
import { darkTheme } from "./themes/dark";

import Navbar from "./components/Navbar";
import Editor from "./components/Editor";
import LeftSidebar from "./components/LeftSidebar";
import { TabsContextProvider } from "./contexts/TabsContext";

const defaultTabs = [
    { id: "Editor.jsx", label: "Editor.jsx" },
    { id: "index.js", label: "index.js" },
    { id: "utils", label: "utils.ts" },
    { id: "RightSidebar", label: "RightSidebar.tsx" },
    { id: "logo512.jpg", label: "logo512.jpg" },
    { id: "manifest.json", label: "manifest.json" },
    { id: "robots.txt", label: "robots.txt" },
    { id: "main.css", label: "main.css" },
    { id: "Montserrat-Bold.ttf", label: "Montserrat-Bold.ttf" },
    { id: "index.html", label: "index.html" },
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
            <Stack direction="row" sx={{
                flex: 1,
                overflow: 'hidden',
            }}>
                <TabsContextProvider tabs={defaultTabs} activeValue={defaultTabs[0].id}>
                    <LeftSidebar/>
                    <Editor/>
                </TabsContextProvider>
            </Stack>
        </ThemeProvider>
    );
}

export default App;

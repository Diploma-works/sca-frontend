import { useMemo, useState } from "react";

import { createTheme, CssBaseline, Divider, Stack, ThemeProvider } from "@mui/material";
import { lightTheme } from "./themes/light";
import { darkTheme } from "./themes/dark";

import Navbar from "./components/Navbar";
import Editor from "./components/Editor";
import LeftSidebar from "./components/LeftSidebar";
import { TabsProvider } from "./contexts/TabsContext";

const defaultTabs = [
    { id: 1, label: "file1.dsl" },
    { id: 2, label: "file2.dsl" },
    { id: 3, label: "test.dsl" },
    { id: 4, label: "file3.dsl" },
    { id: 5, label: "testttt.dsl" },
    { id: 6, label: "file9.dsl" },
    { id: 7, label: "file8.dsl" },
    { id: 8, label: "t.dsl" },
    { id: 9, label: "file28.dsl" },
    { id: 10, label: "no.dsl" }
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
                <TabsProvider defaultTabs={defaultTabs}>
                    <LeftSidebar/>
                    <Editor/>
                </TabsProvider>
            </Stack>
        </ThemeProvider>
    );
}

export default App;

import { useMemo, useState } from "react";

import { createTheme, CssBaseline, Divider, Stack, ThemeProvider } from "@mui/material";
import { lightTheme } from "./themes/light";
import { darkTheme } from "./themes/dark";

import Navbar from "./components/Navbar";
import Editor from "./components/Editor";
import LeftSidebar from "./components/LeftSidebar";

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
                <LeftSidebar/>
                <Editor/>
            </Stack>
        </ThemeProvider>
    );
}

export default App;

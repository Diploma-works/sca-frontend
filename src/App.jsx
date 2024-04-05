import { useMemo, useState } from "react";

import { createTheme, CssBaseline, Divider, ThemeProvider } from "@mui/material";
import { lightTheme } from "./themes/light";
import { darkTheme } from "./themes/dark";

import "overlayscrollbars/overlayscrollbars.css";

import Navbar from "./components/Navbar";
import Main from "./components/Main";

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
            <Main/>
        </ThemeProvider>
    );
}

export default App;

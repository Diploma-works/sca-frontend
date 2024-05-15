import { useState } from "react";

import "overlayscrollbars/overlayscrollbars.css";

import { CssBaseline, Divider, ThemeProvider } from "@mui/material";

import { darkTheme, lightTheme } from "./themes";
import Navbar from "./components/Navbar";
import Main from "./components/Main";

const App = () => {
    const [mode, setMode] = useState("dark");

    const theme = mode === "light" ? lightTheme : darkTheme;
    const switchMode = () => setMode(prevState => prevState === "light" ? "dark" : "light");

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

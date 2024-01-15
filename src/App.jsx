import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { lightTheme } from "./themes/light";
import { darkTheme } from "./themes/dark";

import Navbar from "./components/Navbar";
import { useMemo, useState } from "react";

const App = () => {
    const [mode, setMode] = useState("light");

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
            <CssBaseline/>
            <Navbar mode={mode} switchMode={switchMode}/>
        </ThemeProvider>
    );
}

export default App;

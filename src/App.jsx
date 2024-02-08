import { Container, createTheme, CssBaseline, Divider, ThemeProvider } from "@mui/material";
import { lightTheme } from "./themes/light";
import { darkTheme } from "./themes/dark";

import Navbar from "./components/Navbar";
import Editor from "./components/Editor";
import { useMemo, useState } from "react";

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
            <CssBaseline/>
            <Navbar mode={mode} switchMode={switchMode}/>
            <Divider/>
            <Container sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                p: 0,
            }}>
                <Editor/>
            </Container>
        </ThemeProvider>
    );
}

export default App;

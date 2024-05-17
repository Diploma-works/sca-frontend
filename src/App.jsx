import { useState } from "react";

import "overlayscrollbars/overlayscrollbars.css";

import { CssBaseline, Divider, Stack, ThemeProvider } from "@mui/material";

import { darkTheme, lightTheme } from "./themes";
import Navbar from "./components/Navbar";
import Main from "./components/Main";
import Auth from "./components/Auth";

const App = () => {
    const [mode, setMode] = useState("dark");

    const theme = mode === "light" ? lightTheme : darkTheme;
    const switchMode = () => setMode(prevState => prevState === "light" ? "dark" : "light");

    const [user, setUser] = useState(false); // TODO: заменить  на нормальную авторизацию

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme/>
            <Stack sx={{
                height: '100dvh',
            }}>
                <Navbar mode={mode} switchMode={switchMode}/>
                <Divider/>
                {user ? (
                    <Main/>
                ) : (
                    <Auth setUser={setUser}/>
                )}
            </Stack>
        </ThemeProvider>
    );
}

export default App;

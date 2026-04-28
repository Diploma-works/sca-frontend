import { useState } from "react";

import "overlayscrollbars/overlayscrollbars.css";

import { CssBaseline, Divider, Stack, ThemeProvider } from "@mui/material";

import { BrowserRouter } from "react-router-dom";

import { darkTheme, lightTheme } from "./themes";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes";

import AuthProvider from "react-auth-kit";

import createStore from "react-auth-kit/createStore";

const store = createStore({
    authName: '_auth',
    authType: 'cookie',
    cookieDomain: 'localhost',
    cookieSecure: false,
    cookieSameSite: 'lax',
});

const App = () => {
    const [mode, setMode] = useState("dark");

    const theme = mode === "light" ? lightTheme : darkTheme;
    const switchMode = () => setMode(prevState => prevState === "light" ? "dark" : "light");

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme/>
            <Stack sx={{
                height: '100dvh',
            }}>
                <AuthProvider store={store}>
                    <BrowserRouter>
                        <Navbar mode={mode} switchMode={switchMode}/>
                        <Divider/>
                        <AppRoutes />
                    </BrowserRouter>
                </AuthProvider>
            </Stack>
        </ThemeProvider>
    );
}

export default App;

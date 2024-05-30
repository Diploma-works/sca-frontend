import { useState } from "react";

import "overlayscrollbars/overlayscrollbars.css";

import { CssBaseline, Divider, Stack, ThemeProvider } from "@mui/material";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { darkTheme, lightTheme } from "./themes";
import Navbar from "./components/Navbar";
import Main from "./components/Main";
import Auth from "./components/Auth";

import AuthProvider from "react-auth-kit";
import RequireAuth from "@auth-kit/react-router/RequireAuth"

import createStore from "react-auth-kit/createStore";

const store = createStore({
    authName: '_auth',
    authType: 'cookie',
    cookieDomain: window.location.hostname,
    cookieSecure: window.location.protocol === 'https:',
});

const router = createBrowserRouter([
    {
        path: "/sca-frontend",
        element: <Main/>,
    },
    {
        path: "/sca-frontend/auth",
        element: <Auth/>,
    },
]);

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
                    <Navbar mode={mode} switchMode={switchMode}/>
                    <Divider/>
                    <RouterProvider router={router}/>
                </AuthProvider>
            </Stack>
        </ThemeProvider>
    );
}

export default App;

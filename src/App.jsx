import { useState } from "react";

import "overlayscrollbars/overlayscrollbars.css";

import { CssBaseline, Stack, ThemeProvider } from "@mui/material";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { darkTheme, lightTheme } from "./themes";
import AppLayout from "./pages/AppLayout";
import Main from "./pages/Main";
import Auth from "./components/Auth";

import AuthProvider from "react-auth-kit";
// import RequireAuth from "@auth-kit/react-router/RequireAuth"

import createStore from "react-auth-kit/createStore";

const store = createStore({
    authName: '_auth',
    authType: 'cookie',
    cookieDomain: window.location.hostname,
    cookieSecure: window.location.protocol === 'https:',
});

const App = () => {
    const [mode, setMode] = useState("dark");

    const theme = mode === "light" ? lightTheme : darkTheme;
    const switchMode = () => setMode(prevState => prevState === "light" ? "dark" : "light");

    const router = createBrowserRouter([
        {
            path: "/",
            element: <AppLayout mode={mode} switchMode={switchMode} />,
            children: [
                { path: "/sca-frontend", element: <Main /> },
            ],
        },
        {
            path: "/sca-frontend/auth",
            element: <Auth />,
        },
    ]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline enableColorScheme />
            <Stack sx={{
                height: '100dvh',
            }}>
                <AuthProvider store={store}>
                    <RouterProvider router={router} />
                </AuthProvider>
            </Stack>
        </ThemeProvider>
    );
}

export default App;

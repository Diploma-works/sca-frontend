import { useState } from "react";

import "overlayscrollbars/overlayscrollbars.css";

import { CssBaseline, Divider, Stack, ThemeProvider } from "@mui/material";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import { darkTheme, lightTheme } from "./themes";
import Navbar from "./components/Navbar";
import Main from "./components/Main";
import Auth from "./components/Auth";
import Projects from "./components/Projects";
import GitHubPage from "./pages/GitHubPage";

import AuthProvider from "react-auth-kit";
import RequireAuth from "@auth-kit/react-router/RequireAuth"

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
                        <Routes>
                            <Route path="/auth" element={<Auth/>}/>
                            <Route path="/projects" element={
                                <RequireAuth fallbackPath="/auth">
                                    <Projects/>
                                </RequireAuth>
                            }/>
                            <Route path="/github" element={
                                <RequireAuth fallbackPath="/auth">
                                    <GitHubPage/>
                                </RequireAuth>
                            }/>
                            <Route path="/projects/:id" element={
                                <RequireAuth fallbackPath="/auth">
                                    <Main/>
                                </RequireAuth>
                            }/>
                            <Route path="/*" element={
                                <RequireAuth fallbackPath="/auth">
                                    <Main/>
                                </RequireAuth>
                            }/>
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </Stack>
        </ThemeProvider>
    );
}

export default App;

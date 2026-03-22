import { CssBaseline, Stack, ThemeProvider } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import AuthProvider from "react-auth-kit";
import createStore from "react-auth-kit/createStore";
import RequireAuth from "@auth-kit/react-router/RequireAuth"

import Navbar from "./components/Navbar";
import Main from "./components/Main";
import Auth from "./components/Auth";
import Projects from "./components/Projects";
import GitHubPage from "./pages/GitHubPage";
import { theme } from "./theme";

const store = createStore({
    authName: '_auth',
    authType: 'cookie',
    cookieDomain: 'localhost',
    cookieSecure: false,
    cookieSameSite: 'lax',
});

const App = () => {
    return (
        <ThemeProvider theme={theme} noSsr>
            <CssBaseline enableColorScheme/>
            <Stack sx={{
                height: '100dvh',
            }}>
                <AuthProvider store={store}>
                    <BrowserRouter>
                        <Navbar/>
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
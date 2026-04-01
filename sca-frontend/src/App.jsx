import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Stack } from "@mui/material";
import RequireAuth from "@auth-kit/react-router/RequireAuth"

import Main from "./components/Main";
import Auth from "./components/Auth";
import Projects from "./components/Projects";
import GitHubPage from "./pages/GitHubPage";

const App = () => {
    return (
        <Stack sx={{ height: '100dvh' }}>
            <BrowserRouter>
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
                            <Navigate to="/projects" replace/>
                        </RequireAuth>
                    }/>
                </Routes>
            </BrowserRouter>
        </Stack>
    );
}

export default App;
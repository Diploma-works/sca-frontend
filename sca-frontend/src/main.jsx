import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AuthProvider from "react-auth-kit";
import createStore from "react-auth-kit/createStore";
import { CssBaseline, Stack, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "@fontsource-variable/montserrat";
import "overlayscrollbars/overlayscrollbars.css";
import "./styles.css";
import "./monaco/init.js";

import { theme } from "./theme";
import { routes } from "./routes";

const store = createStore({
    authName: '_auth',
    authType: 'cookie',
    cookieDomain: 'localhost',
    cookieSecure: false,
    cookieSameSite: 'lax',
});

const queryClient = new QueryClient();
const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <AuthProvider store={store}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={theme} noSsr>
                    <CssBaseline enableColorScheme/>
                    <Stack sx={{ height: '100dvh' }}>
                        <RouterProvider router={router}/>
                    </Stack>
                </ThemeProvider>
            </QueryClientProvider>
        </AuthProvider>
    </StrictMode>,
);
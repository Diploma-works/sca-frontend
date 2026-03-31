import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AuthProvider from "react-auth-kit";
import createStore from "react-auth-kit/createStore";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import "@fontsource-variable/montserrat";
import "overlayscrollbars/overlayscrollbars.css";
import "./styles.css";
import "./monaco/init.js";

import App from "./App";
import { theme } from "./theme";

const store = createStore({
    authName: '_auth',
    authType: 'cookie',
    cookieDomain: 'localhost',
    cookieSecure: false,
    cookieSameSite: 'lax',
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <AuthProvider store={store}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={theme} noSsr>
                    <CssBaseline enableColorScheme/>
                    <App/>
                </ThemeProvider>
            </QueryClientProvider>
        </AuthProvider>
    </StrictMode>,
);
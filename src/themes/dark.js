import { createTheme } from "@mui/material";

export const darkTheme = createTheme({
    typography: {
        fontFamily: "Montserrat",
    },
    palette: {
        mode: "dark",
        primary: {
            main: '#4489FF',
        },
        background: {
            default: '#0a0a0a'
        }
    },
});
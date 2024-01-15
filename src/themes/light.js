import { createTheme } from "@mui/material";

export const lightTheme = createTheme({
    typography: {
        fontFamily: "Montserrat",
    },
    palette: {
        mode: "light",
        primary: {
            main: '#4489FF',
        },
        background: {
            default: '#f5f6fa'
        },
        text: {
            primary: '#283646',
            secondary: '#5b5d6c',
            disabled: '#939ea8'
        }
    },
});